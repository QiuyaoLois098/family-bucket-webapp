import { useState } from "react";
import { EntryRow } from "../HyperionDevOverlay.jsx";
import useHyperionActivity, { clearHyperionActivity } from "../../hooks/useHyperionActivity.js";

const MAX_EVENTS = 8;

/**
 * Hyperion event log docked in /vrbo-v2 (the black area beside the third phone).
 * Same data as the ?dev=1 overlay, always on here. Tap a row to expand the request.
 * Clear empties the log; Open shows everything on /logging.
 */
export default function HyperionLogPanel() {
  const events = useHyperionActivity({ force: true, max: MAX_EVENTS });
  const [openId, setOpenId] = useState(null);

  return (
    <aside className="hyperion-dev hyperion-dev--inline" aria-label="Hyperion log" aria-live="polite">
      <div className="hyperion-dev__head">
        <p className="hyperion-dev__title">Hyperion · log</p>
        <div className="hyperion-dev__actions">
          <button
            type="button"
            className="hyperion-dev__btn"
            onClick={() => {
              clearHyperionActivity();
              setOpenId(null);
            }}
          >
            Clear
          </button>
          <a className="hyperion-dev__btn" href="/logging" target="_blank" rel="noopener noreferrer">
            Open
          </a>
        </div>
      </div>
      <div className="hyperion-dev__section hyperion-dev__section--events">
        <p className="hyperion-dev__section-title">events · latest {MAX_EVENTS}</p>
        {events.length === 0 ? (
          <p className="hyperion-dev__empty">No events yet</p>
        ) : (
          <ul className="hyperion-dev__list">
            {events.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                compact
                expanded={openId === entry.id}
                onToggle={() => setOpenId((current) => (current === entry.id ? null : entry.id))}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
