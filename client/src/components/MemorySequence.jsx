import { useEffect, useState } from "react";
import { getDestination } from "@shared/destinations.js";

export default function MemorySequence({ itinerary, destinationId, heroUrl, slideMs = 7000 }) {
  const destination = getDestination(destinationId);
  const moments = itinerary?.moments || [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [itinerary, destinationId]);

  useEffect(() => {
    if (moments.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % moments.length);
    }, slideMs);
    return () => window.clearInterval(timer);
  }, [moments.length, slideMs]);

  if (!destination || !moments.length) return null;

  return (
    <div className="memory-sequence">
      {moments.map((moment, momentIndex) => {
        const isHero = momentIndex === 0;
        const image = isHero
          ? heroUrl || destination.gallery[0] || destination.image
          : destination.gallery[momentIndex % destination.gallery.length] || destination.image;
        const crop = destination.crops[momentIndex % destination.crops.length];
        const active = momentIndex === index;
        const number = String(momentIndex + 1).padStart(2, "0");
        return (
          <figure
            key={`${moment.title}-${momentIndex}`}
            className={`memory-slide ${active ? "is-active" : ""}`}
          >
            <div
              className="memory-slide__image"
              style={{
                backgroundImage: `url(${image})`,
                backgroundPosition: crop,
              }}
            />
            <div className="memory-slide__veil" />
            <figcaption>
              <span>{number}</span>
              <small>{moment.time}</small>
              <h2>{moment.title}</h2>
              <p>{moment.description}</p>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
