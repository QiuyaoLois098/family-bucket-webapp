import { useEffect, useRef } from "react";
import copy from "../../data/vrbo-v2/copy.json";
import {
  OPENING_PHOTOS,
  updateOpeningHeadlines,
  updateOpeningPhotos,
} from "../../motion/vrboOpeningLoop.js";

export default function OpeningLoop() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slides = [...root.querySelectorAll("[data-opening-slide]")];
    const photos = [...root.querySelectorAll("[data-opening-photo]")];
    const images = [...root.querySelectorAll("img")];

    let elapsed = 0;
    let playing = true;
    let loaded = false;
    let destroyed = false;
    let lastStamp = null;
    let frame = 0;

    const render = () => {
      updateOpeningHeadlines(slides, elapsed, reduced);
      updateOpeningPhotos(photos, elapsed, reduced);
    };

    const tick = (stamp) => {
      if (destroyed) return;
      if (playing && lastStamp !== null) elapsed += Math.min(stamp - lastStamp, 100);
      lastStamp = stamp;
      render();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (destroyed || loaded) return;
      loaded = true;
      root.dataset.openingReady = "true";
      root.style.visibility = "visible";
      render();
      frame = requestAnimationFrame(tick);
    };

    const titleFontReady = document.fonts
      ? document.fonts.load('500 180px "Albra Sans"', root.textContent).catch(() => [])
      : Promise.resolve();
    Promise.all([
      titleFontReady,
      ...images.map((image) =>
        image.decode().catch(() => undefined),
      ),
    ]).then(start);

    return () => {
      destroyed = true;
      playing = false;
      cancelAnimationFrame(frame);
      delete root.dataset.openingReady;
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="vrbo-v2-opening"
      aria-label="Vrbo image and two-copy opening loop"
      style={{ visibility: "hidden" }}
    >
      <img
        data-opening-logo
        className="vrbo-v2-opening__logo"
        src="/logo/Vrbo_Logo_Sail_RGB.png"
        alt="Vrbo"
        draggable={false}
      />

      <div className="vrbo-v2-opening__headlines">
        <div data-opening-slide className="vrbo-v2-opening__slide">
          <div data-opening-line className="vrbo-v2-opening__line">
            <p>{copy.ranking.waitingTitleLine1}</p>
          </div>
          <div data-opening-line className="vrbo-v2-opening__line vrbo-v2-opening__line--2">
            <p>{copy.ranking.waitingTitleLine2}</p>
          </div>
        </div>
        <div
          data-opening-slide
          className="vrbo-v2-opening__slide vrbo-v2-opening__slide--second"
        >
          <p>
            {copy.ranking.waitingTitle2Line1}
            <br />
            {copy.ranking.waitingTitle2Line2}
            <br />
            {copy.ranking.waitingTitle2Line3}
          </p>
        </div>
      </div>

      <div className="vrbo-v2-opening__photos">
        {OPENING_PHOTOS.map((src) => (
          <div key={src} data-opening-photo className="vrbo-v2-opening__photo">
            <img src={src} alt="" draggable={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
