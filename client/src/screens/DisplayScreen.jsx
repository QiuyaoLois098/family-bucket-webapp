import { getDestination } from "@shared/destinations.js";
import { ScreenChrome } from "../components/ScreenChrome.jsx";
import IdleDisplay from "../components/IdleDisplay.jsx";
import ImageReveal from "../components/ImageReveal.jsx";
import ItineraryView from "../components/ItineraryView.jsx";

export default function DisplayScreen() {
  return (
    <ScreenChrome role="display">
      {({ state }) => (
        <main className={`screen screen--display phase-${state.phase}`}>
          <div className="screen__grain" />
          <section className={`panel ${!state.destination ? "is-active" : ""}`}>
            <IdleDisplay />
          </section>
          <section className={`panel panel--reveal ${state.destination ? "is-active" : ""}`}>
            {state.destination ? <ImageReveal state={state} /> : null}
          </section>
          <section className={`panel panel--memories ${state.phase === "itinerary" ? "is-active" : ""}`}>
            {state.phase === "itinerary" ? (
              <ItineraryView
                itinerary={state.itinerary}
                destination={getDestination(state.destination)}
              />
            ) : null}
          </section>
        </main>
      )}
    </ScreenChrome>
  );
}
