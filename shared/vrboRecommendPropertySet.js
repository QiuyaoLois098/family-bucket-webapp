/**
 * Recommend a set of 3 properties that fairly cover guest feature picks.
 *
 * @param {Array<{ id: string|number, features: string[] }>} properties
 * @param {string[][]} guestSelections - each guest's selected feature ids (typically 3)
 * @param {{ resultBadges?: string[] }} [options]
 * @returns {Array<{
 *   property: object,
 *   score: number,
 *   matched: Array<{ id: string, rank: number, weight: number }>,
 *   maxScore: number,
 *   matchPercent: number,
 *   badge: string|null,
 *   combination?: {
 *     minGuestCoverage: number,
 *     groupPreferenceScore: number,
 *     totalGuestCoverage: number,
 *   }
 * }>}
 */
export function recommendPropertySet(properties, guestSelections, options = {}) {
  const badges = options.resultBadges ?? ["01", "02", "03"];
  const lists = (guestSelections ?? [])
    .map((picks) => (picks ?? []).filter(Boolean))
    .filter((picks) => picks.length > 0);

  if (!properties?.length || !lists.length) return [];

  const groupFeatureSet = new Set();
  lists.forEach((picks) => {
    picks.forEach((featureId) => groupFeatureSet.add(featureId));
  });

  const combos = chooseK(properties, 3);

  function scoreCombos(requireSharedMatch) {
    const next = [];
    for (const combo of combos) {
      if (
        requireSharedMatch &&
        combo.some(
          (property) =>
            !(property.features ?? []).some((featureId) => groupFeatureSet.has(featureId)),
        )
      ) {
        continue;
      }

      const covered = new Set();
      combo.forEach((property) => {
        (property.features ?? []).forEach((featureId) => covered.add(featureId));
      });

      const guestCoverages = lists.map(
        (picks) => picks.filter((featureId) => covered.has(featureId)).length,
      );

      // Every guest must have at least one of their picks represented.
      if (guestCoverages.some((count) => count === 0)) continue;

      const minGuestCoverage = Math.min(...guestCoverages);
      const totalGuestCoverage = guestCoverages.reduce((sum, count) => sum + count, 0);

      // Unique covered features: points = how many guests selected that feature.
      let groupPreferenceScore = 0;
      covered.forEach((featureId) => {
        const fans = lists.filter((picks) => picks.includes(featureId)).length;
        groupPreferenceScore += fans;
      });

      next.push({
        combo,
        minGuestCoverage,
        groupPreferenceScore,
        totalGuestCoverage,
      });
    }
    return next;
  }

  // Each stay should match at least one group-selected priority; fall back if none do.
  const scored = scoreCombos(true);
  const ranked = scored.length ? scored : scoreCombos(false);

  if (!ranked.length) return [];

  ranked.sort((a, b) => {
    if (b.minGuestCoverage !== a.minGuestCoverage) {
      return b.minGuestCoverage - a.minGuestCoverage;
    }
    if (b.groupPreferenceScore !== a.groupPreferenceScore) {
      return b.groupPreferenceScore - a.groupPreferenceScore;
    }
    return b.totalGuestCoverage - a.totalGuestCoverage;
  });

  const winner = ranked[0];
  const groupFeatureCounts = new Map();
  lists.forEach((picks) => {
    picks.forEach((featureId) => {
      groupFeatureCounts.set(featureId, (groupFeatureCounts.get(featureId) ?? 0) + 1);
    });
  });

  // Order winning properties by how many group-selected features each covers.
  const ordered = [...winner.combo].sort((a, b) => {
    const aHits = (a.features ?? []).filter((id) => groupFeatureCounts.has(id)).length;
    const bHits = (b.features ?? []).filter((id) => groupFeatureCounts.has(id)).length;
    if (bHits !== aHits) return bHits - aHits;
    return (a.order ?? a.id ?? 0) - (b.order ?? b.id ?? 0);
  });

  const maxPerGuest = Math.max(...lists.map((picks) => picks.length), 1);

  return ordered.map((property, index) => {
    const matched = (property.features ?? [])
      .filter((id) => groupFeatureCounts.has(id))
      .map((id) => ({
        id,
        rank: 1,
        weight: groupFeatureCounts.get(id) ?? 1,
      }))
      .sort((a, b) => b.weight - a.weight);

    const score = matched.reduce((sum, entry) => sum + entry.weight, 0);
    const maxScore = lists.length * maxPerGuest;

    return {
      property,
      score,
      matched,
      maxScore,
      matchPercent: Math.round((score / Math.max(maxScore, 1)) * 100),
      badge: badges[index] ?? null,
      combination: {
        minGuestCoverage: winner.minGuestCoverage,
        groupPreferenceScore: winner.groupPreferenceScore,
        totalGuestCoverage: winner.totalGuestCoverage,
      },
    };
  });
}

/** All unordered k-subsets of items. */
export function chooseK(items, k) {
  const list = items ?? [];
  if (k <= 0 || list.length < k) return [];
  if (k === list.length) return [list.slice()];

  const results = [];
  const path = [];

  function walk(start) {
    if (path.length === k) {
      results.push(path.slice());
      return;
    }
    for (let i = start; i < list.length; i += 1) {
      path.push(list[i]);
      walk(i + 1);
      path.pop();
    }
  }

  walk(0);
  return results;
}
