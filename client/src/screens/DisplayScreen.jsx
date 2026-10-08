import { getDestination } from "@shared/destinations.js";
import { ScreenChrome } from "../components/ScreenChrome.jsx";
import IdleDisplay from "../components/IdleDisplay.jsx";
import ImageReveal from "../components/ImageReveal.jsx";
import FlightCardReveal from "../components/FlightCardReveal.jsx";
import ItineraryView from "../components/ItineraryView.jsx";

export default function DisplayScreen() {
  return (
    <ScreenChrome role="display" syncOnly>
      {({ state }) => {
        const destination = getDestination(state.destination);
        const showFlightCard = state.phase === "reveal";

        return (
          <main className={`screen screen--display phase-${state.phase}`}>
            <div className="screen__grain" />
            <section className={`panel ${!state.destination ? "is-active" : ""}`}>
              <IdleDisplay />
            </section>
            <section className={`panel panel--reveal ${state.destination ? "is-active" : ""}`}>
              {state.destination ? (
                showFlightCard ? (
                  <FlightCardReveal destination={destination} />
                ) : (
                  <ImageReveal state={state} />
                )
              ) : null}
            </section>
            <section className={`panel panel--memories ${state.phase === "itinerary" ? "is-active" : ""}`}>
              {state.phase === "itinerary" ? <ItineraryView destination={destination} /> : null}
            </section>
          </main>
        );
      }}
    </ScreenChrome>
  );
}
