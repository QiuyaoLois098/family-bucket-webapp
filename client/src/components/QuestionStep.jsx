import { useEffect, useRef, useState } from "react";
import { QUESTIONS } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const SELECT_HOLD_MS = 520;
const DEFAULT_DATES = "Jun 15 – 20";

/**
 * Light AI Activity Planner question picker — matches the Expedia reference.
 * No chat bubbles, footer, or back control.
 */
export default function QuestionStep({
  currentQuestion,
  destinationId,
  onAnswer,
}) {
  const [pendingId, setPendingId] = useState(null);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    setPendingId(null);
    setLocked(false);
  }, [currentQuestion, destinationId]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const question = QUESTIONS[currentQuestion];
  if (!question) return null;

  const destination = getDestination(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "Your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;
  const options = question.options;

  const handleSelect = (optionId) => {
    if (locked) return;
    const option = options.find((item) => item.id === optionId);
    if (!option) return;

    setLocked(true);
    setPendingId(optionId);
    onAnswer(currentQuestion, optionId, { advance: false });

    timerRef.current = setTimeout(() => {
      onAnswer(currentQuestion, optionId, { advance: true });
    }, SELECT_HOLD_MS);
  };

  return (
    <div className={`question question--planner question--count-${options.length}`}>
      <ExpediaBrandBar />

      <div className="question__trip">
        <p className="question__trip-line">
          {tripPlace} · {tripDates}
        </p>
        <p className="question__follow-up">Follow up</p>
      </div>

      <div className="question__prompt">
        <h2>{question.prompt}</h2>
        <p className="question__pick-hint">{question.pickHint || "(Pick 1 option)"}</p>
      </div>

      <div className="question__options" role="list">
        {options.map((option) => {
          const selected = pendingId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="listitem"
              className={`question__option${selected ? " is-selected" : ""}`}
              disabled={locked}
              onClick={() => handleSelect(option.id)}
            >
              <span
                className="question__option-image"
                style={{ backgroundImage: `url(${option.image})` }}
                aria-hidden="true"
              />
              <span className="question__option-copy">
                <span className="question__option-label">{option.label}</span>
                {option.description ? (
                  <span className="question__option-desc">{option.description}</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
