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
