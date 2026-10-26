import { useMemo, useState } from "react";
import { formatTime, formatRequest } from "../components/HyperionDevOverlay.jsx";
import useHyperionActivity, { clearHyperionActivity } from "../hooks/useHyperionActivity.js";

/** /logging — every Hyperion log entry recorded since the server started (or last Clear), fully expanded. */
export default function HyperionLogScreen() {
  const all = useHyperionActivity({ force: true, max: 500, includeHeartbeats: true });
  const [showHeartbeats, setShowHeartbeats] = useState(false);
  const [collapsed, setCollapsed] = useState(() => new Set());

  const entries = useMemo(
    () => all.filter((entry) => showHeartbeats || entry.kind === "event"),
    [all, showHeartbeats],
  );

  const toggle = (id) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="hyperion-log-page">
      <header className="hyperion-log-page__bar">
        <h1>Hyperion · log</h1>
        <span className="hyperion-log-page__count">{entries.length} entries</span>
        <label className="hyperion-log-page__check">
          <input
            type="checkbox"
            checked={showHeartbeats}
            onChange={(event) => setShowHeartbeats(event.target.checked)}
          />
          Show heartbeats
        </label>
        <button type="button" className="hyperion-dev__btn" onClick={clearHyperionActivity}>
          Clear
        </button>
      </header>

      {entries.length === 0 ? (
        <p className="hyperion-log-page__empty">No entries yet</p>
      ) : (
        <ul className="hyperion-log-page__list">
          {entries.map((entry) => {
            const tone = entry.skipped ? "is-muted" : entry.ok ? "is-ok" : "is-bad";
            const open = !collapsed.has(entry.id);
            return (
              <li key={entry.id} className={`hyperion-log-page__item ${tone}`}>
                <button
                  type="button"
                  className="hyperion-log-page__head"
                  onClick={() => toggle(entry.id)}
                  aria-expanded={open}
                >
                  <span className="hyperion-log-page__chevron">{open ? "▾" : "▸"}</span>
                  <strong>{entry.slug || entry.kind}</strong>
                  <span className="hyperion-log-page__kind">{entry.kind}</span>
                  <span className="hyperion-log-page__status">
                    {entry.status == null ? (entry.skipped ? "skip" : "—") : entry.status}
                  </span>
                  <span className="hyperion-log-page__time">{formatTime(entry.at)}</span>
                </button>
                {entry.error ? <div className="hyperion-log-page__error">{entry.error}</div> : null}
                {open ? <pre className="hyperion-log-page__json">{formatRequest(entry)}</pre> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
