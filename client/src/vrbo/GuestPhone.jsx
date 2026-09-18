import FinalSelection from "./FinalSelection.jsx";
import PreferenceQuestion from "./PreferenceQuestion.jsx";
import VotingInterface from "./VotingInterface.jsx";
import { IosHome, IosStatusBar } from "./IosChrome.jsx";
import { QUESTIONS } from "./data.js";

export default function GuestPhone({ profile, guest, guestId, guests, stage, winnerId, onAnswer, onRank }) {
  const questionIndex = guest.answers.length;
  const waiting = stage === "recommendations";
  const progress = Math.min(questionIndex + 1, QUESTIONS.length);

  return (
    <div className="vrbo-phone">
      <IosStatusBar />
      <header className="vrbo-quiz__head">
        <i style={{ background: profile.color }}>{profile.initial}</i>
        <div>
          <strong>{profile.name}</strong>
          <em>
            {stage === "final"
              ? "Trip locked in"
              : stage === "voting"
                ? "Rank the cabins"
                : waiting || questionIndex >= QUESTIONS.length
                  ? "Waiting on the group"
                  : `Question ${progress} of ${QUESTIONS.length}`}
          </em>
        </div>
      </header>
      {stage === "preferences" && questionIndex < QUESTIONS.length ? (
        <div className="vrbo-quiz__dots" aria-hidden="true">
          {QUESTIONS.map((question, index) => (
            <span key={question.id} className={index <= questionIndex ? "is-on" : ""} />
          ))}
        </div>
      ) : null}
      <section className="vrbo-phone__stage is-fill">
        {stage === "final" && winnerId ? (
          <FinalSelection winnerId={winnerId} compact />
        ) : waiting ? (
          <div className="vrbo-wait">
            <p>Jamie is putting a few cabins in the group chat…</p>
          </div>
        ) : stage === "voting" ? (
          <VotingInterface guest={guest} guests={guests} onRank={(propertyId) => onRank(guestId, propertyId)} />
        ) : questionIndex < QUESTIONS.length ? (
          <PreferenceQuestion
            key={QUESTIONS[questionIndex].id}
            question={QUESTIONS[questionIndex]}
            onAnswer={(optionId) => onAnswer(guestId, optionId)}
          />
        ) : (
          <div className="vrbo-wait">
            <p>Your picks are in the group chat.</p>
          </div>
        )}
      </section>
      <IosHome />
    </div>
  );
}
