function Print({ src, crop = "center", className = "", delay = "0s" }) {
  return (
    <figure className={`print ${className}`} style={{ animationDelay: delay }}>
      <span
        className="print__image"
        style={{ backgroundImage: `url(${src})`, backgroundPosition: crop }}
      />
    </figure>
  );
}

function Letter({ dear, title, body, sign, className = "", delay = "0s" }) {
  return (
    <article className={`letter ${className}`} style={{ animationDelay: delay }}>
      {dear ? <p className="letter__dear">{dear}</p> : null}
      {title ? <h3>{title}</h3> : null}
      {body ? <p className="letter__body">{body}</p> : null}
      {sign ? <p className="letter__sign">{sign}</p> : null}
    </article>
  );
}

export default function ItineraryView({ itinerary, destination, onStartOver }) {
  if (!itinerary) {
    return (
      <div className="itinerary itinerary--waiting">
        <p className="eyebrow">Composing your journey</p>
        <h2>A few more seconds.</h2>
      </div>
    );
  }

  const gallery = destination?.gallery || [];
  const crops = destination?.crops || [];
  const moments = itinerary.moments || [];
  const photo = (index) => gallery[index % Math.max(gallery.length, 1)] || destination?.image;
  const crop = (index) => crops[index % Math.max(crops.length, 1)] || "center";

  return (
    <div className="bucket-wall">
      <Print className="print--hero" src={photo(0)} crop={crop(0)} delay="0.05s" />
      <Letter
        className="letter--intro"
        dear="A family bucket list"
        title={destination?.shortTitle || itinerary.title}
        body={itinerary.subtitle}
        sign={destination?.location}
        delay="0.12s"
      />
      <Print className="print--a" src={photo(1)} crop={crop(1)} delay="0.18s" />
      {moments[0] ? (
        <Letter
          className="letter--0"
          dear={`${moments[0].time},`}
          title={moments[0].title}
          body={moments[0].description}
          delay="0.22s"
        />
      ) : null}
      <Print className="print--b" src={photo(2)} crop={crop(2)} delay="0.28s" />
      {moments[1] ? (
        <Letter
          className="letter--1"
          dear={`${moments[1].time},`}
          title={moments[1].title}
          body={moments[1].description}
          delay="0.32s"
        />
      ) : null}
      <Print className="print--c" src={photo(3)} crop={crop(3)} delay="0.38s" />
      {moments[2] ? (
        <Letter
          className="letter--2"
          dear={`${moments[2].time},`}
          title={moments[2].title}
          body={moments[2].description}
          delay="0.42s"
        />
      ) : null}
      <Print className="print--d" src={photo(0)} crop={crop(3)} delay="0.48s" />
      {moments[3] ? (
        <Letter
          className="letter--3"
          dear={`${moments[3].time},`}
          title={moments[3].title}
          body={moments[3].description}
          sign="Until next time"
          delay="0.52s"
        />
      ) : null}
      {onStartOver ? (
        <button type="button" className="wall-start-over" onClick={onStartOver}>
          Start over
        </button>
      ) : null}
    </div>
  );
}
