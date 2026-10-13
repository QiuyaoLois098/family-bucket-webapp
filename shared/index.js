export { DESTINATIONS, getDestination } from "./destinations.js";
export {
  QUESTIONS,
  BLUR_LEVELS,
  REVEAL_VISIBLE,
  defaultAnswerId,
  resolveAnswerOption,
  isValidAnswer,
} from "./questions.js";
import { DESTINATIONS } from "./destinations.js";
import { BLUR_LEVELS, REVEAL_VISIBLE } from "./questions.js";

export const PHASES = {
  IDLE: "idle",
  DESTINATION: "destination",
  BRIEFING: "briefing",
  QUESTIONS: "questions",
  PLANNING: "planning",
  REVEAL: "reveal",
  BUILDING: "building",
  ITINERARY: "itinerary",
};

export const INITIAL_STATE = {
  phase: PHASES.DESTINATION,
  destination: null,
  offeredDestinations: [],
  answers: [],
  currentQuestion: 0,
  imageUrl: null,
  imageReady: false,
  imageSource: null,
  itinerary: null,
  imageStatus: "idle",
  itineraryStatus: "idle",
  /** Hyperion FBL session id — set on first interactive click; cleared on reset */
  hyperionSessionId: null,
  lastEvent: "init",
  updatedAt: 0,
};

export function pickRandomDestinations(count = 6, previousIds = []) {
  const ids = DESTINATIONS.map((item) => item.id);
  const previousKey = [...previousIds].sort().join("|");

  const shuffle = () => {
    const copy = [...ids];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
  };

  let next = shuffle();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if ([...next].sort().join("|") !== previousKey) break;
    next = shuffle();
  }
  return next;
}

export function getBlurPx(answerCount) {
  const index = Math.min(Math.max(answerCount, 0), BLUR_LEVELS.length - 1);
  return BLUR_LEVELS[index];
}

/** Scale factor so the viewport shows only the center fraction of the image. */
export function getRevealScale(answerCount) {
  const index = Math.min(Math.max(answerCount, 0), REVEAL_VISIBLE.length - 1);
  const visible = REVEAL_VISIBLE[index];
  return 1 / visible;
}
