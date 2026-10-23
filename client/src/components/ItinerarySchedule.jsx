import {
  getDestinationScript,
  resolveItinerarySchedule,
} from "@shared/scripts/index.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

function BookedIcon({ src, alt = "" }) {
  return (
    <img
      className="schedule__booked-glyph"
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable="false"
    />
  );
}

function BookedItem({ icon, label }) {
  return (
    <span className="schedule__booked-item">
      {icon}
      <span className="schedule__booked-label" title={label}>
        {label}
      </span>
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
              <BookedItem
                icon={<BookedIcon src="/images/Expedia-images/flight-icon.png" />}
                label={bookings.flight}
              />
            ) : null}
            {bookings.stay ? (
              <BookedItem
                icon={<BookedIcon src="/images/Expedia-images/hotel-icon.png" />}
                label={bookings.stay}
              />
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
