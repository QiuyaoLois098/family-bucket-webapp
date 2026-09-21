export default function ItinerarySchedule({ itinerary, destination, onStartOver }) {
  if (!itinerary) {
    return (
      <div className="itinerary itinerary--waiting">
        <p className="eyebrow">Composing your journey</p>
        <h2>A few more seconds.</h2>
      </div>
    );
  }

  const moments = itinerary.moments || [];
  const place = destination?.shortTitle || itinerary.title || destination?.location || "";
  const location = destination?.location;

  return (
    <div className="schedule">
      <header className="schedule__header">
        <div className="schedule__brand">
          {location ? <p className="schedule__location">{location}</p> : null}
          <h2 className="schedule__place">{place}</h2>
          <p className="schedule__tagline">{itinerary.subtitle || "Built for your family"}</p>
        </div>
        <p className="schedule__motto">
          Good people
          <br />
          Good places
          <br />
          Brighter
          <br />
          Tomorrows
        </p>
      </header>

      <ol className="schedule__list">
        {moments.map((moment, index) => (
          <li key={`${moment.title}-${index}`} className="schedule__item">
            <span className="schedule__dot" aria-hidden="true" />
            <div className="schedule__body">
              <p className="schedule__day">{moment.time}</p>
              <h3 className="schedule__title">{moment.title}</h3>
              <span className="schedule__rule" aria-hidden="true" />
              <p className="schedule__copy">{moment.description}</p>
            </div>
          </li>
        ))}
      </ol>

      {onStartOver ? (
        <div className="wall-actions">
          <button type="button" className="wall-action" onClick={onStartOver}>
            Start over
          </button>
        </div>
      ) : null}
    </div>
  );
}
