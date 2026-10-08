import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const HEARTBEAT_MS = 90_000;

/** Paths that should emit Hyperion heartbeats while open. */
export const HYPERION_HEARTBEAT_PATHS = new Set([
  "/vrbo-left",
  "/vrbo-right",
  "/vrbo-ip1",
  "/vrbo-ip2",
  "/vrbo-ip3",
]);

/**
 * While this screen URL is open: heartbeat immediately, then every 90s.
 * Stops automatically on unmount / navigation away.
 */
export default function useHyperionHeartbeat() {
  const { pathname } = useLocation();
  const enabled = HYPERION_HEARTBEAT_PATHS.has(pathname);
  const [status, setStatus] = useState({
    enabled,
    path: pathname,
    phase: enabled ? "idle" : "disabled",
    ok: null,
    httpStatus: null,
    hyperionStatus: null,
    deviceId: null,
    deviceLabel: null,
    error: null,
    at: null,
  });

  useEffect(() => {
    if (!enabled) {
      setStatus({
        enabled: false,
        path: pathname,
        phase: "disabled",
        ok: null,
        httpStatus: null,
        hyperionStatus: null,
        deviceId: null,
        deviceLabel: null,
        error: null,
        at: null,
      });
      return undefined;
    }

    let cancelled = false;

    const beat = async () => {
      setStatus((prev) => ({ ...prev, phase: "sending", path: pathname }));
      try {
        const response = await fetch("/api/hyperion/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ path: pathname }),
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        setStatus({
          enabled: true,
          path: pathname,
          phase: "done",
          ok: Boolean(data.ok),
          httpStatus: data.status ?? response.status,
          hyperionStatus: data.healthStatus ?? null,
          deviceId: data.deviceId ?? null,
          deviceLabel: data.deviceLabel ?? null,
          error: data.error ?? null,
          at: Date.now(),
        });
      } catch (error) {
        if (cancelled) return;
        setStatus({
          enabled: true,
          path: pathname,
          phase: "done",
          ok: false,
          httpStatus: null,
          hyperionStatus: null,
          deviceId: null,
          deviceLabel: null,
          error: error?.message || String(error),
          at: Date.now(),
        });
      }
    };

    beat();
    const timer = window.setInterval(beat, HEARTBEAT_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pathname, enabled]);

  return status;
}
