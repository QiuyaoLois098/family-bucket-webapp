import { useEffect, useState } from "react";
import { getDestination } from "@shared/destinations.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

const DEFAULT_DATES = "Jun 15 – 20";
const FADE_MS = 650;
const STAGGER_MS = 750;
const HOLD_MS = 2000;
const THINKING_HOLD_MS = 1000;

const LODGE_BY_DESTINATION = {
  "san-diego": "Pacific Crest Family Lodge",
  "south-lake-tahoe": "Sierra Shore Family Lodge",
  asheville: "Blue Ridge Family Lodge",
  "new-braunfels": "Hill Country Family Lodge",
  sedona: "Red Rock Family Lodge",
  orlando: "Sunshine Family Lodge",
};

/**
 * Post-destination chat beat:
 * bubble fades in → card fades in → after 2s Thinking… → 1s later question 1.
 */
export default function BriefingStep({ destinationId, onContinue }) {
  const [showBubble, setShowBubble] = useState(false);
  const [showStay, setShowStay] = useState(false);
  const [thinking, setThinking] = useState(false);

  const destination = getDestination(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;
  const shortTitle = destination?.shortTitle || tripPlace;
  const lodgeName = LODGE_BY_DESTINATION[destinationId] || "Family Lodge";
  const thumb = destination?.image;

  useEffect(() => {
    const thinkingAt = 40 + STAGGER_MS + FADE_MS + HOLD_MS;
    const bubbleTimer = setTimeout(() => setShowBubble(true), 40);
    const stayTimer = setTimeout(() => setShowStay(true), 40 + STAGGER_MS);
    const thinkingTimer = setTimeout(() => setThinking(true), thinkingAt);
    const continueTimer = setTimeout(
      () => onContinue?.(),
      thinkingAt + THINKING_HOLD_MS,
    );

    return () => {
      clearTimeout(bubbleTimer);
      clearTimeout(stayTimer);
      clearTimeout(thinkingTimer);
      clearTimeout(continueTimer);
    };
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
        className="briefing__dialogue"
        style={{ "--briefing-fade-ms": `${FADE_MS}ms` }}
      >
        <div className={`briefing__bubble${showBubble ? " is-visible" : ""}`}>
          We&apos;re heading to {tripPlace} from April 6–11. Our flights from
          Seattle to Reno are booked, and we&apos;re staying here.
        </div>

        <div className={`briefing__stay${showStay ? " is-visible" : ""}`}>
          <div
            className="briefing__stay-thumb"
            style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
            role="img"
            aria-hidden="true"
          />
          <div className="briefing__stay-copy">
            <p className="briefing__stay-name">{lodgeName}</p>
            <p className="briefing__stay-meta">
              {shortTitle} · April 6–11 · Confirmed
            </p>
            <span className="briefing__stay-badge">Booked · Expedia</span>
          </div>
        </div>

        {thinking ? <p className="briefing__thinking">Thinking...</p> : null}
      </div>
    </div>
  );
}
