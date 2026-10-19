/**
 * Claude-style streaming: words/phrases appear in short bursts, not char-by-char.
 */

/** Deterministic burst sizes so demos replay the same way. */
const BURST_PATTERN = [2, 3, 1, 4, 2, 3, 2, 1, 3, 2];

/**
 * Split plain text into phrase chunks (punctuation tends to end a burst).
 * @param {string} text
 * @returns {string[]}
 */
export function splitTypingChunks(text) {
  const full = String(text ?? "");
  if (!full) return [];

  const tokens = full.match(/\S+\s*/g);
  if (!tokens?.length) return [full];

  const chunks = [];
  let i = 0;
  let patternIndex = 0;

  while (i < tokens.length) {
    let take = BURST_PATTERN[patternIndex % BURST_PATTERN.length];
    patternIndex += 1;

    // Short tokens (—, ·, etc.) ride with the next word.
    while (take < tokens.length - i && /^\S{1,2}\s*$/.test(tokens[i + take - 1] || "")) {
      take += 1;
    }

    let end = Math.min(i + take, tokens.length);

    // End the burst at sentence / clause punctuation when nearby.
    for (let j = i; j < end; j += 1) {
      if (/[.!?…,:;—–]\s*$/.test(tokens[j])) {
        end = j + 1;
        break;
      }
    }

    chunks.push(tokens.slice(i, end).join(""));
    i = end;
  }

  return chunks;
}

/**
 * @param {string} text
 * @param {{ chunkMs?: number, jitterMs?: number }} [opts]
 */
export function estimateChunkTypingMs(text, opts = {}) {
  const chunkMs = opts.chunkMs ?? 55;
  const jitterMs = opts.jitterMs ?? 18;
  const chunks = splitTypingChunks(text);
  if (!chunks.length) return 0;
  // Average delay ≈ chunkMs + half jitter per step (including first paint at 0).
  return Math.max(0, chunks.length - 1) * (chunkMs + jitterMs * 0.45);
}

/**
 * Run a chunk typewriter. Returns a cancel function.
 * @param {string} text
 * @param {{
 *   onUpdate: (visible: string) => void,
 *   onDone?: () => void,
 *   chunkMs?: number,
 *   jitterMs?: number,
 *   reduceMotion?: boolean,
 * }} options
 */
export function runChunkTypewriter(text, options) {
  const {
    onUpdate,
    onDone,
    chunkMs = 55,
    jitterMs = 18,
    reduceMotion = false,
  } = options;

  const full = String(text ?? "");
  const chunks = splitTypingChunks(full);

  if (!full || reduceMotion || chunks.length <= 1) {
    onUpdate(full);
    onDone?.();
    return () => {};
  }

  let index = 0;
  let visible = "";
  let timerId = null;
  let cancelled = false;

  const step = () => {
    if (cancelled) return;
    visible += chunks[index];
    index += 1;
    onUpdate(visible);

    if (index >= chunks.length) {
      onDone?.();
      return;
    }

    // Slight rhythm: longer pause after punctuation, tiny jitter otherwise.
    const justEnded = /[.!?…,;:—–]\s*$/.test(chunks[index - 1] || "");
    const delay =
      chunkMs +
      (justEnded ? jitterMs * 1.6 : 0) +
      ((index * 17) % (jitterMs + 1));
    timerId = window.setTimeout(step, delay);
  };

  // First burst immediately so the line doesn't sit empty.
  timerId = window.setTimeout(step, 0);

  return () => {
    cancelled = true;
    if (timerId != null) window.clearTimeout(timerId);
  };
}
