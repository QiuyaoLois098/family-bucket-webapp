import properties from "../data/vrbo-v2/properties.json";

const HOTEL_PAGE_IMAGES = [
  ...properties.map((property) => property.image),
  "/images/Vrbo-Images/score.png",
  "/images/Vrbo-Images/final-bg.jpg",
];

/** Keep decoded bitmaps referenced so restart / GC does not drop them. */
const cache = new Map();

function warm(src) {
  let image = cache.get(src);
  if (!image) {
    image = new Image();
    image.decoding = "async";
    cache.set(src, image);
  }
  if (!image.src) image.src = src;
  return image.decode?.().catch(() => undefined);
}

/** Warm hotel-page photos on boot and every demo restart. */
export function preloadVrboHotelImages() {
  if (typeof window === "undefined") return;
  HOTEL_PAGE_IMAGES.forEach((src) => {
    warm(src);
  });
}
