/**
 * Frozen shared chat pacing from Expedia Animation Handoff v72.
 * Source: _motion-reference/.../demo/integrated-flow/chat-pacing.js
 */
export const chatPacing = Object.freeze({
  bubbleEntranceMs: 500,
  readingMs: 3500,
  thinkingGapMs: 600,
  thinkingFadeMs: 250,
  thinkingExitMs: 200,
  /** Conversation typing step (handoff TYPE_STEP). */
  typeCharMs: 32,
  /** Hold after option select before reply bridge. */
  selectHoldMs: 650,
  /** Stagger between option cards after typing finishes. */
  cardStaggerMs: 550,
  /** Delay from typing complete to first card / hint. */
  afterTypePauseMs: 400,
  /** Scene swap fade before painting reply bridge. */
  sceneExitMs: 180,
  /** Hotel / stay card entrance used for Thinking gap on intro. */
  stayEntranceMs: 800,
  /** Portal destination select hold before advancing. */
  portalSelectHoldMs: 700,
});

export default chatPacing;
