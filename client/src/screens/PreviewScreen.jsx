import { useEffect, useRef, useState } from "react";
import { CANVAS_W, CANVAS_H } from "../canvas.js";
import ExpediaRestartButton from "../components/ExpediaRestartButton.jsx";
import { useSession } from "../hooks/useSession.js";

const FRAME_WIDTH = CANVAS_W;
const FRAME_HEIGHT = CANVAS_H;
const FRAME_GAP = 28;
const LABEL_HEIGHT = 28;

export default function PreviewScreen() {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(0.35);
  const { actions } = useSession({ syncOnly: true });

  useEffect(() => {
    const fit = () => {
      const width = stageRef.current?.clientWidth || window.innerWidth;
      const height = (stageRef.current?.clientHeight || window.innerHeight) - LABEL_HEIGHT;
      const next = Math.min(height / FRAME_HEIGHT, (width - FRAME_GAP) / (FRAME_WIDTH * 2));
      setScale(Math.max(0.18, next));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const frameStyle = {
    "--scale": String(scale),
    width: FRAME_WIDTH * scale,
    height: LABEL_HEIGHT + FRAME_HEIGHT * scale,
  };

  return (
    <div className="preview">
      <div className="preview__stage" ref={stageRef}>
        <div className="preview__pair">
          <div className="preview__frame" style={frameStyle}>
            <p>Screen A · Control</p>
            <iframe title="Screen A" src="/control" />
          </div>
          <div className="preview__frame" style={frameStyle}>
            <p>Screen B · Display</p>
            <iframe title="Screen B" src="/display" />
          </div>
        </div>
      </div>
      <ExpediaRestartButton onRestart={actions.reset} />
    </div>
  );
}
