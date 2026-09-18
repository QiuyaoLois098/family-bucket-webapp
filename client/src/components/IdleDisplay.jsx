import { DESTINATIONS } from "@shared/destinations.js";

const CYCLE_SECONDS = 42;
const SLOT_SECONDS = CYCLE_SECONDS / DESTINATIONS.length;

export default function IdleDisplay() {
  const first = DESTINATIONS[0];

  return (
    <div className="idle-display">
      <img className="idle-display__base" src={first.image} alt="" decoding="async" fetchPriority="high" />
      {DESTINATIONS.map((destination, index) => (
        <img
          key={destination.id}
          className="idle-display__slide"
          src={destination.image}
          alt=""
          decoding="async"
          fetchPriority={index === 0 ? "high" : "low"}
          style={{ animationDelay: `${-index * SLOT_SECONDS}s` }}
        />
      ))}
      <div className="idle-display__wash" />
      <div className="idle-display__copy">
        <p className="eyebrow">The Family Bucket List</p>
        <h1>Where will your family go next?</h1>
      </div>
    </div>
  );
}
