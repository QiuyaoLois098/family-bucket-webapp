import { AnimatePresence, motion } from "framer-motion";
import copy from "../../data/vrbo-v2/copy.json";
import { StayShowcase } from "./StayViews.jsx";

const panelMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.42, ease: "easeOut" },
};

function WaitingPanel({ ready }) {
  return (
    <motion.div
      key={ready ? "loading" : "waiting"}
      className={`vrbo-v2-rank__panel vrbo-v2-rank__panel--hero ${ready ? "is-loading" : ""}`}
      {...panelMotion}
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
    </motion.div>
  );
}

export function SummaryPanel({ summaryText, onSearch, compact = false }) {
  return (
    <motion.div
      key="summary"
      className={`vrbo-v2-summary ${compact ? "vrbo-v2-summary--compact" : ""}`}
      {...panelMotion}
    >
      <header className="vrbo-v2-summary__masthead">
        <img
          className="vrbo-v2-summary__brand"
          src="/logo/Vrbo_Logo_Sail_RGB.png"
          alt={copy.summary.brand}
        />
      </header>

      <div className="vrbo-v2-summary__body">
        <h2 className="vrbo-v2-summary__title">{copy.summary.title}</h2>

        <div className="vrbo-v2-summary__box" role="textbox" aria-readonly="true">
          <p className="vrbo-v2-summary__box-label">{copy.summary.boxLabel}</p>
          <p className="vrbo-v2-summary__box-text">{summaryText}</p>
        </div>

        <p className="vrbo-v2-summary__listening">
          <span className="vrbo-v2-summary__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {copy.summary.listening}
        </p>

        <div className="vrbo-v2-summary__spacer" aria-hidden="true" />

        <button type="button" className="vrbo-v2-summary__search" onClick={onSearch}>
          {copy.summary.search}
        </button>
      </div>
    </motion.div>
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
    <motion.div
      key="results"
      className="vrbo-v2-rank__panel vrbo-v2-rank__panel--light vrbo-v2-rank__panel--showcase"
      {...panelMotion}
    >
      <StayShowcase
        results={results}
        priorities={priorities}
        previewPropertyId={previewPropertyId}
        selectedPropertyId={selectedPropertyId}
        onPreview={actions.previewProperty}
        onShare={actions.selectProperty}
      />
    </motion.div>
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
  actions,
}) {
  return (
    <div className="vrbo-v2-rank">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "intro" || stage === "selecting" ? (
          <WaitingPanel key={allSubmitted ? "loading" : "waiting"} ready={allSubmitted} />
        ) : null}

        {stage === "summary" ? (
          <SummaryPanel key="summary" summaryText={summaryText} onSearch={actions.searchStays} />
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
      </AnimatePresence>
    </div>
  );
}
