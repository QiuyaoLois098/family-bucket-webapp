import { QUESTIONS } from "@shared/questions.js";

export default function QuestionStep({ currentQuestion, answers, onAnswer }) {
  const question = QUESTIONS[currentQuestion];
  if (!question) return null;

  const locked = Boolean(answers[currentQuestion]);

  return (
    <div className="question" key={question.id}>
      <header className="question__header">
        <p className="eyebrow">
          Question {currentQuestion + 1} of {QUESTIONS.length}
        </p>
        <div className="question__progress" aria-hidden="true">
          {QUESTIONS.map((item, index) => (
            <span
              key={item.id}
              className={
                index < currentQuestion ? "is-done" : index === currentQuestion ? "is-now" : ""
              }
            />
          ))}
        </div>
        <h2>{question.prompt}</h2>
      </header>
      <div className="question__options">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="question__option"
            disabled={locked}
            onClick={() => onAnswer(currentQuestion, option.id)}
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
