import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { INITIAL_STATE, PHASES, pickRandomDestinations } from "../../shared/index.js";
import { DESTINATIONS, getDestination } from "../../shared/destinations.js";
import { QUESTIONS } from "../../shared/questions.js";
import { config } from "./config.js";
import {
  HYPERION_STATIONS,
  sendHyperionEvent,
} from "./hyperionEvents.js";
import { generateDestinationImage, generateItinerary } from "./openaiService.js";

const FBL_INTERACTIVE = {
  id: "expedia-oct26-fbl-interactive",
  label: "interactive",
};

const FBL_OUTPUT = {
  id: "expedia-oct26-fbl-output",
  label: "output",
};

/** Output display screen names for fbl_output_screen_changed. */
function resolveOutputScreen(state) {
  if (
    !state.destination ||
    state.phase === PHASES.DESTINATION ||
    state.phase === PHASES.IDLE
  ) {
    return "start";
  }
  if (state.phase === PHASES.BRIEFING) {
    return "briefing";
  }
  if (state.phase === PHASES.QUESTIONS) {
    const step = Math.min(Math.max(state.currentQuestion ?? 0, 0), 2) + 1;
    return `question${step}`;
  }
  if (state.phase === PHASES.PLANNING || state.phase === PHASES.REVEAL) {
    return "luggage";
  }
  if (state.phase === PHASES.BUILDING) {
    return "building";
  }
  if (state.phase === PHASES.ITINERARY) {
    return "itinerary";
  }
  return "start";
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function homeState(previousOffered = []) {
  return {
    ...cloneState(INITIAL_STATE),
    phase: PHASES.DESTINATION,
    offeredDestinations: pickRandomDestinations(6, previousOffered),
    updatedAt: Date.now(),
  };
}

export class ExperienceSession extends EventEmitter {
  constructor() {
    super();
    this.state = homeState();
    this.imageJobId = 0;
    this.itineraryJobId = 0;
    this.revealTimer = null;
    this.lastInteractionAt = Date.now();
    this.inputQuietUntil = 0;
    /** Wall-clock start for Hyperion duration_seconds (cleared on session end). */
    this.hyperionSessionStartedAt = null;
    /** Last output-display screen name (start | question1… | luggage | itinerary). */
    this.outputScreen = resolveOutputScreen(this.state);

    setInterval(() => this.checkInactivity(), 1000);
  }

  snapshot() {
    return cloneState(this.state);
  }

  touch() {
    this.lastInteractionAt = Date.now();
  }

  quiet(ms = 650) {
    this.inputQuietUntil = Date.now() + ms;
  }

  canAcceptInput(force = false) {
    return force || Date.now() >= this.inputQuietUntil;
  }

  set(patch, lastEvent) {
    this.state = {
      ...this.state,
      ...patch,
      lastEvent: lastEvent || this.state.lastEvent,
      updatedAt: Date.now(),
    };
    this.emit("state", this.snapshot());
    this.emitOutputScreenChangedIfNeeded();
  }

  emitOutputScreenChangedIfNeeded() {
    const screen = resolveOutputScreen(this.state);
    const previous = this.outputScreen;
    if (previous === screen) return;
    this.outputScreen = screen;

    const sessionId = this.state.hyperionSessionId || undefined;
    sendHyperionEvent({
      slug: "fbl_output_screen_changed",
      stationId: HYPERION_STATIONS.FAMILY_BUCKET_LIST,
      sessionId,
      sourceId: FBL_OUTPUT.id,
      fieldData: {
        device: FBL_OUTPUT.label,
        screen,
        previous_screen: previous,
      },
    })
      .then((result) => {
        if (result.ok) {
          console.log(
            `[hyperion] fbl_output_screen_changed ok · ${previous} → ${screen}`,
          );
        } else if (!result.skipped) {
          console.warn(`[hyperion] fbl_output_screen_changed failed: ${result.error}`);
        } else {
          console.warn(`[hyperion] fbl_output_screen_changed skipped: ${result.error}`);
        }
      })
      .catch((error) => {
        console.warn(
          "[hyperion] fbl_output_screen_changed error:",
          error?.message || error,
        );
      });
  }

  checkInactivity() {
    if (!config.inactivityTimeoutMs || config.inactivityTimeoutMs <= 0) return;
    if (this.state.phase === PHASES.DESTINATION && !this.state.destination) return;
    if (this.state.phase === PHASES.IDLE) return;
    if (Date.now() - this.lastInteractionAt < config.inactivityTimeoutMs) return;
    this.reset("inactivity");
  }

  begin() {
    this.reset("begin");
  }

  /**
   * First pointer interaction on the interactive display starts a Hyperion FBL session.
   * Idempotent — later clicks reuse the same sessionId and do not re-send.
   */
  startHyperionSession() {
    this.touch();
    if (this.state.hyperionSessionId) {
      return this.state.hyperionSessionId;
    }

    const sessionId = randomUUID();
    this.hyperionSessionStartedAt = Date.now();
    this.set({ hyperionSessionId: sessionId }, "hyperion-fbl-session-start");

    sendHyperionEvent({
      slug: "fbl_session_start",
      stationId: HYPERION_STATIONS.FAMILY_BUCKET_LIST,
      sessionId,
      sourceId: FBL_INTERACTIVE.id,
      fieldData: {
        device: FBL_INTERACTIVE.label,
      },
    })
      .then((result) => {
        if (result.ok) {
          console.log(`[hyperion] fbl_session_start ok · ${sessionId}`);
        } else if (!result.skipped) {
          console.warn(`[hyperion] fbl_session_start failed: ${result.error}`);
        } else {
          console.warn(`[hyperion] fbl_session_start skipped: ${result.error}`);
        }
      })
      .catch((error) => {
        console.warn("[hyperion] fbl_session_start error:", error?.message || error);
      });

    return sessionId;
  }

  /**
   * End an active Hyperion FBL session (idempotent if none).
   * @param {"completed"|"abandoned"|"timeout"|"reset"} reason
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

    this.hyperionSessionStartedAt = null;

    sendHyperionEvent({
      slug: "fbl_session_end",
      stationId: HYPERION_STATIONS.FAMILY_BUCKET_LIST,
      sessionId,
      sourceId: FBL_INTERACTIVE.id,
      fieldData: {
        device: FBL_INTERACTIVE.label,
        reason,
        duration_seconds: durationSeconds,
      },
    })
      .then((result) => {
        if (result.ok) {
          console.log(
            `[hyperion] fbl_session_end ok · ${reason} · ${durationSeconds}s · ${sessionId}`,
          );
        } else if (!result.skipped) {
          console.warn(`[hyperion] fbl_session_end failed: ${result.error}`);
        } else {
          console.warn(`[hyperion] fbl_session_end skipped: ${result.error}`);
        }
      })
      .catch((error) => {
        console.warn("[hyperion] fbl_session_end error:", error?.message || error);
      });
  }

  /** Map reset trigger + current phase → Hyperion fbl_session_end reason. */
  resolveSessionEndReason(resetReason) {
    const onItinerary = this.state.phase === PHASES.ITINERARY;
    if (resetReason === "inactivity") {
      return onItinerary ? "timeout" : "abandoned";
    }
    if (resetReason === "manual") {
      return onItinerary ? "completed" : "abandoned";
    }
    return "reset";
  }

  selectDestination(destinationId, force = false) {
    this.touch();
    if (!this.canAcceptInput(force)) return;
    if (this.state.phase !== PHASES.DESTINATION) return;
    const dest = getDestination(destinationId);
    if (!dest) return;

    this.emitDestinationChoiceMade(dest);

    this.quiet();
    this.set(
      {
        phase: PHASES.BRIEFING,
        destination: dest.id,
        answers: [],
        currentQuestion: 0,
        imageUrl: dest.image,
        imageReady: false,
        imageSource: "placeholder",
        itinerary: null,
        imageStatus: "generating",
        itineraryStatus: "idle",
      },
      "select-destination",
    );

    this.startImageGeneration();
  }

  /** Advance from booked-context briefing into question 1. */
  beginQuestions(force = false) {
    this.touch();
    if (!this.canAcceptInput(force)) return;
    if (this.state.phase !== PHASES.BRIEFING) return;
    this.quiet();
    this.set({ phase: PHASES.QUESTIONS, currentQuestion: 0 }, "begin-questions");
  }

  /**
   * Hyperion fbl_choice_made for start-screen destination pick.
   * step / question_id = 0; choice_id = 1..6 from offered grid order.
   */
  emitDestinationChoiceMade(dest) {
    const offered = this.state.offeredDestinations || [];
    const index = offered.indexOf(dest.id);
    const choiceId = index >= 0 ? index + 1 : null;
    if (choiceId == null) return;

    const sessionId = this.state.hyperionSessionId || this.startHyperionSession();
    const choiceLabel = dest.location
      ? `${dest.shortTitle}, ${dest.location}`
      : dest.shortTitle || dest.title;

    sendHyperionEvent({
      slug: "fbl_choice_made",
      stationId: HYPERION_STATIONS.FAMILY_BUCKET_LIST,
      sessionId,
      sourceId: FBL_INTERACTIVE.id,
      fieldData: {
        device: FBL_INTERACTIVE.label,
        step: 0,
        question_id: 0,
        question_label: "where will your family go next",
        choice_id: choiceId,
        choice_label: choiceLabel,
        screen: "start",
      },
    })
      .then((result) => {
        if (result.ok) {
          console.log(
            `[hyperion] fbl_choice_made ok · destination #${choiceId} · ${sessionId}`,
          );
        } else if (!result.skipped) {
          console.warn(`[hyperion] fbl_choice_made (destination) failed: ${result.error}`);
        } else {
          console.warn(`[hyperion] fbl_choice_made (destination) skipped: ${result.error}`);
        }
      })
      .catch((error) => {
        console.warn(
          "[hyperion] fbl_choice_made (destination) error:",
          error?.message || error,
        );
      });
  }

  /**
   * Hyperion fbl_choice_made — once per newly locked answer.
   * step / question_id = 1..3; choice_id = "1-a", "1-b", …
   */
  emitChoiceMade(questionIndex, answerId) {
    const question = QUESTIONS[questionIndex];
    const optionIndex = question?.options.findIndex((option) => option.id === answerId);
    const option = optionIndex >= 0 ? question.options[optionIndex] : null;
    if (!question || !option) return;

    const step = questionIndex + 1;
    const choiceLetter = String.fromCharCode(97 + optionIndex); // a, b, c…
    const sessionId = this.state.hyperionSessionId || this.startHyperionSession();

    sendHyperionEvent({
      slug: "fbl_choice_made",
      stationId: HYPERION_STATIONS.FAMILY_BUCKET_LIST,
      sessionId,
      sourceId: FBL_INTERACTIVE.id,
      fieldData: {
        device: FBL_INTERACTIVE.label,
        step,
        question_id: step,
        question_label: question.prompt,
        choice_id: `${step}-${choiceLetter}`,
        choice_label: option.label,
        screen: `question${step}`,
      },
    })
      .then((result) => {
        if (result.ok) {
          console.log(
            `[hyperion] fbl_choice_made ok · q${step} ${step}-${choiceLetter} · ${sessionId}`,
          );
        } else if (!result.skipped) {
          console.warn(`[hyperion] fbl_choice_made failed: ${result.error}`);
        } else {
          console.warn(`[hyperion] fbl_choice_made skipped: ${result.error}`);
        }
      })
      .catch((error) => {
        console.warn("[hyperion] fbl_choice_made error:", error?.message || error);
      });
  }

  answerQuestion(questionIndex, answerId, force = false, { advance = true } = {}) {
    this.touch();
    if (!this.canAcceptInput(force)) return;
    if (this.state.phase !== PHASES.QUESTIONS) return;
    if (questionIndex !== this.state.currentQuestion) return;

    const question = QUESTIONS[questionIndex];
    if (!question) return;
    if (!question.options.some((option) => option.id === answerId)) return;

    const lockedId = this.state.answers[questionIndex];
    if (lockedId && lockedId !== answerId) return;

    const isNewChoice = !lockedId;
    const answers = lockedId ? this.state.answers : [...this.state.answers, answerId];

    if (isNewChoice) {
      this.emitChoiceMade(questionIndex, answerId);
    }

    if (!advance) {
      if (!lockedId) {
        this.touch();
        this.set({ answers }, `answer-lock-${questionIndex}`);
      }
      return;
    }

    this.quiet();
    const nextIndex = questionIndex + 1;

    if (nextIndex >= QUESTIONS.length) {
      this.set(
        {
          answers,
          currentQuestion: nextIndex,
          phase: PHASES.REVEAL,
          itineraryStatus: "generating",
        },
        "answer-final",
      );
      this.startItineraryGeneration();
      return;
    }

    this.set(
      {
        answers,
        currentQuestion: nextIndex,
      },
      `answer-${nextIndex}`,
    );
  }

  goBack(force = false) {
    this.touch();
    if (!this.canAcceptInput(force)) return;
    if (this.state.phase !== PHASES.QUESTIONS) return;

    this.quiet();

    // Answer locked for current question but not advanced yet — unlock only.
    if (this.state.answers.length > this.state.currentQuestion) {
      this.set(
        {
          answers: this.state.answers.slice(0, this.state.currentQuestion),
        },
        "unlock-answer",
      );
      return;
    }

    if (this.state.currentQuestion <= 0) {
      this.imageJobId += 1;
      this.set(
        {
          phase: PHASES.DESTINATION,
          destination: null,
          answers: [],
          currentQuestion: 0,
          imageUrl: null,
          imageReady: false,
          imageSource: null,
          itinerary: null,
          imageStatus: "idle",
          itineraryStatus: "idle",
        },
        "back-to-destination",
      );
      return;
    }

    this.set(
      {
        answers: this.state.answers.slice(0, -1),
        currentQuestion: this.state.currentQuestion - 1,
      },
      "back-question",
    );
  }

  async startImageGeneration() {
    const jobId = ++this.imageJobId;
    const { destination, answers } = this.state;

    const result = await generateDestinationImage({ destination, answers });
    if (jobId !== this.imageJobId) return;
    if (this.state.phase === PHASES.IDLE) return;

    this.set(
      {
        imageUrl: result.imageUrl || getDestination(destination)?.image || this.state.imageUrl,
        imageReady: true,
        imageSource: result.source,
        imageStatus: result.ok ? "ready" : "fallback",
      },
      result.ok ? "image-ready" : "image-fallback",
    );
  }

  async startItineraryGeneration() {
    const jobId = ++this.itineraryJobId;
    const { destination, answers } = this.state;
    const result = await generateItinerary({ destination, answers });
    if (jobId !== this.itineraryJobId) return;
    if (
      this.state.phase !== PHASES.PLANNING &&
      this.state.phase !== PHASES.REVEAL &&
      this.state.phase !== PHASES.BUILDING
    ) {
      return;
    }

    const itinerary = result.itinerary || getDestination(destination)?.fallbackItinerary || null;

    this.set(
      {
        itinerary,
        itineraryStatus: result.ok ? "ready" : "fallback",
      },
      result.ok ? "itinerary-ready" : "itinerary-fallback",
    );
  }

  scheduleRevealFromPlanning(delayMs = 3800) {
    clearTimeout(this.revealTimer);
    this.revealTimer = setTimeout(() => {
      if (this.state.phase !== PHASES.PLANNING) return;
      this.set({ phase: PHASES.REVEAL }, "planning-complete");
    }, delayMs);
  }

  scheduleBuildingToItinerary(delayMs = config.buildingHoldMs) {
    clearTimeout(this.revealTimer);
    this.revealTimer = setTimeout(() => {
      if (this.state.phase !== PHASES.BUILDING) return;
      this.set({ phase: PHASES.ITINERARY }, "building-complete");
    }, delayMs);
  }

  shake() {
    this.touch();
    if (this.state.phase !== PHASES.REVEAL) return;

    const dest = getDestination(this.state.destination);
    const itinerary = this.state.itinerary || dest?.fallbackItinerary || null;
    this.itineraryJobId += 1;
    clearTimeout(this.revealTimer);
    this.quiet();
    this.set(
      {
        itinerary,
        itineraryStatus: this.state.itinerary ? this.state.itineraryStatus : "fallback",
        phase: PHASES.BUILDING,
      },
      "shake",
    );
    this.scheduleBuildingToItinerary();
  }

  reset(reason = "manual") {
    this.touch();
    this.inputQuietUntil = 0;
    this.imageJobId += 1;
    this.itineraryJobId += 1;
    clearTimeout(this.revealTimer);
    this.endHyperionSession(this.resolveSessionEndReason(reason));
    const previous = this.state.offeredDestinations;
    this.set(homeState(previous), `reset:${reason}`);
  }

  debugSkip() {
    this.touch();
    this.inputQuietUntil = 0;
    const { phase } = this.state;

    if (phase === PHASES.IDLE) {
      this.reset("debug-skip");
      return;
    }

    if (phase === PHASES.DESTINATION) {
      const offered = this.state.offeredDestinations?.[0] || DESTINATIONS[0].id;
      this.selectDestination(offered, true);
      return;
    }

    if (phase === PHASES.BRIEFING) {
      this.beginQuestions(true);
      return;
    }

    if (phase === PHASES.QUESTIONS) {
      const question = QUESTIONS[this.state.currentQuestion];
      this.answerQuestion(this.state.currentQuestion, question.options[0].id, true);
      return;
    }

    if (phase === PHASES.PLANNING) {
      clearTimeout(this.revealTimer);
      this.set({ phase: PHASES.REVEAL }, "debug-skip-planning");
      return;
    }

    if (phase === PHASES.REVEAL) {
      this.shake();
      return;
    }

    if (phase === PHASES.BUILDING) {
      clearTimeout(this.revealTimer);
      this.set({ phase: PHASES.ITINERARY }, "debug-skip-building");
      return;
    }

    if (phase === PHASES.ITINERARY) {
      this.reset("debug-skip");
    }
  }

  debugSimulateImage() {
    this.touch();
    const dest = getDestination(this.state.destination);
    if (!dest) return;
    this.imageJobId += 1;
    this.set(
      {
        imageUrl: dest.image,
        imageReady: true,
        imageSource: "fallback",
        imageStatus: "fallback",
      },
      "debug-image",
    );
  }

  debugSimulateItinerary() {
    this.touch();
    const dest = getDestination(this.state.destination);
    if (!dest) return;
    this.itineraryJobId += 1;
    clearTimeout(this.revealTimer);
    this.set(
      {
        itinerary: dest.fallbackItinerary,
        itineraryStatus: "fallback",
        phase: PHASES.ITINERARY,
      },
      "debug-itinerary",
    );
  }

  /** Dev shortcut: jump to luggage / building / itinerary with seed data. */
  debugJump(target) {
    this.touch();
    this.inputQuietUntil = 0;
    clearTimeout(this.revealTimer);
    this.imageJobId += 1;
    this.itineraryJobId += 1;

    const destId =
      this.state.destination ||
      this.state.offeredDestinations?.[0] ||
      DESTINATIONS[0].id;
    const dest = getDestination(destId);
    if (!dest) return;

    const answers =
      this.state.answers?.length === QUESTIONS.length
        ? this.state.answers
        : QUESTIONS.map((question) => question.options[0].id);

    const seeded = {
      destination: destId,
      answers,
      currentQuestion: QUESTIONS.length,
      imageUrl: dest.image,
      imageReady: true,
      imageSource: "fallback",
      imageStatus: "fallback",
      itinerary: dest.fallbackItinerary,
      itineraryStatus: "fallback",
    };

    if (target === "reveal" || target === "luggage") {
      this.set({ ...seeded, phase: PHASES.REVEAL }, "debug-jump-reveal");
      return;
    }

    if (target === "building") {
      this.set({ ...seeded, phase: PHASES.BUILDING }, "debug-jump-building");
      this.scheduleBuildingToItinerary();
      return;
    }

    if (target === "itinerary") {
      this.set({ ...seeded, phase: PHASES.ITINERARY }, "debug-jump-itinerary");
    }
  }
}

export const session = new ExperienceSession();
