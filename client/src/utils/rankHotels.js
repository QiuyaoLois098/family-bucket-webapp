function hotelFeatureSet(hotel) {
  return new Set(hotel.features);
}

function scoreHotel(hotel, selectedFeatures, weights) {
  const featureSet = hotelFeatureSet(hotel);
  const matchedFeatures = [];
  let score = 0;

  selectedFeatures.forEach((feature, position) => {
    if (!featureSet.has(feature)) return;
    const weight = weights[position];
    if (weight == null) return;
    score += weight;
    matchedFeatures.push({ feature, weight });
  });

  return { hotel: hotel.id, score, matchedFeatures };
}

function matchesFeature(result, feature) {
  return result.matchedFeatures.some((match) => match.feature === feature);
}

function compareRankedHotels(a, b, selectedFeatures) {
  if (b.score !== a.score) return b.score - a.score;

  for (const feature of selectedFeatures) {
    const aHit = matchesFeature(a, feature);
    const bHit = matchesFeature(b, feature);
    if (aHit !== bHit) return aHit ? -1 : 1;
  }

  if (b.matchedFeatures.length !== a.matchedFeatures.length) {
    return b.matchedFeatures.length - a.matchedFeatures.length;
  }

  return a.order - b.order;
}

export function rankHotels(selectedFeatures, config) {
  const weights = config.userRankWeights;
  const ranked = config.hotels.map((hotel, order) => ({
    ...scoreHotel(hotel, selectedFeatures, weights),
    order,
  }));

  ranked.sort((a, b) => compareRankedHotels(a, b, selectedFeatures));

  return ranked.map(({ order, ...result }) => result);
}
