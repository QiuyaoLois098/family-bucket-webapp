import { DESTINATIONS, getDestination } from "@shared/destinations.js";

export default function DestinationPicker({ onSelect, offeredIds }) {
  const destinations = (offeredIds?.length ? offeredIds : DESTINATIONS.map((item) => item.id))
    .map((id) => getDestination(id))
    .filter(Boolean);

  return (
    <div className="destinations">
      <header className="destinations__header">
        <p className="eyebrow">Choose an experience</p>
        <h2>Where will you go?</h2>
      </header>
      <div className={`destinations__grid destinations__grid--${destinations.length}`}>
        {destinations.map((destination) => (
          <button
            key={destination.id}
            type="button"
            className="destination-card"
            onClick={() => onSelect(destination.id)}
          >
            <span
              className="destination-card__image"
              style={{ backgroundImage: `url(${destination.image})` }}
            />
            <span className="destination-card__veil" />
            <span className="destination-card__copy">
              <small>{destination.location}</small>
              <strong>{destination.title}</strong>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
