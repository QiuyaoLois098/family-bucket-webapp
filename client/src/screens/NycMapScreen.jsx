import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import hotelConfig from "../data/hotelConfig.json";
import { HOTEL_CARDS, NYC_HOTELS } from "../projects.js";
import { rankHotels } from "../utils/rankHotels.js";

function NycBaseMap() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return undefined;

    const map = L.map(node, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
      zoomSnap: 0.1,
    });

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 16,
    }).addTo(map);

    const markers = NYC_HOTELS.map((hotel) => {
      const left = hotel.label === "left";
      return L.marker([hotel.lat, hotel.lng], {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: `hotel-pin ${left ? "hotel-pin--left" : ""}`,
          html: `<span class="hotel-pin__dot"></span><span class="hotel-pin__label">${hotel.name.toUpperCase()}</span>`,
          iconSize: [168, 28],
          iconAnchor: left ? [160, 14] : [8, 14],
        }),
      });
    });

    const group = L.featureGroup(markers).addTo(map);
    map.fitBounds(group.getBounds(), { padding: [90, 140], maxZoom: 12.7 });
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
    };
  }, []);

  return <div className="nyc-map__canvas" ref={canvasRef} />;
}

function featureMeta(id) {
  return hotelConfig.features.find((feature) => feature.id === id);
}

function vibeCopy(id) {
  const feature = featureMeta(id);
  if (!feature?.description) return "";
  return `finding ${feature.description}...`;
}

function featureNumber(id) {
  return String(id ?? "").replace(/^F/i, "");
}

function RankSelect({ value, disabled, taken, onChange, label }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div className={`hotel-rank ${open ? "is-open" : ""} ${disabled ? "is-locked" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="hotel-rank__toggle"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label} rank`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value ? featureNumber(value) : "–"}</span>
      </button>
      {open ? (
        <ul className="hotel-rank__menu" role="listbox" aria-label={`${label} features`}>
          {hotelConfig.features.map((feature) => {
            const blocked = taken.has(feature.id) && feature.id !== value;
            return (
              <li key={feature.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === feature.id}
                  disabled={blocked}
                  className={value === feature.id ? "is-current" : ""}
                  onClick={() => {
                    onChange(feature.id);
                    setOpen(false);
                  }}
                >
                  {featureNumber(feature.id)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default function NycMapScreen() {
  const [page, setPage] = useState("intro");
  const [choices, setChoices] = useState({});
  const [locked, setLocked] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const allChosen = HOTEL_CARDS.every((card) => choices[card.id] != null);

  const rankedHotels = useMemo(() => {
    if (!submitted) return null;
    const selectedFeatures = HOTEL_CARDS.map((card) => choices[card.id]);
    if (selectedFeatures.some((feature) => feature == null)) return null;
    return rankHotels(selectedFeatures, hotelConfig);
  }, [choices, submitted]);

  const recommended = rankedHotels?.slice(0, 2) ?? null;

  const taken = useMemo(
    () => new Set(Object.values(choices).filter((rank) => rank != null)),
    [choices],
  );

  useEffect(() => {
    if (page !== "intro") return undefined;
    const timer = window.setTimeout(() => setPage("map"), 10000);
    return () => window.clearTimeout(timer);
  }, [page]);

  const restart = () => {
    setChoices({});
    setLocked([]);
    setSubmitted(false);
    setPage("intro");
  };

  const pickRank = (id, rank) => {
    if (submitted) return;
    setChoices((current) => ({ ...current, [id]: rank }));
  };

  const lockCard = (id) => {
    if (submitted || locked.includes(id) || choices[id] == null) return;
    setLocked((current) => (current.includes(id) ? current : [...current, id]));
  };

  const submitPicks = () => {
    if (!allChosen || submitted) return;
    setSubmitted(true);
  };

  if (page === "intro") {
    return (
      <main className="nyc-intro">
        <img src="/images/nyc/skyline.png" alt="Find the hotel that best suits you" />
        <button type="button" className="nyc-skip" onClick={() => setPage("map")}>
          Start
        </button>
      </main>
    );
  }

  return (
    <main className={`nyc-map ${locked.length || allChosen ? "has-picks" : ""} ${recommended ? "has-list" : ""}`}>
      <div className="nyc-map__scene">
        <NycBaseMap />
        <div className="nyc-map__wash" />
        <div className="nyc-map__vignette" />
      </div>
      {locked.length || allChosen ? null : <p className="nyc-map__prompt">Insert a card based on your vibe</p>}

      <div className="nyc-map__dock">
        {recommended ? (
          <section className="hotel-list" aria-live="polite">
            <button type="button" className="hotel-list__restart" onClick={restart}>
              Restart
            </button>
            <p className="hotel-list__eyebrow">Your recommendation</p>
            <h2>Top 2 hotels</h2>
            <ol>
              {recommended.map((result) => (
                <li key={result.hotel}>
                  <strong>
                    {result.hotel}
                    <em>{result.score} pts</em>
                  </strong>
                  <span>
                    {result.matchedFeatures.length
                      ? result.matchedFeatures.map((match) => `${match.feature} +${match.weight}`).join(" · ")
                      : "No matching features"}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {allChosen && !submitted ? (
          <button type="button" className="nyc-submit" onClick={submitPicks}>
            Submit
          </button>
        ) : null}

        <div className="hotel-cards">
          {HOTEL_CARDS.map((card) => {
            const selected = locked.includes(card.id);
            const rank = choices[card.id];
            return (
              <div key={card.id} className={`hotel-card-slot ${selected ? "is-selected" : ""}`}>
                {rank != null ? <p className="hotel-vibe">{vibeCopy(rank)}</p> : null}
                <RankSelect
                  value={rank}
                  disabled={submitted}
                  taken={taken}
                  label={card.label}
                  onChange={(next) => pickRank(card.id, next)}
                />
                <button
                  type="button"
                  className={`hotel-card ${selected ? "is-selected" : ""} ${rank == null ? "is-waiting" : ""}`}
                  onClick={() => lockCard(card.id)}
                  aria-pressed={selected}
                  aria-label={
                    selected
                      ? `${card.label}, locked at ${rank}`
                      : rank == null
                        ? `${card.label}, pick a feature first`
                        : `Lock in ${card.label} at ${rank}`
                  }
                >
                  <img src={card.src} alt="" draggable="false" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
