import dgram from "dgram";

/**
 * Listen for UDP datagrams and forward payloads to Socket.IO clients.
 * Browsers can't receive UDP directly, so this is the bridge.
 * Optional onPacket(packet) hooks (e.g. luggage sensor → Expedia shake).
 */
export function startUdpBridge(
  io,
  { port = 41234, host = "0.0.0.0", onPacket } = {},
) {
  const socket = dgram.createSocket("udp4");

  socket.on("message", (msg, rinfo) => {
    const text = msg.toString("utf8");
    const packet = {
      text,
      from: `${rinfo.address}:${rinfo.port}`,
      bytes: msg.length,
      at: Date.now(),
    };
    console.log(`[udp] ${packet.from} → ${text}`);
    io.emit("udp:message", packet);
    try {
      onPacket?.(packet);
    } catch (err) {
      console.error("[udp] onPacket error:", err?.message || err);
    }
  });

  socket.on("error", (err) => {
    console.error("[udp] socket error:", err.message);
  });

  socket.bind(port, host, () => {
    const address = socket.address();
    console.log(`UDP listener:          udp://${address.address}:${address.port}`);
  });

  return socket;
}
