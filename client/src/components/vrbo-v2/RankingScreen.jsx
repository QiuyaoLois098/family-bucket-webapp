import { useEffect, useState } from "react";
import copy from "../../data/vrbo-v2/copy.json";
import users from "../../data/vrbo-v2/users.json";
import { StayShowcase } from "./StayViews.jsx";

const FINALE_LOCKED_SRC = "/images/Vrbo-Images/example/vrbo-r/4.png";
const TYPEWRITER_MS = 28;

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

function FinaleLockedPanel() {
  return (
    <div className="vrbo-v2-rank__finale vrbo-v2-rank__panel--enter" aria-label="Trip locked in">
      <img
        className="vrbo-v2-rank__finale-img"
        src={FINALE_LOCKED_SRC}
        alt="Hawaii Trip 2027 locked in"
        draggable={false}
      />
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
        <FinaleLockedPanel />
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
