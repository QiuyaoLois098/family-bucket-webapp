import { ScreenChrome } from "../components/ScreenChrome.jsx";
import IdleDisplay from "../components/IdleDisplay.jsx";
import ImageReveal from "../components/ImageReveal.jsx";
import RevealStep from "../components/RevealStep.jsx";
import BuildingProgressStep from "../components/BuildingProgressStep.jsx";
import ItineraryView from "../components/ItineraryView.jsx";

export default function DisplayScreen() {
  return (
    <ScreenChrome role="display" syncOnly>
      {({ state, actions }) => {
        const phase = state.phase;
        const showLuggage = phase === "reveal";
        const showBuilding = phase === "building";
        const showItinerary = phase === "itinerary";
        const revealPanelActive =
          Boolean(state.destination) && !showItinerary;

        return (
          <main className={`screen screen--display phase-${phase}`}>
            <div className="screen__grain" />
            <section className={`panel ${!state.destination ? "is-active" : ""}`}>
              <IdleDisplay />
            </section>
            <section className={`panel panel--reveal ${revealPanelActive ? "is-active" : ""}`}>
              {state.destination ? (
                showLuggage ? (
                  <RevealStep onReveal={actions.shake} />
                ) : showBuilding ? (
                  <BuildingProgressStep />
                ) : (
                  <ImageReveal state={state} />
                )
              ) : null}
            </section>
            <section className={`panel panel--memories ${showItinerary ? "is-active" : ""}`}>
              {showItinerary ? <ItineraryView /> : null}
            </section>
          </main>
        );
      }}
    </ScreenChrome>
  );
}
