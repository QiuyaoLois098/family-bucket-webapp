import { useEffect } from "react";

const LOCK_CLASS = "vrbo-kiosk-lock";
const STANDALONE_FILL_CLASS = "vrbo-standalone-fill";
const KIOSK_VIEWPORT =
  "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
const DEFAULT_VIEWPORT =
  "width=device-width, initial-scale=1, viewport-fit=cover";

function upsertViewport(content) {
  let el = document.querySelector('meta[name="viewport"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "viewport");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

/**
 * Lock /vrbo-left|/vrbo-right|/vrbo-ip* pages: no document scroll, no pinch/browser zoom.
 * Inner panels (chat feed, etc.) can still scroll inside overflow:auto regions.
 */
export default function useVrboFixedViewport(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;

    const html = document.documentElement;
    const previousViewport =
      document.querySelector('meta[name="viewport"]')?.getAttribute("content") ||
      DEFAULT_VIEWPORT;

    html.classList.add(LOCK_CLASS);
    upsertViewport(KIOSK_VIEWPORT);

    // iOS Home Screen apps: window.innerHeight / 100dvh come back one status bar
    // short (793 on an 852pt screen) while 100vh is the full 852, and anything
    // position:fixed (html/body included) is clipped at 793. Let the page use
    // normal flow at 100vh instead — see .vrbo-standalone-fill in vrbo-v2.css.
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) html.classList.add(STANDALONE_FILL_CLASS);

    const blockMultiTouchZoom = (event) => {
      if (event.touches?.length > 1) event.preventDefault();
    };
    const blockGestureZoom = (event) => {
      event.preventDefault();
    };
    const blockCtrlWheelZoom = (event) => {
      if (event.ctrlKey) event.preventDefault();
    };
    const blockDocScroll = (event) => {
      // Allow scroll only inside explicitly scrollable descendants.
      const target = event.target;
      if (!(target instanceof Element)) {
        event.preventDefault();
        return;
      }
      const scroller = target.closest(
        '[data-allow-scroll="1"], .vrbo-v2-chat__feed, .vrbo-v2-phone__feed, .vrbo-v2-phone__prompt, .vrbo-v2-phone__draft-line, .vrbo-v2-rank__results',
      );
      if (scroller) return;
      event.preventDefault();
    };

    document.addEventListener("touchmove", blockMultiTouchZoom, { passive: false });
    document.addEventListener("touchmove", blockDocScroll, { passive: false });
    document.addEventListener("gesturestart", blockGestureZoom, { passive: false });
    document.addEventListener("gesturechange", blockGestureZoom, { passive: false });
    document.addEventListener("wheel", blockCtrlWheelZoom, { passive: false });

    return () => {
      html.classList.remove(LOCK_CLASS);
      html.classList.remove(STANDALONE_FILL_CLASS);
      upsertViewport(previousViewport);
      document.removeEventListener("touchmove", blockMultiTouchZoom);
      document.removeEventListener("touchmove", blockDocScroll);
      document.removeEventListener("gesturestart", blockGestureZoom);
      document.removeEventListener("gesturechange", blockGestureZoom);
      document.removeEventListener("wheel", blockCtrlWheelZoom);
    };
  }, [enabled]);
}
