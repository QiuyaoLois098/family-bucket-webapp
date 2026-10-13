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
 * Q1 → same page: outdoors bubble → Thinking… → swap Thinking for Q2 (no remount)
 * Q2 → bubble + AI → Thinking → Q3
 * Q3 → jump to reveal finale (luggage on right)
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
  /** 0=hidden … 1=bubble 2=ai 3=card 4=thinking 5=thinking fading */
  const [bridgeStep, setBridgeStep] = useState(0);
  const [bridgeExiting, setBridgeExiting] = useState(false);
  /** Keep Q1 outdoors bubble while Q2 content replaces Thinking on the same page */
  const [pinnedBubble, setPinnedBubble] = useState(null);
  /** Local merge: show Q2 under the bubble before / as session advances */
  const [mergedToQ2, setMergedToQ2] = useState(false);
  const [kayakId, setKayakId] = useState(null);
  const [ropesId, setRopesId] = useState(null);
  /** 0=none, 1=prompt, 2=hint, 3=first card, … */
  const [revealStep, setRevealStep] = useState(0);

  const timerRef = useRef(null);
  const revealTimersRef = useRef([]);
  const bridgeTimersRef = useRef([]);
  const kayakIdRef = useRef(null);
  const ropesIdRef = useRef(null);
  const q2RevealStartedRef = useRef(false);
  const confirmingRef = useRef(false);
  const pinnedBubbleRef = useRef(null);
  const mergedToQ2Ref = useRef(false);

  const liveQuestion = QUESTIONS[currentQuestion];
  const question =
    mergedToQ2 && liveQuestion?.type !== "activity-pair"
      ? QUESTIONS[1]
      : liveQuestion;
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

  const startActivityReveal = ({ keepBubble }) => {
    clearRevealTimers();
    setExiting(false);
    setBridgeExiting(false);
    setRevealStep(0);

    const timers = keepBubble
      ? [
          setTimeout(() => setRevealStep(1), 80),
          setTimeout(() => setRevealStep(2), 80 + REVEAL_STAGGER_MS),
          setTimeout(() => setRevealStep(3), 80 + REVEAL_STAGGER_MS * 2),
          setTimeout(() => setRevealStep(4), 80 + REVEAL_STAGGER_MS * 3),
        ]
      : [1, 2, 3, 4].map((step) =>
          setTimeout(() => setRevealStep(step), 80 + (step - 1) * REVEAL_STAGGER_MS),
        );
    revealTimersRef.current = timers;
  };

  const startStandardReveal = (optionCount) => {
    clearRevealTimers();
    setRevealStep(0);
    setExiting(false);
    setBridge(null);
    setBridgeStep(0);
    setBridgeExiting(false);
    setPinnedBubble(null);
    setMergedToQ2(false);
    pinnedBubbleRef.current = null;
    mergedToQ2Ref.current = false;
    q2RevealStartedRef.current = false;
    confirmingRef.current = false;

    const totalSteps = 2 + optionCount;
    for (let step = 1; step <= totalSteps; step += 1) {
      revealTimersRef.current.push(
        setTimeout(() => setRevealStep(step), 80 + (step - 1) * REVEAL_STAGGER_MS),
      );
    }
  };

  useEffect(() => {
    // Answer-confirm owns the screen — do not tear it down.
    if (confirmingRef.current) {
      return undefined;
    }

    // Q1→Q2 already merged on this page: session index caught up — unlock only.
    if (q2RevealStartedRef.current && liveQuestion?.type === "activity-pair") {
      setExiting(false);
      setLocked(false);
      setPendingId(null);
      return undefined;
    }

    clearTimeout(timerRef.current);
    clearBridgeTimers();
    clearRevealTimers();
    setPendingId(null);
    setLocked(false);
    setKayakId(null);
    setRopesId(null);
    kayakIdRef.current = null;
    ropesIdRef.current = null;
    setBridge(null);
    setBridgeStep(0);
    setBridgeExiting(false);
    confirmingRef.current = false;

    if (liveQuestion?.type === "activity-pair") {
      const keepBubble =
        Boolean(pinnedBubbleRef.current) ||
        mergedToQ2Ref.current ||
        q2RevealStartedRef.current;
      if (keepBubble) q2RevealStartedRef.current = true;
      startActivityReveal({ keepBubble });
    } else if (!mergedToQ2Ref.current) {
      startStandardReveal(liveQuestion?.options?.length || 0);
    }

    return () => {
      // Never kill an in-flight confirm or the Q1→Q2 merged stagger on index sync.
      if (confirmingRef.current || q2RevealStartedRef.current) return;
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

  const answerQuestionIndex = () => {
    if (liveQuestion?.type === "activity-pair") return currentQuestion;
    if (mergedToQ2) return 1;
    return currentQuestion;
  };

  /** Q1 only: outdoors bubble → Thinking → same page becomes Q2 under the bubble. */
  const runQ1BridgeIntoQ2 = (optionId) => {
    const bubbleText = question.bridgeBubble || "";

    clearTimeout(timerRef.current);
    clearBridgeTimers();
    setExiting(true);
    setPinnedBubble(null);
    setMergedToQ2(false);
    pinnedBubbleRef.current = null;
    mergedToQ2Ref.current = false;
    q2RevealStartedRef.current = false;
    confirmingRef.current = false;

    timerRef.current = setTimeout(() => {
      setBridge({ bubbleText, optionId, kind: "q1" });
      setBridgeStep(0);
      setBridgeExiting(false);
      setExiting(false);

      bridgeTimersRef.current.push(setTimeout(() => setBridgeStep(1), 40));
      bridgeTimersRef.current.push(
        setTimeout(() => setBridgeStep(4), 40 + REVEAL_STAGGER_MS),
      );
      bridgeTimersRef.current.push(
        setTimeout(() => {
          setBridgeStep(5);
          bridgeTimersRef.current.push(
            setTimeout(() => {
              pinnedBubbleRef.current = bubbleText;
              mergedToQ2Ref.current = true;
              q2RevealStartedRef.current = true;
              setPinnedBubble(bubbleText);
              setMergedToQ2(true);
              setBridge(null);
              setBridgeStep(0);
              setLocked(false);
              setPendingId(null);
              setKayakId(null);
              setRopesId(null);
              kayakIdRef.current = null;
              ropesIdRef.current = null;
              setExiting(false);
              startActivityReveal({ keepBubble: true });
              onAnswer(currentQuestion, optionId, { advance: true });
            }, REVEAL_FADE_MS),
          );
        }, 40 + REVEAL_STAGGER_MS + THINKING_HOLD_MS),
      );
    }, REVEAL_FADE_MS);
  };

  /** Q2/Q3 answer confirm: bubble (+ AI) → Thinking → next question */
  const runBridgeThenAdvance = (optionId) => {
    const option = resolveAnswerOption(question, optionId);
    if (!option && question?.type === "activity-pair") {
      // Still proceed with synthesized copy if lookup fails
    }
    const bubbleText = option?.youSay || question.userBubble || "";
    const aiText = option?.aiSay || null;
    const placeCard = option?.answerCard || null;
    const qIndex = answerQuestionIndex();

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
      setExiting(false);
      setPinnedBubble(null);
      pinnedBubbleRef.current = null;

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
              q2RevealStartedRef.current = false;
              mergedToQ2Ref.current = false;
              pinnedBubbleRef.current = null;
              setMergedToQ2(false);
              setPinnedBubble(null);
              setBridge(null);
              setBridgeStep(0);
              setBridgeExiting(false);
              onAnswer(qIndex, optionId, { advance: true });
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
    onAnswer(answerQuestionIndex(), optionId, { advance: false });

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (currentQuestion === QUESTIONS.length - 1) {
        setExiting(true);
        timerRef.current = setTimeout(() => {
          onAnswer(currentQuestion, optionId, { advance: true });
        }, REVEAL_FADE_MS);
        return;
      }
      if (currentQuestion === 0 && !mergedToQ2Ref.current) {
        runQ1BridgeIntoQ2(optionId);
        return;
      }
      runBridgeThenAdvance(optionId);
    }, SELECT_HOLD_MS);
  };

  /** One card click advances — fill the other group with its first option for now. */
  const handleActivitySelect = (groupId, optionId) => {
    if (locked || confirmingRef.current || bridge) return;

    const kayakGroup = question.groups?.find((g) => g.id === "kayak");
    const ropesGroup = question.groups?.find((g) => g.id === "ropes");
    const defaultKayak = kayakGroup?.options?.[0]?.id;
    const defaultRopes = ropesGroup?.options?.[0]?.id;

    const nextKayak = groupId === "kayak" ? optionId : defaultKayak;
    const nextRopes = groupId === "ropes" ? optionId : defaultRopes;
    if (!nextKayak || !nextRopes) return;

    kayakIdRef.current = nextKayak;
    ropesIdRef.current = nextRopes;
    setKayakId(nextKayak);
    setRopesId(nextRopes);

    const answerId = `${nextKayak}|${nextRopes}`;
    setLocked(true);
    setPendingId(answerId);
    onAnswer(answerQuestionIndex(), answerId, { advance: false });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      runBridgeThenAdvance(answerId);
    }, SELECT_HOLD_MS);
  };

  const inBridge = Boolean(bridge);
  const showBridgeBubble = inBridge && bridgeStep >= 1 && !bridgeExiting;
  const showBridgeAi = inBridge && bridge?.aiText && bridgeStep >= 2 && !bridgeExiting;
  const showBridgeCard =
    inBridge && bridge?.placeCard && bridgeStep >= 3 && !bridgeExiting;
  const showBridgeThinking =
    inBridge && bridgeStep >= 4 && bridgeStep < 5 && !bridgeExiting;
  const thinkingFading = inBridge && bridgeStep >= 5;

  const showPinnedOrLiveBubble =
    Boolean(pinnedBubble) ||
    showBridgeBubble ||
    (isActivityPair && !inBridge && (pinnedBubble || revealStep >= 1) && !exiting);

  const showPrompt = revealStep >= 1 && !exiting && !inBridge;
  const showHint = revealStep >= 2 && !exiting && !inBridge;

  const bubbleText =
    bridge?.bubbleText || pinnedBubble || question.userBubble || question.bridgeBubble;

  const questionIndexKey =
    mergedToQ2 || isActivityPair ? Math.max(currentQuestion, 1) : currentQuestion;

  // Merged Q2: allow clicks even if stagger timers were interrupted.
  const cardsEnabled =
    !locked &&
    !confirmingRef.current &&
    !bridge &&
    (mergedToQ2 || revealStep >= 3 || q2RevealStartedRef.current);

  return (
    <div
      className={`question question--planner question--count-${
        isActivityPair ? "activity" : options.length
      }${exiting && !inBridge ? " is-exiting" : ""}${inBridge ? " is-bridging" : ""}`}
      style={{ "--question-reveal-ms": `${REVEAL_FADE_MS}ms` }}
    >
      <ExpediaBrandBar />

      <div className="question__trip">
        <p className="question__trip-line">
          {tripPlace} · {tripDates}
        </p>
        <p className="question__follow-up">Follow up</p>
      </div>

      {showPinnedOrLiveBubble || inBridge ? (
        <div
          className={`question__dialogue${bridgeExiting ? " is-exiting" : ""}`}
          style={{ "--briefing-fade-ms": `${REVEAL_FADE_MS}ms` }}
        >
          <div
            className={`briefing__bubble${
              showBridgeBubble || Boolean(pinnedBubble) || (isActivityPair && revealStep >= 1)
                ? " is-visible"
                : ""
            }`}
          >
            {bubbleText}
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

          {inBridge && (bridgeStep >= 4 || thinkingFading) ? (
            <p
              className={`briefing__thinking${
                showBridgeThinking ? " is-visible" : ""
              }${thinkingFading ? " is-leaving" : ""}`}
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
                  key={`${questionIndexKey}-${option.id}`}
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
            <h2
              className={
                showPrompt || mergedToQ2 || revealStep >= 1 ? "is-revealed" : undefined
              }
            >
              {question.prompt}
            </h2>
            <p
              className={`question__pick-hint${
                showHint || mergedToQ2 || revealStep >= 2 ? " is-revealed" : ""
              }`}
            >
              {question.pickHint}
            </p>
          </div>

          <div
            className={`activity-board${
              revealStep >= 3 || mergedToQ2 || q2RevealStartedRef.current
                ? " is-revealed"
                : ""
            }`}
          >
            {question.groups.map((group, groupIndex) => {
              const selectedId = group.id === "kayak" ? kayakId : ropesId;
              const groupRevealed =
                revealStep >= 3 + groupIndex || mergedToQ2 || revealStep >= 3;
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
                          disabled={!cardsEnabled}
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
