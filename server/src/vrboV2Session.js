import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  assembleGuestParts,
  buildGroupRequest,
  buildJamieParts,
  partsToText,
  pickSharedPriorities,
} from "../../shared/vrboChatCopy.js";
import { recommendPropertySet } from "../../shared/vrboRecommendPropertySet.js";
import { applyStayCopy, countFeatureSelections } from "../../shared/vrboStayCopy.js";
import { config } from "./config.js";
import {
  HYPERION_STATIONS,
  sendHyperionEvent,
} from "./hyperionEvents.js";

const VGC_ORGANIZER = {
  id: "expedia-oct26-vgc-organizer",
  label: "organizer",
};

/** Hyperion device values → Device IDs (event brief, section 2). */
const VGC_DEVICES = Object.freeze({
  organizer: "expedia-oct26-vgc-organizer",
  output: "expedia-oct26-vgc-output",
  "phone-1": "expedia-oct26-vgc-phone-1",
  "phone-2": "expedia-oct26-vgc-phone-2",
  "phone-3": "expedia-oct26-vgc-phone-3",
});

/** Devices that send vgc_device_joined / vgc_device_left (the organizer owns the session). */
const VGC_JOINING_DEVICES = new Set(["output", "phone-1", "phone-2", "phone-3"]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../client/src/data/vrbo-v2");

function loadJson(name) {
  return JSON.parse(readFileSync(path.join(dataDir, name), "utf8"));
}

/** Reload each read so chatScript edits apply without a full server restart. */
function getChatScript() {
  return loadJson("chatScript.json");
}

const copy = loadJson("copy.json");
const preferences = loadJson("preferences.json");
const properties = loadJson("properties.json");
const rankingWeights = loadJson("rankingWeights.json");
const users = loadJson("users.json");

const guests = users.filter((user) => user.role === "guest");

/** Guest id → Hyperion phone device (sarah → /vrbo-ip1 → phone-1, …). */
function phoneForGuest(userId) {
  return `phone-${guests.findIndex((user) => user.id === userId) + 1}`;
}
const preferenceOrder = new Map(preferences.map((preference, index) => [preference.id, index]));
const preferenceById = new Map(preferences.map((preference) => [preference.id, preference]));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function emptyMap(value) {
  return guests.reduce((map, user) => ({ ...map, [user.id]: value() }), {});
}

function submittedLists(submitted, joined) {
  return guests
    .filter((user) => Boolean(joined[user.id]) && submitted[user.id])
    .map((user) => submitted[user.id] ?? []);
}

function buildSummaryText(submitted, joined) {
  const counts = countFeatureSelections(submittedLists(submitted, joined));
  return buildGroupRequest(counts, copy);
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
    sharedPriorityIds: [],
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
    /** socket.id → Hyperion device value (organizer, output, phone-1..3) for open device pages. */
    this.deviceSockets = new Map();
    /** device value → ms timestamp it joined the current session (dwell time). */
    this.deviceJoinedAt = new Map();
    /** vgc_interaction events sent in the current session. */
    this.interactionCount = 0;
    /** Last output-display screen name reported (null until an output page is open). */
    this.lastOutputScreen = null;
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

  /**
   * Guest/organizer activity: bump the idle clock only.
   * The Hyperion session does NOT start here — it starts when the first guest taps Join.
   */
  noteActivity() {
    this.touch();
  }

  devicesJoinedCount() {
    return guests.filter((user) => Boolean(this.state.joined[user.id])).length;
  }

  /**
   * The first guest tapping Join on a phone starts a VGC session (see joinGuest).
   * Idempotent — broadcasts sessionId via state to output + phones.
   * Starts the session duration timer.
   */
  startHyperionSession() {
    if (this.state.hyperionSessionId) {
      return this.state.hyperionSessionId;
    }

    const sessionId = randomUUID();
    this.hyperionSessionStartedAt = Date.now();
    this.interactionCount = 0;
    this.deviceJoinedAt.clear();
    this.touch();
    this.patch({ hyperionSessionId: sessionId });

    // Open phones + output display receive the session id now → start their dwell time.
    for (const label of new Set(this.deviceSockets.values())) {
      if (VGC_JOINING_DEVICES.has(label)) this.joinDevice(label);
    }

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
    // Devices that actually joined (phones + output); fall back to guests who tapped Join.
    const devicesJoined = this.deviceJoinedAt.size || this.devicesJoinedCount();
    const interactionsCount = this.interactionCount;

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
        interactions_count: interactionsCount,
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

    // Organizer ended the session → every device that joined leaves it (ends their dwell time).
    for (const label of [...this.deviceJoinedAt.keys()]) {
      this.leaveDevice(label, reason === "timeout" ? "timeout" : "session_ended", sessionId);
    }
    this.interactionCount = 0;
  }

  /** Send one VGC event as `deviceLabel` (its own Device ID + `device` field). */
  sendVgcEvent(slug, deviceLabel, fieldData = {}, { sessionId = this.state.hyperionSessionId } = {}) {
    const sourceId = VGC_DEVICES[deviceLabel];
    if (!sourceId) return;

    sendHyperionEvent({
      slug,
      stationId: HYPERION_STATIONS.VRBO_GROUP_CHAT,
      sessionId: sessionId || undefined,
      sourceId,
      fieldData: { device: deviceLabel, ...fieldData },
    })
      .then((result) => {
        if (result.ok) {
          console.log(`[hyperion] ${slug} ok · ${deviceLabel}`);
        } else if (!result.skipped) {
          console.warn(`[hyperion] ${slug} failed: ${result.error}`);
        }
      })
      .catch((error) => {
        console.warn(`[hyperion] ${slug} error:`, error?.message || error);
      });
  }

  deviceConnected(label) {
    for (const value of this.deviceSockets.values()) {
      if (value === label) return true;
    }
    return false;
  }

  /**
   * A device page (/vrbo-left, /vrbo-right, /vrbo-ip1..3) says which device it is.
   * Pass `label = null` to forget the socket. The same label from two sockets counts once.
   */
  registerDevice(socketId, label) {
    const previous = this.deviceSockets.get(socketId);
    if (label == null || !VGC_DEVICES[label]) {
      this.unregisterDevice(socketId);
      return;
    }
    if (previous === label) return;
    if (previous) this.unregisterDevice(socketId);

    this.deviceSockets.set(socketId, label);
    if (label === "output") this.lastOutputScreen = this.outputScreenName();

    if (
      this.state.hyperionSessionId &&
      VGC_JOINING_DEVICES.has(label) &&
      !this.deviceJoinedAt.has(label)
    ) {
      this.joinDevice(label);
    }
  }

  unregisterDevice(socketId) {
    const label = this.deviceSockets.get(socketId);
    if (!label) return;
    this.deviceSockets.delete(socketId);
    if (this.deviceConnected(label)) return;

    if (this.deviceJoinedAt.has(label)) this.leaveDevice(label, "disconnected");
    if (label === "output") this.lastOutputScreen = null;
  }

  joinDevice(label) {
    this.deviceJoinedAt.set(label, Date.now());
    this.sendVgcEvent("vgc_device_joined", label, label === "output" ? { screen: this.outputScreenName() } : {});
  }

  leaveDevice(label, reason, sessionId = this.state.hyperionSessionId) {
    const joinedAt = this.deviceJoinedAt.get(label);
    if (joinedAt == null) return;
    this.deviceJoinedAt.delete(label);
    this.sendVgcEvent(
      "vgc_device_left",
      label,
      {
        reason,
        duration_seconds: Math.max(0, Math.round((Date.now() - joinedAt) / 1000)),
      },
      { sessionId },
    );
  }

  /**
   * One front-end interaction (phone or output display), whether it came from the real
   * device page or the /vrbo-v2 overview. Never starts a session — only Join does —
   * so it carries the shared sessionId when one exists.
   */
  logInteraction(deviceLabel, { action, label, elementId, screen, value }) {
    if (!VGC_DEVICES[deviceLabel]) return;
    this.interactionCount += 1;
    this.sendVgcEvent("vgc_interaction", deviceLabel, {
      action,
      label,
      ...(elementId ? { element_id: elementId } : {}),
      ...(screen ? { screen } : {}),
      ...(value != null ? { value: String(value) } : {}),
    });
  }

  /** vgc_error from a device page (JS error, dropped socket). No personal data in `message`. */
  reportDeviceError(socketId, payload) {
    const label = this.deviceSockets.get(socketId);
    if (!label) return;
    const severity = ["warning", "error", "fatal"].includes(payload?.severity)
      ? payload.severity
      : "error";
    this.sendVgcEvent("vgc_error", label, {
      code: String(payload?.code || "UNKNOWN").slice(0, 40),
      message: String(payload?.message || "Unknown error").slice(0, 200),
      severity,
      ...(payload?.screen ? { screen: String(payload.screen).slice(0, 40) } : {}),
    });
  }

  /** Stable names for what Display 2 (the output display) is showing. */
  outputScreenName(state = this.state) {
    if (state.celebrating) return "celebration";
    if (state.stage === "summary") return "summary";
    if (state.stage === "searching") return "searching";
    if (state.stage === "results") return "results";

    const joinedGuests = guests.filter((user) => Boolean(state.joined[user.id]));
    const allSubmitted =
      joinedGuests.length >= 2 && joinedGuests.every((user) => Boolean(state.submitted[user.id]));
    const plannerReady = (state.messages ?? []).some((message) => message.phase === "planner");
    return allSubmitted && plannerReady ? "pulling" : "attract";
  }

  /** Send vgc_output_screen_changed when Display 2 moves to a new screen (only if its page is open). */
  noteOutputScreen() {
    if (!this.deviceConnected("output")) return;
    const screen = this.outputScreenName();
    const previous = this.lastOutputScreen;
    if (screen === previous) return;
    this.lastOutputScreen = screen;
    this.sendVgcEvent("vgc_output_screen_changed", "output", {
      screen,
      ...(previous ? { previous_screen: previous } : {}),
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
    this.sendVgcEvent("vgc_timeout", "organizer", {
      idle_seconds: Math.round((Date.now() - this.lastInteractionAt) / 1000),
      screen: "celebration",
      action_taken: "reset",
    });
    this.reset("inactivity");
  }

  makeMessage(message) {
    this.messageCounter += 1;
    return { id: `m${this.state.runId}-${this.messageCounter}`, kind: "text", ...message };
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
    this.noteOutputScreen();
  }

  patch(patch, emit = true) {
    this.setState({ ...this.state, ...patch }, emit);
  }

  startIntro() {
    this.clearTimers();
    let offset = 0;

    const chatScript = getChatScript();
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
    // First Join starts the session (vgc_session_start) before this click is logged.
    this.startHyperionSession();
    // Never send the typed name (personal data) — only that Join was pressed.
    this.logInteraction(phoneForGuest(userId), {
      action: "click",
      label: "Join group",
      elementId: "join",
      screen: "join",
    });
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
    this.logInteraction(phoneForGuest(userId), {
      action: "select",
      label: `${has ? "Deselect" : "Select"} ${preferenceById.get(preferenceId)?.label ?? preferenceId}`,
      elementId: preferenceId,
      screen: "select",
    });
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
    this.logInteraction(phoneForGuest(userId), {
      action: "submit",
      label: "Send priorities",
      elementId: "send",
      screen: "select",
    });
    const nextSubmitted = { ...this.state.submitted, [userId]: picks };
    this.patch({
      submitted: nextSubmitted,
    });
    this.maybeOpenSummary();

    const pref = getChatScript().preference;
    const fadeMs = pref?.introFadeMs ?? 420;
    const submitDelayMs = pref?.submitDelayMs ?? 1000;
    const parts = assembleGuestParts(userId, picks, preferences, copy);
    const text = partsToText(parts);

    const hasIntro = this.state.messages.some((message) => message.phase === "intro");

    const revealPreference = () => {
      if (this.state.submitted[userId] == null) return;
      const rest = this.state.messages.filter(
        (message) => message.phase !== "intro" && !message.exiting,
      );
      this.patch({
        typing: withoutTyping(this.state.typing, userId),
        messages: [
          ...rest,
          this.makeMessage({
            authorId: userId,
            text,
            parts,
            preferenceIds: picks,
            phase: "preference",
          }),
        ],
      });
    };

    if (hasIntro) {
      // Phone submit first; wait, then fade Jamie's intro and show the SMS.
      this.schedule(() => {
        if (this.state.submitted[userId] == null) return;
        this.patch({
          messages: this.state.messages.map((message) =>
            message.phase === "intro" ? { ...message, exiting: true } : message,
          ),
        });
      }, Math.max(0, submitDelayMs - fadeMs));
      this.schedule(revealPreference, submitDelayMs);
    } else {
      this.schedule(revealPreference, submitDelayMs);
    }
  }

  maybeOpenSummary() {
    if (this.state.stage !== "selecting") return;
    const joinedUsers = guests.filter((user) => Boolean(this.state.joined[user.id]));
    // Need ≥2 guests joined + every joined guest submitted (one submitter alone waits).
    const allSubmitted =
      joinedUsers.length >= 2 &&
      joinedUsers.every((user) => Boolean(this.state.submitted[user.id]));
    if (!allSubmitted) return;

    const pref = getChatScript().preference;
    const submitDelayMs = pref?.submitDelayMs ?? 1000;
    const boldAfterTextsMs = pref?.boldAfterTextsMs ?? 400;
    const jamieDelayMs = pref?.jamieDelayMs ?? 1000;
    const pullingMs = pref?.pullingMs ?? 2200;

    this.schedule(() => {
      if (this.state.stage !== "selecting") return;
      const stillJoined = guests.filter((user) => Boolean(this.state.joined[user.id]));
      const stillReady =
        stillJoined.length >= 2 &&
        stillJoined.every((user) => Boolean(this.state.submitted[user.id]));
      if (!stillReady) return;

      const counts = countFeatureSelections(
        submittedLists(this.state.submitted, this.state.joined),
      );
      this.patch({ sharedPriorityIds: pickSharedPriorities(counts) });
    }, submitDelayMs + boldAfterTextsMs);

    this.schedule(() => {
      if (this.state.stage !== "selecting") return;
      const stillJoined = guests.filter((user) => Boolean(this.state.joined[user.id]));
      const stillReady =
        stillJoined.length >= 2 &&
        stillJoined.every((user) => Boolean(this.state.submitted[user.id]));
      if (!stillReady) return;

      const priorities = aggregatePreferences(this.state.submitted, this.state.joined);
      const counts = countFeatureSelections(
        submittedLists(this.state.submitted, this.state.joined),
      );
      const sharedPriorityIds = pickSharedPriorities(counts);
      const selections = guests
        .filter((user) => Boolean(this.state.joined[user.id]) && this.state.submitted[user.id])
        .map((user) => ({ userId: user.id, picks: this.state.submitted[user.id] ?? [] }));
      const jamieParts = buildJamieParts(sharedPriorityIds, copy, { selections });
      const messages = [...this.state.messages];
      if (jamieParts) {
        messages.push(
          this.makeMessage({
            authorId: "jamie",
            text: partsToText(jamieParts),
            parts: jamieParts,
            phase: "planner",
          }),
        );
      }
      // Jamie's SMS lands on Display 1 first. Display 2 keeps its opening loop until
      // this message exists, then shows "Pulling it all together…" (see RankingScreen).
      this.patch({
        priorities,
        sharedPriorityIds,
        typing: [],
        messages,
      });

      // Hold the "Pulling it all together…" panel, then open the summary.
      this.schedule(() => {
        if (this.state.stage !== "selecting") return;
        this.patch({
          stage: "summary",
          summaryText: buildSummaryText(this.state.submitted, this.state.joined),
        });
      }, pullingMs);
    }, submitDelayMs + boldAfterTextsMs + jamieDelayMs);
  }

  searchStays() {
    if (this.state.stage !== "summary") return;
    this.noteActivity();
    this.logInteraction("output", {
      action: "click",
      label: "Search stays",
      elementId: "search",
      screen: "summary",
    });

    // Handoff: search loading ~2200ms — reuse "Pulling it all together" panel.
    this.patch({
      stage: "searching",
      celebrating: false,
    });

    const loadingMs = rankingWeights.searchLoadingMs ?? 2200;
    this.schedule(() => {
      if (this.state.stage !== "searching") return;

      const guestSelections = guests
        .filter((user) => Boolean(this.state.joined[user.id]) && this.state.submitted[user.id])
        .map((user) => this.state.submitted[user.id] ?? []);

      const results = applyStayCopy(
        recommendPropertySet(properties, guestSelections, {
          resultBadges: rankingWeights.resultBadges,
        }),
        guestSelections,
        copy,
      );

      this.patch({
        stage: "results",
        results,
        previewPropertyId: results[0]?.property.id ?? null,
        selectedPropertyId: null,
        celebrating: false,
      });
    }, loadingMs);
  }

  previewProperty(propertyId) {
    if (this.state.stage !== "results" || this.state.selectedPropertyId) return;
    if (!this.state.results.some((result) => result.property.id === propertyId)) return;
    this.noteActivity();
    this.logInteraction("output", {
      action: "select",
      label: "Preview stay",
      elementId: propertyId,
      screen: "results",
    });
    this.patch({ previewPropertyId: propertyId });
  }

  selectProperty(propertyId) {
    if (this.state.stage !== "results" || this.state.selectedPropertyId) return;
    const result = this.state.results.find((entry) => entry.property.id === propertyId);
    if (!result) return;

    this.noteActivity();
    this.logInteraction("output", {
      action: "click",
      label: "Select stay",
      elementId: propertyId,
      screen: "results",
    });
    // Wipe prior preference / intro thread — finale starts from a clean chat.
    this.patch({
      previewPropertyId: propertyId,
      selectedPropertyId: propertyId,
      messages: [],
      typing: [],
    });

    const finale = getChatScript().finale;
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

    // Guests only — Jamie's closing SMS is intentionally omitted from the script.
    const reactions = (finale.reactions ?? []).filter(
      (line) => line.authorId !== "jamie" && isActiveAuthor(line.authorId),
    );
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
    this.noteOutputScreen();
    this.startIntro();
  }
}

export const vrboV2Session = new VrboV2Session();
export { guests as vrboV2Guests };
