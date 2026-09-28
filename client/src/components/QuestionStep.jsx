import { QUESTIONS } from "@shared/questions.js";
import { getDestination } from "@shared/destinations.js";

const TOTAL_STEPS = 5; // destination + 3 questions + reveal
const VISIBLE_OPTIONS = 2;

export default function QuestionStep({
  currentQuestion,
  answers,
  destinationId,
  onAnswer,
  onBack,
}) {
  const question = QUESTIONS[currentQuestion];
  if (!question) return null;

  const destination = getDestination(destinationId);
  const options = question.options.slice(0, VISIBLE_OPTIONS);
  const locked = Boolean(answers[currentQuestion]);
  const hasPhotos = options.every((option) => option.image);
  const stepIndex = currentQuestion + 1; // 0 = destination
  const stepLabel = `${String(currentQuestion + 1).padStart(2, "0")} OF ${String(QUESTIONS.length).padStart(2, "0")}`;

  return (
    <div className={`question ${hasPhotos ? "question--photos" : ""}`} key={question.id}>
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
        <h2>{question.prompt}</h2>
      </div>

      <div className={`question__options ${hasPhotos ? "question__options--photos" : ""}`}>
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            className={`question__option ${hasPhotos ? "question__option--photo" : ""}`}
            disabled={locked}
            onClick={() => onAnswer(currentQuestion, option.id)}
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

      <footer className="question__footer">
        <div className="question__dots" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <span key={index} className={index === stepIndex ? "is-active" : ""} />
          ))}
        </div>
        <div className="question__footer-row">
          <p>{hasPhotos ? "Tap a photo to tell us more." : "Tap an option to continue."}</p>
          <button type="button" className="question__back" onClick={onBack}>
            Back
          </button>
        </div>
      </footer>
    </div>
  );
}
