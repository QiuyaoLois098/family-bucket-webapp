import { useEffect, useRef, useState } from "react";
import copy from "../../data/vrbo-v2/copy.json";
import { vrboMotion } from "./vrboMotion.js";

const STAY_CROSSFADE_MS = 480;

function StayImage({ property, className, style }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={className}
      /* Use CSS var — inline background overrides stylesheet and hides seam fixes. */
      style={{ "--stay-image-fallback": property.gradient, ...style }}
    >
      {failed ? null : (
        <img
          src={property.image}
          alt=""
          draggable={false}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function GuestRatingBadge({ rating, label }) {
  return (
    <div className="vrbo-v2-showcase__badge" aria-label={`${rating} ${label}`}>
      <img
        className="vrbo-v2-showcase__badge-ring"
        src="/images/Vrbo-Images/score.png"
        alt=""
        draggable={false}
        aria-hidden="true"
      />
      <strong>{rating}</strong>
    </div>
  );
}

function padIndex(index) {
  return String(index + 1).padStart(2, "0");
}

function useStayCrossfade(property) {
  const [incoming, setIncoming] = useState(property);
  const [outgoing, setOutgoing] = useState(null);
  const incomingRef = useRef(property);
  const timerRef = useRef(0);

  useEffect(() => {
    if (!property) return undefined;
    if (property.id === incomingRef.current?.id) {
      incomingRef.current = property;
      setIncoming(property);
      return undefined;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      incomingRef.current = property;
      setIncoming(property);
      setOutgoing(null);
      return undefined;
    }

    const previous = incomingRef.current;
    incomingRef.current = property;
    setOutgoing(previous);
    setIncoming(property);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setOutgoing(null);
    }, STAY_CROSSFADE_MS);

    return () => window.clearTimeout(timerRef.current);
  }, [property]);

  return { incoming, outgoing };
}

function StayDetails({ property }) {
  const stats = [property.bedrooms, property.sleeps, `${property.nightly} / night`]
    .filter(Boolean)
    .join(" · ");
  const reviews = property.thumbReviews || copy.ranking.reviewsFallback || "128 reviews";
  const highlights =
    property.highlightsText || (property.highlights ?? []).join(", ");

  return (
    <>
      <div className="vrbo-v2-showcase__heading">
        <h3 className="vrbo-v2-showcase__name">{property.name}</h3>
        <p className="vrbo-v2-showcase__stats">{stats}</p>
      </div>

      <div className="vrbo-v2-showcase__cards">
        <section className="vrbo-v2-showcase__card vrbo-v2-showcase__card--loved">
          <h4>{copy.ranking.lovedByGuests || "Loved by Guests"}</h4>
          <p className="vrbo-v2-showcase__reviews">{reviews}</p>
          <GuestRatingBadge
            rating={property.rating}
            label={property.ratingLabel || copy.ranking.guestRatingLabel}
          />
        </section>

        <section className="vrbo-v2-showcase__card vrbo-v2-showcase__card--highlights">
          <h4>{copy.ranking.highlightsLabel}</h4>
          <p className="vrbo-v2-showcase__highlights-text">{highlights}</p>
        </section>
      </div>
    </>
  );
}

function buildResultsHeadline(priorities = []) {
  const phrases = copy.ranking.headlinePhrases ?? {};
  const firstId = priorities[0];
  const feature =
    (firstId && phrases[firstId]) || copy.ranking.resultsTitleFallback || "pool days";
  return String(copy.ranking.resultsTitle ?? "Hawaii stays for {feature}.").replaceAll(
    "{feature}",
    feature,
  );
}

/** Display 2 — pick among the 3 recommended stays, then share to the group. */
export function StayShowcase({
  results,
  priorities = [],
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
  const entry = results[index] ?? results[0];
  const property = entry?.property;

  useEffect(() => {
    if (!results.length || previewPropertyId != null || selectedPropertyId != null) return;
    onPreview?.(results[0].property.id);
  }, [results, previewPropertyId, selectedPropertyId, onPreview]);

  const { incoming, outgoing } = useStayCrossfade(property);
  const fading = Boolean(outgoing);

  if (!results.length || !property || !incoming) return null;

  function handleThumb(propertyId) {
    if (shared) return;
    onPreview?.(propertyId);
  }

  return (
    <div className={`vrbo-v2-showcase${shared ? " is-shared" : ""}`}>
      {/* One stack so hero can overlap masthead bottom — no grid-track seam */}
      <div className="vrbo-v2-showcase__top">
        <header className="vrbo-v2-showcase__masthead">
          <img
            className="vrbo-v2-showcase__logo is-scene-enter"
            src="/logo/Vrbo_Logo_Sail_RGB.png"
            alt="Vrbo"
            draggable={false}
            style={{ "--scene-delay": "0ms", "--scene-y": "17px", "--scene-duration": "750ms" }}
          />
          {/* Handoff resultParts stagger: +300 then +180 each · 750ms · Y20 */}
          <p
            className="vrbo-v2-showcase__headline is-scene-enter"
            style={{ "--scene-delay": "300ms", "--scene-y": "20px", "--scene-duration": "750ms" }}
          >
            {buildResultsHeadline(priorities)}
          </p>
        </header>
        <div
          className="vrbo-v2-showcase__hero is-scene-enter"
          style={{
            "--scene-delay": "0ms",
            "--scene-y": "0px",
            "--scene-duration": "750ms",
            "--stay-crossfade": `${STAY_CROSSFADE_MS}ms`,
            "--stay-crossfade-ease": vrboMotion.softEase,
          }}
        >
          {outgoing ? (
            <StayImage
              property={outgoing}
              className="vrbo-v2-showcase__hero-layer is-out"
            />
          ) : null}
          <StayImage
            property={incoming}
            className={`vrbo-v2-showcase__hero-layer${fading ? " is-in" : ""}`}
          />
        </div>
      </div>

      <div
        className="vrbo-v2-showcase__body is-scene-enter"
        style={{
          "--scene-delay": "480ms",
          "--scene-y": "20px",
          "--scene-duration": "750ms",
          "--stay-crossfade": `${STAY_CROSSFADE_MS}ms`,
          "--stay-crossfade-ease": vrboMotion.softEase,
        }}
      >
        <div className="vrbo-v2-showcase__copy">
          {outgoing ? (
            <div className="vrbo-v2-showcase__copy-layer is-out">
              <StayDetails property={outgoing} />
            </div>
          ) : null}
          <div className={`vrbo-v2-showcase__copy-layer${fading ? " is-in" : ""}`}>
            <StayDetails property={incoming} />
          </div>
        </div>
      </div>

      <div
        className="vrbo-v2-showcase__thumbs is-scene-enter"
        role="listbox"
        aria-label="Stays"
        style={{ "--scene-delay": "660ms", "--scene-y": "20px", "--scene-duration": "750ms" }}
      >
        {results.map((item, thumbIndex) => {
          const active = item.property.id === property.id;
          const thumb = item.property;
          return (
            <button
              key={thumb.id}
              type="button"
              role="option"
              className={`vrbo-v2-showcase__thumb${active ? " is-active" : ""}`}
              disabled={shared}
              aria-label={thumb.name}
              aria-selected={active}
              onClick={() => handleThumb(thumb.id)}
            >
              <StayImage property={thumb} className="vrbo-v2-showcase__thumb-img" />
              <span className="vrbo-v2-showcase__thumb-badge">{padIndex(thumbIndex)}</span>
            </button>
          );
        })}
      </div>

      <div
        className="vrbo-v2-showcase__actions is-scene-enter"
        style={{ "--scene-delay": "840ms", "--scene-y": "20px", "--scene-duration": "750ms" }}
      >
        <button
          type="button"
          className="vrbo-v2-showcase__share"
          disabled={shared}
          onClick={() => onShare?.(property.id)}
        >
          {shared ? copy.ranking.shared : copy.ranking.share}
        </button>
      </div>
    </div>
  );
}
