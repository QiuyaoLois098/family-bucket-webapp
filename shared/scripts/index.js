import asheville from "./asheville.js";
import laFortuna from "./la-fortuna.js";
import reykjavik from "./reykjavik.js";
import sedona from "./sedona.js";
import southLakeTahoe from "./south-lake-tahoe.js";
import tokyo from "./tokyo.js";

export const DESTINATION_SCRIPTS = {
  "south-lake-tahoe": southLakeTahoe,
  asheville,
  sedona,
  "la-fortuna": laFortuna,
  tokyo,
  reykjavik,
};

export function getDestinationScript(destinationId) {
  return DESTINATION_SCRIPTS[destinationId] ?? null;
}

export function getQuestion(script, questionId) {
  if (!script || questionId == null) return null;
  return script.questions?.[questionId] ?? null;
}

export function getAnswer(script, answerId) {
  if (!script || answerId == null) return null;
  return script.answers?.[answerId] ?? null;
}

export function getQuestionAnswers(script, questionId) {
  const question = getQuestion(script, questionId);
  if (!question) return [];
  return (question.answerIds ?? [])
    .map((id) => getAnswer(script, id))
    .filter(Boolean);
}

export function getStartQuestion(script) {
  if (!script) return null;
  return getQuestion(script, script.startQuestionId);
}

/** Map a script answer → UI option shape used by QuestionStep / AnswerFinaleStep. */
export function answerToOption(answer) {
  if (!answer) return null;
  const chip = answer.aiReplyChip;
  return {
    id: answer.id,
    label: answer.text,
    description: answer.subtitle,
    badge: answer.chipText || undefined,
    badgeTone: String(answer.chipText || "").toLowerCase().includes("expedia")
      ? "bookable"
      : "maps",
    image: answer.image,
    youSay: answer.replyMsg || "",
    aiSay: answer.aiReplyMsg || "",
    answerCard: chip
      ? {
          title: chip.title,
          meta: chip.subtitle,
          badge: chip.chipText,
          image: answer.image,
        }
      : null,
    nextQuestionId: answer.nextQuestionId ?? null,
  };
}

/** Map a script question → UI question shape (prompt + options). */
export function questionToUi(script, questionId) {
  const question = getQuestion(script, questionId);
  if (!question) return null;
  return {
    id: question.id,
    prompt: question.text,
    pickHint: "(Pick 1 option)",
    options: getQuestionAnswers(script, questionId).map(answerToOption),
  };
}

export function defaultScriptAnswerId(script, questionId) {
  const answers = getQuestionAnswers(script, questionId);
  return answers[0]?.id ?? null;
}

export function isValidScriptAnswer(script, questionId, answerId) {
  const question = getQuestion(script, questionId);
  return Boolean(question?.answerIds?.includes(answerId) && getAnswer(script, answerId));
}

const ITINERARY_DAY_COUNT = 5;
const FALLBACK_DAY_IMAGES = [
  "/images/Expedia-images/03-itinerary/it1.png",
  "/images/Expedia-images/03-itinerary/it2.png",
  "/images/Expedia-images/03-itinerary/it3.png",
  "/images/Expedia-images/03-itinerary/it4.png",
  "/images/Expedia-images/03-itinerary/it5.png",
];

/**
 * Right-screen image during briefing / Q&A from script.displayImages.
 * Keys: briefing | q1 | q2-1 | q2-2 | q3-1 | q3-2 | default
 * Returns null when the caller should keep using state.imageUrl (post-Q&A).
 */
export function resolveDisplayImage(script, state = {}, destination = null) {
  const images = script?.displayImages || {};
  const fallback =
    images.default ||
    script?.memoryCard?.image ||
    destination?.heroImage ||
    destination?.image ||
    null;
  const phase = state.phase;
  const questionId = state.currentQuestionId;

  if (phase === "briefing") {
    return images.briefing || fallback;
  }

  if (phase === "questions") {
    if (questionId && images[questionId]) return images[questionId];
    return images.default || images.briefing || fallback;
  }

  return null;
}

/**
 * Resolve the finale schedule from a destination script + answer path.
 * Path key = answerIds joined by "|"; falls back to itineraryPaths.default.
 */
export function resolveItinerarySchedule(script, answerIds = []) {
  const header = script?.itinerary || {};
  const modules = script?.dayModules || {};
  const paths = script?.itineraryPaths || {};
  const pathKey = (Array.isArray(answerIds) ? answerIds : [])
    .filter(Boolean)
    .join("|");
  const moduleIds =
    (pathKey && paths[pathKey]) ||
    paths.default ||
    Object.keys(modules).slice(0, ITINERARY_DAY_COUNT);

  const days = Array.from({ length: ITINERARY_DAY_COUNT }, (_, index) => {
    const moduleId = moduleIds[index];
    const mod = (moduleId && modules[moduleId]) || {};
    return {
      id: moduleId || `day-${index + 1}`,
      dayLabel: `Day ${index + 1}`,
      title: mod.title || `Day ${index + 1}`,
      description: mod.description || "",
      image: mod.image || FALLBACK_DAY_IMAGES[index],
    };
  });

  return {
    headline: header.headline || "Five days built for your family",
    meta: header.meta || script?.tripTitle || "",
    summary: header.summary || "",
    days,
  };
}
