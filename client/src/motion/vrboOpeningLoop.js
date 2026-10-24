/**
 * Right-screen opening loop — timings and easing from
 * vrbo-image-right-loop-1020 / right-screen.js (published image option v13).
 */

export const PHOTO_LOOP_START = 3100;
export const PHOTO_STEP = 4100;
export const PHOTO_HOLD = 3000;
export const PHOTO_TRANSITION = 1100;

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
  node.style.opacity = p;
  /* Design-px travel, relative to the 3840 display container — never raw CSS px. */
  node.style.transform = `translateY(calc(${offset * (1 - p)} / var(--design-h, 3840) * 100cqh))`;
}

export function updateOpeningPhotos(photos, t, reduced) {
  photos.forEach((node) => {
    node.style.opacity = 0;
    node.style.transform = "translateY(100%)";
    node.style.zIndex = 0;
  });
  if (t < 1800) return;
  if (t < 3100) {
    const p = reduced ? 1 : softEase((t - 1800) / 1300);
    photos[0].style.opacity = p;
    photos[0].style.transform = `translateY(${8 * (1 - p)}%)`;
    return;
  }
  const elapsed = t - PHOTO_LOOP_START;
  const index = Math.floor(elapsed / PHOTO_STEP) % photos.length;
  const local = elapsed % PHOTO_STEP;
  photos[index].style.opacity = 1;
  photos[index].style.transform = "translateY(0)";
  if (local >= PHOTO_HOLD) {
    const next = (index + 1) % photos.length;
    const p = reduced ? 1 : screenEase((local - PHOTO_HOLD) / PHOTO_TRANSITION);
    photos[index].style.transform = `translateY(${-100 * p}%)`;
    photos[next].style.opacity = 1;
    photos[next].style.transform = `translateY(${100 * (1 - p)}%)`;
  }
}

export function updateOpeningHeadlines(slides, t, reduced) {
  const firstSwitch = PHOTO_LOOP_START + PHOTO_STEP + PHOTO_HOLD;
  const elapsed = t - firstSwitch;
  slides.forEach((node) => {
    node.style.display = "none";
    node.style.opacity = 0;
    node.style.transform = "none";
  });
  const show = (i, opacity, y) => {
    const node = slides[i];
    node.style.display = "block";
    node.style.opacity = opacity;
    node.style.transform = `translateY(${y}%)`;
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
