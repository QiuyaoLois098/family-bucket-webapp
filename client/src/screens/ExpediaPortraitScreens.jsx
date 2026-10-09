import { useEffect, useRef, useState } from "react";

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const QUESTION_REF =
  "/images/Expedia-images/example/expedia-question.png";

/** Family Bucket screens in a locked 1080×1920 (9∶16) stage, like /vrbo-left. */

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
  return (
    <div className="expedia-portrait expedia-portrait--compare">
      <div className="expedia-portrait__stage expedia-portrait__stage--compare">
        <div className="expedia-portrait__column">
          <PortraitFrame title="Expedia · Control" src="/control" />
          <p className="expedia-portrait__caption">Live · /control</p>
        </div>
        <div className="expedia-portrait__column">
          <ReferenceFrame src={QUESTION_REF} />
          <p className="expedia-portrait__caption">Reference · question</p>
        </div>
      </div>
    </div>
  );
}

/** Screen B · Display */
export function ExpediaRightPage() {
  return (
    <div className="expedia-portrait">
      <div className="expedia-portrait__stage">
        <PortraitFrame title="Expedia · Display" src="/display" />
      </div>
    </div>
  );
}
