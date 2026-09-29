import { QUESTIONS } from "@shared/questions.js";

const CARD_COUNT = 5;

const FOOTER_LABEL = {
  adventurous: "Adventure",
  slow: "Take it slow",
  kids: "Kids lead",
  grownups: "Grown-ups unwind",
  everyone: "Everyone's moment",
  local: "Local favorites",
  fresh: "Fresh & healthy",
};

function getHeadline(answers = []) {
  const hero = answers[1];
  if (hero === "kids") return "Big adventures, little explorers.";
  if (hero === "grownups") return "Quiet hours, shared together.";
  if (hero === "everyone") return "Something for every age.";
  if (answers[0] === "slow") return "Slow days, soft light.";
  return "Your family adventure awaits.";
}

function getFooterLabels(answers = []) {
  return answers
    .map((answerId, index) => {
      if (FOOTER_LABEL[answerId]) return FOOTER_LABEL[answerId];
      const option = QUESTIONS[index]?.options.find((item) => item.id === answerId);
      return option?.label || "";
    })
    .filter(Boolean);
}

function getThumb(destination, index) {
  const gallery = destination?.gallery?.filter(Boolean) || [];
  if (gallery.length) return gallery[index % gallery.length];
  return destination?.image || "";
}

function buildCards(moments = []) {
  return Array.from({ length: CARD_COUNT }, (_, index) => {
    const moment = moments[index];
    return {
      title: moment?.title || "Coming up",
      description: moment?.description || "Your family day is taking shape.",
      image: null,
      index,
    };
  });
}

export default function ItinerarySchedule({
  itinerary,
  destination,
  answers = [],
  onStartOver,
}) {
  if (!itinerary) {
    return (
      <div className="itinerary itinerary--waiting">
        <p className="eyebrow">Composing your journey</p>
        <h2>A few more seconds.</h2>
      </div>
    );
  }

  const cards = buildCards(itinerary.moments);
  const place = destination?.shortTitle || itinerary.title || "Your trip";
  const location = destination?.location || "";
  const headline = itinerary.headline || getHeadline(answers);
  const footerLabels = getFooterLabels(answers);

  return (
    <div className="schedule">
      <header className="schedule__brandbar">
        <img
          className="schedule__logo"
          src="/images/Expedia-images/expedia-logo.png"
          alt="Expedia"
        />
        <span className="schedule__product">AI Activity Planner</span>
      </header>

      <div className="schedule__intro">
        <p className="schedule__location">
          {place}
          {location ? (
            <>
              <span aria-hidden="true"> / </span>
              {location}
            </>
          ) : null}
        </p>
        <h1 className="schedule__headline">{headline}</h1>
      </div>

      <ol className="schedule__list">
        {cards.map((card) => (
          <li key={`day-${card.index}`} className="schedule__card">
            <div
              className="schedule__thumb"
              style={{ backgroundImage: `url(${getThumb(destination, card.index)})` }}
              role="img"
              aria-hidden="true"
            />
            <div className="schedule__body">
              <p className="schedule__day">Day {card.index + 1}</p>
              <h3 className="schedule__title">{card.title}</h3>
              <p className="schedule__copy">{card.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <footer className="schedule__footer">
        {footerLabels.length ? (
          <p className="schedule__chips">{footerLabels.join(" / ")}</p>
        ) : (
          <p className="schedule__chips">Made for your family</p>
        )}
        {onStartOver ? (
          <button type="button" className="schedule__restart" onClick={onStartOver}>
            Start over
          </button>
        ) : null}
      </footer>
    </div>
  );
}
