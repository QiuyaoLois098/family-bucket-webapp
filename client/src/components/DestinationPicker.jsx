import { useEffect, useRef, useState } from "react";
import { DESTINATIONS, getDestination } from "@shared/destinations.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const ORDER = new Map(DESTINATIONS.map((item, index) => [item.id, index]));
const SELECT_HOLD_MS = 520;

export default function DestinationPicker({ onSelect, offeredIds }) {
  const [pendingId, setPendingId] = useState(null);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);

  const destinations = (offeredIds?.length ? offeredIds : DESTINATIONS.map((item) => item.id))
    .map((id) => getDestination(id))
    .filter(Boolean)
    .sort((a, b) => (ORDER.get(a.id) ?? 0) - (ORDER.get(b.id) ?? 0));

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleSelect = (destinationId) => {
    if (locked) return;
    setLocked(true);
    setPendingId(destinationId);
    timerRef.current = setTimeout(() => {
      onSelect(destinationId);
    }, SELECT_HOLD_MS);
  };

  return (
    <div className="destinations">
      <ExpediaBrandBar />

      <div className="destinations__intro">
        <h2>Find your family&apos;s next trip</h2>
        <p className="destinations__lede">
          Choose a destination and start making memories together.
        </p>
      </div>

      <div className="destinations__grid">
        {destinations.map((destination, index) => {
          const selected = pendingId === destination.id;
          return (
            <button
              key={destination.id}
              type="button"
              className={`destination-card${selected ? " is-selected" : ""}`}
              disabled={locked}
              onClick={() => handleSelect(destination.id)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span
                className={`destination-card__image destination-card__image--${destination.id}`}
                style={{ backgroundImage: `url(${destination.image})` }}
              />
              <span className="destination-card__veil" />
              <span className="destination-card__label">{destination.shortTitle}</span>
            </button>
          );
        })}
      </div>

      <p className="destinations__hint">Tap a destination to begin</p>
    </div>
  );
}
