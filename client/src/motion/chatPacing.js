/**
 * Shared Expedia Q&A pacing.
 * Blue bubble + thinking: Expedia-text-1020 (sample.js / word-batch-motion.js).
 * White text + cards: same study — whole-message fade, no typing.
 */
export const chatPacing = Object.freeze({
  /** Blue bubble pop (opacity + 24@2160 slide). */
  bubbleEntranceMs: 500,
  /** Hold after the blue message finishes before the page can leave. */
  readingMs: 3500,
  thinkingGapMs: 600,
  thinkingFadeMs: 250,
  thinkingExitMs: 200,
  /** Visible interval including fade-in and fade-out. */
  thinkingVisibleMs: 1500,
  /** Legacy per-char step (prefer chunk typing below). */
  typeCharMs: 32,
  /** Claude-style burst typing — VRBO ranking only. Expedia Q&A no longer types. */
  typeChunkMs: 55,
  typeChunkJitterMs: 18,
  selectHoldMs: 650,
  /** Stagger between option cards after the first. */
  cardStaggerMs: 550,
  /** Delay from completed white text to first option card. */
  afterTypePauseMs: 400,
  firstCardDelayMs: 400,
  secondCardDelayMs: 950,
  cardEntranceMs: 900,
  /** AI / prompt + hint fade as one block. */
  aiBlockFadeMs: 400,
  /** Question → reply-bridge swap. */
  sceneExitMs: 180,
  /** First-page outgoing fade. */
  pageExitMs: 500,
  stayEntranceMs: 800,
  portalSelectHoldMs: 700,
});

export default chatPacing;
