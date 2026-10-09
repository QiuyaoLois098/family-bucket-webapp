import { DESTINATIONS, getDestination } from "@shared/destinations.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const ORDER = new Map(DESTINATIONS.map((item, index) => [item.id, index]));

export default function DestinationPicker({ onSelect, offeredIds }) {
  const destinations = (offeredIds?.length ? offeredIds : DESTINATIONS.map((item) => item.id))
    .map((id) => getDestination(id))
    .filter(Boolean)
    .sort((a, b) => (ORDER.get(a.id) ?? 0) - (ORDER.get(b.id) ?? 0));

  return (
    <div className="destinations">
      <ExpediaBrandBar />

      <div className="destinations__intro">
        <p className="destinations__eyebrow">Future Family Memories</p>
        <h2>
          Where will your
          <br />
          family go next?
        </h2>
        <p className="destinations__lede">
          Find things to do, places to eat,
          <br />
          and moments to share.
        </p>
      </div>

      <div className="destinations__grid">
        {destinations.map((destination, index) => (
          <button
            key={destination.id}
            type="button"
            className="destination-card"
            onClick={() => onSelect(destination.id)}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span
              className={`destination-card__image destination-card__image--${destination.id}`}
              style={{ backgroundImage: `url(${destination.image})` }}
            />
            <span className="destination-card__veil" />
            <span className="destination-card__label">{destination.shortTitle}</span>
          </button>
        ))}
      </div>

      <footer className="destinations__footer">
        <p>Tap a destination to begin</p>
      </footer>
    </div>
  );
}
