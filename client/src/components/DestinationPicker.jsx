import { DESTINATIONS, getDestination } from "@shared/destinations.js";

export default function DestinationPicker({ onSelect, offeredIds }) {
  const destinations = (offeredIds?.length ? offeredIds : DESTINATIONS.map((item) => item.id))
    .map((id) => getDestination(id))
    .filter(Boolean);

  return (
    <div className="destinations">
      <header className="destinations__header">
        <h2>Where will you go?</h2>
        <p className="destinations__hint">Tap a destination to begin</p>
      </header>
      <div className={`destinations__grid destinations__grid--${destinations.length}`}>
        {destinations.map((destination, index) => (
          <button
            key={destination.id}
            type="button"
            className="destination-card"
            onClick={() => onSelect(destination.id)}
          >
            <span
              className="destination-card__frame"
              style={{ animationDelay: `${index * 0.09}s` }}
            >
              <span
                className="destination-card__image"
                style={{ backgroundImage: `url(${destination.image})` }}
              />
            </span>
            <span className="destination-card__copy">
              <strong>{destination.title}</strong>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
