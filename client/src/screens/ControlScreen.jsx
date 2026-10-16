import { ScreenChrome } from "../components/ScreenChrome.jsx";
import DestinationPicker from "../components/DestinationPicker.jsx";
import BriefingStep from "../components/BriefingStep.jsx";
import QuestionStep from "../components/QuestionStep.jsx";
import BuildingMemoryStep from "../components/BuildingMemoryStep.jsx";
import ItinerarySchedule from "../components/ItinerarySchedule.jsx";

export default function ControlScreen() {
  return (
    <ScreenChrome role="control">
      {({ state, actions }) => {
        const phase = state.phase === "idle" ? "destination" : state.phase;
        // Keep the Q&A panel through reveal so the settled reply doesn't remount.
        const qaActive =
          phase === "briefing" || phase === "questions" || phase === "reveal";
        const afterActive = phase === "building" || phase === "itinerary";
        const stepQuestionId =
          phase === "reveal"
            ? state.answeredQuestionIds?.[state.answeredQuestionIds.length - 1] ||
              null
            : state.currentQuestionId;

        return (
          <main className={`screen screen--control phase-${phase}`}>
            <div className="screen__grain" />
            <section
              className={`panel ${phase === "destination" ? "is-active" : ""}`}
              inert={phase !== "destination" ? "" : undefined}
            >
              {phase === "destination" ? (
                <DestinationPicker
                  onSelect={actions.selectDestination}
                  offeredIds={state.offeredDestinations}
                />
              ) : null}
            </section>
            <section
              className={`panel ${qaActive ? "is-active" : ""}`}
              inert={!qaActive ? "" : undefined}
            >
              {phase === "briefing" ? (
                <BriefingStep
                  key={state.destination || "briefing"}
                  destinationId={state.destination}
                  onContinue={actions.beginQuestions}
                />
              ) : null}
              {phase === "questions" || phase === "reveal" ? (
                <QuestionStep
                  key={`${state.destination}-${stepQuestionId || state.currentQuestion}`}
                  currentQuestion={state.currentQuestion}
                  currentQuestionId={stepQuestionId}
                  destinationId={state.destination}
                  finaleAnswerId={
                    state.answers?.[state.answers.length - 1] || null
                  }
                  holdReply={phase === "reveal"}
                  onAnswer={actions.answer}
                />
              ) : null}
            </section>
            <section
              className={`panel ${afterActive ? "is-active" : ""}`}
              inert={!afterActive ? "" : undefined}
            >
              {phase === "building" ? (
                <BuildingMemoryStep destinationId={state.destination} />
              ) : null}
              {phase === "itinerary" ? (
                <ItinerarySchedule
                  destinationId={state.destination}
                  answers={state.answers}
                />
              ) : null}
            </section>
          </main>
        );
      }}
    </ScreenChrome>
  );
}
