import { useEffect, useState } from "react";
import chatScript from "../../data/vrbo-v2/chatScript.json";
import copy from "../../data/vrbo-v2/copy.json";
import properties from "../../data/vrbo-v2/properties.json";
import users from "../../data/vrbo-v2/users.json";
import { runChunkTypewriter } from "../../motion/chunkType.js";
import { StayShowcase } from "./StayViews.jsx";

/** Handoff openingHeadline: first enter, then 6s breathe loop (do not restart full open). */
function OpeningHeadline({ className = "", children }) {
  const [phase, setPhase] = useState("enter");

  return (
    <h2
      className={`${className} vrbo-v2-opening-headline is-${phase}`.trim()}
      onAnimationEnd={(event) => {
        if (
          phase === "enter" &&
          String(event.animationName).includes("vrbo-opening-headline-in")
        ) {
          setPhase("loop");
        }
      }}
    >
      {children}
    </h2>
  );
}

const FINALE_BG_SRC = "/images/Vrbo-Images/final-bg.jpg";

const propertyById = new Map(properties.map((property) => [property.id, property]));

function useTypewriter(text) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    const full = text ?? "";
    if (!full) {
      setShown("");
      return undefined;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    return runChunkTypewriter(full, {
      reduceMotion,
      onUpdate: setShown,
    });
  }, [text]);

  return shown;
}

function formatListeningLine(names) {
  if (names.length === 0) return "Listening...";
  if (names.length === 1) return `Listening to ${names[0]}...`;
  if (names.length === 2) return `Listening to ${names[0]} and ${names[1]}...`;
  return `Listening to ${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}...`;
}

function buildListeningLine(joined = {}, displayNames = {}) {
  const names = users
    .filter((user) => user.role === "coordinator" || Boolean(joined[user.id]))
    .map((user) => displayNames[user.id] || user.name);
  return formatListeningLine(names);
}

function WaitingPanel({
  ready,
  title = copy.ranking.loadingTitle,
  subtitle = copy.ranking.loadingSubtitle,
  hint = copy.ranking.loadingHint,
}) {
  return (
    <div
      className={`vrbo-v2-rank__panel vrbo-v2-rank__panel--hero ${
        ready ? "is-loading vrbo-v2-rank__panel--enter" : ""
      }`}
    >
      {ready ? (
        <div className="vrbo-v2-rank__hero-loading">
          <span className="vrbo-v2-rank__spinner" aria-hidden="true" />
          <h2>{title}</h2>
          <p className="vrbo-v2-rank__lede">{subtitle}</p>
          <p className="vrbo-v2-rank__hint">{hint}</p>
        </div>
      ) : (
        <>
          <header className="vrbo-v2-rank__hero-top">
            <img
              className="vrbo-v2-rank__brand-logo is-opening-enter"
              src="/logo/Vrbo_Logo_Sail_RGB.png"
              alt="Vrbo"
            />
          </header>
          <div className="vrbo-v2-rank__hero-mid">
            <OpeningHeadline>
              {copy.ranking.waitingTitleLine1}
              <br />
              {copy.ranking.waitingTitleLine2}
            </OpeningHeadline>
          </div>
        </>
      )}
    </div>
  );
}

export function SummaryPanel({
  summaryText,
  onSearch,
  compact = false,
  joined = {},
  displayNames = {},
}) {
  const listeningLine = buildListeningLine(joined, displayNames);
  const typedText = useTypewriter(summaryText);
  const isTyping = Boolean(summaryText) && typedText.length < summaryText.length;

  return (
    <div className={`vrbo-v2-summary ${compact ? "vrbo-v2-summary--compact" : ""}`}>
      <header className="vrbo-v2-summary__masthead">
        <img
          className="vrbo-v2-summary__brand is-scene-enter"
          src="/logo/Vrbo_Logo_Sail_RGB.png"
          alt={copy.summary.brand}
          style={{ "--scene-delay": "0ms", "--scene-y": "17px", "--scene-duration": "750ms" }}
        />
      </header>

      <div className="vrbo-v2-summary__body">
        <h2
          className="vrbo-v2-summary__title is-scene-enter"
          style={{ "--scene-delay": "80ms", "--scene-y": "28px", "--scene-duration": "750ms" }}
        >
          {copy.summary.title}
        </h2>

        <div
          className="vrbo-v2-summary__box is-scene-enter"
          role="textbox"
          aria-readonly="true"
          aria-label={summaryText}
          style={{ "--scene-delay": "160ms", "--scene-y": "28px", "--scene-duration": "750ms" }}
        >
          <p className="vrbo-v2-summary__box-label">{copy.summary.boxLabel}</p>
          <p
            className={`vrbo-v2-summary__box-text${isTyping ? " is-typing" : ""}`}
            aria-hidden={Boolean(summaryText)}
          >
            {typedText}
          </p>
        </div>

        <p
          className="vrbo-v2-summary__listening is-scene-enter"
          style={{ "--scene-delay": "240ms", "--scene-y": "20px", "--scene-duration": "650ms" }}
        >
          <span className="vrbo-v2-summary__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {listeningLine}
        </p>

        <div className="vrbo-v2-summary__spacer" aria-hidden="true" />

        <button
          type="button"
          className="vrbo-v2-summary__search is-scene-enter"
          style={{ "--scene-delay": "400ms", "--scene-y": "20px", "--scene-duration": "650ms" }}
          onClick={onSearch}
        >
          {copy.summary.search}
        </button>
      </div>
    </div>
  );
}

function ResultsPanel({
  results,
  priorities,
  previewPropertyId,
  selectedPropertyId,
  actions,
}) {
  return (
    <div className="vrbo-v2-rank__panel vrbo-v2-rank__panel--light vrbo-v2-rank__panel--showcase">
      <StayShowcase
        results={results}
        priorities={priorities}
        previewPropertyId={previewPropertyId}
        selectedPropertyId={selectedPropertyId}
        onPreview={actions.previewProperty}
        onShare={actions.selectProperty}
      />
    </div>
  );
}

function resolveSelectedProperty(selectedPropertyId, results = []) {
  if (selectedPropertyId == null) return null;
  const fromResults = results.find((entry) => entry.property?.id === selectedPropertyId);
  if (fromResults?.property) return fromResults.property;
  return propertyById.get(selectedPropertyId) ?? null;
}

function buildChatParticipantNames(displayNames = {}) {
  // Full chat cast (Jamie + guests), with optional display-name overrides.
  const names = users.map((user) => displayNames[user.id] || user.name);
  return names.length ? names.join(", ") : chatScript.groupSubtitle;
}

function FinaleLockedPanel({
  selectedPropertyId,
  results = [],
  displayNames = {},
}) {
  const property = resolveSelectedProperty(selectedPropertyId, results);
  const namesLine = buildChatParticipantNames(displayNames);
  const title = chatScript.groupTitle;
  const hotelAlt = property?.name ? `${property.name}` : title;

  return (
    <div
      className="vrbo-v2-rank__finale vrbo-v2-rank__panel--enter"
      aria-label={`${title} locked in`}
      style={{ "--finale-bg": `url("${FINALE_BG_SRC}")` }}
    >
      <div className="vrbo-v2-rank__finale-stage">
        <div className="vrbo-v2-rank__finale-card">
          {property?.image ? (
            <img
              className="vrbo-v2-rank__finale-hotel"
              src={property.image}
              alt={hotelAlt}
              draggable={false}
            />
          ) : (
            <div
              className="vrbo-v2-rank__finale-hotel vrbo-v2-rank__finale-hotel--fallback"
              style={property?.gradient ? { background: property.gradient } : undefined}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="vrbo-v2-rank__finale-copy">
          <h2 className="vrbo-v2-rank__finale-title">{title}</h2>
          <p className="vrbo-v2-rank__finale-names">{namesLine}</p>
        </div>
      </div>
    </div>
  );
}

export default function RankingScreen({
  stage,
  summaryText,
  results,
  priorities,
  allSubmitted,
  previewPropertyId,
  selectedPropertyId,
  celebrating = false,
  joined = {},
  displayNames = {},
  actions,
}) {
  if (celebrating) {
    return (
      <div className="vrbo-v2-rank vrbo-v2-rank--finale">
        <FinaleLockedPanel
          selectedPropertyId={selectedPropertyId}
          results={results}
          displayNames={displayNames}
        />
      </div>
    );
  }

  return (
    <div className="vrbo-v2-rank">
      {stage === "intro" || stage === "selecting" ? (
        <WaitingPanel key={allSubmitted ? "loading" : "waiting"} ready={allSubmitted} />
      ) : null}

      {stage === "summary" ? (
        <SummaryPanel
          key="summary"
          summaryText={summaryText}
          onSearch={actions.searchStays}
          joined={joined}
          displayNames={displayNames}
        />
      ) : null}

      {stage === "searching" ? (
        <WaitingPanel
          key="search-loading"
          ready
          title={copy.ranking.searchLoadingTitle || copy.ranking.loadingTitle}
          subtitle={
            copy.ranking.searchLoadingSubtitle || copy.ranking.loadingSubtitle
          }
          hint={copy.ranking.searchLoadingHint || copy.ranking.loadingHint}
        />
      ) : null}

      {stage === "results" ? (
        <ResultsPanel
          key="results"
          results={results}
          priorities={priorities}
          previewPropertyId={previewPropertyId}
          selectedPropertyId={selectedPropertyId}
          actions={actions}
        />
      ) : null}
    </div>
  );
}
