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
const BUILDING_LEFT_REF = "/images/Expedia-images/example/left/left-card.png";
const ITINERARY_REF = "/images/Expedia-images/example/itinerary.png";
const LUGGAGE_REF = "/images/Expedia-images/example/luggage.png";
const BUILDING_RIGHT_REF = "/images/Expedia-images/example/building-right.png";
const RIGHT_IDLE_REF = "/images/Expedia-images/example/right/1.png";

/** Family Bucket screens in a locked 2160×3840 (9∶16) stage, like /vrbo-left. */

function PortraitFrame({ title, src, className = "" }) {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return undefined;

    const fit = () => {
      const width = node.clientWidth || 1;
      const height = node.clientHeight || 1;
      // Cover the frame (not just width-fit) so subpixel rounding can't leave a
      // 1px white strip on the right/bottom edge of the locked canvas.
      const next = Math.max(width / CANVAS_W, height / CANVAS_H);
      setScale(next * 1.002);
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

function leftReference(phase, currentQuestion) {
  const questionRef =
    phase === "questions" && currentQuestion >= 2
      ? QUESTION3_REF
      : phase === "questions" && currentQuestion >= 1
        ? QUESTION2_REF
        : QUESTION_REF;

  if (phase === "destination") {
    return { src: DESTINATION_REF, caption: "Reference · destination" };
  }
  if (phase === "briefing") {
    return { src: BRIEFING_REF, caption: "Reference · briefing" };
  }
  if (phase === "reveal") {
    return { src: ANSWER3_REF, caption: "Reference · Q3 answer" };
  }
  if (phase === "building") {
    return { src: BUILDING_LEFT_REF, caption: "Reference · building" };
  }
  if (phase === "itinerary") {
    return { src: ITINERARY_REF, caption: "Reference · itinerary" };
  }
  return {
    src: questionRef,
    caption:
      currentQuestion >= 2
        ? "Reference · question 3"
        : currentQuestion >= 1
          ? "Reference · question 2"
          : "Reference · question",
  };
}

function rightReference(phase) {
  if (phase === "reveal") {
    return { src: LUGGAGE_REF, caption: "Reference · luggage" };
  }
  if (phase === "building") {
    return { src: BUILDING_RIGHT_REF, caption: "Reference · building" };
  }
  if (phase === "itinerary") {
    return { src: ITINERARY_REF, caption: "Reference · itinerary" };
  }
  return { src: RIGHT_IDLE_REF, caption: "Reference · idle" };
}

/** Screen A · Control — prod full-bleed; `compareLayout` = live + reference. */
export function ExpediaLeftPage({ compareLayout = false } = {}) {
  const { state, actions } = useSession({ syncOnly: true });
  const phase = state.phase === "idle" ? "destination" : state.phase;
  const reference = leftReference(phase, state.currentQuestion);

  const live = (
    <PortraitFrame title={`Expedia · Control · ${phase}`} src="/control" />
  );

  if (!compareLayout) {
    return (
      <div className="expedia-portrait">
        <div className="expedia-portrait__stage">{live}</div>
      </div>
    );
  }

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
      <div className="expedia-portrait__stage expedia-portrait__stage--compare">
        <div className="expedia-portrait__column">
          {live}
          <p className="expedia-portrait__caption">Live · /control</p>
        </div>
        <div className="expedia-portrait__column">
          <ReferenceFrame src={reference.src} />
          <p className="expedia-portrait__caption">{reference.caption}</p>
        </div>
      </div>
      <ExpediaRestartButton onRestart={actions.reset} />
    </div>
  );
}

/** Screen B · Display — prod full-bleed; `compareLayout` = live + reference. */
export function ExpediaRightPage({ compareLayout = false } = {}) {
  const { state, actions } = useSession({ syncOnly: true });
  const phase = state.phase === "idle" ? "destination" : state.phase;
  const reference = rightReference(phase);

  const live = <PortraitFrame title="Expedia · Display" src="/display" />;

  if (!compareLayout) {
    return (
      <div className="expedia-portrait">
        <div className="expedia-portrait__stage">{live}</div>
      </div>
    );
  }

  return (
    <div className="expedia-portrait expedia-portrait--compare">
      <div className="expedia-portrait__stage expedia-portrait__stage--compare">
        <div className="expedia-portrait__column">
          {live}
          <p className="expedia-portrait__caption">Live · /display</p>
        </div>
        <div className="expedia-portrait__column">
          <ReferenceFrame src={reference.src} />
          <p className="expedia-portrait__caption">{reference.caption}</p>
        </div>
      </div>
      <ExpediaRestartButton onRestart={actions.reset} />
    </div>
  );
}
