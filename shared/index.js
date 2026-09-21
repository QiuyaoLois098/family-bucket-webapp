export { DESTINATIONS, getDestination } from "./destinations.js";
export { QUESTIONS, BLUR_LEVELS } from "./questions.js";
import { DESTINATIONS } from "./destinations.js";

export const PHASES = {
  IDLE: "idle",
  DESTINATION: "destination",
  QUESTIONS: "questions",
  REVEAL: "reveal",
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
  if (answerCount <= 0) return 40;
  if (answerCount === 1) return 28;
  if (answerCount === 2) return 14;
  return 0;
}
