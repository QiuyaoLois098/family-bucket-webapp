import { useSession } from "../hooks/useSession.js";
import "../styles/expedia-ba.css";

/** BA remote — isolated Reveal + Restart controls (not product UI). */
export default function ExpediaBaScreen() {
  const { state, actions } = useSession({ syncOnly: true });
  const canReveal = state.phase === "reveal";

  return (
    <main className="eba">
      <button
        type="button"
        className="eba__btn eba__btn--reveal"
        disabled={!canReveal}
        onClick={() => actions.shake()}
      >
        Reveal
      </button>
      <button
        type="button"
        className="eba__btn eba__btn--restart"
        onClick={() => actions.reset()}
      >
        Restart
      </button>
    </main>
  );
}
