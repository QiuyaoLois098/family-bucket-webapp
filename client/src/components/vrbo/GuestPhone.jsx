import { AnimatePresence, motion } from "framer-motion";
import copy from "../../data/vrbo/copy.json";
import PreferenceCard from "./PreferenceCard.jsx";

const panelMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.32, ease: "easeOut" },
};

function fill(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

export default function GuestPhone({
  user,
  preferences,
  preferenceById,
  selection,
  submitted,
  locked,
  groupReady,
  onToggle,
  onSubmit,
}) {
  const max = copy.maxSelections;
  const phase = locked ? "idle" : submitted ? "done" : "select";
  const atLimit = selection.length >= max;

  return (
    <div className="vrbo-phone" style={{ "--accent": user.accent }}>
      <div className="vrbo-phone__frame">
        <div className="vrbo-phone__screen">
          <div className="vrbo-phone__status">
            <span>{user.name}</span>
            <span className="vrbo-phone__notch" aria-hidden="true" />
            <span>{user.statusLine}</span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {phase === "idle" ? (
              <motion.div key="idle" className="vrbo-phone__panel vrbo-phone__panel--idle" {...panelMotion}>
                <span className="vrbo-phone__pulse" aria-hidden="true" />
                <h3>{copy.phone.idleTitle}</h3>
                <p>{copy.phone.idleSubtitle}</p>
              </motion.div>
            ) : null}

            {phase === "select" ? (
              <motion.div key="select" className="vrbo-phone__panel" {...panelMotion}>
                <div className="vrbo-phone__head">
                  <h3>{copy.phone.title}</h3>
                  <p>{fill(copy.phone.subtitle, { max })}</p>
                </div>

                <div className="vrbo-phone__grid">
                  {preferences.map((preference) => {
                    const selected = selection.includes(preference.id);
                    return (
                      <PreferenceCard
                        key={preference.id}
                        preference={preference}
                        variant="phone"
                        selected={selected}
                        disabled={!selected && atLimit}
                        onSelect={() => onToggle(user.id, preference.id)}
                      />
                    );
                  })}
                </div>

                <div className="vrbo-phone__foot">
                  <span className="vrbo-phone__counter">
                    {fill(copy.phone.counter, { count: selection.length, max })}
                  </span>
                  <button
                    type="button"
                    className="vrbo-phone__submit"
                    disabled={selection.length === 0}
                    onClick={() => onSubmit(user.id)}
                  >
                    {selection.length === 0 ? copy.phone.submitLocked : copy.phone.submit}
                  </button>
                </div>
              </motion.div>
            ) : null}

            {phase === "done" ? (
              <motion.div key="done" className="vrbo-phone__panel vrbo-phone__panel--done" {...panelMotion}>
                <span className="vrbo-phone__check" aria-hidden="true">
                  ✓
                </span>
                <h3>{copy.phone.doneTitle}</h3>
                <p>{copy.phone.doneSubtitle}</p>
                <ul className="vrbo-phone__picks">
                  {(submitted ?? []).map((id) => {
                    const preference = preferenceById.get(id);
                    if (!preference) return null;
                    return (
                      <li key={id}>
                        <span aria-hidden="true">{preference.icon}</span>
                        {preference.label}
                      </li>
                    );
                  })}
                </ul>
                <p className="vrbo-phone__waiting">
                  {groupReady ? copy.phone.doneReady : copy.phone.doneWaiting}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      <p className="vrbo-phone__label">{user.phoneLabel}</p>
    </div>
  );
}
