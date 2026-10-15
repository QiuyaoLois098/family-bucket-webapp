import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import chatScript from "../../data/vrbo-v2/chatScript.json";
import copy from "../../data/vrbo-v2/copy.json";
import users from "../../data/vrbo-v2/users.json";
import PreferenceCard from "./PreferenceCard.jsx";
import PropertyCard from "./PropertyCard.jsx";

const panelMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.32, ease: "easeOut" },
};

const guests = users.filter((user) => user.role === "guest");

function fill(template, values) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

function resolveUser(user, displayNames = {}) {
  if (!user) return user;
  const custom = displayNames[user.id];
  if (custom == null || custom === "") return user;
  return { ...user, name: custom };
}

function PhoneAvatar({ user, className = "vrbo-v2-phone__avatar" }) {
  if (user?.avatar) {
    return (
      <span className={`${className} has-photo`} aria-hidden="true">
        <img src={user.avatar} alt="" />
      </span>
    );
  }
  return (
    <span
      className={className}
      style={{ background: user.accent, color: user.onAccent }}
      aria-hidden="true"
    >
      {user.initials}
    </span>
  );
}

function WaitingPills({ guestList, joinedMap, displayNames }) {
  return (
    <div className="vrbo-v2-phone__waiting" aria-label="Guests joining">
      {guestList.map((guest) => {
        const joined = Boolean(joinedMap[guest.id]);
        const label = joined
          ? displayNames[guest.id] || guest.name
          : copy.phone.joinWaiting;
        return (
          <span
            key={guest.id}
            className={`vrbo-v2-phone__waiting-pill${joined ? " is-joined" : ""}`}
          >
            <span className="vrbo-v2-phone__waiting-dot" aria-hidden="true" />
            {label}
          </span>
        );
      })}
    </div>
  );
}

/** Same pill row as join Waiting… — used for joined members in chat phases. */
function MemberPills({ members, selfId }) {
  if (!members.length) return null;
  return (
    <div className="vrbo-v2-phone__waiting" aria-label="People in this trip">
      {members.map((member) => {
        const isYou = member.id === selfId;
        return (
          <span
            key={member.id}
            className={`vrbo-v2-phone__waiting-pill${isYou ? " is-you" : " is-joined"}`}
          >
            <PhoneAvatar user={member} className="vrbo-v2-phone__waiting-avatar" />
            {member.name}
          </span>
        );
      })}
    </div>
  );
}

/** Shared blue header + pill row (tuned on join) — same on every phone phase. */
function PhoneHeader({ subtitle, children = null }) {
  return (
    <header className="vrbo-v2-phone__join-head">
      <div className="vrbo-v2-phone__join-head-row">
        <span className="vrbo-v2-phone__group-avatar" aria-hidden="true">
          <img src="/images/Vrbo-Images/Properties/ohana-beach-house.jpg" alt="" />
        </span>
        <div>
          <h3>{chatScript.groupTitle}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </header>
  );
}

function authorLabel(user, { isSelf = false } = {}) {
  if (isSelf) return `${user.name} · You`;
  if (user.role === "coordinator") {
    return `${user.name} · ${user.roleLabel || copy.chat.groupPlannerLabel || "Group planner"}`;
  }
  return user.name;
}

function PhoneBubble({ user, text, isSelf = false }) {
  return (
    <div className={`vrbo-v2-phone__msg${isSelf ? " is-self" : ""}`}>
      {!isSelf ? <PhoneAvatar user={user} /> : null}
      <div className={`vrbo-v2-phone__bubble${isSelf ? " is-self" : ""}`}>
        <p className="vrbo-v2-phone__bubble-author">{authorLabel(user, { isSelf })}</p>
        <p className="vrbo-v2-phone__bubble-text">{text}</p>
      </div>
      {isSelf ? <PhoneAvatar user={user} /> : null}
    </div>
  );
}

function MessageFeed({ messages, typing, userById, propertyLookup, live = false, selfId }) {
  const feedRef = useRef(null);
  const visibleMessages = live
    ? messages ?? []
    : (messages ?? []).filter((message) => message.kind !== "property").slice(-6);

  useEffect(() => {
    const node = feedRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages?.length, typing?.length, live]);

  return (
    <div className={`vrbo-v2-phone__feed ${live ? "is-live" : ""}`} ref={feedRef}>
      {visibleMessages.map((message) => {
        const author = userById[message.authorId];
        if (!author) return null;
        const isSelf = Boolean(selfId && author.id === selfId);
        const entry = propertyLookup?.(message.propertyId);
        if (message.kind === "property" && entry) {
          return (
            <div
              key={message.id}
              className={`vrbo-v2-phone__property${isSelf ? " is-self" : ""}`}
            >
              <div className={`vrbo-v2-phone__msg${isSelf ? " is-self" : ""}`}>
                {!isSelf ? <PhoneAvatar user={author} /> : null}
                <p className={`vrbo-v2-phone__bubble-author${isSelf ? " is-self" : ""}`}>
                  {authorLabel(author, { isSelf })}
                </p>
                {isSelf ? <PhoneAvatar user={author} /> : null}
              </div>
              <PropertyCard property={entry.property} variant="chat" />
            </div>
          );
        }
        return (
          <PhoneBubble key={message.id} user={author} text={message.text} isSelf={isSelf} />
        );
      })}
      {typing?.length ? <p className="vrbo-v2-phone__typing">{copy.phone.idleSubtitle}</p> : null}
    </div>
  );
}

function ReadonlyComposer() {
  return (
    <div className="vrbo-v2-phone__composer is-readonly">
      <div className="vrbo-v2-phone__composer-row">
        <span className="vrbo-v2-phone__composer-add" aria-hidden="true">
          +
        </span>
        <div className="vrbo-v2-phone__composer-field">
          <span>{copy.phone.watchPlaceholder}</span>
        </div>
        <button type="button" className="vrbo-v2-phone__composer-send" disabled aria-label={copy.phone.watchPlaceholder}>
          ↑
        </button>
      </div>
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
  joinedMap = {},
  displayNames = {},
  locked,
  canJoin,
  stage,
  messages,
  typing,
  userById,
  propertyLookup,
  onJoin,
  onToggle,
  onSubmit,
  bare = false,
  runId = 0,
}) {
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    setDraftName("");
  }, [runId, user.id]);

  // Restart / leave clears join — drop any leftover typed name.
  useEffect(() => {
    if (!joined) setDraftName("");
  }, [joined]);

  const max = copy.maxSelections;
  const groupFinished = stage === "summary" || stage === "results";
  const phase = !joined
    ? canJoin
      ? "join"
      : "closed"
    : locked
      ? "idle"
      : submitted || groupFinished
        ? "watch"
        : "select";
  const atLimit = selection.length >= max;
  const canSend = selection.length === max;
  const draftLines = selection
    .map((id) => {
      const preference = preferenceById.get(id);
      if (!preference) return null;
      const text =
        preference.chatLines?.[user.id] ?? preference.chatLine ?? preference.label;
      return { id, text };
    })
    .filter(Boolean);

  const namedUserById = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(userById || {}).map(([id, person]) => [id, resolveUser(person, displayNames)]),
      ),
    [userById, displayNames],
  );
  const selfUser = resolveUser(user, displayNames);

  const chipMembers = Object.values(namedUserById).filter(
    (member) => member.role === "coordinator" || Boolean(joinedMap[member.id]),
  );
  const showMemberChips = phase === "select" || phase === "watch";
  const tripSubtitle = showMemberChips
    ? fill(copy.phone.groupCount, { count: chipMembers.length })
    : chatScript.groupSubtitle;
  const joinMeta = fill(copy.phone.joinHeaderMeta, { count: guests.length });

  const handleContinue = () => {
    onJoin(user.id, draftName.trim());
  };

  const headerSubtitle =
    phase === "join" || phase === "closed" ? joinMeta : tripSubtitle;

  const screen = (
        <div className="vrbo-v2-phone__screen">
          <div className="vrbo-v2-phone__chrome">
            <span className="vrbo-v2-phone__time">9:41</span>
            <span className="vrbo-v2-phone__notch" aria-hidden="true" />
          </div>

          <PhoneHeader subtitle={headerSubtitle}>
            {phase === "join" || phase === "closed" ? (
              <WaitingPills
                guestList={guests}
                joinedMap={joinedMap}
                displayNames={displayNames}
              />
            ) : showMemberChips ? (
              <MemberPills members={chipMembers} selfId={user.id} />
            ) : null}
          </PhoneHeader>

          <AnimatePresence mode="wait" initial={false}>
            {phase === "idle" ? (
              <motion.div key="idle" className="vrbo-v2-phone__panel vrbo-v2-phone__panel--chat" {...panelMotion}>
                <MessageFeed
                  messages={messages}
                  typing={typing}
                  userById={namedUserById}
                  selfId={user.id}
                />
              </motion.div>
            ) : null}

            {phase === "join" || phase === "closed" ? (
              <motion.div key="join" className="vrbo-v2-phone__panel vrbo-v2-phone__panel--join" {...panelMotion}>
                <div className="vrbo-v2-phone__join">
                  <div className="vrbo-v2-phone__join-avatar-wrap">
                    <PhoneAvatar user={user} className="vrbo-v2-phone__join-avatar" />
                    <span className="vrbo-v2-phone__join-avatar-label">{copy.phone.joinAvatarLabel}</span>
                  </div>
                  <h4>{copy.phone.joinTitle}</h4>
                  <p>{phase === "closed" ? copy.phone.joinClosed : copy.phone.joinBody}</p>
                  {phase === "join" ? (
                    <>
                      <label className="vrbo-v2-phone__join-field">
                        <span className="visually-hidden">{user.name}</span>
                        <input
                          type="text"
                          value={draftName}
                          placeholder={copy.phone.joinPlaceholder}
                          autoComplete="nickname"
                          maxLength={24}
                          onChange={(event) => setDraftName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") handleContinue();
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="vrbo-v2-btn vrbo-v2-phone__join-cta"
                        onClick={handleContinue}
                      >
                        {copy.phone.joinCta}
                      </button>
                    </>
                  ) : null}
                </div>
              </motion.div>
            ) : null}

            {phase === "select" ? (
              <motion.div key="select" className="vrbo-v2-phone__panel vrbo-v2-phone__panel--select" {...panelMotion}>
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
                  <p className="vrbo-v2-phone__selected-hint">
                    {fill(copy.phone.selectedReview, {
                      count: draftLines.length,
                      max,
                    })}
                  </p>
                </div>

                <div className={`vrbo-v2-phone__composer ${draftLines.length ? "has-draft" : ""}`}>
                  <p className="vrbo-v2-phone__draft-label">
                    <strong>{selfUser.name} · You</strong>
                    <span> / </span>
                    <strong>{copy.phone.draftStatus}</strong>
                  </p>
                  <div className="vrbo-v2-phone__composer-row">
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
                </div>
              </motion.div>
            ) : null}

            {phase === "watch" ? (
              <motion.div key="watch" className="vrbo-v2-phone__panel vrbo-v2-phone__panel--chat" {...panelMotion}>
                <MessageFeed
                  messages={messages}
                  typing={typing}
                  userById={namedUserById}
                  propertyLookup={propertyLookup}
                  selfId={user.id}
                  live
                />
                <p className="vrbo-v2-phone__continue">{copy.phone.continueCta}</p>
                <ReadonlyComposer />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
  );

  if (bare) {
    return <div className="vrbo-v2-phone vrbo-v2-phone--bare">{screen}</div>;
  }

  return (
    <div className="vrbo-v2-phone">
      <div className="vrbo-v2-phone__frame">{screen}</div>
      <p className="vrbo-v2-phone__label">
        <span>{user.phoneLabel}</span>
      </p>
    </div>
  );
}
