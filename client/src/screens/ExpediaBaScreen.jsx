import { useSession } from "../hooks/useSession.js";

export default function ExpediaBaScreen() {
  const { state, actions } = useSession({ syncOnly: true });
  const canReveal = state.phase === "reveal";

  return (
    <main className="expedia-ba">
      <button
        type="button"
        className="expedia-ba__btn expedia-ba__btn--reveal"
        disabled={!canReveal}
        onClick={() => actions.shake()}
      >
        Reveal
      </button>
      <button
        type="button"
        className="expedia-ba__btn expedia-ba__btn--restart"
        onClick={() => actions.reset()}
      >
        Restart
      </button>
    </main>
  );
}
