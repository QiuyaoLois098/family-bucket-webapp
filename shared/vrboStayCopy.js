/**
 * Headline + highlights from the Hotel Reveal Copy Matrix.
 * Only those two lines are dynamic; facts, imagery, rating, reviews, CTA stay fixed.
 */

export const FEATURE_ORDER = [
  "private-pool",
  "outdoor-dining",
  "near-beach",
  "wifi",
  "fire-pit",
  "hot-tub",
  "air-conditioning",
  "big-kitchen",
];

function orderIndex(featureId) {
  const index = FEATURE_ORDER.indexOf(featureId);
  return index === -1 ? FEATURE_ORDER.length : index;
}

function asCountMap(featureCounts) {
  if (featureCounts instanceof Map) return featureCounts;
  return new Map(Object.entries(featureCounts ?? {}));
}

function compareByCountThenOrder(a, b, counts) {
  const byCount = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
  if (byCount !== 0) return byCount;
  return orderIndex(a) - orderIndex(b);
}

export function countFeatureSelections(guestSelections = []) {
  const counts = new Map();
  guestSelections.forEach((picks) => {
    (picks ?? []).forEach((featureId) => {
      if (!featureId) return;
      counts.set(featureId, (counts.get(featureId) ?? 0) + 1);
    });
  });
  return counts;
}

export function featureCountsFromResults(results = []) {
  const counts = new Map();
  results.forEach((entry) => {
    (entry.matched ?? []).forEach((match) => {
      if (!match?.id) return;
      counts.set(match.id, match.weight ?? 1);
    });
  });
  return counts;
}

/** Primary feature: matched priority with the most guests; ties use fixed order. */
export function pickHeadlineFeature(priorities = [], results = []) {
  const covered = new Set();
  results.forEach((entry) => {
    (entry.matched ?? []).forEach((match) => {
      if (match?.id) covered.add(match.id);
    });
    (entry.property?.features ?? []).forEach((featureId) => covered.add(featureId));
  });

  const selected = (priorities ?? []).filter(Boolean);
  if (!selected.length) return null;

  const matched = covered.size
    ? selected.filter((featureId) => covered.has(featureId))
    : selected;
  return (matched.length ? matched : selected)[0] ?? null;
}

export function buildStayHeadline(priorities = [], copy = {}, results = []) {
  const phrases = copy.ranking?.headlinePhrases ?? {};
  const featureId = pickHeadlineFeature(priorities, results);
  return (
    (featureId && phrases[featureId]) ||
    copy.ranking?.resultsTitleFallback ||
    "Hawaii homes for private pool days"
  );
}

export function buildStayHighlights(property, featureCounts, copy = {}) {
  const features = (property?.features ?? []).filter(Boolean);
  if (!features.length) {
    return property?.highlightsText || (property?.highlights ?? []).join(", ") || "";
  }

  const counts = asCountMap(featureCounts);
  const matrix = copy.ranking?.featureCopy ?? {};
  const selected = features.filter((featureId) => (counts.get(featureId) ?? 0) > 0);
  const shared = selected.filter((featureId) => (counts.get(featureId) ?? 0) >= 2);

  let leadId;
  if (shared.length) {
    leadId = [...shared].sort((a, b) => compareByCountThenOrder(a, b, counts))[0];
  } else if (selected.length) {
    leadId = [...selected].sort((a, b) => compareByCountThenOrder(a, b, counts))[0];
  } else {
    leadId = [...features].sort((a, b) => orderIndex(a) - orderIndex(b))[0];
  }

  const remaining = features.filter((featureId) => featureId !== leadId);
  const supportSelected = remaining
    .filter((featureId) => (counts.get(featureId) ?? 0) > 0)
    .sort((a, b) => compareByCountThenOrder(a, b, counts));
  const supportRest = remaining
    .filter((featureId) => (counts.get(featureId) ?? 0) === 0)
    .sort((a, b) => orderIndex(a) - orderIndex(b));
  const supportIds = [...supportSelected, ...supportRest].slice(0, 2);

  const lead =
    matrix[leadId]?.lead ||
    copy.summary?.phrases?.[leadId] ||
    leadId;
  const supports = supportIds.map(
    (featureId) => matrix[featureId]?.supporting || copy.summary?.phrases?.[featureId] || featureId,
  );

  if (!supports.length) return `${lead}.`;
  if (supports.length === 1) return `${lead} and ${supports[0]}.`;
  return `${lead}, ${supports[0]}, and ${supports[1]}.`;
}

export function applyStayCopy(results, guestSelections, copy) {
  const counts = countFeatureSelections(guestSelections);
  return (results ?? []).map((entry) => {
    const property = { ...entry.property };
    property.highlightsText = buildStayHighlights(property, counts, copy);
    return { ...entry, property };
  });
}

/**
 * Chat card title: "{displayName} w/ {top 2 guest priorities}".
 * Priorities come ranked (most guests first). Only tags the property offers
 * count; suppressed tags (Near Beach) never appear.
 */
export function buildStayCardTitle(property, priorities = [], copy = {}) {
  const base = property?.displayName || property?.name || "";
  const labels = copy.chat?.cardTitleTags ?? {};
  const suppressed = new Set(property?.suppressTags ?? []);
  const offered = (property?.titleTags ?? property?.features ?? []).filter(
    (id) => !suppressed.has(id),
  );
  const offeredSet = new Set(offered);

  const picked = [];
  (priorities ?? []).forEach((id) => {
    if (picked.length < 2 && offeredSet.has(id) && !picked.includes(id)) picked.push(id);
  });
  [...offered]
    .sort((a, b) => orderIndex(a) - orderIndex(b))
    .forEach((id) => {
      if (picked.length < 2 && !picked.includes(id)) picked.push(id);
    });

  const words = picked.map((id) => labels[id]).filter(Boolean);
  if (!words.length) return base;
  return `${base} w/ ${words.join(" & ")}`;
}

export function ratingWord(rating, copy = {}) {
  const score = Number.parseFloat(rating);
  if (Number.isNaN(score)) return "";
  const scale = copy.chat?.ratingScale ?? [];
  return scale.find((step) => score >= step.min)?.label ?? "";
}

/** "House · 4 bedrooms · 6 beds" */
export function stayTypeLine(property) {
  return [property?.propertyType, property?.bedrooms, property?.beds || property?.sleeps]
    .filter(Boolean)
    .join(" · ");
}

export function stayStatsLine(property) {
  const beds = property?.beds || property?.sleeps;
  const price = property?.nightly ? `${property.nightly} / night` : null;
  return [property?.bedrooms, beds, price].filter(Boolean).join(" · ");
}
