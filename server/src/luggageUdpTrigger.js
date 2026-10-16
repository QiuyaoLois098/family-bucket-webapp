import { PHASES } from "../../shared/index.js";

/**
 * Hardware luggage sensor → Expedia reveal advance.
 * Any UDP packet while phase === reveal schedules session.shake()
 * (same as the luggage up-arrow), after a short hold.
 */
const ADVANCE_DELAY_MS = 1000;

export function createLuggageUdpTrigger(session) {
  let pendingAdvance = null;

  function clearPending() {
    if (pendingAdvance != null) {
      clearTimeout(pendingAdvance);
      pendingAdvance = null;
    }
  }

  function handlePacket(packet) {
    const text = typeof packet === "string" ? packet : packet?.text;
    // Ignore empty / whitespace-only datagrams.
    if (text == null || !String(text).trim()) return;

    if (session.state.phase !== PHASES.REVEAL) {
      return;
    }
    if (pendingAdvance != null) {
      return;
    }

    console.log(
      `[luggage-udp] packet → shake in ${ADVANCE_DELAY_MS}ms (advance luggage → building)`,
    );
    pendingAdvance = setTimeout(() => {
      pendingAdvance = null;
      if (session.state.phase !== PHASES.REVEAL) {
        console.log(
          `[luggage-udp] delayed shake skipped (phase=${session.state.phase})`,
        );
        return;
      }
      console.log("[luggage-udp] delayed shake → building");
      session.shake();
    }, ADVANCE_DELAY_MS);
  }

  function reset() {
    clearPending();
  }

  return { handlePacket, reset };
}
