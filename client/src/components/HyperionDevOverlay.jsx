import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useHyperionActivity from "../hooks/useHyperionActivity.js";

export function formatTime(at) {
  if (!at) return "—";
  return new Date(at).toLocaleTimeString();
}

function shortId(value) {
  if (!value || typeof value !== "string") return "—";
  return value.length > 12 ? `${value.slice(0, 8)}…` : value;
}

export function formatRequest(entry) {
  const request = entry.request ?? {
    slug: entry.slug,
    sessionId: entry.sessionId,
    eventKey: entry.eventKey,
    sourceId: entry.sourceId,
    device: entry.deviceLabel,
    error: entry.error,
  };
  try {
    return JSON.stringify(request, null, 2);
  } catch {
    return String(request);
  }
}

const COMPACT_HIDDEN_KEYS = new Set(["eventKey", "occurredAt", "sessionId", "source"]);

/** Request body without timestamp / session id / event key / url — what the event actually says. */
function formatCompactRequest(entry) {
  const body = entry.request?.body ?? {
    slug: entry.slug,
    sourceId: entry.sourceId,
    fieldData: entry.deviceLabel ? { device: entry.deviceLabel } : undefined,
  };
  const trimmed = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    if (!COMPACT_HIDDEN_KEYS.has(key)) trimmed[key] = value;
  }
  try {
    return JSON.stringify(trimmed, null, 2);
  } catch {
    return String(trimmed);
  }
}

export function EntryRow({ entry, expanded, onToggle, compact = false }) {
  const tone = entry.skipped
    ? "is-muted"
    : entry.ok
      ? "is-ok"
      : "is-bad";

  return (
    <li className={`hyperion-dev__row ${tone} ${expanded ? "is-open" : ""}`}>
      <button
        type="button"
        className="hyperion-dev__row-btn"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="hyperion-dev__row-top">
          <strong>
            <span className="hyperion-dev__chevron" aria-hidden>
              {expanded ? "▾" : "▸"}
            </span>
            {entry.slug || "event"}
          </strong>
          <span>{entry.status == null ? (entry.skipped ? "skip" : "—") : entry.status}</span>
        </div>
        {compact ? null : (
          <div className="hyperion-dev__row-meta">
            {formatTime(entry.at)}
            {entry.sessionId ? <> · sess {shortId(entry.sessionId)}</> : null}
          </div>
        )}
      </button>
      {expanded ? (
        <pre className="hyperion-dev__request">
          {compact ? formatCompactRequest(entry) : formatRequest(entry)}
        </pre>
      ) : null}
      {!expanded && entry.error ? (
        <div className="hyperion-dev__row-error">{entry.error}</div>
      ) : null}
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

  const events = useHyperionActivity();
  const [openId, setOpenId] = useState(null);

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

      <div className="hyperion-dev__section hyperion-dev__section--events">
        <p className="hyperion-dev__section-title">events · latest 5</p>
        {events.length === 0 ? (
          <p className="hyperion-dev__empty">No events yet</p>
        ) : (
          <ul className="hyperion-dev__list">
            {events.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                expanded={openId === entry.id}
                onToggle={() =>
                  setOpenId((current) => (current === entry.id ? null : entry.id))
                }
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
