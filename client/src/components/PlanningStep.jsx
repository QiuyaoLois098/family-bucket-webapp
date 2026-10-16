import { getDestination } from "@shared/destinations.js";
import ExpediaBrandBar from "./ExpediaBrandBar.jsx";

export default function PlanningStep({ destinationId }) {
  const destination = getDestination(destinationId);
  const place = destination?.shortTitle || "your destination";

  return (
    <div className="planning">
      <ExpediaBrandBar />

      <div className="planning__body">
        <p className="planning__eyebrow">Activity Planner</p>
        <h1>
          Bringing your
          <br />
          family day together.
        </h1>
        <p className="planning__lede">A day in {place}, shaped around your family</p>
        <div className="planning__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <footer className="planning__footer">
        <p>Planning your family adventure</p>
      </footer>
    </div>
  );
}
