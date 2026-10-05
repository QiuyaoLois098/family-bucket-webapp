import { useEffect, useState } from "react";
import { getSocket } from "../socket.js";

export default function UdpScreen() {
  const [lines, setLines] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const onMessage = (packet) => {
      const text = typeof packet === "string" ? packet : packet?.text ?? JSON.stringify(packet);
      const stamp = new Date(packet?.at ?? Date.now()).toLocaleTimeString();
      const from = packet?.from ? ` (${packet.from})` : "";
      console.log("[udp page]", text);
      setLines((prev) => [`[${stamp}]${from} ${text}`, ...prev].slice(0, 15));
    };

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("udp:message", onMessage);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) onConnect();

    return () => {
      socket.off("udp:message", onMessage);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100dvh",
        margin: 0,
        padding: 24,
        boxSizing: "border-box",
        background: "#0b0d12",
        color: "#e8eaef",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      }}
    >
      <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>UDP</h1>
      <p style={{ margin: "0 0 20px", opacity: 0.7, fontSize: 14 }}>
        Listening via server bridge · socket {connected ? "connected" : "disconnected"} · send UDP to
        port 41234
      </p>
      <pre
        style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 15,
          lineHeight: 1.5,
        }}
      >
        {lines.length ? lines.join("\n") : "Waiting for UDP messages…"}
      </pre>
    </main>
  );
}
