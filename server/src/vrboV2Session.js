import { EventEmitter } from "events";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { rankProperties } from "./vrboV2Rank.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../client/src/data/vrbo-v2");

function loadJson(name) {
  return JSON.parse(readFileSync(path.join(dataDir, name), "utf8"));
}

const chatScript = loadJson("chatScript.json");
const copy = loadJson("copy.json");
const preferences = loadJson("preferences.json");
const properties = loadJson("properties.json");
const rankingWeights = loadJson("rankingWeights.json");
const users = loadJson("users.json");

const guests = users.filter((user) => user.role === "guest");
const preferenceOrder = new Map(preferences.map((preference, index) => [preference.id, index]));
const preferenceById = new Map(preferences.map((preference) => [preference.id, preference]));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyMap(value) {
  return guests.reduce((map, user) => ({ ...map, [user.id]: value() }), {});
}

function listPhrase(items) {
  if (!items.length) return "everything the group asked for";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function buildSummaryText(priorities) {
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
    updatedAt: Date.now(),
  };
}

export class VrboV2Session extends EventEmitter {
  constructor() {
    super();
    this.messageCounter = 0;
    this.timers = [];
    this.state = createInitialState(0);
    this.startIntro();
  }

  snapshot() {
    return clone(this.state);
  }

  makeMessage(message) {
    this.messageCounter += 1;
    return { id: `m${this.messageCounter}`, kind: "text", ...message };
  }

  clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  schedule(fn, delay) {
    const id = setTimeout(fn, delay);
    this.timers.push(id);
    return id;
  }

  setState(next, emit = true) {
    this.state = { ...next, updatedAt: Date.now() };
    if (emit) this.emit("state", this.snapshot());
  }

  patch(patch, emit = true) {
    this.setState({ ...this.state, ...patch }, emit);
  }

  startIntro() {
    this.clearTimers();
    let offset = 0;

    chatScript.intro.forEach((line) => {
      offset += line.pause ?? 0;
      this.schedule(() => {
        if (this.state.stage !== "intro") return;
        this.patch({
          typing: this.state.typing.includes(line.authorId)
            ? this.state.typing
            : [...this.state.typing, line.authorId],
        });
      }, offset);

      offset += line.typing ?? 0;
      this.schedule(() => {
        if (this.state.stage !== "intro") return;
        this.patch({
          typing: withoutTyping(this.state.typing, line.authorId),
          messages: [
            ...this.state.messages,
            this.makeMessage({ authorId: line.authorId, text: line.text }),
          ],
        });
      }, offset);
    });

    offset += Math.max(chatScript.handoffPause ?? 900, 2200);
    this.schedule(() => {
      if (this.state.stage !== "intro") return;
      this.patch({ stage: "selecting", typing: [] });
    }, offset);
  }

  joinGuest(userId) {
    if ((this.state.stage !== "intro" && this.state.stage !== "selecting") || this.state.joined[userId]) {
      return;
    }
    if (!guests.some((user) => user.id === userId)) return;
    this.patch({
      joined: { ...this.state.joined, [userId]: true },
    });
  }

  togglePreference(userId, preferenceId) {
    if (!this.state.joined[userId] || this.state.submitted[userId]) return;
    const current = this.state.selections[userId] ?? [];
    const has = current.includes(preferenceId);
    if (!has && current.length >= copy.maxSelections) return;
    const next = has
      ? current.filter((id) => id !== preferenceId)
      : [...current, preferenceId];
    this.patch({
      selections: { ...this.state.selections, [userId]: next },
    });
  }

  submitGuest(userId) {
    if (!this.state.joined[userId] || this.state.submitted[userId]) return;
    const picks = this.state.selections[userId] ?? [];
    if (picks.length !== copy.maxSelections) return;

    this.patch({
      submitted: { ...this.state.submitted, [userId]: picks },
    });
    this.maybeOpenSummary();

    const { typing = 700 } = chatScript.preference;
    const text = picks
      .map((preferenceId) => {
        const preference = preferenceById.get(preferenceId);
        return preference?.chatLines?.[userId] ?? preference?.chatLine ?? preferenceId;
      })
      .join("\n");

    this.schedule(() => {
      if (this.state.submitted[userId] == null) return;
      this.patch({
        typing: this.state.typing.includes(userId)
          ? this.state.typing
          : [...this.state.typing, userId],
      });
    }, 0);

    this.schedule(() => {
      if (this.state.submitted[userId] == null) return;
      this.patch({
        typing: withoutTyping(this.state.typing, userId),
        messages: [
          ...this.state.messages,
          this.makeMessage({
            authorId: userId,
            text,
            preferenceIds: picks,
          }),
        ],
      });
    }, typing);
  }

  maybeOpenSummary() {
    if (this.state.stage !== "selecting") return;
    const joinedUsers = guests.filter((user) => Boolean(this.state.joined[user.id]));
    const allSubmitted =
      joinedUsers.length > 0 &&
      joinedUsers.every((user) => Boolean(this.state.submitted[user.id]));
    if (!allSubmitted) return;

    const settle = (chatScript.preference.typing ?? 700) + (chatScript.preference.stagger ?? 800);
    this.schedule(() => {
      if (this.state.stage !== "selecting") return;
      const stillJoined = guests.filter((user) => Boolean(this.state.joined[user.id]));
      const stillReady =
        stillJoined.length > 0 &&
        stillJoined.every((user) => Boolean(this.state.submitted[user.id]));
      if (!stillReady) return;

      const priorities = aggregatePreferences(this.state.submitted, this.state.joined);
      this.patch({
        stage: "summary",
        priorities,
        summaryText: buildSummaryText(priorities),
        typing: [],
      });
    }, settle);
  }

  searchStays() {
    if (this.state.stage !== "summary") return;
    const results = rankProperties(properties, this.state.priorities, rankingWeights);
    this.patch({
      stage: "results",
      results,
      previewPropertyId: results[0]?.property.id ?? null,
      selectedPropertyId: null,
      celebrating: false,
    });
  }

  previewProperty(propertyId) {
    if (this.state.stage !== "results" || this.state.selectedPropertyId) return;
    if (!this.state.results.some((result) => result.property.id === propertyId)) return;
    this.patch({ previewPropertyId: propertyId });
  }

  selectProperty(propertyId) {
    if (this.state.stage !== "results" || this.state.selectedPropertyId) return;
    const result = this.state.results.find((entry) => entry.property.id === propertyId);
    if (!result) return;

    this.patch({
      previewPropertyId: propertyId,
      selectedPropertyId: propertyId,
    });

    const finale = chatScript.finale;
    const vars = {
      name: result.property.name,
      reasons: formatReasons(result.matched),
    };
    const joinedNow = this.state.joined;

    const isActiveAuthor = (authorId) => {
      const person = users.find((user) => user.id === authorId);
      if (!person) return false;
      if (person.role === "coordinator") return true;
      return Boolean(joinedNow[authorId]);
    };

    let offset = finale.reveal.pause ?? 300;
    this.schedule(() => {
      this.patch({
        typing: this.state.typing.includes(finale.reveal.authorId)
          ? this.state.typing
          : [...this.state.typing, finale.reveal.authorId],
      });
    }, offset);

    offset += finale.reveal.typing ?? 1000;
    this.schedule(() => {
      this.patch({
        typing: withoutTyping(this.state.typing, finale.reveal.authorId),
        messages: [
          ...this.state.messages,
          this.makeMessage({
            authorId: finale.reveal.authorId,
            text: fillTemplate(finale.reveal.text, vars),
          }),
        ],
      });
    }, offset);

    offset += finale.propertyPause ?? 700;
    this.schedule(() => {
      this.patch({
        messages: [
          ...this.state.messages,
          this.makeMessage({
            kind: "property",
            authorId: finale.propertyAuthorId ?? "jamie",
            propertyId,
          }),
        ],
      });
    }, offset);

    (finale.reactions ?? []).forEach((line) => {
      if (!isActiveAuthor(line.authorId)) return;
      offset += line.pause ?? 700;
      this.schedule(() => {
        this.patch({
          typing: this.state.typing.includes(line.authorId)
            ? this.state.typing
            : [...this.state.typing, line.authorId],
        });
      }, offset);
      offset += line.typing ?? 700;
      this.schedule(() => {
        this.patch({
          typing: withoutTyping(this.state.typing, line.authorId),
          messages: [
            ...this.state.messages,
            this.makeMessage({
              authorId: line.authorId,
              text: fillTemplate(line.text, vars),
            }),
          ],
        });
      }, offset);
    });

    offset += finale.celebrationPause ?? 400;
    this.schedule(() => {
      this.patch({ celebrating: true });
    }, offset);
  }

  reset() {
    this.clearTimers();
    this.messageCounter = 0;
    this.state = createInitialState(this.state.runId + 1);
    this.emit("state", this.snapshot());
    this.startIntro();
  }
}

export const vrboV2Session = new VrboV2Session();
export { guests as vrboV2Guests };
