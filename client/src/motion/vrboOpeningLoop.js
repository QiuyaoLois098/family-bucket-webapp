/**
 * Right-screen opening loop — timings and easing from
 * vrbo-image-right-loop-1020 / right-screen.js (published image option v13).
 */

export const PHOTO_LOOP_START = 3100;
export const PHOTO_STEP = 4100;
export const PHOTO_HOLD = 3000;
export const PHOTO_TRANSITION = 1100;

// Each node's motion styles are owned here. Avoid invalidating unchanged layers
// on every animation frame, especially during the long headline/photo holds.
const motionStyles = new WeakMap();
function applyMotionStyles(node, values) {
  let previous = motionStyles.get(node);
  if (!previous) {
    previous = {};
    motionStyles.set(node, previous);
  }
  for (const [key, value] of Object.entries(values)) {
    const next = String(value);
    if (previous[key] !== next) {
      node.style[key] = next;
      previous[key] = next;
    }
  }
}

export const OPENING_PHOTOS = [
  "/images/Vrbo-Images/Properties/sunset-beach-house.jpg",
  "/images/Vrbo-Images/Properties/ohana-beach-house.jpg",
  "/images/Vrbo-Images/Properties/aloha-coast-retreat.jpg",
  "/images/Vrbo-Images/Properties/honolulu-oceanfront-home.jpeg",
  "/images/Vrbo-Images/Properties/oceanfront-maui-home.jpeg",
  "/images/Vrbo-Images/Properties/big-island-beach-retreat.jpg",
];

export function clamp(n, a = 0, b = 1) {
  return Math.max(a, Math.min(b, n));
}

export function screenEase(p) {
  p = clamp(p);
  return p * p * (3 - 2 * p);
}

export function softEase(p) {
  p = clamp(p);
  if (p === 0 || p === 1) return p;
  let lo = 0;
  let hi = 1;
  let u = p;
  for (let i = 0; i < 16; i += 1) {
    u = (lo + hi) / 2;
    const x = 3 * (1 - u) ** 2 * u * 0.4 + 3 * (1 - u) * u * u * 0.2 + u * u * u;
    if (x < p) lo = u;
    else hi = u;
  }
  return 3 * (1 - u) * u * u + u * u * u;
}

export function softEnter(node, t, start, duration, offset, reduced) {
  const p = reduced ? 1 : screenEase((t - start) / duration);
  /* Design-px travel, relative to the 3840 display container — never raw CSS px. */
  applyMotionStyles(node, {
    opacity: p,
    transform: `translate3d(0, calc(${offset * (1 - p)} / var(--design-h, 3840) * 100cqh), 0)`,
  });
}

export function updateOpeningPhotos(photos, t, reduced) {
  const states = photos.map(() => ({ opacity: 0, y: 100 }));
  const commit = () => photos.forEach((node, i) => applyMotionStyles(node, {
    opacity: states[i].opacity,
    transform: `translate3d(0, ${states[i].y}%, 0)`,
    zIndex: 0,
  }));
  if (t < 1800) {
    commit();
    return;
  }
  if (t < 3100) {
    const p = reduced ? 1 : softEase((t - 1800) / 1300);
    states[0] = { opacity: p, y: 8 * (1 - p) };
    commit();
    return;
  }
  const elapsed = t - PHOTO_LOOP_START;
  const index = Math.floor(elapsed / PHOTO_STEP) % photos.length;
  const local = elapsed % PHOTO_STEP;
  states[index] = { opacity: 1, y: 0 };
  if (local >= PHOTO_HOLD) {
    const next = (index + 1) % photos.length;
    const p = reduced ? 1 : screenEase((local - PHOTO_HOLD) / PHOTO_TRANSITION);
    states[index].y = -100 * p;
    states[next] = { opacity: 1, y: 100 * (1 - p) };
  }
  commit();
}

export function updateOpeningHeadlines(slides, t, reduced) {
  const firstSwitch = PHOTO_LOOP_START + PHOTO_STEP + PHOTO_HOLD;
  const elapsed = t - firstSwitch;
  const states = slides.map(() => ({ opacity: 0, y: 0, visible: false }));
  const commit = () => slides.forEach((node, i) => applyMotionStyles(node, {
    // Keep the text layer laid out instead of removing/recreating it each frame.
    visibility: states[i].visible ? "visible" : "hidden",
    opacity: states[i].opacity,
    transform: `translate3d(0, ${states[i].y}%, 0)`,
  }));
  const show = (i, opacity, y) => {
    states[i] = { opacity, y, visible: true };
    commit();
  };
  if (elapsed < 0) {
    show(0, 1, 0);
    return;
  }
  const index = Math.floor(elapsed / (2 * PHOTO_STEP)) % 2;
  const local = elapsed % (2 * PHOTO_STEP);
  if (reduced) {
    show((index + 1) % 2, 1, 0);
    return;
  }
  if (local < 400) {
    const p = softEase(local / 400);
    show(index, 1 - p, -6 * p);
  } else if (local < PHOTO_TRANSITION) {
    const p = softEase((local - 400) / (PHOTO_TRANSITION - 400));
    show((index + 1) % 2, p, 6 * (1 - p));
  } else {
    show((index + 1) % 2, 1, 0);
  }
}
