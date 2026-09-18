import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const FRAME_WIDTH = 1080;
const FRAME_HEIGHT = 1920;
const FRAME_GAP = 28;
const LABEL_HEIGHT = 28;

export default function PreviewScreen() {
  const stageRef = useRef(null);
  const [scale, setScale] = useState(0.35);

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
      <header className="preview__header">
        <div>
          <p className="eyebrow">Installation preview</p>
          <h1>Expedia Interaction Demo</h1>
        </div>
        <nav>
          <Link to="/control" target="_blank" rel="noreferrer">
            Open Screen A
          </Link>
          <Link to="/display" target="_blank" rel="noreferrer">
            Open Screen B
          </Link>
          <Link to="/control?debug=true" target="_blank" rel="noreferrer">
            Debug A
          </Link>
        </nav>
      </header>
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
    </div>
  );
}
