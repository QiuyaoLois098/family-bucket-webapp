import { useLayoutEffect, useState } from "react";

/**
 * When enabled, keep only the newest messages that fit in the feed (no scroll).
 * Older messages are dropped from the rendered list as overflow appears.
 */
export default function useTailFitMessages(messages, feedRef, enabled) {
  const list = messages ?? [];
  const [startIndex, setStartIndex] = useState(0);

  useLayoutEffect(() => {
    if (!enabled) {
      setStartIndex(0);
      return;
    }
    // New message arrived — remeasure from full list next paint.
    setStartIndex(0);
  }, [list.length, enabled]);

  useLayoutEffect(() => {
    if (!enabled) return;
    const feed = feedRef.current;
    if (!feed) return;

    const rows = [...feed.querySelectorAll("[data-tail-fit-row]")];
    if (rows.length <= 1) return;
    if (feed.scrollHeight <= feed.clientHeight + 2) return;

    const gap =
      parseFloat(getComputedStyle(feed).rowGap || getComputedStyle(feed).gap) || 0;
    const maxH = feed.clientHeight;
    let used = 0;
    let keep = 0;
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const add = rows[i].offsetHeight + (keep > 0 ? gap : 0);
      if (keep > 0 && used + add > maxH) break;
      used += add;
      keep += 1;
    }
    // rows map to list.slice(startIndex); convert keep → absolute start.
    const absoluteStart = list.length - keep;
    if (absoluteStart > startIndex) {
      setStartIndex(absoluteStart);
    }
  }, [list, enabled, startIndex, feedRef]);

  return enabled ? list.slice(Math.max(0, startIndex)) : list;
}
