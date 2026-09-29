import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";

const TOTAL_STEPS = 5; // destination + 3 questions + reveal
const AI_LOGO = "/images/Expedia-images/expedia-samll.png";

const FLASH_MS = 420;
const TYPING_MS = 1100;
const HOLD_MS = 3000;

const BUBBLE_LAYOUT = {
  layout: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
};

export default function QuestionStep({
  currentQuestion,
  answers,
  destinationId,
  onAnswer,
  onBack,
}) {
  const question = QUESTIONS[currentQuestion];
  const [pendingId, setPendingId] = useState(null);
  const [phase, setPhase] = useState("pick"); // pick | flash | typing | done
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current = [];
  };

  const later = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => {
    setPendingId(null);
    setPhase("pick");
    return clearTimers;
  }, [currentQuestion]);

  if (!question) return null;

  const destination = getDestination(destinationId);
  const options = question.options;
  const isChatQuestion = options.every((option) => option.youSay && option.aiSay);
  const selected = options.find((option) => option.id === pendingId);
  const hasPhotos = options.length > 0 && options.every((option) => option.image);
  const stepIndex = currentQuestion + 1;
  const stepLabel = `${String(currentQuestion + 1).padStart(2, "0")} OF ${String(QUESTIONS.length).padStart(2, "0")}`;
  const showCards = !isChatQuestion || phase === "pick" || phase === "flash";
  const inConversation = isChatQuestion && (phase === "typing" || phase === "done");
  const isLastQuestion = currentQuestion >= QUESTIONS.length - 1;
  const locked = Boolean(answers[currentQuestion]) || phase !== "pick";

  const handleSelect = (optionId) => {
    if (locked) return;
    const option = options.find((item) => item.id === optionId);
    if (!option) return;

    if (!isChatQuestion) {
      onAnswer(currentQuestion, optionId);
      return;
    }

    clearTimers();
    setPendingId(optionId);
    setPhase("flash");

    later(() => {
      setPhase("typing");
      later(() => {
        setPhase("done");
        // Lock answer now so the display zoom updates with the AI reply text.
        onAnswer(currentQuestion, optionId, { advance: false });
        later(() => {
          onAnswer(currentQuestion, optionId, { advance: true });
        }, HOLD_MS);
      }, TYPING_MS);
    }, FLASH_MS);
  };

  return (
    <div
      className={[
        "question",
        hasPhotos ? "question--photos" : "",
        `question--count-${options.length}`,
        isChatQuestion ? "question--chatflow" : "",
        inConversation ? "question--chatting" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      key={question.id}
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
        {!isChatQuestion ? <h2>{question.prompt}</h2> : null}
      </div>

      {isChatQuestion ? (
        <div className="question__thread" aria-live="polite">
          <div className="question__chat-row question__chat-row--ai">
            <img className="question__chat-logo" src={AI_LOGO} alt="" />
            <div className="question__bubble question__bubble--ai">
              <p className="question__bubble-label">AI Activity Planner</p>
              <p className="question__bubble-text">{question.prompt}</p>
            </div>
          </div>

          {inConversation && selected ? (
            <div className="question__chat-row question__chat-row--you">
              <div className="question__bubble question__bubble--you">
                <p className="question__bubble-label">You</p>
                <p className="question__bubble-text">{selected.youSay}</p>
              </div>
            </div>
          ) : null}

          {phase === "typing" || phase === "done" ? (
            <div className="question__chat-row question__chat-row--ai">
              <img className="question__chat-logo" src={AI_LOGO} alt="" />
              <motion.div
                layout
                className={`question__bubble question__bubble--ai${phase === "typing" ? " is-typing" : " is-reply"}`}
                transition={BUBBLE_LAYOUT}
                style={{ transformOrigin: "left center" }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {phase === "typing" ? (
                    <motion.p
                      key="typing"
                      className="question__typing"
                      aria-label="AI is typing"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    >
                      <span />
                      <span />
                      <span />
                    </motion.p>
                  ) : (
                    <motion.div
                      key="reply"
                      className="question__bubble-body"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.28, delay: 0.12, ease: "easeOut" }}
                    >
                      <p className="question__bubble-label">AI Activity Planner</p>
                      <p className="question__bubble-text">{selected?.aiSay}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ) : null}
        </div>
      ) : null}

      {showCards ? (
        <div className={`question__options ${hasPhotos ? "question__options--photos" : ""}`}>
          {options.map((option, index) => (
            <button
              key={option.id}
              type="button"
              className={`question__option ${hasPhotos ? "question__option--photo" : ""}${pendingId === option.id ? " is-selected" : ""}`}
              disabled={locked}
              onClick={() => handleSelect(option.id)}
              style={hasPhotos ? { animationDelay: `${index * 0.06}s` } : undefined}
            >
              {hasPhotos ? (
                <>
                  <span
                    className="question__option-image"
                    style={{ backgroundImage: `url(${option.image})` }}
                  />
                  <span className="question__option-veil" />
                  <span className="question__option-label">{option.label}</span>
                </>
              ) : (
                <span>{option.label}</span>
              )}
            </button>
          ))}
        </div>
      ) : null}

      <footer className="question__footer">
        {isChatQuestion ? null : (
          <div className="question__dots" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }, (_, index) => (
              <span key={index} className={index === stepIndex ? "is-active" : ""} />
            ))}
          </div>
        )}
        <div className="question__footer-row">
          <p>
            {phase === "done"
              ? isLastQuestion
                ? "Your family trip is taking shape."
                : "Your answer has been added. Continuing..."
              : phase === "typing" || phase === "flash"
                ? ""
                : isChatQuestion
                  ? "Tap a photo to reply."
                  : hasPhotos
                    ? "Tap a photo to tell us more."
                    : "Tap an option to continue."}
          </p>
          {phase === "pick" ? (
            <button type="button" className="question__back" onClick={onBack}>
              Back
            </button>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
