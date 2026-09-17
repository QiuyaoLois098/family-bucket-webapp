import { getDestination } from "@shared/destinations.js";
import { ScreenChrome } from "../components/ScreenChrome.jsx";
import DestinationPicker from "../components/DestinationPicker.jsx";
import QuestionStep from "../components/QuestionStep.jsx";
import ItineraryView from "../components/ItineraryView.jsx";

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
              <DestinationPicker
                onSelect={actions.selectDestination}
                offeredIds={state.offeredDestinations}
              />
            </section>
            <section
              className={`panel ${phase === "questions" ? "is-active" : ""}`}
              inert={phase !== "questions" ? "" : undefined}
            >
              <QuestionStep
                currentQuestion={state.currentQuestion}
                answers={state.answers}
                onAnswer={actions.answer}
              />
            </section>
            <section
              className={`panel ${phase === "reveal" || phase === "itinerary" ? "is-active" : ""}`}
              inert={phase !== "reveal" && phase !== "itinerary" ? "" : undefined}
            >
              {phase === "reveal" ? (
                <div className="itinerary itinerary--waiting">
                  <h2>Pick up the snow globe and shake it to see the itinerary</h2>
                  <button type="button" className="shake-button" onClick={actions.shake}>
                    Shake
                  </button>
                </div>
              ) : (
                <ItineraryView
                  itinerary={state.itinerary}
                  destination={getDestination(state.destination)}
                  onStartOver={phase === "itinerary" ? actions.reset : undefined}
                />
              )}
            </section>
          </main>
        );
      }}
    </ScreenChrome>
  );
}
