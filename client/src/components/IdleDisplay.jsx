import { DESTINATIONS } from "@shared/destinations.js";

export default function IdleDisplay() {
  return (
    <div className="idle-display">
      {DESTINATIONS.map((destination, index) => (
        <div
          key={destination.id}
          className="idle-display__slide"
          style={{
            backgroundImage: `url(${destination.image})`,
            animationDelay: `${index * 7}s`,
          }}
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
