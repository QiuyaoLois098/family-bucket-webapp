import { useState } from "react";
import { getBlurPx, getRevealScale } from "@shared/index.js";
import { getDestination } from "@shared/destinations.js";
import {
  getDestinationScript,
  resolveDisplayImage,
} from "@shared/scripts/index.js";
import { useCrossfadeImage } from "../hooks/useCrossfadeImage.js";
import FrostReveal from "./FrostReveal.jsx";

export default function ImageReveal({ state }) {
  const destination = getDestination(state.destination);
  const script = getDestinationScript(state.destination);
  const fromScript = resolveDisplayImage(script, state, destination);
  const url =
    fromScript || state.imageUrl || destination?.heroImage || destination?.image;
  const { shown, next, nextVisible } = useCrossfadeImage(url);
  const answerCount = state.answers?.length ?? 0;
  const frostPhase =
    state.phase === "briefing" ||
    state.phase === "questions" ||
    state.phase === "planning";
  const done =
    state.phase === "planning" ||
    state.phase === "reveal" ||
    state.phase === "itinerary";
  const [frostLive, setFrostLive] = useState(false);
  const useFrost = frostPhase && !!url;
  const hideCssPhoto = useFrost && frostLive;
  const blur = done || hideCssPhoto ? 0 : getBlurPx(answerCount);
  const scale = done || hideCssPhoto ? 1 : getRevealScale(answerCount);
  const sharp = blur === 0;
  const place = destination?.tripLabel || destination?.shortTitle || "";

  const layerStyle = (backgroundImage) => ({
    backgroundImage,
    filter: `blur(${blur}px)`,
    transform: `scale(${scale})`,
    opacity: hideCssPhoto ? 0 : undefined,
  });

  return (
    <div
      className={`image-reveal${sharp ? " is-sharp" : ""}${
        useFrost ? " image-reveal--frost" : ""
      }`}
    >
      <div
        className="image-reveal__layer is-shown"
        style={layerStyle(shown ? `url(${shown})` : destination?.palette?.wash)}
      />
      {next ? (
        <div
          className={`image-reveal__layer is-incoming ${
            nextVisible ? "is-visible" : ""
          }`}
          style={layerStyle(`url(${next})`)}
        />
      ) : null}
      {useFrost ? (
        <FrostReveal
          imageUrl={url}
          answerCount={Math.min(3, answerCount)}
          onLiveChange={setFrostLive}
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
