import { motion } from "framer-motion";
import { JAMIE } from "./data.js";

export default function ChatMessage({ message, people, selfId, grouped, showName, showAvatar }) {
  const person = message.from === "jamie" ? JAMIE : people(message.from);
  const isSelf = Boolean(selfId) && message.from === selfId;

  return (
    <motion.article
      layout
      className={`vrbo-msg ${isSelf ? "is-self" : "is-them"} ${grouped ? "is-grouped" : ""} ${showAvatar ? "has-avatar" : ""}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {isSelf ? null : showAvatar ? (
        <span className="vrbo-avatar" style={{ background: person.color }}>
          {person.initial}
        </span>
      ) : (
        <span className="vrbo-avatar is-spacer" />
      )}
      <div className="vrbo-msg__body">
        {showName ? <p className="vrbo-msg__name">{person.name}</p> : null}
        <p className="vrbo-msg__text">{message.text}</p>
      </div>
    </motion.article>
  );
}
