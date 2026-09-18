import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage.jsx";

export default function Chat({ messages, people, compact = false, selfId = null }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return (
    <div className={`vrbo-chat ${compact ? "is-compact" : ""}`}>
      <p className="vrbo-chat__stamp">Today 9:41 AM</p>
      {messages.map((message, index) => {
        const prev = messages[index - 1];
        const next = messages[index + 1];
        const grouped = prev?.from === message.from;
        const showName = message.from !== selfId && prev?.from !== message.from;
        const showAvatar = message.from !== selfId && next?.from !== message.from;
        return (
          <ChatMessage
            key={message.id}
            message={message}
            people={people}
            selfId={selfId}
            grouped={grouped}
            showName={showName}
            showAvatar={showAvatar}
          />
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
