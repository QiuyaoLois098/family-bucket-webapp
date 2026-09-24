import { AnimatePresence, motion } from "framer-motion";
import chatScript from "../../data/vrbo-v2/chatScript.json";
import copy from "../../data/vrbo-v2/copy.json";
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

function PhoneBubble({ user, text, isPlanner }) {
  return (
    <div className={`vrbo-v2-phone__bubble ${isPlanner ? "vrbo-v2-phone__bubble--planner" : ""}`}>
      <p className="vrbo-v2-phone__bubble-author">
        {user.name}
        {isPlanner ? <span> · {copy.phone.plannerBadge}</span> : null}
      </p>
      <p className="vrbo-v2-phone__bubble-text">{text}</p>
    </div>
  );
}

function MessageFeed({ messages, typing, userById, children }) {
  const visibleMessages = (messages ?? []).filter((message) => message.kind !== "property").slice(-4);

  return (
    <div className="vrbo-v2-phone__feed">
      {visibleMessages.map((message) => {
        const author = userById[message.authorId];
        if (!author) return null;
        return (
          <PhoneBubble
            key={message.id}
            user={author}
            text={message.text}
            isPlanner={author.role === "coordinator"}
          />
        );
      })}
      {typing?.length ? <p className="vrbo-v2-phone__typing">{copy.phone.idleSubtitle}</p> : null}
      {children}
    </div>
  );
}

export default function GuestPhone({
  user,
  preferences,
  preferenceById,
  selection,
  submitted,
  joined,
  locked,
  canJoin,
  groupReady,
  messages,
  typing,
  userById,
  onJoin,
  onToggle,
  onSubmit,
}) {
  const max = copy.maxSelections;
  const phase = locked
    ? "idle"
    : !joined
      ? canJoin
        ? "join"
        : "closed"
      : submitted
        ? "done"
        : "select";
  const atLimit = selection.length >= max;
  const canSend = selection.length === max;
  const isPlanner = user.role === "coordinator";
  const draftLines = selection
    .map((id) => {
      const preference = preferenceById.get(id);
      if (!preference) return null;
      return { id, text: preference.chatLine ?? preference.label };
    })
    .filter(Boolean);

  return (
    <div className={`vrbo-v2-phone ${isPlanner ? "vrbo-v2-phone--planner" : ""}`}>
      <div className="vrbo-v2-phone__frame">
        <div className="vrbo-v2-phone__screen">
          <div className="vrbo-v2-phone__chrome">
            <span className="vrbo-v2-phone__notch" aria-hidden="true" />
          </div>

          <header className="vrbo-v2-phone__trip">
            <h3>{chatScript.groupTitle}</h3>
            <p>{chatScript.groupSubtitle}</p>
          </header>

          <AnimatePresence mode="wait" initial={false}>
            {phase === "idle" ? (
              <motion.div key="idle" className="vrbo-v2-phone__panel vrbo-v2-phone__panel--chat" {...panelMotion}>
                <MessageFeed messages={messages} typing={typing} userById={userById} />
              </motion.div>
            ) : null}

            {phase === "join" || phase === "closed" ? (
              <motion.div key="join" className="vrbo-v2-phone__panel vrbo-v2-phone__panel--chat" {...panelMotion}>
                <MessageFeed messages={messages} typing={typing} userById={userById} />
                <div className="vrbo-v2-phone__join">
                  <h4>{copy.phone.joinTitle}</h4>
                  <p>{phase === "closed" ? copy.phone.joinClosed : copy.phone.joinBody}</p>
                  {phase === "join" ? (
                    <button
                      type="button"
                      className="vrbo-v2-btn vrbo-v2-btn--md vrbo-v2-phone__join-cta"
                      onClick={() => onJoin(user.id)}
                    >
                      {copy.phone.joinCta}
                    </button>
                  ) : null}
                </div>
              </motion.div>
            ) : null}

            {phase === "select" ? (
              <motion.div key="select" className="vrbo-v2-phone__panel vrbo-v2-phone__panel--chat" {...panelMotion}>
                <MessageFeed messages={messages} typing={typing} userById={userById}>
                  <div className="vrbo-v2-phone__prompt">
                    <p className="vrbo-v2-phone__prompt-title">{copy.phone.promptTitle}</p>
                    <div className="vrbo-v2-phone__chips">
                      {preferences.map((preference) => {
                        const selected = selection.includes(preference.id);
                        return (
                          <PreferenceCard
                            key={preference.id}
                            preference={preference}
                            variant="chip"
                            selected={selected}
                            disabled={!selected && atLimit}
                            onSelect={() => onToggle(user.id, preference.id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </MessageFeed>

                <div className={`vrbo-v2-phone__composer ${draftLines.length ? "has-draft" : ""}`}>
                  <p className="vrbo-v2-phone__autofill">
                    {draftLines.length
                      ? fill(copy.phone.autofillLabel, { count: draftLines.length })
                      : copy.phone.autofillEmpty}
                  </p>
                  <div className="vrbo-v2-phone__composer-row">
                    <span className="vrbo-v2-phone__composer-add" aria-hidden="true">
                      +
                    </span>
                    <div
                      className={`vrbo-v2-phone__composer-field ${
                        draftLines.length ? "is-filled" : ""
                      }`}
                    >
                      {draftLines.length ? (
                        draftLines.map((line) => (
                          <p key={line.id} className="vrbo-v2-phone__draft-line">
                            {line.text}
                          </p>
                        ))
                      ) : (
                        <span>{copy.phone.composerPlaceholder}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="vrbo-v2-phone__composer-send"
                      disabled={!canSend}
                      aria-label={canSend ? copy.phone.submit : copy.phone.submitLocked}
                      onClick={() => onSubmit(user.id)}
                    >
                      ↑
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {phase === "done" ? (
              <motion.div key="done" className="vrbo-v2-phone__panel vrbo-v2-phone__panel--chat" {...panelMotion}>
                <div className="vrbo-v2-phone__feed">
                  <div className="vrbo-v2-phone__done">
                    <span className="vrbo-v2-phone__check" aria-hidden="true">
                      ✓
                    </span>
                    <h4>{copy.phone.doneTitle}</h4>
                    <p>{copy.phone.doneSubtitle}</p>
                    <ul className="vrbo-v2-phone__picks">
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
                    <p className="vrbo-v2-phone__waiting">
                      {groupReady ? copy.phone.doneReady : copy.phone.doneWaiting}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <p className="vrbo-v2-phone__label">
        <span>{user.phoneLabel}</span>
        {isPlanner ? <span className="vrbo-v2-phone__planner">{copy.phone.plannerBadge}</span> : null}
      </p>
    </div>
  );
}
