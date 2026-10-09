/** Light-theme Expedia header: yellow mark + wordmark + product label. */
export default function ExpediaBrandBar({ product = "AI Activity Planner" }) {
  return (
    <header className="expedia-brandbar">
      <div className="expedia-brandbar__brand" aria-label="Expedia">
        <img
          className="expedia-brandbar__mark"
          src="/images/Expedia-images/expedia-samll.png"
          alt=""
        />
        <span className="expedia-brandbar__name">Expedia</span>
      </div>
      {product ? <span className="expedia-brandbar__product">{product}</span> : null}
    </header>
  );
}
