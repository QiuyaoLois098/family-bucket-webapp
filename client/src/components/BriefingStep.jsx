import { useEffect, useState } from "react";
import { getDestination } from "@shared/destinations.js";
import { getDestinationScript } from "@shared/scripts/index.js";
import { chatPacing } from "../motion/chatPacing.js";
import { wordBatchDurationMs } from "../motion/wordBatch.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";
import GrowingBubble from "./GrowingBubble.jsx";

const DEFAULT_DATES = "Apr 6 – 11";
const {
  bubbleEntranceMs,
  readingMs,
  thinkingGapMs,
  thinkingFadeMs,
  thinkingExitMs,
  thinkingVisibleMs,
  stayEntranceMs,
  pageExitMs,
} = chatPacing;

/**
 * Blue bubble (word-batch + grow) → hotel after the message finishes →
 * Thinking 1.5s including fades → page fade. Timings from Expedia-text-1020.
 */
export default function BriefingStep({ destinationId, onContinue }) {
  const [showBubble, setShowBubble] = useState(false);
  const [showStay, setShowStay] = useState(false);
  const [thinking, setThinking] = useState("hidden");
  const [exiting, setExiting] = useState(false);

  const destination = getDestination(destinationId);
  const script = getDestinationScript(destinationId);
  const tripPlace = destination?.tripLabel || destination?.shortTitle || "your trip";
  const tripDates = destination?.dates || DEFAULT_DATES;
  const tripTitle = script?.tripTitle || `${tripPlace} · ${tripDates}`;
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
    const blueMs = wordBatchDurationMs(intro);
    const stayAt = bubbleAt + blueMs;
    const thinkingAt = stayAt + stayEntranceMs + thinkingGapMs;
    const thinkingLeaveAt = thinkingAt + thinkingVisibleMs - thinkingExitMs;
    const thinkingEnd = thinkingAt + thinkingVisibleMs;
    const exitAt = Math.max(bubbleAt + blueMs + readingMs, thinkingEnd);

    const timers = [
      setTimeout(() => setShowBubble(true), bubbleAt),
      setTimeout(() => setShowStay(true), stayAt),
      setTimeout(() => setThinking("on"), thinkingAt),
      setTimeout(() => setThinking("leaving"), thinkingLeaveAt),
      setTimeout(() => setExiting(true), exitAt),
      setTimeout(() => onContinue?.(), exitAt + pageExitMs),
    ];

    return () => timers.forEach(clearTimeout);
  }, [destinationId, intro, onContinue]);

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
          "--stay-fade-ms": `${stayEntranceMs}ms`,
          "--thinking-fade-ms": `${thinkingFadeMs}ms`,
          "--thinking-exit-ms": `${pageExitMs}ms`,
        }}
      >
        <GrowingBubble text={intro} visible={showBubble} />

        <article
          className={`question__place-card briefing__stay${showStay && !exiting ? " is-visible" : ""}`}
        >
          <div
            className="question__place-thumb"
            style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
            role="img"
            aria-hidden="true"
          />
          <div className="question__place-copy">
            <p className="question__place-title">{introChip.title}</p>
            <p className="question__place-meta">{introChip.subtitle}</p>
            {introChip.chipText ? (
              <span
                className={`question__place-badge${
                  String(introChip.chipText).toLowerCase().includes("expedia")
                    ? " question__place-badge--bookable"
                    : ""
                }`}
              >
                {introChip.chipText}
              </span>
            ) : null}
          </div>
        </article>

        {thinking !== "hidden" ? (
          <p
            className={`briefing__thinking${thinking === "on" && !exiting ? " is-visible" : ""}`}
          >
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
