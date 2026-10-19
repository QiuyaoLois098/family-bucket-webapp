import { useEffect, useState } from "react";
import { DESTINATIONS } from "@shared/destinations.js";

/** Portal right cycle (handoff): 3s hold between destination crossfades. */
const HOLD_MS = 3000;

function heroSrc(destination) {
  return destination.heroImage || destination.image;
}

export default function IdleDisplay() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (DESTINATIONS.length < 2) return undefined;
    const id = window.setInterval(() => {
      setActive((index) => (index + 1) % DESTINATIONS.length);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="idle-display">
      {DESTINATIONS.map((destination, index) => (
        <img
          key={destination.id}
          className={`idle-display__slide${index === active ? " is-active" : ""}`}
          src={heroSrc(destination)}
          alt=""
          decoding="async"
          fetchPriority={index === 0 ? "high" : "low"}
        />
      ))}
      <div className="idle-display__wash" />
      <div className="idle-display__copy">
        {DESTINATIONS.map((destination, index) => (
          <div
            key={destination.id}
            className={`idle-display__caption${index === active ? " is-active" : ""}`}
          >
            <h1>{destination.tripLabel || destination.shortTitle}</h1>
            <p className="idle-display__status">A moment made for all of you</p>
          </div>
        ))}
      </div>
    </div>
  );
}
