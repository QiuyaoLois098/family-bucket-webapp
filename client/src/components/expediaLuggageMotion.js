/** Easing + crop helpers ported from Expedia-Animation-Handoff-v72 app.js */

export const MOTION_W = 1080;
export const MOTION_H = 1920;

export const clamp = (t) => Math.max(0, Math.min(1, t));
export const range = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
export const outCubic = (t) => 1 - (1 - clamp(t)) ** 3;
export const settle = (t) => {
  t = clamp(t) - 1;
  return 1 + 1.35 * t * t * t + 0.35 * t * t;
};
export const mix = (a, b, t) => a + (b - a) * t;

export function crop(ctx, img, x, y, w, h, dx = x, dy = y, dw = w, dh = h, alpha = 1) {
  if (alpha <= 0 || !img || dh <= 0 || !img.width) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  ctx.drawImage(
    img,
    (x / MOTION_W) * img.width,
    (y / MOTION_H) * img.height,
    (w / MOTION_W) * img.width,
    (h / MOTION_H) * img.height,
    dx,
    dy,
    dw,
    dh,
  );
  ctx.restore();
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

/** Four building-itinerary suitcases (handoff `cases`). */
export const BUILDING_CASES = [
  {
    name: "large",
    body: [220, 874, 257, 404],
    source: [205, 460, 650, 1020],
    grip: [340, 15, 220, 445],
    raise: 82,
    dx: -260,
    dy: 0,
    src: "/images/Expedia-images/motion/large-complete-v2.png",
  },
  {
    name: "navy",
    body: [424, 955, 206, 331],
    source: [210, 490, 620, 975],
    grip: [344, 42, 240, 448],
    raise: 69,
    dx: 250,
    dy: -14,
    src: "/images/Expedia-images/motion/navy-complete-v3.png",
  },
  {
    name: "small",
    body: [562, 996, 169, 298],
    source: [250, 535, 572, 911],
    grip: [400, 80, 230, 455],
    raise: 63,
    dx: 210,
    dy: -26,
    src: "/images/Expedia-images/motion/small-complete-v3.png",
  },
  {
    name: "blue",
    body: [704, 1050, 157, 246],
    source: [205, 500, 655, 947],
    grip: [355, 65, 255, 435],
    raise: 49,
    dx: 250,
    dy: -34,
    src: "/images/Expedia-images/motion/blue-complete-v2.png",
  },
];

export const SUITCASE_SRC = "/images/Expedia-images/motion/client-screen-suitcase.webp";
export const BUILDING_SRC = "/images/Expedia-images/motion/client-screen-building.webp";
