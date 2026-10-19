import { useEffect, useRef, useState } from "react";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";
import {
  BUILDING_CASES,
  BUILDING_SRC,
  MOTION_H,
  MOTION_W,
  crop,
  loadImage,
  outCubic,
  range,
  smooth,
} from "./expediaLuggageMotion.js";

const COPY_DURATION = 0.6;

/**
 * Right-screen building itinerary: title + four suitcases stagger + handle extend.
 * Ported from Expedia-Animation-Handoff-v72 app.js drawBuilding.
 */
export default function BuildingProgressStep() {
  const canvasRef = useRef(null);
  const assetsRef = useRef(null);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadImage(BUILDING_SRC),
      ...BUILDING_CASES.map((c) => loadImage(c.src)),
    ])
      .then(([building, ...cases]) => {
        if (cancelled) return;
        const buildingTitle = document.createElement("canvas");
        buildingTitle.width = MOTION_W;
        buildingTitle.height = MOTION_H;
        const titleCtx = buildingTitle.getContext("2d");
        titleCtx.drawImage(building, 0, 0, MOTION_W, MOTION_H);
        // Punch out the three dots so we can pulse them separately (handoff).
        titleCtx.fillStyle = "#fff";
        titleCtx.fillRect(850, 675, 51, 20);
        assetsRef.current = {
          building,
          buildingTitle,
          cases: Object.fromEntries(
            BUILDING_CASES.map((c, i) => [c.name, cases[i]]),
          ),
        };
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
    const assets = assetsRef.current;
    if (!canvas || !assets) return undefined;
    const ctx = canvas.getContext("2d");
    const t0 = performance.now();

    const draw = (now) => {
      const t = (now - t0) / 1000;
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, MOTION_W, MOTION_H);

      // Title enter
      const titleEnter = outCubic(range(t, 0, COPY_DURATION));
      const titleY = 22 * (1 - titleEnter);
      crop(
        ctx,
        assets.buildingTitle,
        80,
        625,
        920,
        80,
        80,
        625 + titleY,
        920,
        80,
        titleEnter,
      );

      // Pulsing dots
      for (let i = 0; i < 3; i += 1) {
        const pulse = ((1 + Math.cos((t / 1.5) * Math.PI * 2 - i * 1.25)) / 2) ** 2;
        crop(
          ctx,
          assets.building,
          850 + i * 17,
          675,
          17,
          20,
          850 + i * 17,
          675 + titleY,
          17,
          20,
          titleEnter * (0.22 + 0.78 * pulse),
        );
      }

      BUILDING_CASES.forEach((c, i) => {
        const start = 0.2 + i * 0.3;
        const move = outCubic(range(t, start, start + 1));
        const alpha = smooth(range(t, start, start + 0.3));
        const dx = c.dx * (1 - move);
        const dy = c.dy * (1 - move);
        const [x, y, w, h] = c.body;
        const sprite = assets.cases[c.name];
        if (!sprite) return;

        ctx.save();
        ctx.globalAlpha = alpha * 0.18;
        ctx.filter = "blur(8px)";
        ctx.fillStyle = "#15182a";
        ctx.beginPath();
        ctx.ellipse(x + w / 2 + dx, y + h - 5 + dy, w * 0.57, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const liftStart = 2.0 + i * 0.95;
        const lift = smooth(range(t, liftStart, liftStart + 0.85));
        const [sx, sy, sw, sh] = c.source;
        const [hx, hy, hw, hh] = c.grip;
        const scale = w / sw;
        const handleX = x + (hx - sx) * scale + dx;
        const handleW = hw * scale;
        const handleH = c.raise * (0.08 + 0.92 * lift);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, hx, hy, hw, hh, handleX, y + dy - handleH, handleW, handleH + 2);
        ctx.drawImage(sprite, sx, sy, sw, sh, x + dx, y + dy, w, h);
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready]);

  return (
    <div className="building-screen building-screen--motion">
      <ExpediaBrandBar />
      <canvas
        ref={canvasRef}
        className="building-screen__canvas"
        width={MOTION_W}
        height={MOTION_H}
        aria-label="Building your itinerary"
      />
    </div>
  );
}
