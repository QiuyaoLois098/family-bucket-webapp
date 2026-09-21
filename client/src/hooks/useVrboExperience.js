import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import chatScript from "../data/vrbo/chatScript.json";
import copy from "../data/vrbo/copy.json";
import preferences from "../data/vrbo/preferences.json";
import properties from "../data/vrbo/properties.json";
import users from "../data/vrbo/users.json";
import { rankProperties } from "../utils/rankProperties.js";

export const STAGES = ["intro", "selecting", "ranking", "results", "sent"];

const preferenceOrder = new Map(preferences.map((preference, index) => [preference.id, index]));
const preferenceById = new Map(preferences.map((preference) => [preference.id, preference]));

let messageCounter = 0;
function makeMessage(message) {
  messageCounter += 1;
  return { id: `m${messageCounter}`, kind: "text", ...message };
}

function emptyMap(value) {
  return users.reduce((map, user) => ({ ...map, [user.id]: value() }), {});
}

function createInitialState(runId = 0) {
  return {
    runId,
    stage: "intro",
    messages: [],
    typing: [],
    selections: emptyMap(() => []),
    submitted: emptyMap(() => null),
    ranked: [],
    results: [],
    chosenPropertyId: null,
    celebrating: false,
  };
}

function aggregatePreferences(submitted) {
  const counts = new Map();
  users.forEach((user) => {
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

    case "TOGGLE_PREFERENCE": {
      if (state.submitted[action.userId]) return state;
      const current = state.selections[action.userId] ?? [];
      const has = current.includes(action.preferenceId);
      if (!has && current.length >= copy.maxSelections) return state;
      const next = has
        ? current.filter((id) => id !== action.preferenceId)
        : [...current, action.preferenceId];
      return { ...state, selections: { ...state.selections, [action.userId]: next } };
    }

    case "SUBMIT_GUEST":
      return {
        ...state,
        submitted: { ...state.submitted, [action.userId]: action.preferences },
      };

    case "OPEN_RANKING":
      return {
        ...state,
        stage: "ranking",
        ranked: state.ranked.length ? state.ranked : aggregatePreferences(state.submitted),
      };

    case "SET_RANKED":
      return { ...state, ranked: action.ranked };

    case "MOVE_RANKED": {
      const index = state.ranked.indexOf(action.preferenceId);
      const target = index + action.offset;
      if (index < 0 || target < 0 || target >= state.ranked.length) return state;
      const ranked = [...state.ranked];
      ranked.splice(target, 0, ranked.splice(index, 1)[0]);
      return { ...state, ranked };
    }

    case "SHOW_RESULTS":
      return {
        ...state,
        stage: "results",
        results: rankProperties(properties, state.ranked),
        chosenPropertyId: null,
      };

    case "BACK_TO_RANKING":
      return { ...state, stage: "ranking", chosenPropertyId: null };

    case "CHOOSE_PROPERTY":
      return { ...state, chosenPropertyId: action.propertyId };

    case "MARK_SENT":
      return { ...state, stage: "sent" };

    case "CELEBRATE":
      return { ...state, celebrating: true };

    case "RESET":
      return createInitialState(state.runId + 1);

    default:
      return state;
  }
}

export default function useVrboExperience() {
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

  // Stage 1 — scripted intro conversation, then hand off to the phones.
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

  const allSubmitted = useMemo(
    () => users.every((user) => Boolean(state.submitted[user.id])),
    [state.submitted],
  );

  // Stage 3 opens once every guest has sent their picks.
  useEffect(() => {
    if (!allSubmitted || state.stage !== "selecting") return undefined;
    const lines = users.reduce((total, user) => total + (state.submitted[user.id]?.length ?? 0), 0);
    const settle = (chatScript.preference.stagger ?? 800) * Math.max(lines, 1);
    const id = schedule(() => dispatch({ type: "OPEN_RANKING" }), settle);
    return () => clearTimeout(id);
  }, [allSubmitted, state.stage, state.submitted, schedule]);

  const togglePreference = useCallback((userId, preferenceId) => {
    dispatch({ type: "TOGGLE_PREFERENCE", userId, preferenceId });
  }, []);

  const submitGuest = useCallback(
    (userId) => {
      const picks = stateRef.current.selections[userId] ?? [];
      if (!picks.length || stateRef.current.submitted[userId]) return;

      dispatch({ type: "SUBMIT_GUEST", userId, preferences: picks });

      const { typing = 700, stagger = 1000 } = chatScript.preference;
      picks.forEach((preferenceId, index) => {
        const base = index * stagger;
        schedule(() => dispatch({ type: "SET_TYPING", userId }), base);
        schedule(() => {
          dispatch({
            type: "ADD_MESSAGE",
            message: makeMessage({
              authorId: userId,
              text: preferenceById.get(preferenceId)?.chatLine ?? preferenceId,
              preferenceId,
            }),
          });
        }, base + typing);
      });
    },
    [schedule],
  );

  const setRanked = useCallback((ranked) => dispatch({ type: "SET_RANKED", ranked }), []);
  const moveRanked = useCallback(
    (preferenceId, offset) => dispatch({ type: "MOVE_RANKED", preferenceId, offset }),
    [],
  );
  const findStay = useCallback(() => dispatch({ type: "SHOW_RESULTS" }), []);
  const backToRanking = useCallback(() => dispatch({ type: "BACK_TO_RANKING" }), []);
  const chooseProperty = useCallback((propertyId) => dispatch({ type: "CHOOSE_PROPERTY", propertyId }), []);

  // Stage 4 finale — the chosen stay lands in the chat and the group reacts.
  const sendToChat = useCallback(() => {
    const { chosenPropertyId } = stateRef.current;
    if (!chosenPropertyId) return;
    const property = properties.find((item) => item.id === chosenPropertyId);
    if (!property) return;

    const { reveal, reactions, propertyAuthorId, propertyPause, celebrationPause } = chatScript.finale;
    dispatch({ type: "MARK_SENT" });

    let offset = reveal.pause ?? 0;
    schedule(() => dispatch({ type: "SET_TYPING", userId: reveal.authorId }), offset);
    offset += reveal.typing ?? 0;
    schedule(
      () => dispatch({ type: "ADD_MESSAGE", message: makeMessage({ authorId: reveal.authorId, text: reveal.text }) }),
      offset,
    );

    offset += propertyPause ?? 0;
    schedule(
      () =>
        dispatch({
          type: "ADD_MESSAGE",
          message: makeMessage({ authorId: propertyAuthorId, kind: "property", propertyId: property.id }),
        }),
      offset,
    );

    offset += celebrationPause ?? 0;
    schedule(() => dispatch({ type: "CELEBRATE" }), offset);

    reactions.forEach((line) => {
      offset += line.pause ?? 0;
      schedule(() => dispatch({ type: "SET_TYPING", userId: line.authorId }), offset);
      offset += line.typing ?? 0;
      schedule(
        () => dispatch({ type: "ADD_MESSAGE", message: makeMessage({ authorId: line.authorId, text: line.text }) }),
        offset,
      );
    });
  }, [schedule]);

  const reset = useCallback(() => {
    clearTimers();
    dispatch({ type: "RESET" });
  }, [clearTimers]);

  return {
    state,
    allSubmitted,
    actions: {
      togglePreference,
      submitGuest,
      setRanked,
      moveRanked,
      findStay,
      backToRanking,
      chooseProperty,
      sendToChat,
      reset,
    },
  };
}
