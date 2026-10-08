/**
 * Hyperion logging client — shared by Family Bucket List and Vrbo.
 * Heartbeat: POST .../hardware/<DEVICE_ID>/heartbeat
 *
 * Device IDs and related options are specified here (not in .env).
 */

import { config } from "./config.js";
import { session } from "./session.js";
import { vrboV2Session } from "./vrboV2Session.js";

const EVENT_SLUG = "expedia-october-2026-event";
const BASE_URL = `https://hyperion.de-yan.com/api/v2/${EVENT_SLUG}`;
const HEARTBEAT_MS = 30_000;

/**
 * Hardware table DEVICE_IDs — fill in when ready.
 * @type {{ id: string, label: string }[]}
 */
const DEVICES = [
  // { id: "<DEVICE_ID>", label: "phone-1" },
  // { id: "<DEVICE_ID>", label: "display-1" },
];

const HEALTH = Object.freeze({
  HEALTHY: "HEALTHY",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
});

let overrideHealth = null;
let timer = null;
let startedAt = Date.now();
let consecutiveFailures = 0;
let lastOkAt = null;
let lastError = null;
/** @type {import("socket.io").Server | null} */
let ioRef = null;

export function setHyperionHealth(status) {
  if (status != null && !Object.values(HEALTH).includes(status)) {
    throw new Error(`Invalid Hyperion healthStatus: ${status}`);
  }
  overrideHealth = status;
}

function familyInSession(fb) {
  if (!fb) return false;
  if (fb.phase === "idle") return false;
  if (fb.phase === "destination" && !fb.destination) return false;
  return true;
}

function vrboInSession(vrbo) {
  if (!vrbo) return false;
  if (vrbo.stage !== "intro") return true;
  return Object.values(vrbo.joined || {}).some(Boolean);
}

function deriveHealth({ family, vrbo }) {
  if (overrideHealth) return overrideHealth;

  if (consecutiveFailures >= 5) return HEALTH.CRITICAL;
  if (consecutiveFailures >= 2) return HEALTH.WARNING;

  if (family?.imageStatus === "error" || family?.itineraryStatus === "error") {
    return HEALTH.WARNING;
  }

  if (vrbo && vrbo.stage === "results" && !vrbo.results?.length) {
    return HEALTH.WARNING;
  }

  return HEALTH.HEALTHY;
}

export function collectApplicationMetrics(deviceLabel) {
  const family = session.snapshot();
  const vrbo = vrboV2Session.snapshot();
  const joinedCount = Object.values(vrbo.joined || {}).filter(Boolean).length;
  const submittedCount = Object.values(vrbo.submitted || {}).filter(Boolean).length;
  const inSession = familyInSession(family) || vrboInSession(vrbo);

  return {
    device: deviceLabel,
    inSession,
    uptimeSec: Math.round((Date.now() - startedAt) / 1000),
    socketClients: ioRef?.engine?.clientsCount ?? null,
    familyBucket: {
      phase: family.phase,
      destinationId: family.destination?.id ?? null,
      questionIndex: family.questionIndex ?? null,
      imageStatus: family.imageStatus ?? null,
      itineraryStatus: family.itineraryStatus ?? null,
      inSession: familyInSession(family),
    },
    vrbo: {
      stage: vrbo.stage,
      runId: vrbo.runId,
      joinedCount,
      submittedCount,
      celebrating: Boolean(vrbo.celebrating),
      selectedPropertyId: vrbo.selectedPropertyId ?? null,
      inSession: vrboInSession(vrbo),
    },
    hyperion: {
      consecutiveFailures,
      lastOkAt,
      lastError,
    },
  };
}

export async function sendHeartbeat(device, { healthStatus, applicationMetrics } = {}) {
  const token = config.hyperionApi;
  if (!token) {
    return { ok: false, skipped: true, error: "HYPERION_API not set" };
  }
  if (!device?.id) {
    return { ok: false, skipped: true, error: "missing device id" };
  }

  const family = session.snapshot();
  const vrbo = vrboV2Session.snapshot();
  const status = healthStatus || deriveHealth({ family, vrbo });
  const metrics = applicationMetrics || collectApplicationMetrics(device.label);

  const url = `${BASE_URL}/hardware/${encodeURIComponent(device.id)}/heartbeat`;
  const body = {
    healthStatus: status,
    applicationMetrics: metrics,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 200) {
      consecutiveFailures = 0;
      lastOkAt = Date.now();
      lastError = null;
      return { ok: true, status: response.status, deviceId: device.id };
    }

    const text = await response.text().catch(() => "");
    consecutiveFailures += 1;
    lastError = `HTTP ${response.status}${text ? `: ${text.slice(0, 180)}` : ""}`;
    return { ok: false, status: response.status, error: lastError, deviceId: device.id };
  } catch (error) {
    consecutiveFailures += 1;
    lastError = error?.message || String(error);
    return { ok: false, error: lastError, deviceId: device.id };
  }
}

async function tick() {
  if (!DEVICES.length) return;

  for (const device of DEVICES) {
    const result = await sendHeartbeat(device);
    if (result.skipped) continue;
    if (result.ok) {
      console.log(`[hyperion] heartbeat ok · ${device.label} (${device.id})`);
    } else {
      console.warn(`[hyperion] heartbeat failed · ${device.label}: ${result.error}`);
    }
  }
}

/**
 * Start the shared Hyperion heartbeat loop (Family Bucket + Vrbo).
 * @param {{ io?: import("socket.io").Server }} [options]
 */
export function startHyperionHeartbeat({ io } = {}) {
  if (timer) return;

  ioRef = io ?? null;
  startedAt = Date.now();

  if (!config.hyperionApi) {
    console.warn("[hyperion] HYPERION_API not set — heartbeat disabled");
    return;
  }

  if (!DEVICES.length) {
    console.warn("[hyperion] no devices in DEVICES — edit server/src/hyperionLogging.js");
    return;
  }

  console.log(
    `[hyperion] heartbeat every ${HEARTBEAT_MS}ms for ${DEVICES.map((d) => `${d.label}:${d.id}`).join(", ")}`,
  );

  setTimeout(() => {
    tick().catch((error) => console.warn("[hyperion] tick error:", error?.message || error));
  }, 1500);

  timer = setInterval(() => {
    tick().catch((error) => console.warn("[hyperion] tick error:", error?.message || error));
  }, HEARTBEAT_MS);

  if (typeof timer.unref === "function") timer.unref();
}

export function stopHyperionHeartbeat() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

export { HEALTH as HYPERION_HEALTH };
