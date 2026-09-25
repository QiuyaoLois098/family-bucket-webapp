import { useEffect, useState } from "react";
import copy from "../../data/vrbo-v2/copy.json";

function fill(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

function padIndex(index) {
  return String(index + 1).padStart(2, "0");
}

function StayImage({ property, className }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={className} style={{ background: property.gradient }}>
      {failed ? null : (
        <img src={property.image} alt={property.name} loading="lazy" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

/** Display 2 - auto-cycles through recommended stays. */
export function StayShowcase({ results, previewPropertyId, selectedPropertyId }) {
  const lockedId = selectedPropertyId ?? null;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!results.length) return undefined;
    if (lockedId != null) {
      const lockedIndex = results.findIndex((entry) => entry.property.id === lockedId);
      if (lockedIndex >= 0) setActiveIndex(lockedIndex);
      return undefined;
    }
    const previewIndex = results.findIndex((entry) => entry.property.id === previewPropertyId);
    if (previewIndex >= 0) setActiveIndex(previewIndex);
    return undefined;
  }, [previewPropertyId, lockedId, results]);

  useEffect(() => {
    if (lockedId != null || results.length < 2) return undefined;
    const id = setInterval(() => {
      setActiveIndex((current) => (current + 1) % results.length);
    }, 4200);
    return () => clearInterval(id);
  }, [lockedId, results.length]);

  if (!results.length) return null;

  const index = Math.min(activeIndex, results.length - 1);
  const { property } = results[index];
  const isJamiePick =
    property.id === (selectedPropertyId ?? previewPropertyId);
  const status = fill(
    isJamiePick ? copy.ranking.resultsStatus : copy.ranking.resultsStatusIdle,
    { index: padIndex(index), total: results.length },
  );

  return (
    <div className="vrbo-v2-showcase">
      <img
        className="vrbo-v2-showcase__logo"
        src="/logo/Vrbo_Logo_Blue_RGB.png"
        alt="Vrbo"
      />
      <h2 className="vrbo-v2-showcase__title">{copy.ranking.resultsTitle}</h2>
      <p className="vrbo-v2-showcase__lede">{copy.ranking.resultsSubtitle}</p>

      <StayImage property={property} className="vrbo-v2-showcase__hero" />

      <h3 className="vrbo-v2-showcase__name">
        {padIndex(index)} {property.name}
      </h3>
      <p className="vrbo-v2-showcase__place">
        {property.location} · {property.tagline}
      </p>

      <div className="vrbo-v2-showcase__cols">
        <div>
          <p className="vrbo-v2-showcase__label">{copy.ranking.aboutLabel}</p>
          <p className="vrbo-v2-showcase__about">{property.about}</p>
        </div>
        <div>
          <p className="vrbo-v2-showcase__label">{copy.ranking.highlightsLabel}</p>
          <ul className="vrbo-v2-showcase__highlights">
            {(property.highlights ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="vrbo-v2-showcase__rating">
        {fill(copy.ranking.ratingLine, {
          rating: property.rating,
          label: property.ratingLabel,
        })}
      </p>

      <p className="vrbo-v2-showcase__stats">
        <span>{property.bedrooms}</span>
        <span>{property.sleeps}</span>
        <span>{property.nightly} / night</span>
      </p>

      <p className="vrbo-v2-showcase__status">{status}</p>

      <div className="vrbo-v2-showcase__thumbs" aria-hidden="true">
        {results.map((entry, thumbIndex) => {
          const active = thumbIndex === index;
          return (
            <div
              key={entry.property.id}
              className={`vrbo-v2-showcase__thumb ${active ? "is-active" : ""}`}
            >
              <StayImage property={entry.property} className="vrbo-v2-showcase__thumb-img" />
              <span>
                {padIndex(thumbIndex)} {entry.property.name}
              </span>
            </div>
          );
        })}
      </div>

      <p className="vrbo-v2-showcase__disclaimer">{copy.ranking.resultsDisclaimer}</p>
    </div>
  );
}

/** Jamie's phone - preview stays and share one to the trip. */
export function StayPicker({
  results,
  previewPropertyId,
  selectedPropertyId,
  onPreview,
  onShare,
  compact = false,
}) {
  if (!results.length) return null;

  const shared = Boolean(selectedPropertyId);
  const activeId = selectedPropertyId ?? previewPropertyId ?? results[0]?.property.id;
  const activeIndex = Math.max(
    0,
    results.findIndex((entry) => entry.property.id === activeId),
  );
  const { property } = results[activeIndex];

  return (
    <div className={`vrbo-v2-picker ${compact ? "vrbo-v2-picker--compact" : ""}`}>
      <img
        className="vrbo-v2-picker__logo"
        src="/logo/Vrbo_Logo_Blue_RGB.png"
        alt="Vrbo"
      />
      <p className="vrbo-v2-picker__meta">
        {fill(copy.stayPicker.meta, { count: results.length })}
      </p>
      <h3 className="vrbo-v2-picker__prompt">{copy.stayPicker.prompt}</h3>

      <div className="vrbo-v2-picker__thumbs">
        {results.map((entry, index) => {
          const selected = entry.property.id === activeId;
          return (
            <button
              key={entry.property.id}
              type="button"
              className={`vrbo-v2-picker__thumb ${selected ? "is-selected" : ""}`}
              disabled={shared}
              onClick={() => onPreview?.(entry.property.id)}
            >
              <StayImage property={entry.property} className="vrbo-v2-picker__thumb-img" />
              <span>
                {selected
                  ? fill(copy.stayPicker.selected, { index: padIndex(index) })
                  : fill(copy.stayPicker.index, { index: padIndex(index) })}
              </span>
            </button>
          );
        })}
      </div>

      <StayImage property={property} className="vrbo-v2-picker__hero" />
      <h4 className="vrbo-v2-picker__name">{property.name}</h4>
      <p className="vrbo-v2-picker__about">{property.about}</p>
      <p className="vrbo-v2-picker__rating">
        {property.rating} {property.ratingLabel} · {property.location}
      </p>
      <p className="vrbo-v2-picker__stats">
        {property.bedrooms} · {property.sleeps} · {property.nightly} / night
      </p>
      <p className="vrbo-v2-picker__highlights">
        {(property.highlights ?? []).join(" · ")}
      </p>

      <button
        type="button"
        className="vrbo-v2-picker__share"
        disabled={shared}
        onClick={() => onShare?.(property.id)}
      >
        {shared ? copy.stayPicker.shared : copy.stayPicker.share}
      </button>

      <nav className="vrbo-v2-picker__nav" aria-label="App">
        <span>{copy.stayPicker.navExplore}</span>
        <span>{copy.stayPicker.navSaved}</span>
        <span>{copy.stayPicker.navTrips}</span>
      </nav>
    </div>
  );
}
