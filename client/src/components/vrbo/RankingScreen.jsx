import { AnimatePresence, Reorder, motion } from "framer-motion";
import copy from "../../data/vrbo/copy.json";
import PreferenceCard from "./PreferenceCard.jsx";
import PropertyCard from "./PropertyCard.jsx";

const panelMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.42, ease: "easeOut" },
};

function WaitingPanel({ submittedCount, total }) {
  return (
    <motion.div
      key="waiting"
      className="vrbo-rank__panel vrbo-rank__panel--blue vrbo-rank__panel--waiting"
      {...panelMotion}
    >
      <h2>{copy.ranking.waitingTitle}</h2>
      <p className="vrbo-rank__lede">{copy.ranking.waitingSubtitle}</p>
      <p className="vrbo-rank__hint">{copy.ranking.waitingHint}</p>
      <div className="vrbo-rank__dots" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={index < submittedCount ? "is-done" : ""} />
        ))}
      </div>
    </motion.div>
  );
}

function RankingPanel({ ranked, preferenceById, canFind, onReorder, onMove, onFind }) {
  return (
    <motion.div key="ranking" className="vrbo-rank__panel vrbo-rank__panel--blue" {...panelMotion}>
      <div className="vrbo-rank__head">
        <h2>{copy.ranking.title}</h2>
        <p className="vrbo-rank__lede">{copy.ranking.instruction}</p>
      </div>

      <div className="vrbo-rank__stack">
        <span className="vrbo-rank__scale-end">↑ {copy.ranking.mostImportant}</span>

        <Reorder.Group axis="y" values={ranked} onReorder={onReorder} className="vrbo-rank__list">
          {ranked.map((id, index) => {
            const preference = preferenceById.get(id);
            if (!preference) return null;
            return (
              <Reorder.Item
                key={id}
                value={id}
                className="vrbo-rank__item"
                whileDrag={{ scale: 1.03, zIndex: 5 }}
                style={{ "--tier": 1 - index / Math.max(ranked.length, 2) }}
              >
                <PreferenceCard preference={preference} variant="rank" rank={index + 1} as="div">
                  <span className="vrbo-rank__nudge">
                    <button
                      type="button"
                      aria-label={`${copy.ranking.moveUp}: ${preference.label}`}
                      disabled={index === 0}
                      onPointerDownCapture={(event) => event.stopPropagation()}
                      onClick={() => onMove(id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
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

        <span className="vrbo-rank__scale-end vrbo-rank__scale-end--low">
          {copy.ranking.lessImportant} ↓
        </span>
      </div>

      <button type="button" className="vrbo-rank__cta" disabled={!canFind} onClick={onFind}>
        {canFind ? copy.ranking.cta : copy.ranking.ctaLocked}
      </button>
    </motion.div>
  );
}

function ResultsPanel({ results }) {
  return (
    <motion.div key="results" className="vrbo-rank__panel vrbo-rank__panel--light" {...panelMotion}>
      <div className="vrbo-rank__head">
        <h2>{copy.ranking.resultsTitle}</h2>
        <p className="vrbo-rank__lede">{copy.ranking.resultsSubtitle}</p>
      </div>

      <div className="vrbo-rank__results">
        {results.map((result) => (
          <PropertyCard
            key={result.property.id}
            property={result.property}
            matched={result.matched}
            matchPercent={result.matchPercent}
            badge={result.badge}
          />
        ))}
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
  actions,
}) {
  return (
    <div className="vrbo-rank">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "intro" || stage === "selecting" ? (
          <WaitingPanel key="waiting" submittedCount={submittedCount} total={guestCount} />
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

        {stage === "results" ? <ResultsPanel key="results" results={results} /> : null}
      </AnimatePresence>
    </div>
  );
}
