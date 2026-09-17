import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { HOTEL_CARDS, NYC_HOTELS, NYC_RECOMMENDATIONS } from "../projects.js";

export default function NycMapScreen() {
  const canvasRef = useRef(null);
  const markersRef = useRef([]);
  const [picked, setPicked] = useState([]);

  const recommended = useMemo(() => {
    if (picked.length < HOTEL_CARDS.length) return null;
    return NYC_RECOMMENDATIONS.map((id) => NYC_HOTELS.find((hotel) => hotel.id === id)).filter(Boolean);
  }, [picked]);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return undefined;

    const map = L.map(node, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
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
    map.fitBounds(group.getBounds(), {
      paddingTopLeft: [80, 72],
      paddingBottomRight: [80, 240],
      maxZoom: 12.7,
    });
    markersRef.current = markers;

    return () => {
      markersRef.current = [];
      map.remove();
    };
  }, []);

  useEffect(() => {
    const recommendedIds = recommended ? recommended.map((hotel) => hotel.id) : null;
    markersRef.current.forEach((marker, index) => {
      const el = marker.getElement();
      if (!el) return;
      const hotelId = NYC_HOTELS[index].id;
      el.classList.toggle("is-dimmed", Boolean(recommendedIds) && !recommendedIds.includes(hotelId));
      el.classList.toggle("is-picked", Boolean(recommendedIds?.includes(hotelId)));
    });
  }, [recommended]);

  const restart = () => setPicked([]);

  const toggleCard = (id) => {
    if (recommended) return;
    setPicked((current) => (current.includes(id) ? current : [...current, id]));
  };

  return (
    <main className={`nyc-map ${recommended ? "has-list" : ""}`}>
      <div className="nyc-map__canvas" ref={canvasRef} />
      <div className="nyc-map__wash" />
      <div className="nyc-map__vignette" />
      <p className="nyc-map__mark">New York · Hotel Map</p>

      <div className="nyc-map__dock">
        {recommended ? (
          <section className="hotel-list" aria-live="polite">
            <button type="button" className="hotel-list__restart" onClick={restart}>
              Restart
            </button>
            <p className="hotel-list__eyebrow">Your recommendation</p>
            <h2>Four hotels for this trip</h2>
            <ol>
              {recommended.map((hotel) => (
                <li key={hotel.id}>
                  <strong>{hotel.name}</strong>
                  <span>
                    {hotel.neighborhood} · {hotel.reason}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <div className="hotel-cards">
          {HOTEL_CARDS.map((card) => {
            const selected = picked.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                className={`hotel-card ${selected ? "is-selected" : ""}`}
                onClick={() => toggleCard(card.id)}
                aria-pressed={selected}
                aria-label={card.label}
              >
                <img src={card.src} alt={card.label} draggable="false" />
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
