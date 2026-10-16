import { useEffect, useRef, useState } from "react";
import { QUESTIONS, resolveAnswerOption } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";
import {
  getDestinationScript,
  questionToUi,
  getAnswer,
} from "@shared/scripts/index.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const SELECT_HOLD_MS = 520;
const DEFAULT_DATES = "Apr 6 – 11";
const REVEAL_FADE_MS = 650;
const REVEAL_STAGGER_MS = 750;
const THINKING_HOLD_MS = 2000;
const TYPE_CHAR_MS = 26;
const TYPE_PAUSE_AFTER_MS = 320;

/**
 * Unified question flow (all questions = 2 options):
 * type prompt → then hint / cards stagger → select → fade out →
 * answer confirm (bubble → AI → optional place card → Thinking) → fade → next
 * Terminal answer → same confirm with place card (no Thinking) → reveal finale
 */
export default function QuestionStep({
  currentQuestion,
  currentQuestionId,
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
  /** 0=none, 1=prompt typing/done, 2=hint, 3=first card, 4=second card */
  const [revealStep, setRevealStep] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [promptDone, setPromptDone] = useState(false);

  const timerRef = useRef(null);
  const revealTimersRef = useRef([]);
  const bridgeTimersRef = useRef([]);
  const typeTimerRef = useRef(null);
  const confirmingRef = useRef(false);

  const script = getDestinationScript(destinationId);
  const question = script
    ? questionToUi(script, currentQuestionId)
    : QUESTIONS[currentQuestion];
  const questionRef = script ? currentQuestionId : currentQuestion;
  const options = question?.options || [];

  const clearRevealTimers = () => {
    revealTimersRef.current.forEach(clearTimeout);
    revealTimersRef.current = [];
  };

  const clearBridgeTimers = () => {
    bridgeTimersRef.current.forEach(clearTimeout);
    bridgeTimersRef.current = [];
  };

  const clearTypeTimer = () => {
    if (typeTimerRef.current != null) {
      clearInterval(typeTimerRef.current);
      typeTimerRef.current = null;
    }
  };

  const startQuestionReveal = (promptText, optionCount) => {
    clearRevealTimers();
    clearTypeTimer();
    setRevealStep(0);
    setTypedPrompt("");
    setPromptDone(false);
    setExiting(false);
    setBridge(null);
    setBridgeStep(0);
    setBridgeExiting(false);
    confirmingRef.current = false;

    const full = promptText || "";
    setRevealStep(1);

    if (!full) {
      setPromptDone(true);
      for (let step = 2; step <= 2 + optionCount; step += 1) {
        revealTimersRef.current.push(
          setTimeout(
            () => setRevealStep(step),
            TYPE_PAUSE_AFTER_MS + (step - 2) * REVEAL_STAGGER_MS,
          ),
        );
      }
      return;
    }

    let i = 0;
    typeTimerRef.current = setInterval(() => {
      i += 1;
      setTypedPrompt(full.slice(0, i));
      if (i < full.length) return;

      clearTypeTimer();
      setPromptDone(true);
      for (let step = 2; step <= 2 + optionCount; step += 1) {
        revealTimersRef.current.push(
          setTimeout(
            () => setRevealStep(step),
            TYPE_PAUSE_AFTER_MS + (step - 2) * REVEAL_STAGGER_MS,
          ),
        );
      }
    }, TYPE_CHAR_MS);
  };

  useEffect(() => {
    if (confirmingRef.current) return undefined;

    clearTimeout(timerRef.current);
    clearBridgeTimers();
    clearRevealTimers();
    clearTypeTimer();
    setPendingId(null);
    setLocked(false);
    setBridge(null);
    setBridgeStep(0);
    setBridgeExiting(false);
    confirmingRef.current = false;

    startQuestionReveal(question?.prompt || "", question?.options?.length || 0);

    return () => {
      if (confirmingRef.current) return;
      clearTimeout(timerRef.current);
      clearBridgeTimers();
      clearRevealTimers();
      clearTypeTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, currentQuestionId, destinationId]);

  if (!question) return null;

  const destination = getDestination(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "Your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;
  const tripTitle = script?.tripTitle || `${tripPlace} · ${tripDates}`;

  const resolveOption = (optionId) => {
    if (script) {
      return options.find((item) => item.id === optionId) || null;
    }
    return resolveAnswerOption(question, optionId);
  };

  const runAnswerConfirm = (optionId) => {
    const option = resolveOption(optionId);
    const useBridgeBubble = Boolean(question.bridgeBubble);
    const bubbleText = useBridgeBubble
      ? question.bridgeBubble
      : option?.youSay || "";
    const aiText = useBridgeBubble ? null : option?.aiSay || null;
    const placeCard = useBridgeBubble ? null : option?.answerCard || null;

    const nextQuestionId = script
      ? getAnswer(script, optionId)?.nextQuestionId ?? null
      : currentQuestion < QUESTIONS.length - 1
        ? currentQuestion + 1
        : null;
    const isLast = nextQuestionId == null;

    clearTimeout(timerRef.current);
    clearBridgeTimers();
    clearRevealTimers();
    clearTypeTimer();
    confirmingRef.current = true;
    setLocked(true);
    setExiting(true);

    // Mid + terminal answers share the same reply bridge (bubble → AI → place card).
    // Terminal skips "Thinking" and advances into reveal after holding on the card.
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

      if (!isLast) {
        bridgeTimersRef.current.push(setTimeout(() => setBridgeStep(4), t));
        t += THINKING_HOLD_MS;
      } else {
        t += placeCard ? THINKING_HOLD_MS : REVEAL_STAGGER_MS;
      }

      bridgeTimersRef.current.push(
        setTimeout(() => {
          setBridgeExiting(true);
          bridgeTimersRef.current.push(
            setTimeout(() => {
              confirmingRef.current = false;
              setBridge(null);
              setBridgeStep(0);
              setBridgeExiting(false);
              onAnswer(questionRef, optionId, { advance: true });
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
    onAnswer(questionRef, optionId, { advance: false });

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
        <p className="question__trip-line">{tripTitle}</p>
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
            <h2 className={showPrompt ? "is-revealed is-typing" : undefined}>
              <span className="question__prompt-text">{typedPrompt}</span>
              {showPrompt && !promptDone ? (
                <span className="question__prompt-caret" aria-hidden="true" />
              ) : null}
            </h2>
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
                  key={`${questionRef}-${option.id}`}
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
