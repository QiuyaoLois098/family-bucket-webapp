import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

function formatTime(at) {
  if (!at) return "—";
  return new Date(at).toLocaleTimeString();
}

/** Top-left Hyperion heartbeat debug panel. Enable with ?dev=1 */
export default function HyperionDevOverlay({ heartbeat }) {
  const [params] = useSearchParams();
  const visible = useMemo(() => {
    const flag = params.get("dev") ?? params.get("hyperion");
    return flag === "1" || flag === "true";
  }, [params]);

  if (!visible || !heartbeat) return null;

  const code =
    heartbeat.httpStatus == null
      ? heartbeat.phase === "sending"
        ? "…"
        : "—"
      : String(heartbeat.httpStatus);

  const tone = !heartbeat.enabled
    ? "is-muted"
    : heartbeat.phase === "sending"
      ? "is-pending"
      : heartbeat.ok
        ? "is-ok"
        : "is-bad";

  return (
    <aside className={`hyperion-dev ${tone}`} aria-live="polite">
      <p className="hyperion-dev__title">Hyperion · dev</p>
      <p>
        <span>path</span> {heartbeat.path}
      </p>
      <p>
        <span>device</span> {heartbeat.deviceLabel || "—"}
      </p>
      <p>
        <span>id</span> {heartbeat.deviceId || "—"}
      </p>
      <p>
        <span>sent</span>{" "}
        {heartbeat.enabled
          ? heartbeat.phase === "sending"
            ? "sending…"
            : heartbeat.at
              ? "yes"
              : "waiting"
          : "n/a"}
      </p>
      <p>
        <span>code</span> {code}
      </p>
      <p>
        <span>health</span> {heartbeat.hyperionStatus || "—"}
      </p>
      <p>
        <span>at</span> {formatTime(heartbeat.at)}
      </p>
      {heartbeat.error ? <p className="hyperion-dev__error">{heartbeat.error}</p> : null}
    </aside>
  );
}
