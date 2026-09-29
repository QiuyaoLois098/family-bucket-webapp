const CARD_COUNT = 5;

/** Fixed finale card copy — do not invent or replace. */
const FIXED_CARDS = [
  {
    title: "Beach discovery",
    description:
      "Explore Espadilla Norte after check-in; spot shorebirds together. Dinner at Soda Mar Azul, known for Costa Rican home cooking by Espadilla.",
  },
  {
    title: "Spot wild wonders",
    description:
      "A guided Manuel Antonio park walk, with kids choosing what to look for. Lunch at Sendero Tico, a local-style soda near the park entrance.",
  },
  {
    title: "Catch a first wave",
    description:
      "A private family surf lesson at Espadilla. Back to the hotel to rest. Lunch at La Olla Tica, a casual spot for local flavors near Espadilla.",
  },
  {
    title: "Paddle & discover",
    description:
      "Explore Damas mangroves by guided kayak, with an adult paddling alongside. Dinner at Casa Quereña in Quepos, a welcoming spot for traditional Costa Rican cooking.",
  },
  {
    title: "One last seaside stop",
    description:
      "After breakfast in Quepos, let the kids pick one last waterfront stop before your transfer. Breakfast at Café del Malecón, a traditional Costa Rican café by Quepos' waterfront.",
  },
];

const FIXED_HEADLINE = "Big adventures, little explorers.";
const FIXED_LOCATION = "Costa Rica / Manuel Antonio";
const FIXED_FOOTER = "Adventure / Kids lead / Local favorites";

function getThumb(destination, index) {
  const gallery = destination?.gallery?.filter(Boolean) || [];
  if (gallery.length) return gallery[index % gallery.length];
  return destination?.image || "";
}

export default function ItinerarySchedule({ destination, onStartOver }) {
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
        <p className="schedule__location">{FIXED_LOCATION}</p>
        <h1 className="schedule__headline">{FIXED_HEADLINE}</h1>
      </div>

      <ol className="schedule__list">
        {FIXED_CARDS.map((card, index) => (
          <li key={`day-${index + 1}`} className="schedule__card">
            <div
              className="schedule__thumb"
              style={{ backgroundImage: `url(${getThumb(destination, index)})` }}
              role="img"
              aria-hidden="true"
            />
            <div className="schedule__body">
              <p className="schedule__day">Day {index + 1}</p>
              <h3 className="schedule__title">{card.title}</h3>
              <p className="schedule__copy">{card.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <footer className="schedule__footer">
        <p className="schedule__chips">{FIXED_FOOTER}</p>
        {onStartOver ? (
          <button type="button" className="schedule__restart" onClick={onStartOver}>
            Start over
          </button>
        ) : null}
      </footer>
    </div>
  );
}
