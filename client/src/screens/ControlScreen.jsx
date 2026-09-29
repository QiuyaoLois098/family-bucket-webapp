import { getDestination } from "@shared/destinations.js";
import { ScreenChrome } from "../components/ScreenChrome.jsx";
import DestinationPicker from "../components/DestinationPicker.jsx";
import QuestionStep from "../components/QuestionStep.jsx";
import PlanningStep from "../components/PlanningStep.jsx";
import RevealStep from "../components/RevealStep.jsx";
import ItinerarySchedule from "../components/ItinerarySchedule.jsx";

export default function ControlScreen() {
  return (
    <ScreenChrome role="control">
      {({ state, actions }) => {
        const phase = state.phase === "idle" ? "destination" : state.phase;
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
              className={`panel ${phase === "questions" ? "is-active" : ""}`}
              inert={phase !== "questions" ? "" : undefined}
            >
              {phase === "questions" ? (
                <QuestionStep
                  currentQuestion={state.currentQuestion}
                  answers={state.answers}
                  destinationId={state.destination}
                  onAnswer={actions.answer}
                  onBack={actions.goBack}
                />
              ) : null}
            </section>
            <section
              className={`panel ${phase === "planning" ? "is-active" : ""}`}
              inert={phase !== "planning" ? "" : undefined}
            >
              {phase === "planning" ? <PlanningStep destinationId={state.destination} /> : null}
            </section>
            <section
              className={`panel ${phase === "reveal" || phase === "itinerary" ? "is-active" : ""}`}
              inert={phase !== "reveal" && phase !== "itinerary" ? "" : undefined}
            >
              {phase === "reveal" ? <RevealStep onReveal={actions.shake} /> : null}
              {phase === "itinerary" ? (
                <ItinerarySchedule
                  itinerary={state.itinerary}
                  destination={getDestination(state.destination)}
                  onStartOver={actions.reset}
                />
              ) : null}
            </section>
          </main>
        );
      }}
    </ScreenChrome>
  );
}
