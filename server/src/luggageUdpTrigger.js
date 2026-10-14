import { PHASES } from "../../shared/index.js";

/**
 * Hardware luggage sensor → Expedia reveal advance.
 * ESP32 sends UTF-8: "luggage status: 0" | "luggage status: 1"
 * On 0 → 1 while phase === reveal, same as clicking the luggage up-arrow (session.shake).
 */
const STATUS_RE = /luggage\s*status\s*[:=]\s*([01])/i;

export function createLuggageUdpTrigger(session) {
  let lastStatus = null;

  function handlePacket(packet) {
    const text = typeof packet === "string" ? packet : packet?.text;
    if (!text) return;

    const match = String(text).match(STATUS_RE);
    if (!match) return;

    const status = Number(match[1]);
    const prev = lastStatus;
    lastStatus = status;

    if (prev === 0 && status === 1) {
      if (session.state.phase !== PHASES.REVEAL) {
        console.log(
          `[luggage-udp] 0→1 ignored (phase=${session.state.phase}, need reveal/luggage)`,
        );
        return;
      }
      console.log("[luggage-udp] 0→1 → shake (advance luggage → building)");
      session.shake();
    }
  }

  function reset() {
    lastStatus = null;
  }

  return { handlePacket, reset };
}
