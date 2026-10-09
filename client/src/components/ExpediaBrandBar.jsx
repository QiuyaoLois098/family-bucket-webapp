import "../styles/expedia-brandbar.css";

/** Shared Expedia header used on every Family Bucket screen. */
export default function ExpediaBrandBar({ product = "AI Activity Planner" }) {
  return (
    <header className="expedia-brandbar">
      <img
        className="expedia-brandbar__logo"
        src="/images/Expedia-images/expedia-logo.png"
        alt="Expedia"
      />
      {product ? <span className="expedia-brandbar__product">{product}</span> : null}
    </header>
  );
}
