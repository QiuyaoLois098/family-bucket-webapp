import { useRef } from "react";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

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

  const pullHandlers = {
    onClick: unlock,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };

  return (
    <div className="reveal-step">
      <ExpediaBrandBar />

      <div className="reveal-step__body">
        <h1 className="reveal-step__title">
          Your family trip
          <br />
          starts here
        </h1>

        <p className="reveal-step__hint">
          Pull up the suitcase handle to generate your personalized five-day
          itinerary.
        </p>

        <button
          type="button"
          className="reveal-step__pull"
          aria-label="Pull up the suitcase handle to reveal your itinerary"
          {...pullHandlers}
        >
          <img
            className="reveal-step__arrow"
            src="/images/Expedia-images/up-arrow.png"
            alt=""
            draggable="false"
          />
        </button>

        <div className="reveal-step__luggage-slot">
          <img
            className="reveal-step__luggage"
            src="/images/Expedia-images/luggage.png"
            alt=""
            draggable="false"
            {...pullHandlers}
          />
        </div>
      </div>
    </div>
  );
}
