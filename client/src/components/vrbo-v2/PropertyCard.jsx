import { useState } from "react";
import copy from "../../data/vrbo-v2/copy.json";
import preferences from "../../data/vrbo-v2/preferences.json";

const preferenceById = new Map(preferences.map((preference) => [preference.id, preference]));

function PropertyImage({ property }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="vrbo-v2-property__image" style={{ background: property.gradient }}>
      {failed ? null : (
        <img src={property.image} alt={property.name} loading="lazy" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export default function PropertyCard({
  property,
  variant = "result",
  matched = [],
  matchPercent = null,
  badge = null,
  selected = false,
  dimmed = false,
  onSelect,
}) {
  const interactive = Boolean(onSelect);
  const Tag = interactive ? "button" : "div";
  const className = [
    "vrbo-v2-property",
    `vrbo-v2-property--${variant}`,
    selected ? "is-selected" : "",
    dimmed ? "is-dimmed" : "",
    interactive ? "is-interactive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={className}
      {...(interactive ? { type: "button", "aria-pressed": selected, onClick: () => onSelect(property.id) } : {})}
    >
      <PropertyImage property={property} />
      <div className="vrbo-v2-property__body">
        <div className="vrbo-v2-property__heading">
          <div>
            <p className="vrbo-v2-property__location">{property.location}</p>
            <h4 className="vrbo-v2-property__name">{property.name}</h4>
          </div>
          {matchPercent != null ? (
            <span className="vrbo-v2-property__score">
              <strong>{matchPercent}%</strong>
              <em>{copy.ranking.matchLabel}</em>
            </span>
          ) : null}
        </div>
        <p className="vrbo-v2-property__description">{property.description}</p>
        {matched.length ? (
          <ul className="vrbo-v2-property__tags">
            {matched.map((match) => {
              const preference = preferenceById.get(match.id);
              if (!preference) return null;
              return (
                <li key={match.id}>
                  <span aria-hidden="true">{preference.icon}</span>
                  {preference.label}
                </li>
              );
            })}
          </ul>
        ) : null}
        {variant === "result" ? (
          <p className="vrbo-v2-property__meta">
            <span>{property.nightly} / night</span>
            <span>{property.sleeps}</span>
          </p>
        ) : null}
      </div>
      {badge ? <span className="vrbo-v2-property__badge">{badge}</span> : null}
      {selected ? <span className="vrbo-v2-property__check" aria-hidden="true">✓</span> : null}
    </Tag>
  );
}
