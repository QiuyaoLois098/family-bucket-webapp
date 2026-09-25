export default function DebugPanel({ role, state, connected, actions }) {
  return (
    <aside className="debug-panel">
      <div className="debug-panel__head">
        <strong>Debug · {role}</strong>
        <span className={connected ? "is-on" : "is-off"}>{connected ? "socket live" : "socket down"}</span>
      </div>
      <dl>
        <div>
          <dt>phase</dt>
          <dd>{state.phase}</dd>
        </div>
        <div>
          <dt>destination</dt>
          <dd>{state.destination || "-"}</dd>
        </div>
        <div>
          <dt>question</dt>
          <dd>{state.currentQuestion}</dd>
        </div>
        <div>
          <dt>answers</dt>
          <dd>{state.answers.length ? state.answers.join(", ") : "-"}</dd>
        </div>
        <div>
          <dt>image</dt>
          <dd>
            {state.imageStatus}
            {state.imageReady ? " · ready" : ""}
            {state.imageSource ? ` · ${state.imageSource}` : ""}
          </dd>
        </div>
        <div>
          <dt>itinerary</dt>
          <dd>{state.itineraryStatus}</dd>
        </div>
      </dl>
      <div className="debug-panel__actions">
        <button type="button" onClick={actions.debugSkip}>
          Skip state
        </button>
        <button type="button" onClick={actions.debugSimulateImage}>
          Simulate image
        </button>
        <button type="button" onClick={actions.debugSimulateItinerary}>
          Simulate itinerary
        </button>
        <button type="button" onClick={actions.reset}>
          Reset
        </button>
      </div>
    </aside>
  );
}
