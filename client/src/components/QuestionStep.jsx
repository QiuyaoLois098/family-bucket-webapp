import { useEffect, useRef, useState } from "react";
import { QUESTIONS } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const SELECT_HOLD_MS = 520;
const DEFAULT_DATES = "Jun 15 – 20";
const REVEAL_FADE_MS = 650;
const REVEAL_STAGGER_MS = 750;

/**
 * Reveal order: prompt → pick hint → cards.
 * On advance: fade all dialogue out, then next question staggers in.
 */
export default function QuestionStep({
  currentQuestion,
  destinationId,
  onAnswer,
}) {
  const [pendingId, setPendingId] = useState(null);
  const [locked, setLocked] = useState(false);
  const [exiting, setExiting] = useState(false);
  /** 0=none, 1=prompt, 2=hint, 3=first card, … */
  const [revealStep, setRevealStep] = useState(0);
  const timerRef = useRef(null);
  const revealTimersRef = useRef([]);

  const question = QUESTIONS[currentQuestion];
  const options = question?.options || [];

  const clearRevealTimers = () => {
    revealTimersRef.current.forEach(clearTimeout);
    revealTimersRef.current = [];
  };

  const startReveal = (optionCount) => {
    clearRevealTimers();
    setRevealStep(0);
    setExiting(false);
    const totalSteps = 2 + optionCount;
    for (let step = 1; step <= totalSteps; step += 1) {
      revealTimersRef.current.push(
        setTimeout(() => setRevealStep(step), 80 + (step - 1) * REVEAL_STAGGER_MS),
      );
    }
  };

  useEffect(() => {
    clearTimeout(timerRef.current);
    setPendingId(null);
    setLocked(false);
    startReveal(options.length);

    return () => {
      clearTimeout(timerRef.current);
      clearRevealTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when question/destination changes
  }, [currentQuestion, destinationId, options.length]);

  if (!question) return null;

  const destination = getDestination(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "Your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;

  const handleSelect = (optionId) => {
    if (locked || exiting) return;
    const option = options.find((item) => item.id === optionId);
    if (!option) return;

    setLocked(true);
    setPendingId(optionId);
    onAnswer(currentQuestion, optionId, { advance: false });

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setExiting(true);
      timerRef.current = setTimeout(() => {
        onAnswer(currentQuestion, optionId, { advance: true });
      }, REVEAL_FADE_MS);
    }, SELECT_HOLD_MS);
  };

  const showPrompt = revealStep >= 1 && !exiting;
  const showHint = revealStep >= 2 && !exiting;

  return (
    <div
      className={`question question--planner question--count-${options.length}${
        exiting ? " is-exiting" : ""
      }`}
      style={{ "--question-reveal-ms": `${REVEAL_FADE_MS}ms` }}
    >
      <ExpediaBrandBar />

      <div className="question__trip">
        <p className="question__trip-line">
          {tripPlace} · {tripDates}
        </p>
        <p className="question__follow-up">Follow up</p>
      </div>

      <div className="question__prompt">
        <h2 className={showPrompt ? "is-revealed" : undefined}>{question.prompt}</h2>
        <p className={`question__pick-hint${showHint ? " is-revealed" : ""}`}>
          {question.pickHint || "(Pick 1 option)"}
        </p>
      </div>

      <div className="question__options" role="list">
        {options.map((option, index) => {
          const selected = pendingId === option.id;
          const revealed = revealStep >= 3 + index && !exiting;
          return (
            <button
              key={`${currentQuestion}-${option.id}`}
              type="button"
              role="listitem"
              className={`question__option${selected ? " is-selected" : ""}${
                revealed ? " is-revealed" : ""
              }`}
              disabled={locked || !revealed}
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
