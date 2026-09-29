export default function ItineraryView({ destination }) {
  const place = destination?.shortTitle || "Your trip";

  return (
    <div className="finale-art">
      <img
        className="finale-art__image"
        src="/images/Expedia-images/figma-source-15.png"
        alt=""
        draggable="false"
      />
      <div className="finale-art__copy">
        <h2 className="finale-art__title">Your future memories</h2>
        <p className="finale-art__subtitle">{place} · Made for your family</p>
      </div>
    </div>
  );
}
