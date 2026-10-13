import { useEffect, useRef, useState } from "react";
import { CANVAS_W, CANVAS_H } from "../canvas.js";
import ExpediaRestartButton from "../components/ExpediaRestartButton.jsx";
import { useSession } from "../hooks/useSession.js";

const DESTINATION_REF = "/images/Expedia-images/example/start.png";
const BRIEFING_REF = "/images/Expedia-images/example/briefing.png";
const QUESTION_REF = "/images/Expedia-images/example/expedia-question.png";
const QUESTION2_REF = "/images/Expedia-images/example/question2.png";
const QUESTION3_REF = "/images/Expedia-images/example/question3.png";
const ANSWER3_REF = "/images/Expedia-images/example/03-answer.png";
const BUILDING_LEFT_REF = "/images/Expedia-images/example/building-left.png";
const ITINERARY_REF = "/images/Expedia-images/example/itinerary.png";

/** Family Bucket screens in a locked 2160×3840 (9∶16) stage, like /vrbo-left. */

function PortraitFrame({ title, src, className = "" }) {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return undefined;

    const fit = () => {
      const width = node.clientWidth || 1;
      setScale(width / CANVAS_W);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    window.addEventListener("resize", fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className={`expedia-portrait__frame ${className}`.trim()}
      aria-label={`${CANVAS_W}×${CANVAS_H}`}
    >
      <iframe
        title={title}
        src={src}
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}

function ReferenceFrame({ src }) {
  return (
    <div
      className="expedia-portrait__frame expedia-portrait__frame--reference"
      aria-label="Design reference"
    >
      <img
        className="expedia-portrait__reference"
        src={src}
        alt="UI design reference"
        draggable={false}
      />
    </div>
  );
}

/** Screen A · Control — live UI + same-size design reference beside it. */
export function ExpediaLeftPage() {
  const { state, actions } = useSession({ syncOnly: true });
  const phase = state.phase === "idle" ? "destination" : state.phase;
  const questionRef =
    phase === "questions" && state.currentQuestion >= 2
      ? QUESTION3_REF
      : phase === "questions" && state.currentQuestion >= 1
        ? QUESTION2_REF
        : QUESTION_REF;
  const referenceSrc =
    phase === "destination"
      ? DESTINATION_REF
      : phase === "briefing"
        ? BRIEFING_REF
        : phase === "reveal"
          ? ANSWER3_REF
          : phase === "building"
            ? BUILDING_LEFT_REF
            : phase === "itinerary"
              ? ITINERARY_REF
              : questionRef;
  const referenceCaption =
    phase === "destination"
      ? "Reference · destination"
      : phase === "briefing"
        ? "Reference · briefing"
        : phase === "reveal"
          ? "Reference · Q3 answer"
          : phase === "building"
            ? "Reference · building"
            : phase === "itinerary"
              ? "Reference · itinerary"
              : state.currentQuestion >= 2
                ? "Reference · question 3"
                : state.currentQuestion >= 1
                  ? "Reference · question 2"
                  : "Reference · question";

  return (
    <div className="expedia-portrait expedia-portrait--compare">
      <div className="expedia-portrait__dev" aria-label="Dev phase jumps">
        <span className="expedia-portrait__dev-label">Dev</span>
        <button
          type="button"
          className={phase === "reveal" ? "is-active" : undefined}
          onClick={() => actions.debugJump("luggage")}
        >
          Luggage
        </button>
        <button
          type="button"
          className={phase === "building" ? "is-active" : undefined}
          onClick={() => actions.debugJump("building")}
        >
          Building
        </button>
        <button
          type="button"
          className={phase === "itinerary" ? "is-active" : undefined}
          onClick={() => actions.debugJump("itinerary")}
        >
          Itinerary
        </button>
      </div>
      {phase === "reveal" || phase === "building" ? (
        <div className="expedia-portrait__stage expedia-portrait__stage--compare">
          <div className="expedia-portrait__column">
            <PortraitFrame
              title={`Expedia · Control · ${phase}`}
              src="/control"
            />
            <p className="expedia-portrait__caption">
              {phase === "reveal"
                ? "Live · left · Q3 answer"
                : "Live · left · building-left"}
            </p>
          </div>
          <div className="expedia-portrait__column">
            <PortraitFrame
              title={`Expedia · Display · ${phase}`}
              src="/display"
            />
            <p className="expedia-portrait__caption">
              {phase === "reveal"
                ? "Live · right · luggage"
                : "Live · right · building-right"}
            </p>
          </div>
        </div>
      ) : (
        <div className="expedia-portrait__stage expedia-portrait__stage--compare">
          <div className="expedia-portrait__column">
            <PortraitFrame title="Expedia · Control" src="/control" />
            <p className="expedia-portrait__caption">Live · /control</p>
          </div>
          <div className="expedia-portrait__column">
            <ReferenceFrame src={referenceSrc} />
            <p className="expedia-portrait__caption">{referenceCaption}</p>
          </div>
        </div>
      )}
      <ExpediaRestartButton onRestart={actions.reset} />
    </div>
  );
}

/** Screen B · Display */
export function ExpediaRightPage() {
  const { actions } = useSession({ syncOnly: true });

  return (
    <div className="expedia-portrait">
      <div className="expedia-portrait__stage">
        <PortraitFrame title="Expedia · Display" src="/display" />
      </div>
      <ExpediaRestartButton onRestart={actions.reset} />
    </div>
  );
}
