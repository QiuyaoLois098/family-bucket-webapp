import { useEffect, useRef } from "react";
import copy from "../../data/vrbo-v2/copy.json";
import {
  softEnter,
  updateOpeningHeadlines,
} from "../../motion/vrboOpeningLoop.js";

const OPENING_VIDEO = "/images/Vrbo-Images/vrbo-image-loop-60fps.mp4";

export default function OpeningLoop() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const logo = root.querySelector("[data-opening-logo]");
    const lines = [...root.querySelectorAll("[data-opening-line]")];
    const slides = [...root.querySelectorAll("[data-opening-slide]")];
    const video = root.querySelector("[data-opening-video]");

    let elapsed = 0;
    let playing = true;
    let loaded = false;
    let destroyed = false;
    let lastStamp = null;
    let frame = 0;

    const render = () => {
      softEnter(logo, elapsed, 100, 1000, 17, reduced);
      lines.forEach((node, index) => {
        softEnter(node, elapsed, 700 + index * 180, 1200, 24, reduced);
      });
      updateOpeningHeadlines(slides, elapsed, reduced);
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
      root.style.visibility = "visible";
      video?.play()?.catch(() => {});
      render();
      frame = requestAnimationFrame(tick);
    };

    const ready = [];
    const logoImg = root.querySelector("[data-opening-logo]");
    if (logoImg?.decode) ready.push(logoImg.decode().catch(() => undefined));
    if (video) {
      ready.push(
        new Promise((resolve) => {
          if (video.readyState >= 2) {
            resolve();
            return;
          }
          video.addEventListener("loadeddata", resolve, { once: true });
          video.addEventListener("error", resolve, { once: true });
        }),
      );
    }

    Promise.all(ready).then(start);

    return () => {
      destroyed = true;
      playing = false;
      cancelAnimationFrame(frame);
      video?.pause();
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
        <video
          data-opening-video
          className="vrbo-v2-opening__video"
          src={OPENING_VIDEO}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
        />
      </div>
    </section>
  );
}
