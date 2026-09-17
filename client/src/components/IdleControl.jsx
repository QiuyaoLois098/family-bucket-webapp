import { DESTINATIONS } from "@shared/destinations.js";

export default function IdleControl({ onBegin }) {
  return (
    <div className="idle-control">
      <div className="idle-control__mark">A shared journey</div>
      <h1>
        The Family
        <em>Bucket List</em>
      </h1>
      <p>
        Choose a place you have always wanted to take them.
        Answer a few questions. Watch a future memory come into focus.
      </p>
      <button type="button" className="begin-button" onClick={onBegin}>
        Begin
      </button>
      <ul className="idle-control__places" aria-hidden="true">
        {DESTINATIONS.map((destination) => (
          <li key={destination.id}>{destination.shortTitle}</li>
        ))}
      </ul>
    </div>
  );
}
