import { useEffect, useState } from "react";

function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

/** Blocks the VRBO demo until the viewport is landscape, then reloads once. */
export default function useLandscapeGate() {
  const [ready] = useState(() => (typeof window === "undefined" ? true : isLandscape()));

  useEffect(() => {
    if (ready) return undefined;

    const onChange = () => {
      if (!isLandscape()) return;
      window.location.reload();
    };

    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    // Catch a rotate that happened between first paint and this effect.
    onChange();

    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, [ready]);

  return ready;
}
