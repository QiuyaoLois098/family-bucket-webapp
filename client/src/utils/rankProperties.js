import weightConfig from "../data/vrbo/rankingWeights.json";

export function weightForRank(position, total, config = weightConfig) {
  const minimum = config.minimumWeight ?? 1;

  if (config.weightMode === "explicit") {
    const explicit = config.explicitWeights?.[position];
    return explicit == null ? minimum : explicit;
  }

  return Math.max(total - position, minimum);
}

export function rankWeights(rankedPreferences, config = weightConfig) {
  return rankedPreferences.map((id, position) => ({
    id,
    rank: position + 1,
    weight: weightForRank(position, rankedPreferences.length, config),
  }));
}

function scoreProperty(property, weighted, config) {
  const features = new Set(property.features);
  const unmatched = config.unmatchedWeight ?? 0;
  const matched = [];
  let score = 0;

  weighted.forEach(({ id, rank, weight }) => {
    if (!features.has(id)) {
      score += unmatched;
      return;
    }
    score += weight;
    matched.push({ id, rank, weight });
  });

  return { property, score, matched };
}

function compareResults(a, b, weighted) {
  if (b.score !== a.score) return b.score - a.score;

  for (const { id } of weighted) {
    const aHit = a.matched.some((match) => match.id === id);
    const bHit = b.matched.some((match) => match.id === id);
    if (aHit !== bHit) return aHit ? -1 : 1;
  }

  if (b.matched.length !== a.matched.length) return b.matched.length - a.matched.length;
  return a.order - b.order;
}

export function rankProperties(properties, rankedPreferences, config = weightConfig) {
  const weighted = rankWeights(rankedPreferences, config);
  const maxScore = weighted.reduce((total, entry) => total + entry.weight, 0) || 1;

  const scored = properties
    .map((property, order) => ({ ...scoreProperty(property, weighted, config), order }))
    .sort((a, b) => compareResults(a, b, weighted))
    .map(({ order, ...result }, index) => ({
      ...result,
      maxScore,
      matchPercent: Math.round((result.score / maxScore) * 100),
      badge: config.resultBadges?.[index] ?? null,
    }));

  const count = config.resultCount ?? 2;
  return scored.slice(0, count);
}
