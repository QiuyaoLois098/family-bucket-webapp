export default function ResetControl({ onReset }) {
  return (
    <button type="button" className="reset-control" onClick={onReset}>
      Reset
    </button>
  );
}
