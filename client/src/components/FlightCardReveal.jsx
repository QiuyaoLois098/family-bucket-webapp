export default function FlightCardReveal({ destination }) {
  const place = destination?.shortTitle || "Your trip";

  return (
    <div className="flight-reveal">
      <header className="flight-reveal__brandbar">
        <img
          className="flight-reveal__logo"
          src="/images/Expedia-images/expedia-logo.png"
          alt="Expedia"
        />
        <span className="flight-reveal__product">AI Activity Planner</span>
      </header>

      <h1 className="flight-reveal__title">
        Ready to make
        <br />
        new memories?
      </h1>

      <article className="flight-card">
        <div className="flight-card__media">
          <img
            src="/images/Expedia-images/flight-card-bg.png"
            alt=""
            draggable="false"
          />
        </div>

        <div className="flight-card__body">
          <div className="flight-card__top">
            <h2 className="flight-card__headline">
              {place}, built
              <br />
              for your family.
            </h2>
          </div>

          <div className="flight-card__bottom">
            <div className="flight-card__perforation" aria-hidden="true">
              <span className="flight-card__notch flight-card__notch--left" />
              <span className="flight-card__rule" />
              <span className="flight-card__notch flight-card__notch--right" />
            </div>

            <div className="flight-card__meta">
              <img
                className="flight-card__plane"
                src="/images/Expedia-images/flight-logo.png"
                alt=""
                draggable="false"
              />
              <p>5 days · your family adventure</p>
            </div>
          </div>
        </div>
      </article>

      <footer className="flight-reveal__footer">
        <p>Expedia / Made for your family</p>
      </footer>
    </div>
  );
}
