import {
  getDestinationScript,
  resolveItinerarySchedule,
} from "@shared/scripts/index.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

/**
 * Control (left) finale schedule — 5 days from destination script modules.
 */
export default function ItinerarySchedule({ destinationId, answers = [] }) {
  const script = getDestinationScript(destinationId);
  const schedule = resolveItinerarySchedule(script, answers);

  return (
    <div className="schedule">
      <ExpediaBrandBar />

      <div className="schedule__intro">
        <h1 className="schedule__headline">{schedule.headline}</h1>
        {schedule.meta ? <p className="schedule__meta">{schedule.meta}</p> : null}
        {schedule.summary ? (
          <p className="schedule__summary">{schedule.summary}</p>
        ) : null}
      </div>

      <ol className="schedule__list">
        {schedule.days.map((day) => (
          <li key={day.id} className="schedule__card">
            <div
              className="schedule__thumb"
              style={
                day.image ? { backgroundImage: `url(${day.image})` } : undefined
              }
              role="img"
              aria-hidden="true"
            />
            <div className="schedule__body">
              <p className="schedule__day">{day.dayLabel}</p>
              <h3 className="schedule__title">{day.title}</h3>
              <p className="schedule__copy">{day.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
