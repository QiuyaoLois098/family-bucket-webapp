/** Bottom-left restart for Expedia Family Bucket pages. */
export default function ExpediaRestartButton({ onRestart }) {
  return (
    <button type="button" className="expedia-restart" onClick={onRestart}>
      Restart demo
    </button>
  );
}
