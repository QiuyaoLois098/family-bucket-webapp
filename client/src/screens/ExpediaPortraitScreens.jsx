import { useEffect, useRef, useState } from "react";
import { CANVAS_W, CANVAS_H } from "../canvas.js";
import ExpediaRestartButton from "../components/ExpediaRestartButton.jsx";
import { useSession } from "../hooks/useSession.js";

const LEFT_REF = "/images/Expedia-images/example/left";
const RIGHT_REF = "/images/Expedia-images/example/right";

const LEFT_QA_REFS = [
  {
    question: { src: `${LEFT_REF}/1-q1.png`, caption: "Reference · Q1" },
    reply: { src: `${LEFT_REF}/2-q1-reply.png`, caption: "Reference · Q1 reply" },
  },
  {
    question: { src: `${LEFT_REF}/3-q2.png`, caption: "Reference · Q2" },
    reply: { src: `${LEFT_REF}/4-q2-reply.png`, caption: "Reference · Q2 reply" },
  },
  {
    question: { src: `${LEFT_REF}/5-q3.png`, caption: "Reference · Q3" },
    reply: { src: `${LEFT_REF}/6-q3-reply.png`, caption: "Reference · Q3 reply" },
  },
];

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

function leftQaReference(currentQuestion, answers = []) {
  const step = Math.min(Math.max(currentQuestion ?? 0, 0), LEFT_QA_REFS.length - 1);
  const showingReply = Boolean(answers[step]);
  return showingReply ? LEFT_QA_REFS[step].reply : LEFT_QA_REFS[step].question;
}

function leftReference(phase, currentQuestion, answers = []) {
  if (phase === "destination") {
    return { src: `${LEFT_REF}/start.png`, caption: "Reference · destination" };
  }
  if (phase === "briefing") {
    return { src: `${LEFT_REF}/0-destination.png`, caption: "Reference · intro" };
  }
  if (phase === "reveal" || phase === "planning") {
    return LEFT_QA_REFS[2].reply;
  }
  if (phase === "building") {
    return { src: `${LEFT_REF}/left-card.png`, caption: "Reference · building" };
  }
  if (phase === "itinerary") {
    return { src: `${LEFT_REF}/itinerary.png`, caption: "Reference · itinerary" };
  }
  return leftQaReference(currentQuestion, answers);
}

function rightReference(phase) {
  if (phase === "reveal" || phase === "planning") {
    return { src: `${RIGHT_REF}/luggage.png`, caption: "Reference · luggage" };
  }
  if (phase === "building") {
    return { src: `${RIGHT_REF}/building-right.png`, caption: "Reference · building" };
  }
  if (phase === "itinerary") {
    return {
      src: "/images/Expedia-images/final-right.png",
      caption: "Reference · itinerary",
    };
  }
  if (phase === "destination") {
    return { src: `${RIGHT_REF}/1.png`, caption: "Reference · idle" };
  }
  return { src: `${RIGHT_REF}/option-view.png`, caption: "Reference · planning" };
}

/** Screen A · Control — prod full-bleed; `compareLayout` = live + reference. */
export function ExpediaLeftPage({ compareLayout = false } = {}) {
  const { state, actions } = useSession({ syncOnly: true });
  const phase = state.phase === "idle" ? "destination" : state.phase;
  const reference = leftReference(phase, state.currentQuestion, state.answers);

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
