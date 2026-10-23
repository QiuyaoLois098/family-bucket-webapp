import { useEffect, useRef, useState } from "react";
import { QUESTIONS, resolveAnswerOption } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";
import {
  getDestinationScript,
  questionToUi,
  getAnswer,
  answerToOption,
} from "@shared/scripts/index.js";
import { chatPacing } from "../motion/chatPacing.js";
import { wordBatchDurationMs } from "../motion/wordBatch.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";
import GrowingBubble from "./GrowingBubble.jsx";
import WholeBlockFade from "./WholeBlockFade.jsx";

const DEFAULT_DATES = "Apr 6 – 11";
const SELECT_HOLD_MS = chatPacing.selectHoldMs;
const BUBBLE_POP_MS = chatPacing.bubbleEntranceMs;
const THINKING_GAP_MS = chatPacing.thinkingGapMs;
const THINKING_EXIT_MS = chatPacing.thinkingExitMs;
const THINKING_VISIBLE_MS = chatPacing.thinkingVisibleMs;
const TEXT_FADE_MS = chatPacing.aiBlockFadeMs;
const FIRST_CARD_MS = chatPacing.firstCardDelayMs;
const SECOND_CARD_MS = chatPacing.secondCardDelayMs;
const CARD_STAGGER_MS = chatPacing.cardStaggerMs;
const SCENE_EXIT_MS = chatPacing.sceneExitMs;
const STAY_FADE_MS = chatPacing.stayEntranceMs;
const PAGE_EXIT_MS = chatPacing.pageExitMs;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

function cardDelayAfterText(index) {
  if (index <= 0) return FIRST_CARD_MS;
  if (index === 1) return SECOND_CARD_MS;
  return SECOND_CARD_MS + (index - 1) * CARD_STAGGER_MS;
}

/**
 * Prompt + hint fade as one block → cards 0.4s / 0.95s → select →
 * blue word-batch bubble → AI whole-message fade → place card → Thinking 1.5s.
 */
export default function QuestionStep({
  currentQuestion,
  currentQuestionId,
  destinationId,
  finaleAnswerId = null,
  holdReply = false,
  onAnswer,
}) {
  const [pendingId, setPendingId] = useState(null);
  const [locked, setLocked] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [bridge, setBridge] = useState(null);
  /** 0=hidden … 1=bubble 2=ai 3=card 4=thinking */
  const [bridgeStep, setBridgeStep] = useState(0);
  const [bridgeExiting, setBridgeExiting] = useState(false);
  const [thinkingOn, setThinkingOn] = useState(false);
  /** 0=none, 1=prompt+hint, 2=first card, 3=second card, … */
  const [revealStep, setRevealStep] = useState(0);

  const timerRef = useRef(null);
  const revealTimersRef = useRef([]);
  const bridgeTimersRef = useRef([]);
  const confirmingRef = useRef(false);
  const bridgeRef = useRef(null);
  const finaleAnswerRef = useRef(finaleAnswerId);
  finaleAnswerRef.current = finaleAnswerId;
  bridgeRef.current = bridge;

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

  const scheduleRevealAfterPrompt = (optionCount) => {
    const textMs = prefersReducedMotion() ? 0 : TEXT_FADE_MS;
    for (let index = 0; index < optionCount; index += 1) {
      revealTimersRef.current.push(
        setTimeout(
          () => setRevealStep(2 + index),
          textMs + cardDelayAfterText(index),
        ),
      );
    }
  };

  const startQuestionReveal = (optionCount) => {
    clearRevealTimers();
    clearBridgeTimers();
    setRevealStep(0);
    setExiting(false);
    setBridge(null);
    setBridgeStep(0);
    setBridgeExiting(false);
    setThinkingOn(false);
    confirmingRef.current = false;
    setRevealStep(1);
    scheduleRevealAfterPrompt(optionCount);
  };

  const continueBridgeAfterAi = ({
    placeCard,
    isLast,
    optionId,
    afterTextMs = 0,
  }) => {
    let t = afterTextMs;

    if (placeCard) {
      bridgeTimersRef.current.push(setTimeout(() => setBridgeStep(3), t));
      t += STAY_FADE_MS;
    }

    t += THINKING_GAP_MS;

    if (!isLast) {
      bridgeTimersRef.current.push(
        setTimeout(() => {
          setBridgeStep(4);
          setThinkingOn(true);
        }, t),
      );
      const leaveAt = t + THINKING_VISIBLE_MS - THINKING_EXIT_MS;
      const endAt = t + THINKING_VISIBLE_MS;

      bridgeTimersRef.current.push(
        setTimeout(() => setThinkingOn(false), leaveAt),
      );
      bridgeTimersRef.current.push(
        setTimeout(() => {
          setBridgeExiting(true);
          bridgeTimersRef.current.push(
            setTimeout(() => {
              confirmingRef.current = false;
              setBridge(null);
              setBridgeStep(0);
              setBridgeExiting(false);
              setThinkingOn(false);
              onAnswer(questionRef, optionId, { advance: true });
            }, PAGE_EXIT_MS),
          );
        }, endAt),
      );
      return;
    }

    t += placeCard ? STAY_FADE_MS : 40;
    bridgeTimersRef.current.push(
      setTimeout(() => {
        confirmingRef.current = true;
        onAnswer(questionRef, optionId, { advance: true });
      }, t),
    );
  };

  useEffect(() => {
    if (holdReply) {
      if (bridgeRef.current) return undefined;

      const answerId = finaleAnswerRef.current;
      const option = script
        ? answerToOption(getAnswer(script, answerId))
        : resolveAnswerOption(QUESTIONS[QUESTIONS.length - 1], answerId) ||
          QUESTIONS[QUESTIONS.length - 1]?.options?.[0];
      if (!option) return undefined;

      setLocked(true);
      setExiting(false);
      setBridgeExiting(false);
      setThinkingOn(false);
      setBridge({
        bubbleText: option.youSay || "",
        aiText: option.aiSay || null,
        placeCard: option.answerCard || null,
        optionId: option.id,
      });
      setBridgeStep(option.answerCard ? 3 : option.aiSay ? 2 : 1);
      confirmingRef.current = true;
      return undefined;
    }

    if (confirmingRef.current) return undefined;

    clearTimeout(timerRef.current);
    clearBridgeTimers();
    clearRevealTimers();
    setPendingId(null);
    setLocked(false);
    setBridge(null);
    setBridgeStep(0);
    setBridgeExiting(false);
    setThinkingOn(false);
    confirmingRef.current = false;

    startQuestionReveal(question?.options?.length || 0);

    return () => {
      if (confirmingRef.current) return;
      clearTimeout(timerRef.current);
      clearBridgeTimers();
      clearRevealTimers();
    };
    // finaleAnswerId intentionally omitted — locking an answer must not reset the question
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, currentQuestionId, destinationId, holdReply]);

  if (!question && !bridge) return null;

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
    confirmingRef.current = true;
    setLocked(true);
    setExiting(true);

    timerRef.current = setTimeout(() => {
      setBridge({ bubbleText, aiText, placeCard, optionId });
      setBridgeStep(0);
      setBridgeExiting(false);
      setThinkingOn(false);

      const reduced = prefersReducedMotion();
      const blueMs = reduced ? 0 : wordBatchDurationMs(bubbleText);
      let t = 40;
      bridgeTimersRef.current.push(setTimeout(() => setBridgeStep(1), t));
      t += blueMs;

      if (aiText) {
        bridgeTimersRef.current.push(
          setTimeout(() => {
            setBridgeStep(2);
            continueBridgeAfterAi({
              placeCard,
              isLast,
              optionId,
              afterTextMs: reduced ? 0 : TEXT_FADE_MS,
            });
          }, t),
        );
        return;
      }

      bridgeTimersRef.current.push(
        setTimeout(() => {
          continueBridgeAfterAi({ placeCard, isLast, optionId });
        }, t),
      );
    }, SCENE_EXIT_MS);
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
  const showBridgeAi = inBridge && bridge?.aiText && bridgeStep >= 2 && !bridgeExiting;
  const showBridgeCard =
    inBridge && bridge?.placeCard && bridgeStep >= 3 && !bridgeExiting;
  const showBridgeThinking = inBridge && bridgeStep >= 4 && thinkingOn && !bridgeExiting;

  const showPrompt = revealStep >= 1 && !exiting && !inBridge;

  return (
    <div
      className={`question question--planner question--count-${options.length}${
        exiting && !inBridge ? " is-exiting" : ""
      }${inBridge ? " is-bridging" : ""}`}
      style={{
        "--question-reveal-ms": `${chatPacing.cardEntranceMs}ms`,
        "--question-text-ms": `${TEXT_FADE_MS}ms`,
        "--thinking-fade-ms": `${chatPacing.thinkingFadeMs}ms`,
        "--thinking-exit-ms": `${THINKING_EXIT_MS}ms`,
      }}
    >
      <ExpediaBrandBar />

      <div className="question__trip">
        <p className="question__trip-line">{tripTitle}</p>
        <p className="question__follow-up">Follow up</p>
      </div>

      {inBridge ? (
        <div
          className={`question__dialogue${bridgeExiting ? " is-exiting" : ""}`}
          style={{
            "--briefing-fade-ms": `${BUBBLE_POP_MS}ms`,
            "--stay-fade-ms": `${STAY_FADE_MS}ms`,
            "--ai-fade-ms": `${TEXT_FADE_MS}ms`,
            "--thinking-fade-ms": `${chatPacing.thinkingFadeMs}ms`,
            "--thinking-exit-ms": `${PAGE_EXIT_MS}ms`,
          }}
        >
          <GrowingBubble
            text={bridge.bubbleText}
            visible={inBridge && bridgeStep >= 1}
            instant={holdReply}
          />

          {bridge.aiText ? (
            <WholeBlockFade
              as="p"
              className="question__ai-line"
              visible={showBridgeAi}
              durationMs={TEXT_FADE_MS}
              instant={holdReply}
            >
              <span className="question__ai-text">{bridge.aiText}</span>
            </WholeBlockFade>
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
                  <span
                    className={`question__place-badge${
                      String(bridge.placeCard.badge).toLowerCase().includes("expedia")
                        ? " question__place-badge--bookable"
                        : ""
                    }`}
                  >
                    {bridge.placeCard.badge}
                  </span>
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
          <WholeBlockFade
            className={`question__prompt${showPrompt ? " is-revealed" : ""}`}
            visible={showPrompt}
            durationMs={TEXT_FADE_MS}
          >
            <h2>{question?.prompt}</h2>
            <p className="question__pick-hint">
              {question?.pickHint || "(Pick 1 option)"}
            </p>
          </WholeBlockFade>

          <div className="question__options" role="list">
            {options.map((option, index) => {
              const selected = pendingId === option.id;
              const revealed = revealStep >= 2 + index && !exiting;
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
