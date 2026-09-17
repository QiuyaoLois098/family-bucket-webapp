import { EventEmitter } from "events";
import { INITIAL_STATE, PHASES, pickRandomDestinations } from "../../shared/index.js";
import { DESTINATIONS, getDestination } from "../../shared/destinations.js";
import { QUESTIONS } from "../../shared/questions.js";
import { config } from "./config.js";
import { generateDestinationImage, generateItinerary } from "./openaiService.js";

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function homeState(previousOffered = []) {
  return {
    ...cloneState(INITIAL_STATE),
    phase: PHASES.DESTINATION,
    offeredDestinations: pickRandomDestinations(4, previousOffered),
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
  }

  checkInactivity() {
    if (this.state.phase === PHASES.DESTINATION && !this.state.destination) return;
    if (this.state.phase === PHASES.IDLE) return;
    if (Date.now() - this.lastInteractionAt < config.inactivityTimeoutMs) return;
    this.reset("inactivity");
  }

  begin() {
    this.reset("begin");
  }

  selectDestination(destinationId, force = false) {
    this.touch();
    if (!this.canAcceptInput(force)) return;
    if (this.state.phase !== PHASES.DESTINATION) return;
    const dest = getDestination(destinationId);
    if (!dest) return;

    this.quiet();
    this.set(
      {
        phase: PHASES.QUESTIONS,
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

  answerQuestion(questionIndex, answerId, force = false) {
    this.touch();
    if (!this.canAcceptInput(force)) return;
    if (this.state.phase !== PHASES.QUESTIONS) return;
    if (questionIndex !== this.state.currentQuestion) return;

    const question = QUESTIONS[questionIndex];
    if (!question) return;
    if (!question.options.some((option) => option.id === answerId)) return;
    if (this.state.answers[questionIndex]) return;

    this.quiet();
    const answers = [...this.state.answers, answerId];
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
    if (this.state.phase !== PHASES.REVEAL) return;

    const itinerary = result.itinerary || getDestination(destination)?.fallbackItinerary || null;

    this.set(
      {
        itinerary,
        itineraryStatus: result.ok ? "ready" : "fallback",
      },
      result.ok ? "itinerary-ready" : "itinerary-fallback",
    );
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
        phase: PHASES.ITINERARY,
      },
      "shake",
    );
  }

  reset(reason = "manual") {
    this.touch();
    this.inputQuietUntil = 0;
    this.imageJobId += 1;
    this.itineraryJobId += 1;
    clearTimeout(this.revealTimer);
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

    if (phase === PHASES.QUESTIONS) {
      const question = QUESTIONS[this.state.currentQuestion];
      this.answerQuestion(this.state.currentQuestion, question.options[0].id, true);
      return;
    }

    if (phase === PHASES.REVEAL) {
      this.shake();
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
}

export const session = new ExperienceSession();
