import { useEffect } from "react";

/**
 * Click / typing on organizer interactive or guest phones:
 * starts VGC Hyperion session (if needed) and refreshes the idle timer
 * (celebration page auto-restarts after 30s with no activity).
 */
export default function useVrboSessionStartOnActivity(startSession) {
  useEffect(() => {
    if (typeof startSession !== "function") return undefined;

    const onActivity = () => {
      startSession();
    };

    window.addEventListener("pointerdown", onActivity, { capture: true });
    window.addEventListener("keydown", onActivity, { capture: true });
    window.addEventListener("input", onActivity, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", onActivity, { capture: true });
      window.removeEventListener("keydown", onActivity, { capture: true });
      window.removeEventListener("input", onActivity, { capture: true });
    };
  }, [startSession]);
}
