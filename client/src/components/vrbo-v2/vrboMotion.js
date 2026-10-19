/**
 * Frozen motion constants from VRBO-Motion-Developer-Handoff-2026-10-16
 * (MOTION-PRESERVATION.md / mobile/motion.js / header-motion.js / flow.js).
 */
export const vrboMotion = Object.freeze({
  softEase: "cubic-bezier(0.22, 1, 0.36, 1)",
  materialEase: "cubic-bezier(0.4, 0, 0.2, 1)",
  capsuleEase: "cubic-bezier(0.42, 0, 0.28, 1)",

  /** Phone preset bubble enter (motion.message). */
  bubbleRowOpacityMs: 220,
  bubbleRasterMs: 400,
  bubbleOffsetPx: 12,
  bubbleScaleFrom: 0.96,

  /** Large-screen springEnter / arrive. */
  springSettleMs: 600,
  springOffsetPx: 56,
  springScaleFrom: 0.9,
  avatarFadeMs: 120,
  textEnterMs: 70,
  textEnterDelayMs: 50,

  /** Waiting → joined header. */
  memberStaggerMs: 40,
  waitingFadeMs: 160,
  capsuleMs: 440,
  capsuleDelayMs: 120,
  avatarRevealMs: 400,
  nameFadeMs: 240,
  nameDelayMs: 180,
  metaCrossfadeMs: 280,

  /** Preference stage stagger (enterPhase 2). */
  prefHeadingDelayMs: 450,
  prefHeadingMs: 650,
  prefCardBaseDelayMs: 540,
  prefCardRowMs: 120,
  prefCardColMs: 45,
  prefCardMs: 680,
  prefCountDelayMs: 1000,
  prefComposerDelayMs: 1120,

  /** Reply sequencing. */
  typingWaitBaseMs: 1000,
  typingWaitStepMs: 100,
  breathMs: 450,
  confirmTypingMs: 650,
  confirmStaggerMs: 320,
  cardConfirmWaitMs: 700,

  /** Pickup hop (connected.js). */
  pickupHopMs: 800,
  pickupCycleMs: 4000,
  pickupFirstDelayMs: 3250,
  pickupLiftPx: 4,
  pickupNudgePx: 1.1,

  /** Large-screen opening (flow.js enter / openingHeadline). */
  openingLogoDelayMs: 100,
  openingLogoMs: 1000,
  openingLogoOffsetPx: 17,
  openingTitleDelayMs: 500,
  openingTitleMs: 1000,
  openingStatusDelayMs: 700,
  openingStatusMs: 1000,
  openingHeadlineDelayMs: 700,
  openingHeadlineMs: 1200,
  openingHeadlineOffsetPx: 20.2,
  openingHeadlineLoopMs: 6000,
  openingHeadlineHoldMs: 4080,
  openingHeadlineOutMs: 600,
  openingHeadlineGapMs: 60,
  openingHeadlineInMs: 1200,
  openingHeadlineNudgePx: 6,

  /** Search / results. */
  searchLoadingMs: 2200,
  resultStaggerMs: 180,
  resultEnterMs: 750,
  shareEnableAfterMs: 1800,
});

/**
 * First socket sync seeds ids (no animation). Later new ids get one CSS enter.
 * Does NOT animate position of existing bubbles — that was the jank source.
 */
export function createEnterTracker() {
  let seeded = false;
  const seen = new Set();

  return {
    prepare(ids) {
      if (seeded) return;
      ids.forEach((id) => seen.add(id));
      seeded = true;
    },
    shouldEnter(id) {
      if (!seeded) {
        seen.add(id);
        return false;
      }
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    },
  };
}

export default vrboMotion;
