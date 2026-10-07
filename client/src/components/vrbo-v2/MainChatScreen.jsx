import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import chatScript from "../../data/vrbo-v2/chatScript.json";
import copy from "../../data/vrbo-v2/copy.json";
import Celebration from "./Celebration.jsx";
import PropertyCard from "./PropertyCard.jsx";

const bubbleMotion = {
  initial: { opacity: 0, y: 18, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: "spring", stiffness: 420, damping: 32 },
};

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
  displayNames = {},
}) {
  const feedRef = useRef(null);
  const namedUserById = Object.fromEntries(
    Object.entries(userById).map(([id, user]) => {
      const custom = displayNames[id];
      return [id, custom ? { ...user, name: custom } : user];
    }),
  );
  // Blue header starts with Jamie; guests appear only after they Join.
  const members = Object.values(namedUserById).filter(
    (user) => user.role === "coordinator" || Boolean(joined[user.id]),
  );
  const typingUsers = typing.map((id) => namedUserById[id]).filter(Boolean);
  const guestTotal = Object.values(namedUserById).filter((user) => user.role === "guest").length;
  const guestsJoined = Object.values(namedUserById).filter(
    (user) => user.role === "guest" && Boolean(joined[user.id]),
  ).length;
  const guestsWaiting = Math.max(0, guestTotal - guestsJoined);
  const plannerLabel = copy.chat.groupPlannerLabel || "Group planner";
  const jamie = members.find((user) => user.role === "coordinator");
  const peopleLine =
    guestsWaiting > 0 && jamie
      ? `${jamie.name} · ${plannerLabel} · ${String(copy.chat.waitingGuests).replaceAll("{count}", String(guestsWaiting))}`
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
    if (!node) return undefined;

    const scrollToBottom = () => {
      node.scrollTop = node.scrollHeight;
    };

    // Wait a frame so new bubbles have laid out; avoid ResizeObserver — it
    // fights framer-motion layout and can leave the feed visually empty.
    const raf = requestAnimationFrame(scrollToBottom);
    const timer = window.setTimeout(scrollToBottom, 280);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [messages.length, typing.length]);

  return (
    <div className={`vrbo-v2-chat ${celebrating ? "is-celebrating" : ""}`}>
      <Celebration active={celebrating} />

      <header className="vrbo-v2-chat__masthead">
        <img
          className="vrbo-v2-chat__brand"
          src="/logo/Vrbo_Logo_Sail_RGB.png"
          alt="Vrbo"
        />
        <h2 className="vrbo-v2-chat__trip">{chatScript.groupTitle}</h2>
        <p className="vrbo-v2-chat__people">{peopleLine}</p>
      </header>

      <div className="vrbo-v2-chat__body">
        <p className="vrbo-v2-chat__prompt">{copy.chat.prompt}</p>

        <div className="vrbo-v2-chat__feed" ref={feedRef}>
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const user = namedUserById[message.authorId];
              if (!user) return null;
              const entry = propertyLookup?.(message.propertyId);

              return (
                <motion.div
                  key={message.id}
                  {...bubbleMotion}
                  className={`vrbo-v2-chat__row vrbo-v2-chat__row--${user.role} ${
                    message.kind === "property" ? "vrbo-v2-chat__row--card" : ""
                  }`}
                >
                  {message.kind === "property" && entry ? (
                    <div className="vrbo-v2-chat__card">
                      <PropertyCard property={entry.property} variant="chat" />
                    </div>
                  ) : (
                    <>
                      <Avatar user={user} />
                      <div className="vrbo-v2-chat__column">
                        <span className="vrbo-v2-chat__author">{authorLabel(user)}</span>
                        <p className="vrbo-v2-chat__bubble">{message.text}</p>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}

            {typingUsers.length ? (
              <motion.div
                key={`typing-${typingUsers.map((u) => u.id).join("-")}`}
                {...bubbleMotion}
                exit={{ opacity: 0, scale: 0.9 }}
                className="vrbo-v2-chat__typing"
              >
                <div className="vrbo-v2-chat__typing-avatars" aria-hidden="true">
                  {typingUsers.slice(0, 3).map((user) => (
                    <Avatar key={user.id} user={user} className="vrbo-v2-chat__typing-avatar" />
                  ))}
                </div>
                <p className="vrbo-v2-chat__bubble vrbo-v2-chat__bubble--typing" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <p className="vrbo-v2-chat__footer">
          {guestsWaiting > 0 ? copy.chat.footer : copy.chat.footerPlanning || copy.chat.footer}
        </p>
      </div>
    </div>
  );
}
