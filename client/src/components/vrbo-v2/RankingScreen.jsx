import { AnimatePresence, Reorder, motion } from "framer-motion";
import copy from "../../data/vrbo-v2/copy.json";
import PreferenceCard from "./PreferenceCard.jsx";
import PropertyCard from "./PropertyCard.jsx";

const panelMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.42, ease: "easeOut" },
};

function WaitingPanel({ submittedCount, total, ready }) {
  const waitingToJoin = total === 0;
  return (
    <motion.div
      key={ready ? "loading" : waitingToJoin ? "join" : "waiting"}
      className={`vrbo-v2-rank__panel vrbo-v2-rank__panel--blue vrbo-v2-rank__panel--waiting ${
        ready ? "is-loading" : ""
      }`}
      {...panelMotion}
    >
      {ready ? (
        <>
          <span className="vrbo-v2-rank__spinner" aria-hidden="true" />
          <h2>{copy.ranking.loadingTitle}</h2>
          <p className="vrbo-v2-rank__lede">{copy.ranking.loadingSubtitle}</p>
          <p className="vrbo-v2-rank__hint">{copy.ranking.loadingHint}</p>
        </>
      ) : (
        <>
          <h2>{copy.ranking.waitingTitle}</h2>
          <p className="vrbo-v2-rank__lede">
            {waitingToJoin ? copy.ranking.waitingJoinSubtitle : copy.ranking.waitingSubtitle}
          </p>
          <p className="vrbo-v2-rank__hint">
            {waitingToJoin ? copy.ranking.waitingJoinHint : copy.ranking.waitingHint}
          </p>
          {!waitingToJoin ? (
            <div className="vrbo-v2-rank__dots" aria-hidden="true">
              {Array.from({ length: total }, (_, index) => (
                <span key={index} className={index < submittedCount ? "is-done" : ""} />
              ))}
            </div>
          ) : null}
        </>
      )}
    </motion.div>
  );
}

function RankingPanel({ ranked, preferenceById, canFind, onReorder, onMove, onFind }) {
  return (
    <motion.div key="ranking" className="vrbo-v2-rank__panel vrbo-v2-rank__panel--blue" {...panelMotion}>
      <div className="vrbo-v2-rank__head">
        <h2>{copy.ranking.title}</h2>
        <p className="vrbo-v2-rank__lede">{copy.ranking.instruction}</p>
      </div>

      <div className="vrbo-v2-rank__stack">
        <span className="vrbo-v2-rank__scale-end">↑ {copy.ranking.mostImportant}</span>

        <Reorder.Group axis="y" values={ranked} onReorder={onReorder} className="vrbo-v2-rank__list">
          {ranked.map((id, index) => {
            const preference = preferenceById.get(id);
            if (!preference) return null;
            return (
              <Reorder.Item
                key={id}
                value={id}
                className="vrbo-v2-rank__item"
                whileDrag={{ scale: 1.03, zIndex: 5 }}
                style={{ "--tier": 1 - index / Math.max(ranked.length, 2) }}
              >
                <PreferenceCard preference={preference} variant="rank" rank={index + 1} as="div">
                  <span className="vrbo-v2-rank__nudge">
                    <button
                      type="button"
                      className="vrbo-v2-btn vrbo-v2-btn--xs"
                      aria-label={`${copy.ranking.moveUp}: ${preference.label}`}
                      disabled={index === 0}
                      onPointerDownCapture={(event) => event.stopPropagation()}
                      onClick={() => onMove(id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="vrbo-v2-btn vrbo-v2-btn--xs"
                      aria-label={`${copy.ranking.moveDown}: ${preference.label}`}
                      disabled={index === ranked.length - 1}
                      onPointerDownCapture={(event) => event.stopPropagation()}
                      onClick={() => onMove(id, 1)}
                    >
                      ↓
                    </button>
                  </span>
                </PreferenceCard>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        <span className="vrbo-v2-rank__scale-end vrbo-v2-rank__scale-end--low">
          {copy.ranking.lessImportant} ↓
        </span>
      </div>

      <button
        type="button"
        className="vrbo-v2-btn vrbo-v2-btn--lg vrbo-v2-rank__cta"
        disabled={!canFind}
        onClick={onFind}
      >
        {canFind ? copy.ranking.cta : copy.ranking.ctaLocked}
      </button>
    </motion.div>
  );
}

function ResultsPanel({ results, selectedPropertyId, onSelect }) {
  const picked = Boolean(selectedPropertyId);

  return (
    <motion.div key="results" className="vrbo-v2-rank__panel vrbo-v2-rank__panel--light" {...panelMotion}>
      <div className="vrbo-v2-rank__head">
        <h2>{copy.ranking.resultsTitle}</h2>
        <p className="vrbo-v2-rank__lede">
          {picked ? copy.ranking.resultsPickedSubtitle : copy.ranking.resultsSubtitle}
        </p>
      </div>

      <div className={`vrbo-v2-rank__results ${picked ? "is-picked" : ""}`}>
        {results.map((result) => {
          const selected = result.property.id === selectedPropertyId;
          const lockedOut = picked && !selected;
          return (
            <PropertyCard
              key={result.property.id}
              property={result.property}
              matched={result.matched}
              matchPercent={result.matchPercent}
              badge={result.badge}
              selected={selected}
              onSelect={picked ? undefined : onSelect}
              dimmed={lockedOut}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

export default function RankingScreen({
  stage,
  ranked,
  results,
  preferenceById,
  submittedCount,
  guestCount,
  allSubmitted,
  selectedPropertyId,
  actions,
}) {
  return (
    <div className="vrbo-v2-rank">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "intro" || stage === "selecting" ? (
          <WaitingPanel
            key={allSubmitted ? "loading" : "waiting"}
            submittedCount={submittedCount}
            total={guestCount}
            ready={allSubmitted}
          />
        ) : null}

        {stage === "ranking" ? (
          <RankingPanel
            key="ranking"
            ranked={ranked}
            preferenceById={preferenceById}
            canFind={allSubmitted}
            onReorder={actions.setRanked}
            onMove={actions.moveRanked}
            onFind={actions.findStay}
          />
        ) : null}

        {stage === "results" ? (
          <ResultsPanel
            key="results"
            results={results}
            selectedPropertyId={selectedPropertyId}
            onSelect={actions.selectProperty}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
