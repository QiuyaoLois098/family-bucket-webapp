/**
 * In-memory Hyperion request log for ?dev=1 overlays.
 * Broadcasts each entry over Socket.IO.
 */

import { randomUUID } from "crypto";

const MAX_ENTRIES = 40;

/** @type {import("socket.io").Server | null} */
let ioRef = null;
/** @type {object[]} */
let entries = [];

export function bindHyperionActivityIo(io) {
  ioRef = io ?? null;
}

export function getHyperionActivity() {
  return entries.slice();
}

/**
 * @param {object} entry
 * @param {"heartbeat"|"event"} entry.kind
 * @param {boolean} [entry.ok]
 * @param {number|null} [entry.status]
 * @param {string} [entry.error]
 * @param {string} [entry.slug]
 * @param {string} [entry.sessionId]
 * @param {string} [entry.eventKey]
 * @param {string} [entry.sourceId]
 * @param {string} [entry.deviceLabel]
 * @param {string} [entry.path]
 * @param {boolean} [entry.skipped]
 * @param {object} [entry.request] Full outbound request for expand view
 */
export function recordHyperionActivity(entry) {
  const item = {
    id: randomUUID(),
    at: Date.now(),
    kind: entry.kind || "event",
    ok: Boolean(entry.ok),
    status: entry.status ?? null,
    error: entry.error ?? null,
    skipped: Boolean(entry.skipped),
    slug: entry.slug ?? null,
    sessionId: entry.sessionId ?? null,
    eventKey: entry.eventKey ?? null,
    sourceId: entry.sourceId ?? null,
    deviceLabel: entry.deviceLabel ?? null,
    path: entry.path ?? null,
    request: entry.request ?? null,
  };

  entries = [item, ...entries].slice(0, MAX_ENTRIES);
  if (ioRef) {
    ioRef.emit("hyperion:activity", item);
  }
  return item;
}
