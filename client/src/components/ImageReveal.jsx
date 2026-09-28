import { getBlurPx, getRevealScale } from "@shared/index.js";
import { getDestination } from "@shared/destinations.js";
import { useCrossfadeImage } from "../hooks/useCrossfadeImage.js";

export default function ImageReveal({ state }) {
  const destination = getDestination(state.destination);
  const url = state.imageUrl || destination?.image;
  const { shown, next, nextVisible } = useCrossfadeImage(url);
  const done = state.phase === "planning" || state.phase === "reveal" || state.phase === "itinerary";
  const blur = done ? 0 : getBlurPx(state.answers.length);
  const scale = done ? 1 : getRevealScale(state.answers.length);
  const sharp = blur === 0;

  const layerStyle = (backgroundImage) => ({
    backgroundImage,
    filter: `blur(${blur}px)`,
    transform: `scale(${scale})`,
  });

  return (
    <div className={`image-reveal ${sharp ? "is-sharp" : ""}`}>
      <div
        className="image-reveal__layer is-shown"
        style={layerStyle(shown ? `url(${shown})` : destination?.palette.wash)}
      />
      {next ? (
        <div
          className={`image-reveal__layer is-incoming ${nextVisible ? "is-visible" : ""}`}
          style={layerStyle(`url(${next})`)}
        />
      ) : null}
      <div className="image-reveal__grade" />
      {destination && state.phase !== "itinerary" ? (
        <div className="image-reveal__caption">
          {state.phase === "reveal" ? (
            <h2>Your family itinerary is ready</h2>
          ) : state.phase === "planning" ? (
            <h2>Bringing your family day together</h2>
          ) : (
            <>
              <p className="eyebrow">{destination.location}</p>
              <h2>{destination.shortTitle}</h2>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
