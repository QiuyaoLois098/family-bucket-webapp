import { useEffect, useRef, useState } from "react";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";
import { getSocket } from "../socket.js";
import {
  MOTION_H,
  MOTION_W,
  SUITCASE_SRC,
  clamp,
  crop,
  loadImage,
  mix,
  outCubic,
  range,
  settle,
  smooth,
} from "./expediaLuggageMotion.js";

const COPY_DURATION = 0.6;
const PULL_DURATION = 0.67;
/** Hold after the arrow click before the phase advances. */
const ADVANCE_DELAY_MS = 1000;

function hintPulse(t) {
  // Keep pulsing while we wait for the click — no timed auto-advance.
  if (t < 1.3) return 0;
  const local = (t - 1.3) % 1.1;
  if (local < 0.4) return smooth(local / 0.4);
  if (local < 0.52) return 1;
  if (local < 1) return 1 - smooth((local - 0.52) / 0.48);
  return 0;
}

/**
 * Right-screen suitcase: rise → hint pulse → click pulls the handle,
 * then shake advances reveal → building.
 */
export default function RevealStep() {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const triggered = useRef(false);
  const pullStartRef = useRef(null);
  const t0Ref = useRef(0);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);

  const activateReveal = () => {
    if (triggered.current) return;
    triggered.current = true;
    pullStartRef.current = performance.now();
    window.setTimeout(() => {
      getSocket().emit("experience:shake");
    }, ADVANCE_DELAY_MS);
  };

  useEffect(() => {
    let cancelled = false;
    loadImage(SUITCASE_SRC)
      .then((img) => {
        if (cancelled) return;
        imgRef.current = img;
        setReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return undefined;
    const ctx = canvas.getContext("2d");
    t0Ref.current = performance.now();
    let finished = false;

    const draw = (now) => {
      const elapsed = (now - t0Ref.current) / 1000;
      let pull = 0;
      if (pullStartRef.current != null) {
        pull = settle(range((now - pullStartRef.current) / 1000, 0, PULL_DURATION));
        if (
          !finished &&
          (now - pullStartRef.current) / 1000 >= PULL_DURATION
        ) {
          finished = true;
        }
      }

      const a = elapsed >= 0.45 ? 1 : 0;
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, MOTION_W, MOTION_H);

      // Title
      const titleEnter = outCubic(range(elapsed, 0, COPY_DURATION));
      crop(
        ctx,
        img,
        80.5,
        256,
        920,
        156,
        80.5,
        256 + 22 * (1 - titleEnter),
        920,
        156,
        titleEnter,
      );

      // Guide copy
      const guideEnter = outCubic(range(elapsed, 1.3, 1.3 + COPY_DURATION));
      const guideY = 22 * (1 - guideEnter);
      const guideA = guideEnter;
      crop(ctx, img, 0, 630, MOTION_W, 150, 0, 630 + guideY, MOTION_W, 150, guideA);

      // Suitcase body rises from below
      ctx.save();
      ctx.translate(0, (MOTION_H - 1145 + 40) * (1 - outCubic(range(elapsed, 0.45, 1.25))));
      crop(ctx, img, 0, 1345, MOTION_W, MOTION_H - 1345, 0, 1345, MOTION_W, MOTION_H - 1345, a);

      const pulse = pullStartRef.current == null ? hintPulse(elapsed) : 0;
      const gripY = mix(1145 - pulse * 25, 1015, pull);
      const rodY = gripY + 88;
      const rodH = 1347 - rodY;
      crop(ctx, img, 365, 1105, 365, 240, 365, rodY, 365, rodH, a);
      crop(ctx, img, 350, 1012, 380, 93, 350, gripY, 380, 93, a);
      ctx.restore();

      // Arrow + circle hint
      const arrowLift =
        pullStartRef.current == null
          ? pulse * 18
          : outCubic(clamp((now - pullStartRef.current) / 1000 / 0.35)) * 24;
      const arrowA =
        guideA *
        (pullStartRef.current == null
          ? 1
          : 1 - smooth(range((now - pullStartRef.current) / 1000, 0.05, 0.35)));
      crop(
        ctx,
        img,
        470,
        820,
        140,
        140,
        470,
        820 + guideY - arrowLift,
        140,
        140,
        arrowA,
      );

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready]);

  return (
    <div className="reveal-step reveal-step--motion">
      <ExpediaBrandBar />
      <button
        type="button"
        className="reveal-step__hit"
        aria-label="Pull the suitcase handle to reveal your itinerary"
        onClick={activateReveal}
      >
        <canvas
          ref={canvasRef}
          className="reveal-step__canvas"
          width={MOTION_W}
          height={MOTION_H}
        />
      </button>
    </div>
  );
}
