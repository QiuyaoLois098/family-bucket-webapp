import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { recommendPropertySet } from "../../shared/vrboRecommendPropertySet.js";
import { config } from "./config.js";
import {
  HYPERION_STATIONS,
  sendHyperionEvent,
} from "./hyperionEvents.js";

const VGC_ORGANIZER = {
  id: "expedia-oct26-vgc-organizer",
  label: "organizer",
};

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
    displayNames: emptyMap(() => null),
    selections: emptyMap(() => []),
    submitted: emptyMap(() => null),
    priorities: [],
    summaryText: "",
    results: [],
    previewPropertyId: null,
    selectedPropertyId: null,
    celebrating: false,
    /** Hyperion VGC session id — set on first interactive/phone activity */
    hyperionSessionId: null,
    updatedAt: Date.now(),
  };
}

export class VrboV2Session extends EventEmitter {
  constructor() {
    super();
    this.messageCounter = 0;
    this.timers = [];
    /** Wall-clock start for Hyperion duration_seconds (cleared on session end). */
    this.hyperionSessionStartedAt = null;
    this.lastInteractionAt = Date.now();
    this.state = createInitialState(0);
    this.startIntro();
    setInterval(() => this.checkCelebrationTimeout(), 1000);
  }

  snapshot() {
    return clone(this.state);
  }

  touch() {
    this.lastInteractionAt = Date.now();
  }

  /** Guest/organizer activity: bump idle clock and start Hyperion session if needed. */
  noteActivity() {
    this.touch();
    return this.startHyperionSession();
  }

  devicesJoinedCount() {
    return guests.filter((user) => Boolean(this.state.joined[user.id])).length;
  }

  /**
   * First click/typing on organizer interactive or any guest phone starts a VGC session.
   * Idempotent — broadcasts sessionId via state to output + phones.
   * Starts the session duration timer.
   */
  startHyperionSession() {
    if (this.state.hyperionSessionId) {
      return this.state.hyperionSessionId;
    }

    const sessionId = randomUUID();
    this.hyperionSessionStartedAt = Date.now();
    this.touch();
    this.patch({ hyperionSessionId: sessionId });

    sendHyperionEvent({
      slug: "vgc_session_start",
      stationId: HYPERION_STATIONS.VRBO_GROUP_CHAT,
      sessionId,
      sourceId: VGC_ORGANIZER.id,
      fieldData: {
        device: VGC_ORGANIZER.label,
      },
    })
      .then((result) => {
        if (result.ok) {
          console.log(`[hyperion] vgc_session_start ok · ${sessionId}`);
        } else if (!result.skipped) {
          console.warn(`[hyperion] vgc_session_start failed: ${result.error}`);
        } else {
          console.warn(`[hyperion] vgc_session_start skipped: ${result.error}`);
        }
      })
      .catch((error) => {
        console.warn("[hyperion] vgc_session_start error:", error?.message || error);
      });

    return sessionId;
  }

  /**
   * End an active Hyperion VGC session (idempotent if none).
   * interactions_count omitted until wired.
   * @param {"completed"|"abandoned"|"timeout"} reason
   */
  endHyperionSession(reason) {
    const sessionId = this.state.hyperionSessionId;
    if (!sessionId) {
      this.hyperionSessionStartedAt = null;
      return;
    }

    const startedAt = this.hyperionSessionStartedAt;
    const durationSeconds = startedAt
      ? Math.max(0, Math.round((Date.now() - startedAt) / 1000))
      : 0;
    const devicesJoined = this.devicesJoinedCount();

    this.hyperionSessionStartedAt = null;

    sendHyperionEvent({
      slug: "vgc_session_end",
      stationId: HYPERION_STATIONS.VRBO_GROUP_CHAT,
      sessionId,
      sourceId: VGC_ORGANIZER.id,
      fieldData: {
        device: VGC_ORGANIZER.label,
        reason,
        duration_seconds: durationSeconds,
        devices_joined: devicesJoined,
      },
    })
      .then((result) => {
        if (result.ok) {
          console.log(
            `[hyperion] vgc_session_end ok · ${reason} · ${durationSeconds}s · joined ${devicesJoined} · ${sessionId}`,
          );
        } else if (!result.skipped) {
          console.warn(`[hyperion] vgc_session_end failed: ${result.error}`);
        } else {
          console.warn(`[hyperion] vgc_session_end skipped: ${result.error}`);
        }
      })
      .catch((error) => {
        console.warn("[hyperion] vgc_session_end error:", error?.message || error);
      });
  }

  /** Map reset trigger + celebration state → vgc_session_end reason. */
  resolveSessionEndReason(resetReason) {
    if (resetReason === "inactivity") return "timeout";
    if (resetReason === "manual" && this.state.celebrating) return "completed";
    return "abandoned";
  }

  /** Final celebration page: idle → auto restart. Disabled when timeout is 0. */
  checkCelebrationTimeout() {
    if (!config.vrboCelebrationTimeoutMs || config.vrboCelebrationTimeoutMs <= 0) return;
    if (!this.state.celebrating) return;
    if (!this.state.hyperionSessionId) return;
    if (Date.now() - this.lastInteractionAt < config.vrboCelebrationTimeoutMs) return;
    this.reset("inactivity");
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
      // No "..." — message fades in complete; typing ms kept as dwell before handoff.
      this.schedule(() => {
        if (this.state.stage !== "intro") return;
        this.patch({
          messages: [
            ...this.state.messages,
            this.makeMessage({
              authorId: line.authorId,
              text: line.text,
              phase: "intro",
            }),
          ],
        });
      }, offset);
      offset += line.typing ?? 0;
    });

    offset += Math.max(chatScript.handoffPause ?? 900, 2200);
    this.schedule(() => {
      if (this.state.stage !== "intro") return;
      this.patch({ stage: "selecting", typing: [] });
    }, offset);
  }

  joinGuest(userId, displayName) {
    if ((this.state.stage !== "intro" && this.state.stage !== "selecting") || this.state.joined[userId]) {
      return;
    }
    const guest = guests.find((user) => user.id === userId);
    if (!guest) return;
    this.noteActivity();
    const trimmed = String(displayName ?? "").trim();
    const name = trimmed || guest.name;
    this.patch({
      joined: { ...this.state.joined, [userId]: true },
      displayNames: { ...this.state.displayNames, [userId]: name },
    });
  }

  togglePreference(userId, preferenceId) {
    if (!this.state.joined[userId] || this.state.submitted[userId]) return;
    this.noteActivity();
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

    this.noteActivity();
    this.patch({
      submitted: { ...this.state.submitted, [userId]: picks },
    });
    this.maybeOpenSummary();

    const fadeMs = chatScript.preference?.introFadeMs ?? 420;
    const text = picks
      .map((preferenceId) => {
        const preference = preferenceById.get(preferenceId);
        return preference?.chatLines?.[userId] ?? preference?.chatLine ?? preferenceId;
      })
      .join("\n");

    const hasIntro = this.state.messages.some((message) => message.phase === "intro");

    const revealPreference = () => {
      if (this.state.submitted[userId] == null) return;
      const rest = this.state.messages.filter(
        (message) => message.phase !== "intro" && !message.exiting,
      );
      this.patch({
        typing: withoutTyping(this.state.typing, userId),
        messages: [
          this.makeMessage({
            authorId: userId,
            text,
            preferenceIds: picks,
            phase: "preference",
          }),
          ...rest,
        ],
      });
    };

    if (hasIntro) {
      // Fade Jamie's intro, then show message — no "..." typing in between.
      this.schedule(() => {
        if (this.state.submitted[userId] == null) return;
        this.patch({
          messages: this.state.messages.map((message) =>
            message.phase === "intro" ? { ...message, exiting: true } : message,
          ),
        });
      }, 0);
      this.schedule(revealPreference, fadeMs);
    } else {
      // Later submitters: message fades in immediately.
      this.schedule(revealPreference, 0);
    }
  }

  maybeOpenSummary() {
    if (this.state.stage !== "selecting") return;
    const joinedUsers = guests.filter((user) => Boolean(this.state.joined[user.id]));
    const allSubmitted =
      joinedUsers.length > 0 &&
      joinedUsers.every((user) => Boolean(this.state.submitted[user.id]));
    if (!allSubmitted) return;

    const settle =
      (chatScript.preference?.introFadeMs ?? 420) + (chatScript.preference.stagger ?? 800);
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
    this.noteActivity();

    const guestSelections = guests
      .filter((user) => Boolean(this.state.joined[user.id]) && this.state.submitted[user.id])
      .map((user) => this.state.submitted[user.id] ?? []);

    const results = recommendPropertySet(properties, guestSelections, {
      resultBadges: rankingWeights.resultBadges,
    });

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
    this.noteActivity();
    this.patch({ previewPropertyId: propertyId });
  }

  selectProperty(propertyId) {
    if (this.state.stage !== "results" || this.state.selectedPropertyId) return;
    const result = this.state.results.find((entry) => entry.property.id === propertyId);
    if (!result) return;

    this.noteActivity();
    // Wipe prior preference / intro thread — finale starts from a clean chat.
    this.patch({
      previewPropertyId: propertyId,
      selectedPropertyId: propertyId,
      messages: [],
      typing: [],
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
    // Jamie reveal first (no "...")
    this.schedule(() => {
      this.patch({
        messages: [
          this.makeMessage({
            authorId: finale.reveal.authorId,
            text: fillTemplate(finale.reveal.text, vars),
            phase: "finale",
          }),
        ],
      });
    }, offset);
    offset += finale.reveal.typing ?? 1000;

    offset += finale.propertyPause ?? 700;
    this.schedule(() => {
      this.patch({
        messages: [
          ...this.state.messages,
          this.makeMessage({
            kind: "property",
            authorId: finale.propertyAuthorId ?? "jamie",
            propertyId,
            phase: "finale",
          }),
        ],
      });
    }, offset);

    const reactions = (finale.reactions ?? []).filter((line) => isActiveAuthor(line.authorId));
    if (!reactions.length) {
      offset += finale.celebrationPause ?? 400;
      this.schedule(() => {
        this.touch();
        this.patch({ celebrating: true });
      }, offset);
    } else {
      reactions.forEach((line, index) => {
        offset += line.pause ?? 700;
        const isLast = index === reactions.length - 1;
        // Celebration: no "..." — full message fades in.
        // On the last SMS, flip right display to locked-in art.
        this.schedule(() => {
          this.patch({
            typing: [],
            messages: [
              ...this.state.messages,
              this.makeMessage({
                authorId: line.authorId,
                text: fillTemplate(line.text, vars),
                phase: "finale",
              }),
            ],
            ...(isLast ? { celebrating: true } : {}),
          });
          if (isLast) this.touch();
        }, offset);
        if (!isLast) offset += line.typing ?? 700;
      });
    }
  }

  /**
   * @param {"manual"|"inactivity"|"page-load"} [reason]
   */
  reset(reason = "manual") {
    this.endHyperionSession(this.resolveSessionEndReason(reason));
    this.clearTimers();
    this.messageCounter = 0;
    this.hyperionSessionStartedAt = null;
    this.lastInteractionAt = Date.now();
    this.state = createInitialState(this.state.runId + 1);
    this.emit("state", this.snapshot());
    this.startIntro();
  }
}

export const vrboV2Session = new VrboV2Session();
export { guests as vrboV2Guests };
