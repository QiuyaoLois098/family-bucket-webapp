/**
 * Hyperion custom-event logging utility (Family Bucket + Vrbo).
 *
 * POST .../custom-events/events
 * Token: HYPERION_API from .env
 *
 * Used by FBL / Vrbo experience code to POST catalogue events.
 */

import { randomUUID } from "crypto";
import { config } from "./config.js";
import { recordHyperionActivity } from "./hyperionActivity.js";

const PROJECT_SLUG = "expedia-october-2026-event";
const EVENTS_URL = `https://hyperion.de-yan.com/api/v2/${PROJECT_SLUG}/custom-events/events`;

/** Station IDs from the Hyperion event brief (section 2). */
export const HYPERION_STATIONS = Object.freeze({
  FAMILY_BUCKET_LIST: "family-bucket-list",
  VRBO_GROUP_CHAT: "vrbo-group-chat",
});

export const HYPERION_SOURCE = "WEB_APP";

/**
 * @typedef {object} HyperionEventInput
 * @property {string} slug Event type from the catalogue (e.g. "vgc_interaction")
 * @property {string} stationId HYPERION_STATIONS.* value
 * @property {string} sourceId This device's Hyperion Device ID
 * @property {Record<string, unknown>} fieldData Must include `device` (and catalogue fields)
 * @property {string} [sessionId] Shared session UUID; omit only for out-of-session events
 * @property {string} [occurredAt] ISO 8601 UTC; defaults to now
 * @property {string} [eventKey] Defaults to `<slug>:<uuid>`
 */

/**
 * Build the JSON body for a Hyperion custom event (does not send).
 * @param {HyperionEventInput} input
 */
export function buildHyperionEventPayload(input) {
  const { slug, stationId, sourceId, fieldData, sessionId, occurredAt, eventKey } = input ?? {};

  if (!slug || typeof slug !== "string") {
    throw new Error("Hyperion event requires slug");
  }
  if (!stationId || typeof stationId !== "string") {
    throw new Error("Hyperion event requires stationId");
  }
  if (!sourceId || typeof sourceId !== "string") {
    throw new Error("Hyperion event requires sourceId");
  }
  if (!fieldData || typeof fieldData !== "object" || Array.isArray(fieldData)) {
    throw new Error("Hyperion event requires fieldData object");
  }
  if (fieldData.device == null || fieldData.device === "") {
    throw new Error("Hyperion event fieldData.device is required");
  }

  /** @type {Record<string, unknown>} */
  const payload = {
    slug,
    stationId,
    source: HYPERION_SOURCE,
    sourceId,
    eventKey: eventKey || `${slug}:${randomUUID()}`,
    occurredAt: occurredAt || new Date().toISOString(),
    fieldData: { ...fieldData },
  };

  if (sessionId != null && sessionId !== "") {
    payload.sessionId = sessionId;
  }

  return payload;
}

/**
 * POST one custom event to Hyperion.
 * @param {HyperionEventInput} input
 * @returns {Promise<{ ok: boolean, status: number|null, skipped?: boolean, error?: string, eventKey?: string, payload?: object }>}
 */
export async function sendHyperionEvent(input) {
  const token = config.hyperionApi;
  if (!token) {
    const result = { ok: false, skipped: true, status: null, error: "HYPERION_API not set" };
    recordHyperionActivity({
      kind: "event",
      ...result,
      slug: input?.slug,
      sessionId: input?.sessionId,
      sourceId: input?.sourceId,
      deviceLabel: input?.fieldData?.device,
    });
    return result;
  }

  let payload;
  try {
    payload = buildHyperionEventPayload(input);
  } catch (error) {
    const result = {
      ok: false,
      skipped: true,
      status: null,
      error: error?.message || String(error),
    };
    recordHyperionActivity({
      kind: "event",
      ...result,
      slug: input?.slug,
      sessionId: input?.sessionId,
      sourceId: input?.sourceId,
      deviceLabel: input?.fieldData?.device,
    });
    return result;
  }

  const activityBase = {
    kind: "event",
    slug: /** @type {string} */ (payload.slug),
    sessionId: /** @type {string|undefined} */ (payload.sessionId) ?? null,
    eventKey: /** @type {string} */ (payload.eventKey),
    sourceId: /** @type {string} */ (payload.sourceId),
    deviceLabel: /** @type {any} */ (payload.fieldData)?.device ?? null,
  };

  try {
    const response = await fetch(EVENTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = {
        ok: true,
        status: response.status,
        eventKey: /** @type {string} */ (payload.eventKey),
        payload,
      };
      recordHyperionActivity({ ...activityBase, ok: true, status: response.status });
      return result;
    }

    const text = await response.text().catch(() => "");
    const result = {
      ok: false,
      status: response.status,
      error: `HTTP ${response.status}${text ? `: ${text.slice(0, 180)}` : ""}`,
      eventKey: /** @type {string} */ (payload.eventKey),
      payload,
    };
    recordHyperionActivity({
      ...activityBase,
      ok: false,
      status: response.status,
      error: result.error,
    });
    return result;
  } catch (error) {
    const result = {
      ok: false,
      status: null,
      error: error?.message || String(error),
      eventKey: /** @type {string} */ (payload.eventKey),
      payload,
    };
    recordHyperionActivity({
      ...activityBase,
      ok: false,
      status: null,
      error: result.error,
    });
    return result;
  }
}

export const HYPERION_EVENTS_URL = EVENTS_URL;
