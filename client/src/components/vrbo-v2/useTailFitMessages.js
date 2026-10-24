import { useLayoutEffect, useState } from "react";

/**
 * When enabled, keep the newest messages that fully fit in the feed (stacked
 * history). Older messages are removed from the DOM entirely — never partially
 * clipped — so no bubble edge / gray sliver peeks under overflow:hidden.
 */
export default function useTailFitMessages(messages, feedRef, enabled) {
  const list = messages ?? [];
  const [startIndex, setStartIndex] = useState(0);

  useLayoutEffect(() => {
    if (!enabled) setStartIndex(0);
  }, [enabled]);

  useLayoutEffect(() => {
    if (!enabled) return;
    const feed = feedRef.current;
    if (!feed) return;
    // Feed not sized yet — don't collapse the stack to a single row.
    if (feed.clientHeight < 32) return;

    const rows = [...feed.querySelectorAll("[data-tail-fit-row]")];
    if (rows.length <= 1) return;
    if (feed.scrollHeight <= feed.clientHeight) return;

    const gap =
      parseFloat(getComputedStyle(feed).rowGap || getComputedStyle(feed).gap) || 0;
    const maxH = feed.clientHeight;

    let used = 0;
    let keep = 0;
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const add = rows[i].offsetHeight + (keep > 0 ? gap : 0);
      // If this older row would not fully fit, drop it (and everything older).
      if (keep > 0 && used + add > maxH) break;
      used += add;
      keep += 1;
    }

    const absoluteStart = Math.max(0, list.length - Math.max(1, keep));
    if (absoluteStart > startIndex) {
      setStartIndex(absoluteStart);
      return;
    }

    // Still overflowing after the pass (subpixel / flex-end) → drop one more
    // oldest so nothing is left half-visible.
    if (startIndex < list.length - 1) {
      setStartIndex(startIndex + 1);
    }
  }, [list, enabled, startIndex, feedRef]);

  return enabled ? list.slice(Math.max(0, startIndex)) : list;
}
