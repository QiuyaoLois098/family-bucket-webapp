import { useLayoutEffect, useRef } from "react";
import { smoothstep } from "../motion/wordBatch.js";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

/** sample.js appear(t, start, duration) — smoothstep, no word masks. */
function appear(ageSec, durationSec) {
  if (durationSec <= 0) return 1;
  return smoothstep(ageSec / durationSec);
}

/**
 * White-bg black text from Expedia-text-1020: the whole block fades as one
 * unit (prompt + hint, or AI reply). Opacity only.
 */
export default function WholeBlockFade({
  visible,
  durationMs = 400,
  instant = false,
  className = "",
  as: Tag = "div",
  children,
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (!visible) {
      node.style.opacity = "0";
      return undefined;
    }

    if (instant || prefersReducedMotion()) {
      node.style.opacity = "1";
      return undefined;
    }

    node.style.opacity = "0";
    const durationSec = durationMs / 1000;
    const started = performance.now();
    let raf = 0;
    let cancelled = false;

    const frame = (now) => {
      if (cancelled) return;
      const alpha = appear((now - started) / 1000, durationSec);
      node.style.opacity = String(alpha);
      if (alpha < 1) raf = window.requestAnimationFrame(frame);
    };

    raf = window.requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [visible, durationMs, instant]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}
