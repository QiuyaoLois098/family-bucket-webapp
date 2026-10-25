import { useState } from "react";
import copy from "../../data/vrbo-v2/copy.json";
import preferences from "../../data/vrbo-v2/preferences.json";
import { ratingWord, stayTypeLine } from "@shared/vrboStayCopy.js";

const preferenceById = new Map(preferences.map((preference) => [preference.id, preference]));

function PropertyImage({ property }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="vrbo-v2-property__image" style={{ background: property.gradient }}>
      {failed ? null : (
        <img src={property.image} alt={property.name} onError={() => setFailed(true)} />
      )}
    </div>
  );
}

export default function PropertyCard({
  property,
  title = null,
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

  if (variant === "chat") {
    const word = ratingWord(property.rating, copy);
    return (
      <div className={className}>
        <div className="vrbo-v2-staycard">
          <div className="vrbo-v2-staycard__media">
            <PropertyImage property={property} />
            <span className="vrbo-v2-staycard__heart" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 20.4 4.9 13.6a4.6 4.6 0 0 1 0-6.5 4.5 4.5 0 0 1 6.4 0l.7.7.7-.7a4.5 4.5 0 0 1 6.4 0 4.6 4.6 0 0 1 0 6.5L12 20.4Z" />
              </svg>
            </span>
          </div>
          <div className="vrbo-v2-staycard__body">
            <div className="vrbo-v2-staycard__top">
              {property.beachLine ? (
                <p className="vrbo-v2-staycard__kicker">{property.beachLine}</p>
              ) : null}
              <h4 className="vrbo-v2-staycard__title">{title || property.name}</h4>
              <p className="vrbo-v2-staycard__meta">{stayTypeLine(property)}</p>
            </div>
            <div className="vrbo-v2-staycard__bottom">
              <span className="vrbo-v2-staycard__rating">
                <span className="vrbo-v2-staycard__score">{property.rating}</span>
                {word ? <span className="vrbo-v2-staycard__word">{word}</span> : null}
              </span>
              {property.nightly ? (
                <span className="vrbo-v2-staycard__price">{property.nightly} / night</span>
              ) : null}
            </div>
          </div>
        </div>
        <p className="vrbo-v2-property__shared">{copy.chat.sharedCard}</p>
      </div>
    );
  }

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
        <p className="vrbo-v2-property__meta">
          <span>{property.nightly} / night</span>
          <span>{property.beds || property.sleeps}</span>
        </p>
      </div>
      {badge ? <span className="vrbo-v2-property__badge">{badge}</span> : null}
      {selected ? <span className="vrbo-v2-property__check" aria-hidden="true">✓</span> : null}
    </Tag>
  );
}
