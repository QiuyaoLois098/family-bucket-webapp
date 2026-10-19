import { useEffect, useRef } from "react";
import chatScript from "../../data/vrbo-v2/chatScript.json";
import copy from "../../data/vrbo-v2/copy.json";
import { createEnterTracker } from "./chatMotion.js";
import Celebration from "./Celebration.jsx";
import PropertyCard from "./PropertyCard.jsx";

function Avatar({ user, className = "vrbo-v2-chat__avatar" }) {
  if (user?.avatar) {
    return (
      <span className={`${className} has-photo`} aria-hidden="true">
        <img src={user.avatar} alt="" />
      </span>
    );
  }
  return (
    <span className={className} style={{ background: user.accent, color: user.onAccent }}>
      {user.initials}
    </span>
  );
}

export default function MainChatScreen({
  messages,
  typing,
  userById,
  propertyLookup,
  celebrating,
  joined = {},
  submitted = {},
  displayNames = {},
}) {
  const feedRef = useRef(null);
  const enterRef = useRef(null);
  if (enterRef.current == null) enterRef.current = createEnterTracker();

  // First list from socket = already-there; later ids fade in once.
  enterRef.current.prepare((messages ?? []).map((message) => message.id));

  const namedUserById = Object.fromEntries(
    Object.entries(userById).map(([id, user]) => {
      const custom = displayNames[id];
      return [id, custom ? { ...user, name: custom } : user];
    }),
  );
  const members = Object.values(namedUserById).filter(
    (user) => user.role === "coordinator" || Boolean(joined[user.id]),
  );
  const typingUsers = typing.map((id) => namedUserById[id]).filter(Boolean);
  const guestUsers = Object.values(namedUserById).filter((user) => user.role === "guest");
  const guestTotal = guestUsers.length;
  const guestsJoined = guestUsers.filter((user) => Boolean(joined[user.id])).length;
  const guestsWaiting = Math.max(0, guestTotal - guestsJoined);
  const anyoneSubmitted = Object.values(submitted).some(Boolean);
  const showPickupFooter = guestsWaiting > 0 && !anyoneSubmitted;
  // After Jamie's intro, before anyone submits: stacked guest avatars + "..."
  const hasJamieIntro = (messages ?? []).some(
    (message) =>
      message.phase === "intro" ||
      (message.authorId === "jamie" &&
        message.kind !== "property" &&
        !message.preferenceIds?.length &&
        message.phase !== "finale"),
  );
  const hasPreferenceOrFinale = (messages ?? []).some(
    (message) =>
      message.phase === "preference" ||
      message.phase === "finale" ||
      message.kind === "property",
  );
  const showIdleTyping =
    hasJamieIntro && !hasPreferenceOrFinale && !anyoneSubmitted && !celebrating;
  const idleTypingUsers = guestUsers.slice(0, 2);
  const typingRowUsers = typingUsers.length ? typingUsers : showIdleTyping ? idleTypingUsers : [];
  const plannerLabel = copy.chat.groupPlannerLabel || "Primary planner";
  const peopleLine =
    guestsWaiting > 0
      ? chatScript.groupSubtitle
      : members
          .map((user) =>
            user.role === "coordinator" ? `${user.name} · ${plannerLabel}` : user.name,
          )
          .join(", ");

  function authorLabel(user) {
    if (user.role === "coordinator") {
      return `${user.name} · ${user.roleLabel || plannerLabel}`;
    }
    return user.name;
  }

  useEffect(() => {
    const node = feedRef.current;
    if (!node) return;
    // Instant pin — never animate scroll (fights paint of new bubbles).
    node.scrollTop = node.scrollHeight;
  }, [messages.length, typing.length, showIdleTyping]);

  return (
    <div className={`vrbo-v2-chat ${celebrating ? "is-celebrating" : ""}`}>
      <Celebration active={celebrating} />

      <header className="vrbo-v2-chat__masthead">
        <img
          className="vrbo-v2-chat__brand is-opening-enter"
          src="/logo/Vrbo_Logo_Sail_RGB.png"
          alt="Vrbo"
        />
        <h2 className="vrbo-v2-chat__trip is-opening-title">{chatScript.groupTitle}</h2>
        <p className="vrbo-v2-chat__people is-opening-status">{peopleLine}</p>
      </header>

      <div className="vrbo-v2-chat__body">
        <div className="vrbo-v2-chat__feed" ref={feedRef}>
          <div className="vrbo-v2-chat__feed-spacer" aria-hidden="true" />
          {messages.map((message) => {
            const user = namedUserById[message.authorId];
            if (!user) return null;
            const entry = propertyLookup?.(message.propertyId);
            const enter = !message.exiting && enterRef.current.shouldEnter(message.id);

            return (
              <div
                key={message.id}
                className={`vrbo-v2-chat__row vrbo-v2-chat__row--${user.role}${
                  message.kind === "property" ? " vrbo-v2-chat__row--card" : ""
                }${enter ? " is-enter" : ""}${message.exiting ? " is-exit" : ""}`}
              >
                {message.kind === "property" && entry ? (
                  <div className="vrbo-v2-chat__card">
                    <PropertyCard property={entry.property} variant="chat" />
                  </div>
                ) : (
                  <>
                    <Avatar user={user} />
                    <div className="vrbo-v2-chat__bubble">
                      <span className="vrbo-v2-chat__author">{authorLabel(user)}</span>
                      <p className="vrbo-v2-chat__text">{message.text}</p>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {typingRowUsers.length ? (
            <div key="typing" className="vrbo-v2-chat__typing is-enter">
              <div className="vrbo-v2-chat__typing-avatars" aria-hidden="true">
                {typingRowUsers.slice(0, 3).map((user) => (
                  <Avatar key={user.id} user={user} className="vrbo-v2-chat__typing-avatar" />
                ))}
              </div>
              <p className="vrbo-v2-chat__bubble vrbo-v2-chat__bubble--typing" aria-hidden="true">
                <i />
                <i />
                <i />
              </p>
            </div>
          ) : null}
        </div>

        <div className="vrbo-v2-chat__footer">
          {showPickupFooter ? (
            <p className="vrbo-v2-chat__footer-text is-pickup-hop">
              Pick up a phone
              <br />
              and join the conversation
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
