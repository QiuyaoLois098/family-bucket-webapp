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
 * Q1 → Thinking → Q2 activity-pair
 * Q2 → bubble + AI → Thinking → Q3
 * Q3 → bubble + AI + place card → Thinking → reveal
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
  const [kayakId, setKayakId] = useState(null);
  const [ropesId, setRopesId] = useState(null);
  /** 0=none, 1=prompt, 2=hint, 3=first card, … */
  const [revealStep, setRevealStep] = useState(0);
  const timerRef = useRef(null);
  const revealTimersRef = useRef([]);
  const bridgeTimersRef = useRef([]);

  const question = QUESTIONS[currentQuestion];
  const options = question?.options || [];
  const isActivityPair = question?.type === "activity-pair";

  const clearRevealTimers = () => {
    revealTimersRef.current.forEach(clearTimeout);
    revealTimersRef.current = [];
  };

  const clearBridgeTimers = () => {
    bridgeTimersRef.current.forEach(clearTimeout);
    bridgeTimersRef.current = [];
  };

  const startReveal = (optionCount) => {
    clearRevealTimers();
    setRevealStep(0);
    setExiting(false);
    setBridge(null);
    setBridgeStep(0);
    setBridgeExiting(false);
    const totalSteps = 2 + optionCount;
    for (let step = 1; step <= totalSteps; step += 1) {
      revealTimersRef.current.push(
        setTimeout(() => setRevealStep(step), 80 + (step - 1) * REVEAL_STAGGER_MS),
      );
    }
  };

  useEffect(() => {
    clearTimeout(timerRef.current);
    clearBridgeTimers();
    setPendingId(null);
    setLocked(false);
    setKayakId(null);
    setRopesId(null);
    if (isActivityPair) {
      startReveal(2);
    } else {
      startReveal(options.length);
    }

    return () => {
      clearTimeout(timerRef.current);
      clearRevealTimers();
      clearBridgeTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when question/destination changes
  }, [currentQuestion, destinationId, options.length, isActivityPair]);

  if (!question) return null;

  const destination = getDestination(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "Your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;

  const runBridgeThenAdvance = (optionId) => {
    const option = resolveAnswerOption(question, optionId);
    // Q1 uses a fixed outdoors bubble; later questions use the option youSay.
    const bubbleText =
      (currentQuestion === 0
        ? question.bridgeBubble
        : option?.youSay || question.userBubble) || "";
    const aiText = currentQuestion === 0 ? null : option?.aiSay || null;
    const placeCard = option?.answerCard || null;

    clearTimeout(timerRef.current);
    clearBridgeTimers();
    setExiting(true);

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

      // Thinking after dialogue (and card) has appeared
      bridgeTimersRef.current.push(setTimeout(() => setBridgeStep(4), t));
      t += THINKING_HOLD_MS;

      bridgeTimersRef.current.push(
        setTimeout(() => {
          setBridgeExiting(true);
          bridgeTimersRef.current.push(
            setTimeout(() => {
              onAnswer(currentQuestion, optionId, { advance: true });
            }, REVEAL_FADE_MS),
          );
        }, t),
      );
    }, REVEAL_FADE_MS);
  };

  const handleSelect = (optionId) => {
    if (locked || exiting || bridge) return;
    const option = options.find((item) => item.id === optionId);
    if (!option) return;

    setLocked(true);
    setPendingId(optionId);
    onAnswer(currentQuestion, optionId, { advance: false });

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Last question: jump to reveal immediately so right screen shows luggage
      // while left plays the Q3 answer finale.
      if (currentQuestion === QUESTIONS.length - 1) {
        setExiting(true);
        timerRef.current = setTimeout(() => {
          onAnswer(currentQuestion, optionId, { advance: true });
        }, REVEAL_FADE_MS);
        return;
      }
      runBridgeThenAdvance(optionId);
    }, SELECT_HOLD_MS);
  };

  const tryCompleteActivityPair = (nextKayak, nextRopes) => {
    if (!nextKayak || !nextRopes || locked) return;
    const optionId = `${nextKayak}|${nextRopes}`;
    setLocked(true);
    setPendingId(optionId);
    onAnswer(currentQuestion, optionId, { advance: false });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      runBridgeThenAdvance(optionId);
    }, SELECT_HOLD_MS);
  };

  const handleActivitySelect = (groupId, optionId) => {
    if (locked || exiting || bridge) return;
    if (groupId === "kayak") {
      setKayakId(optionId);
      tryCompleteActivityPair(optionId, ropesId);
      return;
    }
    setRopesId(optionId);
    tryCompleteActivityPair(kayakId, optionId);
  };

  const showPrompt = revealStep >= 1 && !exiting && !bridge;
  const showHint = revealStep >= 2 && !exiting && !bridge;
  const showActivityBubble =
    isActivityPair && revealStep >= 1 && !exiting && !bridge;

  const inBridge = Boolean(bridge);
  const showBridgeBubble = inBridge && bridgeStep >= 1 && !bridgeExiting;
  const showBridgeAi = inBridge && bridge?.aiText && bridgeStep >= 2 && !bridgeExiting;
  const showBridgeCard =
    inBridge && bridge?.placeCard && bridgeStep >= 3 && !bridgeExiting;
  const showBridgeThinking = inBridge && bridgeStep >= 4 && !bridgeExiting;

  return (
    <div
      className={`question question--planner question--count-${
        isActivityPair ? "activity" : options.length
      }${exiting && !bridge ? " is-exiting" : ""}${inBridge ? " is-bridging" : ""}`}
      style={{ "--question-reveal-ms": `${REVEAL_FADE_MS}ms` }}
    >
      <ExpediaBrandBar />

      <div className="question__trip">
        <p className="question__trip-line">
          {tripPlace} · {tripDates}
        </p>
        <p className="question__follow-up">Follow up</p>
      </div>

      {inBridge || showActivityBubble ? (
        <div
          className={`question__dialogue${bridgeExiting ? " is-exiting" : ""}`}
          style={{ "--briefing-fade-ms": `${REVEAL_FADE_MS}ms` }}
        >
          <div
            className={`briefing__bubble${
              showBridgeBubble || showActivityBubble ? " is-visible" : ""
            }`}
          >
            {bridge?.bubbleText || question.userBubble}
          </div>

          {bridge?.aiText ? (
            <p className={`question__ai-line${showBridgeAi ? " is-visible" : ""}`}>
              {bridge.aiText}
            </p>
          ) : null}

          {bridge?.placeCard ? (
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

          {inBridge && bridgeStep >= 4 ? (
            <p className={`briefing__thinking${showBridgeThinking ? " is-visible" : ""}`}>
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

      {!inBridge && !isActivityPair ? (
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
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {!inBridge && isActivityPair ? (
        <>
          <div className="question__prompt question__prompt--activity">
            <h2 className={showPrompt ? "is-revealed" : undefined}>{question.prompt}</h2>
            <p className={`question__pick-hint${showHint ? " is-revealed" : ""}`}>
              {question.pickHint}
            </p>
          </div>

          <div
            className={`activity-board${
              revealStep >= 3 && !exiting ? " is-revealed" : ""
            }`}
          >
            {question.groups.map((group, groupIndex) => {
              const selectedId = group.id === "kayak" ? kayakId : ropesId;
              const groupRevealed = revealStep >= 3 + groupIndex && !exiting;
              return (
                <section
                  key={group.id}
                  className={`activity-group${groupRevealed ? " is-revealed" : ""}`}
                >
                  <h3 className="activity-group__label">{group.label}</h3>
                  <div className="activity-group__cards">
                    {group.options.map((option) => {
                      const selected = selectedId === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`activity-card${selected ? " is-selected" : ""}`}
                          disabled={locked || !groupRevealed}
                          onClick={() => handleActivitySelect(group.id, option.id)}
                        >
                          <span
                            className="activity-card__image"
                            style={{ backgroundImage: `url(${option.image})` }}
                            aria-hidden="true"
                          />
                          <span className="activity-card__body">
                            <span
                              className={`activity-card__badge activity-card__badge--${option.badgeTone}`}
                            >
                              {option.badge}
                            </span>
                            <span className="activity-card__label">{option.label}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
