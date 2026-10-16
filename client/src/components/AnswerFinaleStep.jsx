import { useEffect, useState } from "react";
import { QUESTIONS, resolveAnswerOption } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";
import { getDestinationScript, answerToOption, getAnswer } from "@shared/scripts/index.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const DEFAULT_DATES = "Apr 6 – 11";
const FADE_MS = 650;
const STAGGER_MS = 750;

/**
 * Control (left) during reveal — final answer page.
 * Right screen shows luggage as soon as this phase starts.
 */
export default function AnswerFinaleStep({ destinationId, answers }) {
  const [step, setStep] = useState(0);

  const script = getDestinationScript(destinationId);
  const answerId = answers?.[answers.length - 1];
  const option = script
    ? answerToOption(getAnswer(script, answerId))
    : resolveAnswerOption(QUESTIONS[QUESTIONS.length - 1], answerId) ||
      QUESTIONS[QUESTIONS.length - 1]?.options?.[0];

  const destination = getDestination(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "Your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;

  useEffect(() => {
    setStep(0);
    const timers = [
      setTimeout(() => setStep(1), 40),
      setTimeout(() => setStep(2), 40 + STAGGER_MS),
      setTimeout(() => setStep(3), 40 + STAGGER_MS * 2),
    ];
    return () => timers.forEach(clearTimeout);
  }, [answerId, destinationId]);

  if (!option) return null;

  return (
    <div className="question question--planner answer-finale">
      <ExpediaBrandBar />

      <div className="question__trip">
        <p className="question__trip-line">
          {tripPlace} · {tripDates}
        </p>
        <p className="question__follow-up">Follow up</p>
      </div>

      <div
        className="question__dialogue"
        style={{ "--briefing-fade-ms": `${FADE_MS}ms` }}
      >
        <div className={`briefing__bubble${step >= 1 ? " is-visible" : ""}`}>
          {option.youSay}
        </div>

        {option.aiSay ? (
          <p className={`question__ai-line${step >= 2 ? " is-visible" : ""}`}>
            {option.aiSay}
          </p>
        ) : null}

        {option.answerCard ? (
          <article
            className={`question__place-card${step >= 3 ? " is-visible" : ""}`}
          >
            <div
              className="question__place-thumb"
              style={{ backgroundImage: `url(${option.answerCard.image})` }}
              aria-hidden="true"
            />
            <div className="question__place-copy">
              <p className="question__place-title">{option.answerCard.title}</p>
              <p className="question__place-meta">{option.answerCard.meta}</p>
              {option.answerCard.badge ? (
                <span className="question__place-badge">{option.answerCard.badge}</span>
              ) : null}
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
