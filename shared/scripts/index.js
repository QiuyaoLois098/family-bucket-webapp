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
