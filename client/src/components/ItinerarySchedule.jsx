import {
  getDestinationScript,
  resolveItinerarySchedule,
} from "@shared/scripts/index.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

function PlaneIcon() {
  return (
    <svg className="schedule__booked-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z"
      />
    </svg>
  );
}

function LodgeIcon() {
  return (
    <svg className="schedule__booked-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 21V9.5L12 3l8 6.5V21h-6v-6H10v6H4zm2-2h2v-6h8v6h2v-8.2L12 5.5 6 10.8V19z"
      />
    </svg>
  );
}

function BookedItem({ icon, label }) {
  return (
    <span className="schedule__booked-item">
      {icon}
      <span className="schedule__booked-label">{label}</span>
      <span className="schedule__booked-pill">
        <span>Booked</span>
      </span>
    </span>
  );
}

/**
 * Control (left) finale schedule — 5 days from destination script modules.
 * Day cards stagger like handoff final sequence (0.8s gap).
 */
export default function ItinerarySchedule({ destinationId, answers = [] }) {
  const script = getDestinationScript(destinationId);
  const schedule = resolveItinerarySchedule(script, answers);
  const bookings = schedule.bookings;

  return (
    <div className="schedule">
      <ExpediaBrandBar />

      <div className="schedule__intro">
        <h1 className="schedule__headline">{schedule.headline}</h1>
        {schedule.meta ? <p className="schedule__meta">{schedule.meta}</p> : null}
        {bookings?.flight || bookings?.stay ? (
          <div className="schedule__booked">
            {bookings.flight ? (
              <BookedItem icon={<PlaneIcon />} label={bookings.flight} />
            ) : null}
            {bookings.stay ? (
              <BookedItem icon={<LodgeIcon />} label={bookings.stay} />
            ) : null}
          </div>
        ) : schedule.summary ? (
          <p className="schedule__summary">{schedule.summary}</p>
        ) : null}
      </div>

      <ol className="schedule__list">
        {schedule.days.map((day, index) => (
          <li
            key={day.id}
            className="schedule__card"
            style={{ animationDelay: `${index * 0.8}s` }}
          >
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
