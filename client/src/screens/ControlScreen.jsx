import { ScreenChrome } from "../components/ScreenChrome.jsx";
import DestinationPicker from "../components/DestinationPicker.jsx";
import BriefingStep from "../components/BriefingStep.jsx";
import QuestionStep from "../components/QuestionStep.jsx";
import AnswerFinaleStep from "../components/AnswerFinaleStep.jsx";
import BuildingMemoryStep from "../components/BuildingMemoryStep.jsx";
import ItinerarySchedule from "../components/ItinerarySchedule.jsx";

export default function ControlScreen() {
  return (
    <ScreenChrome role="control">
      {({ state, actions }) => {
        const phase = state.phase === "idle" ? "destination" : state.phase;
        const finaleActive =
          phase === "reveal" || phase === "building" || phase === "itinerary";
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
              className={`panel ${phase === "briefing" || phase === "questions" ? "is-active" : ""}`}
              inert={phase !== "briefing" && phase !== "questions" ? "" : undefined}
            >
              {phase === "briefing" ? (
                <BriefingStep
                  key={state.destination || "briefing"}
                  destinationId={state.destination}
                  onContinue={actions.beginQuestions}
                />
              ) : null}
              {phase === "questions" ? (
                <QuestionStep
                  key={`${state.destination}-${state.currentQuestionId || state.currentQuestion}`}
                  currentQuestion={state.currentQuestion}
                  currentQuestionId={state.currentQuestionId}
                  destinationId={state.destination}
                  onAnswer={actions.answer}
                />
              ) : null}
            </section>
            <section
              className={`panel ${finaleActive ? "is-active" : ""}`}
              inert={!finaleActive ? "" : undefined}
            >
              {phase === "reveal" ? (
                <AnswerFinaleStep
                  destinationId={state.destination}
                  answers={state.answers}
                />
              ) : null}
              {phase === "building" ? <BuildingMemoryStep /> : null}
              {phase === "itinerary" ? <ItinerarySchedule /> : null}
            </section>
          </main>
        );
      }}
    </ScreenChrome>
  );
}
