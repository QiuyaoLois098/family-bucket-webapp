import { useEffect, useState } from "react";
import copy from "../../data/vrbo-v2/copy.json";

function StayImage({ property, className }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={className} style={{ background: property.gradient }}>
      {failed ? null : (
        <img
          src={property.image}
          alt=""
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

/** Display 2 touchscreen - tap a stay to preview, then share. */
export function StayShowcase({
  results,
  previewPropertyId,
  selectedPropertyId,
  onPreview,
  onShare,
}) {
  const shared = Boolean(selectedPropertyId);
  const activeId = selectedPropertyId ?? previewPropertyId ?? results[0]?.property.id;
  const index = Math.max(
    0,
    results.findIndex((entry) => entry.property.id === activeId),
  );
  const { property } = results[index] ?? results[0];

  useEffect(() => {
    if (!results.length || previewPropertyId != null || selectedPropertyId != null) return;
    onPreview?.(results[0].property.id);
  }, [results, previewPropertyId, selectedPropertyId, onPreview]);

  if (!results.length || !property) return null;

  function handleThumb(propertyId) {
    if (shared) return;
    onPreview?.(propertyId);
  }

  return (
    <div className="vrbo-v2-showcase">
      <div className="vrbo-v2-showcase__top">
        <img
          className="vrbo-v2-showcase__logo"
          src="/logo/Vrbo_Logo_Blue_RGB.png"
          alt="Vrbo"
          draggable={false}
        />
        <h2 className="vrbo-v2-showcase__title">{copy.ranking.resultsTitle}</h2>
      </div>

      <StayImage property={property} className="vrbo-v2-showcase__hero" />

      <div className="vrbo-v2-showcase__info">
        <h3 className="vrbo-v2-showcase__name">{property.name}</h3>
        <p className="vrbo-v2-showcase__about">{property.about}</p>
        <p className="vrbo-v2-showcase__rating">
          {property.rating} {property.ratingLabel} · {property.location}
        </p>
        <p className="vrbo-v2-showcase__stats">
          {property.bedrooms} · {property.sleeps} · {property.nightly} / night
        </p>
        <p className="vrbo-v2-showcase__highlights">
          {(property.highlights ?? []).join(" · ")}
        </p>
      </div>

      <div className="vrbo-v2-showcase__thumbs" role="listbox" aria-label="Stays">
        {results.map((entry) => {
          const active = entry.property.id === property.id;
          return (
            <button
              key={entry.property.id}
              type="button"
              role="option"
              className={`vrbo-v2-showcase__thumb ${active ? "is-active" : ""}`}
              disabled={shared}
              aria-label={entry.property.name}
              aria-selected={active}
              onClick={() => handleThumb(entry.property.id)}
            >
              <StayImage property={entry.property} className="vrbo-v2-showcase__thumb-img" />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="vrbo-v2-showcase__share"
        disabled={shared}
        onClick={() => onShare?.(property.id)}
      >
        {shared ? copy.ranking.shared : copy.ranking.share}
      </button>

      <div className="vrbo-v2-showcase__foot">
        <p className="vrbo-v2-showcase__hint">
          {shared ? copy.ranking.resultsPickedSubtitle : copy.ranking.resultsHint}
        </p>
        <p className="vrbo-v2-showcase__disclaimer">{copy.ranking.resultsDisclaimer}</p>
      </div>
    </div>
  );
}
