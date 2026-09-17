import { useEffect, useRef } from "react";
import L from "leaflet";
import { NYC_HOTELS } from "../projects.js";

export default function NycMapScreen() {
  const canvasRef = useRef(null);

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
    map.fitBounds(group.getBounds(), { padding: [90, 140], maxZoom: 12.7 });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <main className="nyc-map">
      <div className="nyc-map__canvas" ref={canvasRef} />
      <div className="nyc-map__wash" />
      <div className="nyc-map__vignette" />
      <p className="nyc-map__mark">New York · Hotel Map</p>
    </main>
  );
}
