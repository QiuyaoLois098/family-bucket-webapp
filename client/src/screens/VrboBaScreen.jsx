import useVrboV2Session from "../hooks/useVrboV2Session.js";

/** BA remote — single Restart control for the Vrbo v2 experience. */
export default function VrboBaScreen() {
  const { actions } = useVrboV2Session({ syncOnly: true });

  return (
    <main className="vrbo-ba">
      <button
        type="button"
        className="vrbo-ba__btn"
        onClick={() => actions.reset()}
      >
        Restart
      </button>
    </main>
  );
}
