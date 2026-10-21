/**
 * Complete-word batches from Expedia-text-1020 / word-batch-motion.js.
 * Opacity only — never changes final layout.
 */

export const WORD_BATCH = Object.freeze({
  start: 0.04,
  step: 0.16,
  fade: 0.36,
  tail: 0.24,
  /** Designer blueTypingScale — word clock runs slightly faster than wall time. */
  typingScale: 0.9,
});

export function splitWords(text) {
  return String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function planWordBatches(tokens = []) {
  const { start, step } = WORD_BATCH;
  const batches = [];
  let begin = 0;
  let at = start;
  while (begin < tokens.length) {
    let end = Math.min(tokens.length, begin + 2);
    if (/[.!?]$/.test(tokens[begin] || "")) end = begin + 1;
    batches.push({ begin, end, at });
    at += step + (/[.!?]$/.test(tokens[end - 1] || "") ? 0.04 : 0);
    begin = end;
  }
  return batches;
}

export function batchDurationSec(batches) {
  const { start, fade, tail } = WORD_BATCH;
  return (batches.at(-1)?.at ?? start) + fade + tail;
}

export function wordBatchDurationSec(text) {
  const tokens = splitWords(text);
  return batchDurationSec(planWordBatches(tokens));
}

/** Wall-clock ms until the last word fade + tail finishes. */
export function wordBatchDurationMs(text, scale = WORD_BATCH.typingScale) {
  if (!String(text ?? "").trim()) return 0;
  return Math.round(wordBatchDurationSec(text) * scale * 1000);
}

export function smoothstep(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

export function batchOpacity(age, at, reduced = false) {
  if (reduced) return 1;
  return smoothstep((age - at) / WORD_BATCH.fade);
}

/** Monotone hermite height between successive line sizes (sample.js bubbleHeight). */
export function interpolateGrowth(t, growthTimes, lineHeights, spans, slopes) {
  if (!growthTimes.length) return lineHeights[0] || 0;
  if (t <= growthTimes[0]) return lineHeights[0];
  if (t >= growthTimes.at(-1)) return lineHeights.at(-1);
  const i = growthTimes.findIndex((end, index) => index > 0 && t < end) - 1;
  if (i < 0) return lineHeights[0];
  const span = spans[i];
  const u = span ? (t - growthTimes[i]) / span : 1;
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    (2 * u3 - 3 * u2 + 1) * lineHeights[i] +
    (u3 - 2 * u2 + u) * span * (slopes[i] || 0) +
    (-2 * u3 + 3 * u2) * lineHeights[i + 1] +
    (u3 - u2) * span * (slopes[i + 1] || 0)
  );
}

export function planBubbleGrowth(lineStarts, lineHeights) {
  const growthTimes = [0];
  for (let i = 1; i < lineStarts.length; i += 1) {
    growthTimes.push(Math.max(growthTimes[i - 1] + 0.08, lineStarts[i] + 0.14));
  }
  const spans = growthTimes.slice(1).map((end, i) => end - growthTimes[i]);
  const secants = spans.map((span, i) =>
    span ? (lineHeights[i + 1] - lineHeights[i]) / span : 0,
  );
  const slopes = lineHeights.map((_, i) => {
    if (i === 0 || i === lineHeights.length - 1) return 0;
    const left = spans[i - 1];
    const right = spans[i];
    const prev = secants[i - 1];
    const next = secants[i];
    if (!left || !right || !prev || !next) return 0;
    const a = 2 * right + left;
    const b = right + 2 * left;
    return (a + b) / (a / prev + b / next);
  });
  return { growthTimes, spans, slopes };
}
