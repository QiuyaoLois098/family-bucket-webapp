import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import chatScript from "../../data/vrbo/chatScript.json";
import copy from "../../data/vrbo/copy.json";
import Celebration from "./Celebration.jsx";
import PropertyCard from "./PropertyCard.jsx";

const bubbleMotion = {
  initial: { opacity: 0, y: 18, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: "spring", stiffness: 420, damping: 32 },
};

function Avatar({ user }) {
  return (
    <span className="vrbo-chat__avatar" style={{ background: user.accent, color: user.onAccent }}>
      {user.initials}
    </span>
  );
}

export default function MainChatScreen({ messages, typing, userById, propertyLookup, celebrating }) {
  const feedRef = useRef(null);

  useEffect(() => {
    const node = feedRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing.length]);

  return (
    <div className={`vrbo-chat ${celebrating ? "is-celebrating" : ""}`}>
      <Celebration active={celebrating} />
      <header className="vrbo-chat__header">
        <div className="vrbo-chat__stack">
          {Object.values(userById).map((user) => (
            <span
              key={user.id}
              className="vrbo-chat__stack-dot"
              style={{ background: user.accent, color: user.onAccent }}
            >
              {user.initials}
            </span>
          ))}
        </div>
        <div>
          <h2>{chatScript.groupTitle}</h2>
          <p>{chatScript.groupSubtitle}</p>
        </div>
      </header>

      <div className="vrbo-chat__feed" ref={feedRef}>
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const user = userById[message.authorId];
            if (!user) return null;
            const entry = propertyLookup?.(message.propertyId);

            return (
              <motion.div
                key={message.id}
                layout
                {...bubbleMotion}
                className={`vrbo-chat__row vrbo-chat__row--${user.side}`}
              >
                <Avatar user={user} />
                <div className="vrbo-chat__column">
                  <span className="vrbo-chat__author">{user.name}</span>
                  {message.kind === "property" && entry ? (
                    <div className="vrbo-chat__card">
                      <PropertyCard
                        property={entry.property}
                        variant="chat"
                        matched={entry.matched ?? []}
                        matchPercent={entry.matchPercent ?? null}
                      />
                    </div>
                  ) : (
                    <p className="vrbo-chat__bubble">{message.text}</p>
                  )}
                </div>
              </motion.div>
            );
          })}

          {typing.map((userId) => {
            const user = userById[userId];
            if (!user) return null;
            return (
              <motion.div
                key={`typing-${userId}`}
                layout
                {...bubbleMotion}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`vrbo-chat__row vrbo-chat__row--${user.side}`}
              >
                <Avatar user={user} />
                <div className="vrbo-chat__column">
                  <span className="vrbo-chat__author">
                    {user.name} {copy.chat.typingLabel}
                  </span>
                  <p className="vrbo-chat__bubble vrbo-chat__bubble--typing" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
