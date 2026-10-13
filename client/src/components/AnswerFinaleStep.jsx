import { useEffect, useState } from "react";
import { QUESTIONS, resolveAnswerOption } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const DEFAULT_DATES = "Jun 15 – 20";
const FADE_MS = 650;
const STAGGER_MS = 750;

/**
 * Control (left) during reveal — Q3 answer page.
 * Right screen shows luggage as soon as this phase starts.
 */
export default function AnswerFinaleStep({ destinationId, answers }) {
  const [step, setStep] = useState(0);

  const question = QUESTIONS[QUESTIONS.length - 1];
  const answerId = answers?.[QUESTIONS.length - 1];
  const option = resolveAnswerOption(question, answerId) || question?.options?.[0];
  const destination = getDestination(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "Your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;

  useEffect(() => {
    setStep(0);
    const timers = [
      setTimeout(() => setStep(1), 40),
      setTimeout(() => setStep(2), 40 + STAGGER_MS),
      setTimeout(() => setStep(3), 40 + STAGGER_MS * 2),
      setTimeout(() => setStep(4), 40 + STAGGER_MS * 2 + FADE_MS),
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

        {step >= 4 ? (
          <p className={`briefing__thinking${step >= 4 ? " is-visible" : ""}`}>
            Thinking
            <span className="briefing__dots" aria-hidden="true">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
