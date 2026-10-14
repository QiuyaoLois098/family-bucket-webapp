import { useEffect, useRef, useState } from "react";
import { QUESTIONS, resolveAnswerOption } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const SELECT_HOLD_MS = 520;
const DEFAULT_DATES = "Jun 15 – 20";
const REVEAL_FADE_MS = 650;
const REVEAL_STAGGER_MS = 750;
const THINKING_HOLD_MS = 2000;

/**
 * Unified question flow (all questions = 2 options):
 * fade in → prompt / hint / cards stagger → select → fade out →
 * answer confirm (bubble → AI → optional card → Thinking) → fade → next
 * Q3 → fade out → reveal finale (luggage on right)
 */
export default function QuestionStep({
  currentQuestion,
  destinationId,
  onAnswer,
}) {
  const [pendingId, setPendingId] = useState(null);
  const [locked, setLocked] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [bridge, setBridge] = useState(null);
  /** 0=hidden … 1=bubble 2=ai 3=card 4=thinking */
  const [bridgeStep, setBridgeStep] = useState(0);
  const [bridgeExiting, setBridgeExiting] = useState(false);
  /** 0=none, 1=prompt, 2=hint, 3=first card, 4=second card */
  const [revealStep, setRevealStep] = useState(0);

  const timerRef = useRef(null);
  const revealTimersRef = useRef([]);
  const bridgeTimersRef = useRef([]);
  const confirmingRef = useRef(false);

  const question = QUESTIONS[currentQuestion];
  const options = question?.options || [];

  const clearRevealTimers = () => {
    revealTimersRef.current.forEach(clearTimeout);
    revealTimersRef.current = [];
  };

  const clearBridgeTimers = () => {
    bridgeTimersRef.current.forEach(clearTimeout);
    bridgeTimersRef.current = [];
  };

  const startQuestionReveal = (optionCount) => {
    clearRevealTimers();
    setRevealStep(0);
    setExiting(false);
    setBridge(null);
    setBridgeStep(0);
    setBridgeExiting(false);
    confirmingRef.current = false;

    const totalSteps = 2 + optionCount;
    for (let step = 1; step <= totalSteps; step += 1) {
      revealTimersRef.current.push(
        setTimeout(() => setRevealStep(step), 80 + (step - 1) * REVEAL_STAGGER_MS),
      );
    }
  };

  useEffect(() => {
    if (confirmingRef.current) return undefined;

    clearTimeout(timerRef.current);
    clearBridgeTimers();
    clearRevealTimers();
    setPendingId(null);
    setLocked(false);
    setBridge(null);
    setBridgeStep(0);
    setBridgeExiting(false);
    confirmingRef.current = false;

    startQuestionReveal(question?.options?.length || 0);

    return () => {
      if (confirmingRef.current) return;
      clearTimeout(timerRef.current);
      clearBridgeTimers();
      clearRevealTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, destinationId]);

  if (!question) return null;

  const destination = getDestination(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "Your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;

  /**
   * Shared answer confirm:
   * Q1 uses bridgeBubble + Thinking only (01-answer)
   * Q2/Q3 use youSay + aiSay (+ optional place card)
   */
  const runAnswerConfirm = (optionId) => {
    const option = resolveAnswerOption(question, optionId);
    const useBridgeBubble = Boolean(question.bridgeBubble);
    const bubbleText = useBridgeBubble
      ? question.bridgeBubble
      : option?.youSay || "";
    const aiText = useBridgeBubble ? null : option?.aiSay || null;
    const placeCard = useBridgeBubble ? null : option?.answerCard || null;
    const isLast = currentQuestion === QUESTIONS.length - 1;

    clearTimeout(timerRef.current);
    clearBridgeTimers();
    clearRevealTimers();
    confirmingRef.current = true;
    setLocked(true);
    setExiting(true);

    // Q3: fade out → reveal finale (left answer + right luggage). Don't double-play confirm.
    if (isLast) {
      timerRef.current = setTimeout(() => {
        confirmingRef.current = false;
        onAnswer(currentQuestion, optionId, { advance: true });
      }, REVEAL_FADE_MS);
      return;
    }

    timerRef.current = setTimeout(() => {
      setBridge({ bubbleText, aiText, placeCard, optionId });
      setBridgeStep(0);
      setBridgeExiting(false);
      setExiting(false);

      let t = 40;
      bridgeTimersRef.current.push(setTimeout(() => setBridgeStep(1), t));
      t += REVEAL_STAGGER_MS;

      if (aiText) {
        bridgeTimersRef.current.push(setTimeout(() => setBridgeStep(2), t));
        t += REVEAL_STAGGER_MS;
      }

      if (placeCard) {
        bridgeTimersRef.current.push(setTimeout(() => setBridgeStep(3), t));
        t += REVEAL_FADE_MS;
      }

      bridgeTimersRef.current.push(setTimeout(() => setBridgeStep(4), t));
      t += THINKING_HOLD_MS;

      bridgeTimersRef.current.push(
        setTimeout(() => {
          setBridgeExiting(true);
          bridgeTimersRef.current.push(
            setTimeout(() => {
              confirmingRef.current = false;
              setBridge(null);
              setBridgeStep(0);
              setBridgeExiting(false);
              onAnswer(currentQuestion, optionId, { advance: true });
            }, REVEAL_FADE_MS),
          );
        }, t),
      );
    }, REVEAL_FADE_MS);
  };

  const handleSelect = (optionId) => {
    if (locked || exiting || bridge || confirmingRef.current) return;
    const option = options.find((item) => item.id === optionId);
    if (!option) return;

    setLocked(true);
    setPendingId(optionId);
    onAnswer(currentQuestion, optionId, { advance: false });

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      runAnswerConfirm(optionId);
    }, SELECT_HOLD_MS);
  };

  const inBridge = Boolean(bridge);
  const showBridgeBubble = inBridge && bridgeStep >= 1 && !bridgeExiting;
  const showBridgeAi = inBridge && bridge?.aiText && bridgeStep >= 2 && !bridgeExiting;
  const showBridgeCard =
    inBridge && bridge?.placeCard && bridgeStep >= 3 && !bridgeExiting;
  const showBridgeThinking = inBridge && bridgeStep >= 4 && !bridgeExiting;

  const showPrompt = revealStep >= 1 && !exiting && !inBridge;
  const showHint = revealStep >= 2 && !exiting && !inBridge;

  return (
    <div
      className={`question question--planner question--count-${options.length}${
        exiting && !inBridge ? " is-exiting" : ""
      }${inBridge ? " is-bridging" : ""}`}
      style={{ "--question-reveal-ms": `${REVEAL_FADE_MS}ms` }}
    >
      <ExpediaBrandBar />

      <div className="question__trip">
        <p className="question__trip-line">
          {tripPlace} · {tripDates}
        </p>
        <p className="question__follow-up">Follow up</p>
      </div>

      {inBridge ? (
        <div
          className={`question__dialogue${bridgeExiting ? " is-exiting" : ""}`}
          style={{ "--briefing-fade-ms": `${REVEAL_FADE_MS}ms` }}
        >
          <div className={`briefing__bubble${showBridgeBubble ? " is-visible" : ""}`}>
            {bridge.bubbleText}
          </div>

          {bridge.aiText ? (
            <p className={`question__ai-line${showBridgeAi ? " is-visible" : ""}`}>
              {bridge.aiText}
            </p>
          ) : null}

          {bridge.placeCard ? (
            <article
              className={`question__place-card${showBridgeCard ? " is-visible" : ""}`}
            >
              <div
                className="question__place-thumb"
                style={{ backgroundImage: `url(${bridge.placeCard.image})` }}
                aria-hidden="true"
              />
              <div className="question__place-copy">
                <p className="question__place-title">{bridge.placeCard.title}</p>
                <p className="question__place-meta">{bridge.placeCard.meta}</p>
                {bridge.placeCard.badge ? (
                  <span className="question__place-badge">{bridge.placeCard.badge}</span>
                ) : null}
              </div>
            </article>
          ) : null}

          {bridgeStep >= 4 ? (
            <p
              className={`briefing__thinking${showBridgeThinking ? " is-visible" : ""}`}
            >
              Thinking
              <span className="briefing__dots" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          ) : null}
        </div>
      ) : null}

      {!inBridge ? (
        <>
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
                    {option.badge ? (
                      <span
                        className={`question__option-badge question__option-badge--${
                          option.badgeTone || "maps"
                        }`}
                      >
                        {option.badge}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
