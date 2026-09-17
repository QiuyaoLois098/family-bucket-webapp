import { getBlurPx } from "@shared/index.js";
import { getDestination } from "@shared/destinations.js";
import { useCrossfadeImage } from "../hooks/useCrossfadeImage.js";

export default function ImageReveal({ state }) {
  const destination = getDestination(state.destination);
  const url = state.imageUrl || destination?.image;
  const { shown, next, nextVisible } = useCrossfadeImage(url);
  const blur = state.phase === "reveal" || state.phase === "itinerary" ? 0 : getBlurPx(state.answers.length);
  const sharp = blur === 0;

  return (
    <div className={`image-reveal ${sharp ? "is-sharp" : ""}`}>
      <div
        className="image-reveal__layer is-shown"
        style={{
          backgroundImage: shown ? `url(${shown})` : destination?.palette.wash,
          filter: `blur(${blur}px)`,
        }}
      />
      {next ? (
        <div
          className={`image-reveal__layer is-incoming ${nextVisible ? "is-visible" : ""}`}
          style={{
            backgroundImage: `url(${next})`,
            filter: `blur(${blur}px)`,
          }}
        />
      ) : null}
      <div className="image-reveal__grade" />
      {destination && state.phase !== "itinerary" ? (
        <div className="image-reveal__caption">
          <p className="eyebrow">{destination.location}</p>
          <h2>{destination.shortTitle}</h2>
        </div>
      ) : null}
    </div>
  );
}
