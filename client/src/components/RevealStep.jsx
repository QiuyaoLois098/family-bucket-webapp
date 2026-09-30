import { useRef } from "react";

export default function RevealStep({ onReveal }) {
  const startY = useRef(null);
  const triggered = useRef(false);

  const unlock = () => {
    if (triggered.current) return;
    triggered.current = true;
    onReveal?.();
  };

  const onPointerDown = (event) => {
    startY.current = event.clientY;
    triggered.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    if (startY.current == null || triggered.current) return;
    if (startY.current - event.clientY > 48) unlock();
  };

  const onPointerUp = () => {
    startY.current = null;
  };

  return (
    <div className="reveal-step">
      <header className="reveal-step__brandbar">
        <img
          className="reveal-step__logo"
          src="/images/Expedia-images/expedia-logo.png"
          alt="Expedia"
        />
        <span className="reveal-step__product">AI Activity Planner</span>
      </header>

      <h1 className="reveal-step__title">
        Your family
        <br />
        adventure is ready.
      </h1>

      <div className="reveal-step__stage">
        <button
          type="button"
          className="reveal-step__suitcase"
          onClick={unlock}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label="Pull up the suitcase handle to reveal your itinerary"
        >
          <img
            src="/images/Expedia-images/suitcase-guide.png"
            alt=""
            draggable="false"
          />
        </button>

        <p className="reveal-step__hint">
          Pull up the suitcase handle
          <br />
          to reveal your itinerary.
        </p>
      </div>

      <footer className="reveal-step__footer">
        <p>Pull up to reveal ↑</p>
      </footer>
    </div>
  );
}
