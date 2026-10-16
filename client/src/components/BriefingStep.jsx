import { useEffect, useState } from "react";
import { getDestination } from "@shared/destinations.js";
import { getDestinationScript } from "@shared/scripts/index.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const DEFAULT_DATES = "Apr 6 – 11";
const FADE_MS = 650;
const STAGGER_MS = 750;
const THINKING_HOLD_MS = 2000;

/**
 * bubble → stay → Thinking… (right after card) → fade out → question 1.
 */
export default function BriefingStep({ destinationId, onContinue }) {
  const [showBubble, setShowBubble] = useState(false);
  const [showStay, setShowStay] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [exiting, setExiting] = useState(false);

  const destination = getDestination(destinationId);
  const script = getDestinationScript(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;
  const thumb = destination?.image || destination?.heroImage;

  const intro =
    script?.intro ||
    `We're heading to ${tripPlace} from April 6–11. Our flights are booked, and we're staying here.`;
  const introChip = script?.introChip || {
    title: "Family Lodge",
    subtitle: `${destination?.shortTitle || tripPlace} · April 6–11 · Confirmed`,
    chipText: "Booked · Expedia",
  };

  useEffect(() => {
    const stayAt = 40 + STAGGER_MS;
    const thinkingAt = stayAt + FADE_MS;
    const exitAt = thinkingAt + THINKING_HOLD_MS;
    const timers = [
      setTimeout(() => setShowBubble(true), 40),
      setTimeout(() => setShowStay(true), stayAt),
      setTimeout(() => setThinking(true), thinkingAt),
      setTimeout(() => setExiting(true), exitAt),
      setTimeout(() => onContinue?.(), exitAt + FADE_MS),
    ];

    return () => timers.forEach(clearTimeout);
  }, [destinationId, onContinue]);

  return (
    <div className="question question--planner briefing">
      <ExpediaBrandBar />

      <div className="question__trip">
        <p className="question__trip-line">
          {tripPlace} · {tripDates}
        </p>
        <p className="question__follow-up">Follow up</p>
      </div>

      <div
        className={`briefing__dialogue${exiting ? " is-exiting" : ""}`}
        style={{ "--briefing-fade-ms": `${FADE_MS}ms` }}
      >
        <div
          className={`briefing__bubble${showBubble && !exiting ? " is-visible" : ""}`}
        >
          {intro}
        </div>

        <div className={`briefing__stay${showStay && !exiting ? " is-visible" : ""}`}>
          <div
            className="briefing__stay-thumb"
            style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
            role="img"
            aria-hidden="true"
          />
          <div className="briefing__stay-copy">
            <p className="briefing__stay-name">{introChip.title}</p>
            <p className="briefing__stay-meta">{introChip.subtitle}</p>
            <span className="briefing__stay-badge">{introChip.chipText}</span>
          </div>
        </div>

        {thinking ? (
          <p className={`briefing__thinking${!exiting ? " is-visible" : ""}`}>
            Thinking
            <span className="briefing__dots" aria-hidden="true">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
