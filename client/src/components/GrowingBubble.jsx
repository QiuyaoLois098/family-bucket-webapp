import { useLayoutEffect, useMemo, useRef } from "react";
import {
  WORD_BATCH,
  batchOpacity,
  interpolateGrowth,
  planBubbleGrowth,
  planWordBatches,
  splitWords,
  wordBatchDurationMs,
} from "../motion/wordBatch.js";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

function measureLines(inner) {
  const nodes = [...inner.querySelectorAll("[data-word]")];
  const lines = [];
  for (const el of nodes) {
    const top = Math.round(el.offsetTop);
    let line = lines.find((item) => Math.abs(item.top - top) < 4);
    if (!line) {
      line = { top, bottom: top + el.offsetHeight, indices: [] };
      lines.push(line);
    }
    line.bottom = Math.max(line.bottom, top + el.offsetHeight);
    line.indices.push(Number(el.dataset.word));
  }
  return lines;
}

/**
 * Blue user bubble: pop + continuous height growth while complete-word
 * batches fade in. Layout is final from the first frame (opacity only).
 */
export default function GrowingBubble({
  text,
  visible,
  instant = false,
  onComplete,
  className = "briefing__bubble",
}) {
  const bubbleRef = useRef(null);
  const innerRef = useRef(null);
  const doneForRef = useRef("");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const tokens = useMemo(() => splitWords(text), [text]);
  const batches = useMemo(() => planWordBatches(tokens), [tokens]);

  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    const inner = innerRef.current;
    if (!bubble || !inner) return undefined;

    const paintDone = () => {
      bubble.style.height = "";
      bubble.classList.remove("is-growing");
      inner.querySelectorAll("[data-word]").forEach((el) => {
        el.style.opacity = "1";
      });
    };

    const finish = (reduced) => {
      doneForRef.current = text;
      paintDone();
      onCompleteRef.current?.(reduced ? 0 : wordBatchDurationMs(text));
    };

    if (!visible) {
      doneForRef.current = "";
      return undefined;
    }

    if (instant || prefersReducedMotion() || tokens.length === 0) {
      finish(true);
      return undefined;
    }

    if (doneForRef.current === text) {
      paintDone();
      return undefined;
    }

    const lines = measureLines(inner);
    const fullHeight = bubble.offsetHeight;
    const padTop = parseFloat(getComputedStyle(bubble).paddingTop) || 0;
    const padBottom = parseFloat(getComputedStyle(bubble).paddingBottom) || 0;
    const firstContent = lines[0] ? lines[0].bottom - lines[0].top : fullHeight;
    const minFirst = padTop + firstContent + padBottom;

    const lineHeights = lines.map((line, i) => {
      if (i === lines.length - 1) return fullHeight;
      return Math.max(minFirst, padTop + (line.bottom - lines[0].top) + padBottom);
    });

    const lineStarts = lines.map((line) => {
      const hits = batches.filter((batch) =>
        line.indices.some((index) => index >= batch.begin && index < batch.end),
      );
      const firstAt = hits.length ? Math.min(...hits.map((batch) => batch.at)) : 0;
      return firstAt * WORD_BATCH.typingScale;
    });

    const { growthTimes, spans, slopes } = planBubbleGrowth(
      lineStarts.length ? lineStarts : [0],
      lineHeights.length ? lineHeights : [fullHeight],
    );

    const grow = lines.length > 1;
    if (grow) {
      bubble.classList.add("is-growing");
      bubble.style.height = `${lineHeights[0]}px`;
    }

    inner.querySelectorAll("[data-word]").forEach((el) => {
      el.style.opacity = "0";
    });

    const duration = wordBatchDurationMs(text) / 1000;
    const start = performance.now();
    let raf = 0;

    let cancelled = false;
    const frame = (now) => {
      if (cancelled) return;
      const t = (now - start) / 1000;
      const age = t / WORD_BATCH.typingScale;

      inner.querySelectorAll("[data-word]").forEach((el) => {
        const index = Number(el.dataset.word);
        const batch = batches.find((item) => index >= item.begin && index < item.end);
        el.style.opacity = String(batchOpacity(age, batch?.at ?? 0));
      });

      if (grow) {
        bubble.style.height = `${interpolateGrowth(
          t,
          growthTimes,
          lineHeights,
          spans,
          slopes,
        )}px`;
      }

      if (t >= duration) {
        finish(false);
        return;
      }
      raf = window.requestAnimationFrame(frame);
    };

    raf = window.requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [visible, instant, text, tokens, batches]);

  return (
    <div
      ref={bubbleRef}
      className={`${className}${visible ? " is-visible" : ""}`}
    >
      <div ref={innerRef} className="briefing__bubble-inner">
        {tokens.map((word, index) => (
          <span key={`${word}-${index}`} data-word={index} className="briefing__word">
            {word}
            {index < tokens.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
