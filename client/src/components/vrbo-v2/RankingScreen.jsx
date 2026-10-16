import { useEffect, useState } from "react";
import chatScript from "../../data/vrbo-v2/chatScript.json";
import copy from "../../data/vrbo-v2/copy.json";
import properties from "../../data/vrbo-v2/properties.json";
import users from "../../data/vrbo-v2/users.json";
import { StayShowcase } from "./StayViews.jsx";

const FINALE_BG_SRC = "/images/Vrbo-Images/final-bg.jpg";
const TYPEWRITER_MS = 28;

const propertyById = new Map(properties.map((property) => [property.id, property]));

function useTypewriter(text, msPerChar = TYPEWRITER_MS) {
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

    if (reduceMotion) {
      setShown(full);
      return undefined;
    }

    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, msPerChar);

    return () => window.clearInterval(id);
  }, [text, msPerChar]);

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

function WaitingPanel({ ready }) {
  return (
    <div
      className={`vrbo-v2-rank__panel vrbo-v2-rank__panel--hero ${ready ? "is-loading" : ""} vrbo-v2-rank__panel--enter`}
    >
      {ready ? (
        <div className="vrbo-v2-rank__hero-loading">
          <span className="vrbo-v2-rank__spinner" aria-hidden="true" />
          <h2>{copy.ranking.loadingTitle}</h2>
          <p className="vrbo-v2-rank__lede">{copy.ranking.loadingSubtitle}</p>
          <p className="vrbo-v2-rank__hint">{copy.ranking.loadingHint}</p>
        </div>
      ) : (
        <>
          <header className="vrbo-v2-rank__hero-top">
            <img
              className="vrbo-v2-rank__brand-logo"
              src="/logo/Vrbo_Logo_Sail_RGB.png"
              alt="Vrbo"
            />
          </header>
          <div className="vrbo-v2-rank__hero-mid">
            <h2>
              {copy.ranking.waitingTitleLine1}
              <br />
              {copy.ranking.waitingTitleLine2}
            </h2>
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
    <div className={`vrbo-v2-summary ${compact ? "vrbo-v2-summary--compact" : ""} vrbo-v2-rank__panel--enter`}>
      <header className="vrbo-v2-summary__masthead">
        <img
          className="vrbo-v2-summary__brand"
          src="/logo/Vrbo_Logo_Sail_RGB.png"
          alt={copy.summary.brand}
        />
      </header>

      <div className="vrbo-v2-summary__body">
        <h2 className="vrbo-v2-summary__title">{copy.summary.title}</h2>

        <div
          className="vrbo-v2-summary__box"
          role="textbox"
          aria-readonly="true"
          aria-label={summaryText}
        >
          <p className="vrbo-v2-summary__box-label">{copy.summary.boxLabel}</p>
          <p
            className={`vrbo-v2-summary__box-text${isTyping ? " is-typing" : ""}`}
            aria-hidden={Boolean(summaryText)}
          >
            {typedText}
          </p>
        </div>

        <p className="vrbo-v2-summary__listening">
          <span className="vrbo-v2-summary__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {listeningLine}
        </p>

        <div className="vrbo-v2-summary__spacer" aria-hidden="true" />

        <button type="button" className="vrbo-v2-summary__search" onClick={onSearch}>
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
    <div className="vrbo-v2-rank__panel vrbo-v2-rank__panel--light vrbo-v2-rank__panel--showcase vrbo-v2-rank__panel--enter-up">
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
