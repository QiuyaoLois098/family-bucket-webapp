import { getBlurPx, getRevealScale } from "@shared/index.js";
import { getDestination } from "@shared/destinations.js";
import {
  getDestinationScript,
  resolveDisplayImage,
} from "@shared/scripts/index.js";
import { useCrossfadeImage } from "../hooks/useCrossfadeImage.js";

export default function ImageReveal({ state }) {
  const destination = getDestination(state.destination);
  const script = getDestinationScript(state.destination);
  const fromScript = resolveDisplayImage(script, state, destination);
  const url = fromScript || state.imageUrl || destination?.image;
  const { shown, next, nextVisible } = useCrossfadeImage(url);
  const done = state.phase === "planning" || state.phase === "reveal" || state.phase === "itinerary";
  const blur = done ? 0 : getBlurPx(state.answers.length);
  const scale = done ? 1 : getRevealScale(state.answers.length);
  const sharp = blur === 0;
  const place = destination?.tripLabel || destination?.shortTitle || "";

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
      {destination && state.phase !== "itinerary" && state.phase !== "reveal" ? (
        <div className="image-reveal__caption">
          {state.phase === "planning" ? (
            <h2>Your family adventure is ready.</h2>
          ) : (
            <>
              <p className="image-reveal__product">Activity Planner</p>
              <h2>{place}</h2>
              <p className="image-reveal__status">
                {state.phase === "questions"
                  ? "Planning your family trip..."
                  : "Starting with what's already booked..."}
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
