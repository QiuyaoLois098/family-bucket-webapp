import { useEffect, useState } from "react";
import { getDestination } from "@shared/destinations.js";
import { getDestinationScript } from "@shared/scripts/index.js";
import { chatPacing } from "../motion/chatPacing.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const DEFAULT_DATES = "Apr 6 – 11";
const {
  bubbleEntranceMs,
  readingMs,
  thinkingGapMs,
  thinkingFadeMs,
  thinkingExitMs,
  stayEntranceMs,
} = chatPacing;

/**
 * bubble → stay → Thinking (gap after hotel entrance) → fade out → question 1.
 * Timings from handoff v72 chat pacing.
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
  const tripTitle =
    script?.tripTitle || `${tripPlace} · ${tripDates}`;
  const thumb =
    script?.introChip?.image || destination?.image || destination?.heroImage;

  const intro =
    script?.intro ||
    `We're heading to ${tripPlace} from April 6–11. Our flights are booked, and we're staying here.`;
  const introChip = script?.introChip || {
    title: "Family Lodge",
    subtitle: `${destination?.shortTitle || tripPlace} · April 6–11 · Confirmed`,
    chipText: "Booked · Expedia",
  };

  useEffect(() => {
    const bubbleAt = 150;
    const stayAt = 650;
    // Thinking gap starts after the later hotel-card entrance completes.
    const thinkingAt = stayAt + stayEntranceMs + thinkingGapMs;
    const exitAt = thinkingAt + thinkingFadeMs + readingMs;
    const timers = [
      setTimeout(() => setShowBubble(true), bubbleAt),
      setTimeout(() => setShowStay(true), stayAt),
      setTimeout(() => setThinking(true), thinkingAt),
      setTimeout(() => setExiting(true), exitAt),
      setTimeout(() => onContinue?.(), exitAt + thinkingExitMs),
    ];

    return () => timers.forEach(clearTimeout);
  }, [destinationId, onContinue]);

  return (
    <div className="question question--planner briefing">
      <ExpediaBrandBar />

      <div className="question__trip">
        <p className="question__trip-line">{tripTitle}</p>
        <p className="question__follow-up">Follow up</p>
      </div>

      <div
        className={`briefing__dialogue${exiting ? " is-exiting" : ""}`}
        style={{
          "--briefing-fade-ms": `${bubbleEntranceMs}ms`,
          "--thinking-fade-ms": `${thinkingFadeMs}ms`,
          "--thinking-exit-ms": `${thinkingExitMs}ms`,
        }}
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
