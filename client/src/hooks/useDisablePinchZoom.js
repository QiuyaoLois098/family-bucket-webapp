import { useEffect } from "react";

const VIEWPORT =
  "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

function upsertViewport(content) {
  let el = document.querySelector('meta[name="viewport"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "viewport");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Block browser pinch-zoom / ctrl+wheel zoom on touch kiosks.
 * Does not block single-finger scroll inside overflow regions.
 */
export default function useDisablePinchZoom() {
  useEffect(() => {
    upsertViewport(VIEWPORT);
    document.documentElement.classList.add("no-pinch-zoom");

    const blockMultiTouch = (event) => {
      if (event.touches?.length > 1) event.preventDefault();
    };
    const blockGesture = (event) => {
      event.preventDefault();
    };
    const blockCtrlWheel = (event) => {
      if (event.ctrlKey) event.preventDefault();
    };

    document.addEventListener("touchstart", blockMultiTouch, { passive: false });
    document.addEventListener("touchmove", blockMultiTouch, { passive: false });
    document.addEventListener("gesturestart", blockGesture, { passive: false });
    document.addEventListener("gesturechange", blockGesture, { passive: false });
    document.addEventListener("gestureend", blockGesture, { passive: false });
    document.addEventListener("wheel", blockCtrlWheel, { passive: false });

    return () => {
      document.documentElement.classList.remove("no-pinch-zoom");
      document.removeEventListener("touchstart", blockMultiTouch);
      document.removeEventListener("touchmove", blockMultiTouch);
      document.removeEventListener("gesturestart", blockGesture);
      document.removeEventListener("gesturechange", blockGesture);
      document.removeEventListener("gestureend", blockGesture);
      document.removeEventListener("wheel", blockCtrlWheel);
    };
  }, []);
}
