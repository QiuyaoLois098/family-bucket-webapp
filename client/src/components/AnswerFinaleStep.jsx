import { QUESTIONS, resolveAnswerOption } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";
import { getDestinationScript, answerToOption, getAnswer } from "@shared/scripts/index.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const DEFAULT_DATES = "Apr 6 – 11";

/**
 * Control (left) during reveal — settled Q3 reply (bubble + AI + place card).
 * Reply animation already played in QuestionStep; right screen shows luggage.
 */
export default function AnswerFinaleStep({ destinationId, answers }) {
  const script = getDestinationScript(destinationId);
  const answerId = answers?.[answers.length - 1];
  const option = script
    ? answerToOption(getAnswer(script, answerId))
    : resolveAnswerOption(QUESTIONS[QUESTIONS.length - 1], answerId) ||
      QUESTIONS[QUESTIONS.length - 1]?.options?.[0];

  const destination = getDestination(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "Your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;
  const tripTitle = script?.tripTitle || `${tripPlace} · ${tripDates}`;

  if (!option) return null;

  const card = option.answerCard;

  return (
    <div className="question question--planner answer-finale">
      <ExpediaBrandBar />

      <div className="question__trip">
        <p className="question__trip-line">{tripTitle}</p>
        <p className="question__follow-up">Follow up</p>
      </div>

      <div className="question__dialogue">
        <div className="briefing__bubble is-visible">{option.youSay}</div>

        {option.aiSay ? (
          <p className="question__ai-line is-visible">{option.aiSay}</p>
        ) : null}

        {card ? (
          <article className="question__place-card is-visible">
            <div
              className="question__place-thumb"
              style={{ backgroundImage: `url(${card.image})` }}
              aria-hidden="true"
            />
            <div className="question__place-copy">
              <p className="question__place-title">{card.title}</p>
              <p className="question__place-meta">{card.meta}</p>
              {card.badge ? (
                <span
                  className={`question__place-badge${
                    String(card.badge).toLowerCase().includes("expedia")
                      ? " question__place-badge--bookable"
                      : ""
                  }`}
                >
                  {card.badge}
                </span>
              ) : null}
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
