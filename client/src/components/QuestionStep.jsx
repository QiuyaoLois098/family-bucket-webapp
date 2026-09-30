import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";

const AI_LOGO = "/images/Expedia-images/expedia-samll.png";

const FLASH_MS = 360;
const CARD_FADE_MS = 380;
const YOU_PAUSE_MS = 260;
const TYPING_MS = 1100;
const LAST_HOLD_MS = 2800;
const REPLY_SETTLE_MS = 280;
const SHIFT_MS = 720;

const EASE = [0.22, 1, 0.36, 1];
const BUBBLE_LAYOUT = { layout: { duration: 0.96, ease: EASE } };

function makePrompt(index) {
  return {
    id: `prompt-${index}`,
    role: "ai",
    kind: "prompt",
    questionIndex: index,
    text: QUESTIONS[index].prompt,
  };
}

/**
 * One continuous chat for all questions — messages only append,
 * and each handoff does exactly one smooth scroll.
 */
export default function QuestionStep({
  currentQuestion,
  answers,
  destinationId,
  onAnswer,
  onBack,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [messages, setMessages] = useState(() => [makePrompt(0)]);
  const [pendingId, setPendingId] = useState(null);
  const [phase, setPhase] = useState("pick"); // pick | flash | rolling | you | typing | done | rising
  const [shiftY, setShiftY] = useState(0);
  const [viewportH, setViewportH] = useState(null);

  const timers = useRef([]);
  const threadRef = useRef(null);
  const trackRef = useRef(null);
  const activeIndexRef = useRef(0);
  const serverQRef = useRef(currentQuestion);
  const scrollingRef = useRef(false);

  activeIndexRef.current = activeIndex;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  const fitViewportToPrompt = (index = activeIndexRef.current) => {
    const prompt = trackRef.current?.querySelector(`[data-msg-id="prompt-${index}"]`);
    if (!prompt) return;
    // overflow:hidden clips the bubble — leave room for the bottom radius.
    const height = Math.ceil(prompt.getBoundingClientRect().height);
    setViewportH(height + 24);
  };

  const fitViewportToLiveThread = (index = activeIndexRef.current) => {
    const prompt = trackRef.current?.querySelector(`[data-msg-id="prompt-${index}"]`);
    const last = trackRef.current?.lastElementChild;
    if (!prompt || !last) return;
    // Absolute track is clipped by thread height — keep slack so
    // the reply bubble's bottom radius / logo aren't cut off.
    const top = prompt.offsetTop;
    const bottom = last.offsetTop + last.offsetHeight;
    setViewportH(Math.ceil(bottom - top) + 24);
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    clearTimers();
    scrollingRef.current = false;
    setActiveIndex(0);
    activeIndexRef.current = 0;
    setMessages([makePrompt(0)]);
    setPendingId(null);
    setPhase("pick");
    setShiftY(0);
    setViewportH(null);
    serverQRef.current = 0;
  }, [destinationId]);

  useEffect(() => {
    const prev = serverQRef.current;
    serverQRef.current = currentQuestion;
    if (currentQuestion >= prev) return;

    clearTimers();
    scrollingRef.current = false;
    setActiveIndex(currentQuestion);
    activeIndexRef.current = currentQuestion;
    setMessages([makePrompt(currentQuestion)]);
    setPendingId(null);
    setPhase("pick");
    setShiftY(0);
    setViewportH(null);
  }, [currentQuestion]);

  // Keep viewport fitted while answering — never during the handoff scroll.
  useLayoutEffect(() => {
    if (scrollingRef.current || phase === "rising") return;
    if (phase === "pick" || phase === "flash") {
      fitViewportToPrompt();
      // Fonts / layout can settle after first paint and grow the bubble.
      const t1 = window.setTimeout(() => fitViewportToPrompt(), 50);
      const t2 = window.setTimeout(() => fitViewportToPrompt(), 320);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
    if (phase === "you" || phase === "typing" || phase === "done") {
      fitViewportToLiveThread();
      // Remeasure after typing→reply bubble expands.
      const t1 = window.setTimeout(() => fitViewportToLiveThread(), 60);
      const t2 = window.setTimeout(() => fitViewportToLiveThread(), 360);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
  }, [phase, activeIndex, messages]);

  // Watch live bubble size so expand animations / font reflow don't get clipped.
  useEffect(() => {
    if (phase === "rising") return;
    const inner = trackRef.current;
    if (!inner || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      if (scrollingRef.current) return;
      if (phase === "pick" || phase === "flash") fitViewportToPrompt();
      else if (phase === "you" || phase === "typing" || phase === "done") fitViewportToLiveThread();
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [phase, activeIndex, messages.length]);

  const continueToNext = (fromIndex, optionId) => {
    const nextIndex = fromIndex + 1;
    if (!QUESTIONS[nextIndex]) {
      onAnswer(fromIndex, optionId, { advance: true });
      return;
    }

    const nextPrompt = makePrompt(nextIndex);
    scrollingRef.current = true;
    setPhase("rising");
    setActiveIndex(nextIndex);
    activeIndexRef.current = nextIndex;
    setPendingId(null);
    setMessages((prev) => [...prev, nextPrompt]);
    onAnswer(fromIndex, optionId, { advance: true });

    // One frame for the new prompt to mount, then a single absolute scroll.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = trackRef.current?.querySelector(`[data-msg-id="${nextPrompt.id}"]`);
        if (!target) {
          scrollingRef.current = false;
          setPhase("pick");
          return;
        }

        // Keep viewport tall enough to show the scroll path, then move once.
        const inner = trackRef.current;
        if (inner) {
          setViewportH(inner.scrollHeight);
        }

        setShiftY(-target.offsetTop);

        later(() => {
          fitViewportToPrompt(nextIndex);
          scrollingRef.current = false;
          setPhase("pick");
          // Remeasure after the scroll settles — font/layout may still be catching up.
          later(() => fitViewportToPrompt(nextIndex), 80);
          later(() => fitViewportToPrompt(nextIndex), 360);
        }, SHIFT_MS);
      });
    });
  };

  const handleSelect = (optionId) => {
    if (phase !== "pick" || scrollingRef.current) return;
    const index = activeIndexRef.current;
    const current = QUESTIONS[index];
    const option = current?.options.find((item) => item.id === optionId);
    if (!option) return;

    clearTimers();
    setPendingId(optionId);
    setPhase("flash");

    later(() => {
      // Cards roll up first — You bubble waits until they're gone.
      setPhase("rolling");

      later(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `you-${index}-${optionId}`,
            role: "you",
            kind: "you",
            questionIndex: index,
            text: option.youSay,
          },
        ]);
        setPhase("you");

        later(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `reply-${index}`,
              role: "ai",
              kind: "typing",
              questionIndex: index,
              text: option.aiSay,
            },
          ]);
          setPhase("typing");

          later(() => {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === `reply-${index}`
                  ? { ...message, kind: "reply", text: option.aiSay }
                  : message,
              ),
            );
            setPhase("done");
            onAnswer(index, optionId, { advance: false });

            if (index >= QUESTIONS.length - 1) {
              later(() => onAnswer(index, optionId, { advance: true }), LAST_HOLD_MS);
              return;
            }

            later(() => continueToNext(index, optionId), REPLY_SETTLE_MS);
          }, TYPING_MS);
        }, YOU_PAUSE_MS);
      }, CARD_FADE_MS);
    }, FLASH_MS);
  };

  const handleBack = () => {
    if (phase !== "pick") return;
    onBack?.();
  };

  const question = QUESTIONS[activeIndex];
  if (!question) return null;

  const destination = getDestination(destinationId);
  const options = question.options;
  const showCards = phase === "pick" || phase === "flash";
  const isLast = activeIndex >= QUESTIONS.length - 1;
  const locked = phase !== "pick";
  const stepLabel = `${String(activeIndex + 1).padStart(2, "0")} OF ${String(QUESTIONS.length).padStart(2, "0")}`;

  return (
    <div
      className={[
        "question",
        "question--photos",
        "question--chatflow",
        "question--continuous",
        `question--count-${options.length}`,
        showCards ? "question--picking" : "question--chatting",
        phase === "rolling" ? "question--rolling" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="question__brandbar">
        <img
          className="question__logo"
          src="/images/Expedia-images/expedia-logo.png"
          alt="Expedia"
        />
        <span className="question__product">AI Activity Planner</span>
      </header>

      <div className="question__intro">
        <p className="question__eyebrow">
          {destination?.shortTitle || "Your trip"}
          <span aria-hidden="true"> / </span>
          {stepLabel}
        </p>
      </div>

      <div
        className="question__thread"
        ref={threadRef}
        aria-live="polite"
        style={viewportH ? { height: viewportH } : undefined}
      >
        <motion.div
          className="question__thread-track"
          animate={{ y: shiftY }}
          transition={
            phase === "rising"
              ? { duration: SHIFT_MS / 1000, ease: EASE }
              : { duration: 0 }
          }
        >
          <div className="question__thread-inner" ref={trackRef}>
            {messages.map((message) => {
              if (message.role === "you") {
                return (
                  <motion.div
                    key={message.id}
                    data-msg-id={message.id}
                    className="question__chat-row question__chat-row--you"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.64, ease: EASE }}
                  >
                    <div className="question__bubble question__bubble--you">
                      <p className="question__bubble-label">You</p>
                      <p className="question__bubble-text">{message.text}</p>
                    </div>
                  </motion.div>
                );
              }

              const typing = message.kind === "typing";
              const isNewPrompt = message.kind === "prompt" && message.questionIndex > 0;
              const logoLayout = phase !== "rising";

              return (
                <motion.div
                  key={message.id}
                  data-msg-id={message.id}
                  className="question__chat-row question__chat-row--ai"
                  layout={logoLayout ? "position" : false}
                  transition={BUBBLE_LAYOUT}
                >
                  <motion.img
                    layout={logoLayout ? "position" : false}
                    className="question__chat-logo"
                    src={AI_LOGO}
                    alt=""
                    transition={{
                      layout: { duration: 1.04, ease: EASE },
                    }}
                  />
                  <motion.div
                    layout={logoLayout}
                    className={`question__bubble question__bubble--ai${typing ? " is-typing" : ""}`}
                    style={{ transformOrigin: "left bottom" }}
                    initial={isNewPrompt ? { opacity: 0 } : false}
                    animate={{ opacity: 1 }}
                    transition={
                      isNewPrompt
                        ? { duration: 0.7, ease: EASE }
                        : {
                            ...BUBBLE_LAYOUT,
                            layout: { duration: 1.04, ease: EASE },
                          }
                    }
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {typing ? (
                        <motion.p
                          key="typing"
                          className="question__typing"
                          aria-label="AI is typing"
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        >
                          <span />
                          <span />
                          <span />
                        </motion.p>
                      ) : (
                        <motion.div
                          key={`${message.id}-body`}
                          className="question__bubble-body"
                          initial={message.kind === "reply" ? { opacity: 0 } : false}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.48, delay: 0.1, ease: "easeOut" }}
                        >
                          <p className="question__bubble-label">AI Activity Planner</p>
                          <p className="question__bubble-text">{message.text}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {phase === "done" && isLast ? (
        <motion.p
          className="question__shape-line"
          aria-live="polite"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.12 }}
        >
          Your family trip is taking shape
          <span className="question__shape-dots" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </motion.p>
      ) : null}

      <div className="question__cards-slot">
        <AnimatePresence initial={false} mode="sync">
          {showCards ? (
            <motion.div
              key={`options-${activeIndex}`}
              className="question__options question__options--photos"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.38, ease: "easeOut" },
              }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {options.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  className={`question__option question__option--photo${pendingId === option.id ? " is-selected" : ""}`}
                  disabled={locked}
                  onClick={() => handleSelect(option.id)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span
                    className="question__option-image"
                    style={{ backgroundImage: `url(${option.image})` }}
                  />
                  <span className="question__option-veil" />
                  <span className="question__option-label">{option.label}</span>
                </button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <footer className="question__footer">
        <div className="question__footer-row">
          <p>
            {phase === "pick"
              ? "Tap a photo to reply."
              : phase === "rising" || phase === "done"
                ? ""
                : ""}
          </p>
          {phase === "pick" ? (
            <button type="button" className="question__back" onClick={handleBack}>
              Back
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
