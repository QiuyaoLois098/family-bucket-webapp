import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import chatScript from "../data/vrbo-v2/chatScript.json";
import copy from "../data/vrbo-v2/copy.json";
import preferences from "../data/vrbo-v2/preferences.json";
import properties from "../data/vrbo-v2/properties.json";
import rankingWeights from "../data/vrbo-v2/rankingWeights.json";
import users from "../data/vrbo-v2/users.json";
import { rankProperties } from "../utils/rankProperties.js";

export const STAGES = ["intro", "selecting", "summary", "results"];

/** All four phones - planner + guests - pick preferences in v2. */
export const guests = users;
export const planner = users.find((user) => user.role === "coordinator") ?? users[0];

const preferenceOrder = new Map(preferences.map((preference, index) => [preference.id, index]));
const preferenceById = new Map(preferences.map((preference) => [preference.id, preference]));

let messageCounter = 0;
function makeMessage(message) {
  messageCounter += 1;
  return { id: `m${messageCounter}`, kind: "text", ...message };
}

function emptyMap(value) {
  return guests.reduce((map, user) => ({ ...map, [user.id]: value() }), {});
}

function createInitialState(runId = 0) {
  return {
    runId,
    stage: "intro",
    messages: [],
    typing: [],
    joined: emptyMap(() => false),
    selections: emptyMap(() => []),
    submitted: emptyMap(() => null),
    priorities: [],
    summaryText: "",
    results: [],
    previewPropertyId: null,
    selectedPropertyId: null,
    celebrating: false,
  };
}

function aggregatePreferences(submitted, joined) {
  const counts = new Map();
  guests.forEach((user) => {
    if (!joined[user.id]) return;
    (submitted[user.id] ?? []).forEach((id) => {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    });
  });

  return [...counts.keys()].sort((a, b) => {
    const byCount = counts.get(b) - counts.get(a);
    if (byCount !== 0) return byCount;
    return (preferenceOrder.get(a) ?? 0) - (preferenceOrder.get(b) ?? 0);
  });
}

function listPhrase(items) {
  if (!items.length) return "everything the group asked for";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

export function buildSummaryText(priorities) {
  const phrases = copy.summary?.phrases ?? {};
  const destination = copy.summary?.destination ?? "Hawaii";
  const parts = priorities
    .slice(0, 4)
    .map((id) => phrases[id] ?? preferenceById.get(id)?.label?.toLowerCase())
    .filter(Boolean);

  if (!parts.length) {
    return `Let's find a ${destination} stay the whole group will love.`;
  }

  if (parts.length === 1) {
    return `Let's find a ${destination} stay with ${parts[0]}.`;
  }

  const lead = parts.slice(0, -1);
  const last = parts.at(-1);
  return `Let's find a ${destination} stay with ${listPhrase(lead)}. ${last.charAt(0).toUpperCase()}${last.slice(1)} would be great too.`;
}

function formatReasons(matched) {
  const labels = matched
    .slice(0, 3)
    .map((match) => preferenceById.get(match.id)?.label)
    .filter(Boolean);

  if (!labels.length) return "everything we said we needed";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

function fillTemplate(template, { name, reasons }) {
  return String(template ?? "")
    .replaceAll("{name}", name)
    .replaceAll("{reasons}", reasons);
}

function withoutTyping(typing, userId) {
  return typing.filter((id) => id !== userId);
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_TYPING":
      return state.typing.includes(action.userId)
        ? state
        : { ...state, typing: [...state.typing, action.userId] };

    case "ADD_MESSAGE":
      return {
        ...state,
        typing: withoutTyping(state.typing, action.message.authorId),
        messages: [...state.messages, action.message],
      };

    case "SET_STAGE":
      return state.stage === action.stage ? state : { ...state, stage: action.stage };

    case "JOIN_USER": {
      if ((state.stage !== "intro" && state.stage !== "selecting") || state.joined[action.userId]) {
        return state;
      }
      return {
        ...state,
        joined: { ...state.joined, [action.userId]: true },
      };
    }

    case "TOGGLE_PREFERENCE": {
      if (!state.joined[action.userId] || state.submitted[action.userId]) return state;
      const current = state.selections[action.userId] ?? [];
      const has = current.includes(action.preferenceId);
      if (!has && current.length >= copy.maxSelections) return state;
      const next = has
        ? current.filter((id) => id !== action.preferenceId)
        : [...current, action.preferenceId];
      return { ...state, selections: { ...state.selections, [action.userId]: next } };
    }

    case "SUBMIT_GUEST":
      if (!state.joined[action.userId] || state.submitted[action.userId]) return state;
      return {
        ...state,
        submitted: { ...state.submitted, [action.userId]: action.preferences },
      };

    case "OPEN_SUMMARY": {
      const priorities = aggregatePreferences(state.submitted, state.joined);
      return {
        ...state,
        stage: "summary",
        priorities,
        summaryText: buildSummaryText(priorities),
      };
    }

    case "SHOW_RESULTS": {
      const results = rankProperties(properties, state.priorities, rankingWeights);
      return {
        ...state,
        stage: "results",
        results,
        previewPropertyId: results[0]?.property.id ?? null,
        selectedPropertyId: null,
        celebrating: false,
      };
    }

    case "PREVIEW_PROPERTY":
      if (state.stage !== "results" || state.selectedPropertyId) return state;
      if (!state.results.some((result) => result.property.id === action.propertyId)) return state;
      return { ...state, previewPropertyId: action.propertyId };

    case "SELECT_PROPERTY":
      if (state.stage !== "results" || state.selectedPropertyId) return state;
      if (!state.results.some((result) => result.property.id === action.propertyId)) return state;
      return {
        ...state,
        previewPropertyId: action.propertyId,
        selectedPropertyId: action.propertyId,
      };

    case "SET_CELEBRATING":
      return { ...state, celebrating: Boolean(action.active) };

    case "RESET":
      return createInitialState(state.runId + 1);

    default:
      return state;
  }
}

export default function useVrboV2Experience() {
  const [state, dispatch] = useReducer(reducer, 0, createInitialState);
  const timers = useRef([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const schedule = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
    return id;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Stage 1 - scripted intro conversation, then hand off to the phones.
  useEffect(() => {
    let offset = 0;
    const ids = [];

    chatScript.intro.forEach((line) => {
      offset += line.pause ?? 0;
      ids.push(schedule(() => dispatch({ type: "SET_TYPING", userId: line.authorId }), offset));
      offset += line.typing ?? 0;
      ids.push(
        schedule(
          () => dispatch({ type: "ADD_MESSAGE", message: makeMessage({ authorId: line.authorId, text: line.text }) }),
          offset,
        ),
      );
    });

    offset += chatScript.handoffPause ?? 0;
    ids.push(schedule(() => dispatch({ type: "SET_STAGE", stage: "selecting" }), offset));

    return () => ids.forEach(clearTimeout);
  }, [state.runId, schedule]);

  const joinedUsers = useMemo(
    () => guests.filter((user) => Boolean(state.joined[user.id])),
    [state.joined],
  );

  const allSubmitted = useMemo(
    () =>
      joinedUsers.length > 0 &&
      joinedUsers.every((user) => Boolean(state.submitted[user.id])),
    [joinedUsers, state.submitted],
  );

  // Summary opens once everyone who joined has sent their picks.
  useEffect(() => {
    if (!allSubmitted || state.stage !== "selecting") return undefined;
    const settle = (chatScript.preference.typing ?? 700) + (chatScript.preference.stagger ?? 800);
    const id = schedule(() => dispatch({ type: "OPEN_SUMMARY" }), settle);
    return () => clearTimeout(id);
  }, [allSubmitted, state.stage, schedule]);

  const joinGuest = useCallback((userId) => {
    dispatch({ type: "JOIN_USER", userId });
  }, []);

  const togglePreference = useCallback((userId, preferenceId) => {
    dispatch({ type: "TOGGLE_PREFERENCE", userId, preferenceId });
  }, []);

  const submitGuest = useCallback(
    (userId) => {
      const current = stateRef.current;
      if (!current.joined[userId]) return;
      const picks = current.selections[userId] ?? [];
      if (picks.length !== copy.maxSelections || current.submitted[userId]) return;

      dispatch({ type: "SUBMIT_GUEST", userId, preferences: picks });

      const { typing = 700 } = chatScript.preference;
      const text = picks
        .map((preferenceId) => {
          const preference = preferenceById.get(preferenceId);
          return preference?.chatLines?.[userId] ?? preference?.chatLine ?? preferenceId;
        })
        .join("\n");

      schedule(() => dispatch({ type: "SET_TYPING", userId }), 0);
      schedule(() => {
        dispatch({
          type: "ADD_MESSAGE",
          message: makeMessage({
            authorId: userId,
            text,
            preferenceIds: picks,
          }),
        });
      }, typing);
    },
    [schedule],
  );

  const searchStays = useCallback(() => {
    if (stateRef.current.stage !== "summary") return;
    dispatch({ type: "SHOW_RESULTS" });
  }, []);

  const previewProperty = useCallback((propertyId) => {
    dispatch({ type: "PREVIEW_PROPERTY", propertyId });
  }, []);

  const selectProperty = useCallback(
    (propertyId) => {
      const current = stateRef.current;
      if (current.stage !== "results" || current.selectedPropertyId) return;
      const result = current.results.find((entry) => entry.property.id === propertyId);
      if (!result) return;

      dispatch({ type: "SELECT_PROPERTY", propertyId });

      const finale = chatScript.finale;
      const vars = {
        name: result.property.name,
        reasons: formatReasons(result.matched),
      };

      let offset = finale.reveal.pause ?? 300;
      schedule(() => dispatch({ type: "SET_TYPING", userId: finale.reveal.authorId }), offset);
      offset += finale.reveal.typing ?? 1000;
      schedule(() => {
        dispatch({
          type: "ADD_MESSAGE",
          message: makeMessage({
            authorId: finale.reveal.authorId,
            text: fillTemplate(finale.reveal.text, vars),
          }),
        });
      }, offset);

      offset += finale.propertyPause ?? 700;
      schedule(() => {
        dispatch({
          type: "ADD_MESSAGE",
          message: makeMessage({
            kind: "property",
            authorId: finale.propertyAuthorId ?? "jamie",
            propertyId,
          }),
        });
      }, offset);

      (finale.reactions ?? []).forEach((line) => {
        offset += line.pause ?? 700;
        schedule(() => dispatch({ type: "SET_TYPING", userId: line.authorId }), offset);
        offset += line.typing ?? 700;
        schedule(() => {
          dispatch({
            type: "ADD_MESSAGE",
            message: makeMessage({
              authorId: line.authorId,
              text: fillTemplate(line.text, vars),
            }),
          });
        }, offset);
      });

      offset += finale.celebrationPause ?? 400;
      schedule(() => dispatch({ type: "SET_CELEBRATING", active: true }), offset);
    },
    [schedule],
  );

  const reset = useCallback(() => {
    clearTimers();
    dispatch({ type: "RESET" });
  }, [clearTimers]);

  return {
    state,
    allSubmitted,
    joinedUsers,
    actions: {
      joinGuest,
      togglePreference,
      submitGuest,
      searchStays,
      previewProperty,
      selectProperty,
      reset,
    },
  };
}
