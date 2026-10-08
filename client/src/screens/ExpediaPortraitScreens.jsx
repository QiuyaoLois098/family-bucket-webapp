import { useEffect, useRef, useState } from "react";

const CANVAS_W = 1080;
const CANVAS_H = 1920;

/** Family Bucket screens in a locked 1080×1920 (9∶16) stage, like /vrbo-left. */

function PortraitFrame({ title, src }) {
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
    <div className="expedia-portrait">
      <div className="expedia-portrait__stage">
        <div
          ref={frameRef}
          className="expedia-portrait__frame"
          aria-label={`${CANVAS_W}×${CANVAS_H}`}
        >
          <iframe
            title={title}
            src={src}
            style={{ transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}

/** Screen A · Control */
export function ExpediaLeftPage() {
  return <PortraitFrame title="Expedia · Control" src="/control" />;
}

/** Screen B · Display */
export function ExpediaRightPage() {
  return <PortraitFrame title="Expedia · Display" src="/display" />;
}
