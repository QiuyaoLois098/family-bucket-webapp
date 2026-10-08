import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import useHyperionActivity from "../hooks/useHyperionActivity.js";

function formatTime(at) {
  if (!at) return "—";
  return new Date(at).toLocaleTimeString();
}

function shortId(value) {
  if (!value || typeof value !== "string") return "—";
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}

function EntryRow({ entry }) {
  const tone = entry.skipped
    ? "is-muted"
    : entry.ok
      ? "is-ok"
      : "is-bad";
  const label =
    entry.kind === "heartbeat"
      ? `♥ ${entry.deviceLabel || entry.path || "heartbeat"}`
      : entry.slug || "event";

  return (
    <li className={`hyperion-dev__row ${tone}`}>
      <div className="hyperion-dev__row-top">
        <strong>{label}</strong>
        <span>{entry.status == null ? (entry.skipped ? "skip" : "—") : entry.status}</span>
      </div>
      <div className="hyperion-dev__row-meta">
        {formatTime(entry.at)}
        {entry.kind === "event" && entry.sessionId ? (
          <> · sess {shortId(entry.sessionId)}</>
        ) : null}
        {entry.kind === "heartbeat" && entry.path ? <> · {entry.path}</> : null}
      </div>
      {entry.error ? <div className="hyperion-dev__row-error">{entry.error}</div> : null}
    </li>
  );
}

/** Top-left Hyperion debug panel. Enable with ?dev=1 */
export default function HyperionDevOverlay({ heartbeat }) {
  const [params] = useSearchParams();
  const visible = useMemo(() => {
    const flag = params.get("dev") ?? params.get("hyperion");
    return flag === "1" || flag === "true";
  }, [params]);

  const activity = useHyperionActivity();

  if (!visible) return null;

  const code =
    heartbeat?.httpStatus == null
      ? heartbeat?.phase === "sending"
        ? "…"
        : "—"
      : String(heartbeat.httpStatus);

  const tone = !heartbeat?.enabled
    ? "is-muted"
    : heartbeat.phase === "sending"
      ? "is-pending"
      : heartbeat.ok
        ? "is-ok"
        : "is-bad";

  const events = activity.filter((e) => e.kind === "event");
  const recent = activity.slice(0, 12);

  return (
    <aside className={`hyperion-dev ${tone}`} aria-live="polite">
      <p className="hyperion-dev__title">Hyperion · dev</p>

      {heartbeat ? (
        <div className="hyperion-dev__section">
          <p className="hyperion-dev__section-title">this screen · heartbeat</p>
          <p>
            <span>path</span> {heartbeat.path}
          </p>
          <p>
            <span>device</span> {heartbeat.deviceLabel || "—"}
          </p>
          <p>
            <span>id</span> {shortId(heartbeat.deviceId)}
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
        </div>
      ) : null}

      <div className="hyperion-dev__section">
        <p className="hyperion-dev__section-title">
          requests · {events.length ? `${events.length} event` : "live"}
        </p>
        {recent.length === 0 ? (
          <p className="hyperion-dev__empty">No Hyperion requests yet</p>
        ) : (
          <ul className="hyperion-dev__list">
            {recent.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
