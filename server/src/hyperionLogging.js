/**
 * Hyperion logging — shared by Family Bucket List and Vrbo.
 * Client screens POST /api/hyperion/heartbeat; this module forwards to Hyperion.
 *
 * Device map is specified here (not in .env). Token: HYPERION_API.
 */

import { config } from "./config.js";
import { session } from "./session.js";
import { vrboV2Session } from "./vrboV2Session.js";

const EVENT_SLUG = "expedia-october-2026-event";
const BASE_URL = `https://hyperion.de-yan.com/api/v2/${EVENT_SLUG}`;

/**
 * URL path → Hyperion hardware device (from event hardware table).
 * Device value is sent as applicationMetrics.device.
 */
export const HYPERION_DEVICES_BY_PATH = Object.freeze({
  // Family Bucket List
  "/expedia-left": { id: "expedia-oct26-fbl-interactive", label: "interactive" },
  "/expedia-right": { id: "expedia-oct26-fbl-output", label: "output" },

  // Vrbo Group Trip
  "/vrbo-left": { id: "expedia-oct26-vgc-organizer", label: "output" },
  "/vrbo-right": { id: "expedia-oct26-vgc-output", label: "organizer" },
  "/vrbo-ip1": { id: "expedia-oct26-vgc-phone-1", label: "phone-1" },
  "/vrbo-ip2": { id: "expedia-oct26-vgc-phone-2", label: "phone-2" },
  "/vrbo-ip3": { id: "expedia-oct26-vgc-phone-3", label: "phone-3" },
  // Legacy phone paths (redirected on client, still accepted here)
  "/sarah": { id: "expedia-oct26-vgc-phone-1", label: "phone-1" },
  "/alex": { id: "expedia-oct26-vgc-phone-2", label: "phone-2" },
  "/chris": { id: "expedia-oct26-vgc-phone-3", label: "phone-3" },
});

const HEALTH = Object.freeze({
  HEALTHY: "HEALTHY",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
});

let overrideHealth = null;
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

export function bindHyperionIo(io) {
  ioRef = io ?? null;
  startedAt = Date.now();
}

export function resolveHyperionDevice(path) {
  if (!path || typeof path !== "string") return null;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return HYPERION_DEVICES_BY_PATH[normalized] ?? null;
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
  };
}

export async function sendHeartbeat(device, { healthStatus, applicationMetrics } = {}) {
  const token = config.hyperionApi;
  if (!token) {
    return { ok: false, skipped: true, status: null, error: "HYPERION_API not set" };
  }
  if (!device?.id) {
    return { ok: false, skipped: true, status: null, error: "missing device id" };
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
      return {
        ok: true,
        status: response.status,
        deviceId: device.id,
        deviceLabel: device.label,
        healthStatus: status,
      };
    }

    const text = await response.text().catch(() => "");
    consecutiveFailures += 1;
    lastError = `HTTP ${response.status}${text ? `: ${text.slice(0, 180)}` : ""}`;
    return {
      ok: false,
      status: response.status,
      error: lastError,
      deviceId: device.id,
      deviceLabel: device.label,
      healthStatus: status,
    };
  } catch (error) {
    consecutiveFailures += 1;
    lastError = error?.message || String(error);
    return {
      ok: false,
      status: null,
      error: lastError,
      deviceId: device.id,
      deviceLabel: device.label,
      healthStatus: status,
    };
  }
}

/** Resolve path → device and forward one heartbeat to Hyperion. */
export async function forwardHeartbeatForPath(path) {
  const device = resolveHyperionDevice(path);
  if (!device) {
    return { ok: false, skipped: true, status: null, error: `no Hyperion device for path ${path}` };
  }
  return sendHeartbeat(device);
}

export { HEALTH as HYPERION_HEALTH };
