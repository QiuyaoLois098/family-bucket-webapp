import { getDestination } from "@shared/destinations.js";
import { getDestinationScript } from "@shared/scripts/index.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const DEFAULT_MEMORY_CARD = {
  headline: "Your next family memory awaits",
  eyebrow: "Your personalized family itinerary",
  duration: "5 days",
  footer: "Created with Activity Planner",
};

/**
 * Control (left) during building — memory card from destination script.
 */
export default function BuildingMemoryStep({ destinationId }) {
  const destination = getDestination(destinationId);
  const script = getDestinationScript(destinationId);
  const card = {
    ...DEFAULT_MEMORY_CARD,
    title: destination?.tripLabel || destination?.shortTitle || "Your trip",
    image: destination?.heroImage || destination?.image,
    ...script?.memoryCard,
  };

  return (
    <div className="memory-card-screen">
      <ExpediaBrandBar />

      <h1 className="memory-card-screen__headline">{card.headline}</h1>

      <article
        className="memory-card"
        style={card.image ? { backgroundImage: `url(${card.image})` } : undefined}
      >
        <div className="memory-card__veil" aria-hidden="true" />
        <div className="memory-card__top">
          <p className="memory-card__eyebrow">{card.eyebrow}</p>
          <h2 className="memory-card__title">{card.title}</h2>
          {card.duration ? (
            <span className="memory-card__duration">{card.duration}</span>
          ) : null}
        </div>
        <p className="memory-card__footer">{card.footer}</p>
      </article>
    </div>
  );
}
