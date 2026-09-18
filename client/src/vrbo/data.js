export const GUESTS = [
  { id: "alex", name: "Alex", label: "Guest 1", color: "#c45c32", initial: "A" },
  { id: "sam", name: "Sam", label: "Guest 2", color: "#3d5a45", initial: "S" },
  { id: "taylor", name: "Taylor", label: "Guest 3", color: "#5b6d8a", initial: "T" },
];

export const JAMIE = { id: "jamie", name: "Jamie", color: "#b08a3e", initial: "J" };

export const QUESTIONS = [
  {
    id: "setting",
    prompt: "What kind of setting are you looking for?",
    jamie: "What kind of setting are we thinking?",
    options: [
      { id: "lake", label: "By the lake", emoji: "🌊" },
      { id: "woods", label: "In the woods", emoji: "🌲" },
      { id: "mountain", label: "Mountain view", emoji: "⛰" },
      { id: "town", label: "Close to town", emoji: "🏘" },
    ],
  },
  {
    id: "vibe",
    prompt: "What's your ideal vibe?",
    jamie: "And the vibe?",
    options: [
      { id: "cozy", label: "Cozy & rustic", emoji: "🕯" },
      { id: "modern", label: "Modern", emoji: "✨" },
      { id: "remote", label: "Remote escape", emoji: "🗺" },
      { id: "social", label: "Social / group friendly", emoji: "🥂" },
    ],
  },
  {
    id: "priority",
    prompt: "What matters most?",
    jamie: "What matters most to everyone?",
    options: [
      { id: "view", label: "Amazing view", emoji: "🌅" },
      { id: "kitchen", label: "Big kitchen", emoji: "🍳" },
      { id: "fireplace", label: "Fireplace", emoji: "🔥" },
      { id: "outdoor", label: "Outdoor space", emoji: "🌿" },
    ],
  },
  {
    id: "activity",
    prompt: "Pick your perfect activity.",
    jamie: "Last one — perfect activity?",
    options: [
      { id: "hiking", label: "Hiking", emoji: "🥾" },
      { id: "swimming", label: "Swimming", emoji: "🏊" },
      { id: "cooking", label: "Cooking together", emoji: "🍲" },
      { id: "hang", label: "Late night hang", emoji: "🌙" },
    ],
  },
];

export const PROPERTIES = [
  {
    id: "pine",
    name: "Pine House",
    location: "Rangeley, Maine",
    setting: "Lakefront",
    sleeps: 8,
    description: "A timbered lodge on the water, with a long dock and a kitchen made for a crowd.",
    tags: ["Lakefront", "Fireplace", "Big Kitchen", "Sleeps 8"],
    traits: ["lake", "cozy", "kitchen", "fireplace", "swimming", "cooking", "social"],
    image: "/images/memories/water.jpg",
  },
  {
    id: "cedar",
    name: "Cedar Cabin",
    location: "Bethel, Maine",
    setting: "Mountain View",
    sleeps: 6,
    description: "Floor-to-ceiling glass, a quiet ridge, and trailheads a few minutes from the door.",
    tags: ["Mountain View", "Modern", "Hiking", "Sleeps 6"],
    traits: ["mountain", "modern", "remote", "view", "hiking", "hang"],
    image: "/images/destinations/catskills.jpg",
  },
  {
    id: "moose",
    name: "Moose Lodge",
    location: "Greenville, Maine",
    setting: "Lake + Forest",
    sleeps: 10,
    description: "A big-hearted camp in the trees, with a fire pit, a lake path, and room for everyone.",
    tags: ["Lake + Forest", "Outdoor space", "Group friendly", "Sleeps 10"],
    traits: ["woods", "lake", "social", "outdoor", "cooking", "hang", "fireplace"],
    image: "/images/memories/forest.jpg",
  },
];

export const PRESET_ANSWERS = {
  alex: ["lake", "cozy", "fireplace", "swimming"],
  sam: ["mountain", "remote", "view", "hiking"],
  taylor: ["woods", "social", "outdoor", "cooking"],
};

export function findOption(questionIndex, optionId) {
  return QUESTIONS[questionIndex]?.options.find((option) => option.id === optionId);
}

export function findGuest(id) {
  return GUESTS.find((guest) => guest.id === id);
}

export function findProperty(id) {
  return PROPERTIES.find((property) => property.id === id);
}

export function matchPercent(property, guests) {
  const answers = Object.values(guests).flatMap((guest) => guest.answers);
  if (!answers.length) return 80;
  const hits = answers.filter((id) => property.traits.includes(id)).length;
  const score = 78 + Math.round((hits / Math.max(answers.length, 1)) * 20);
  return Math.min(98, score);
}

export function rankingPoints(rankings) {
  const points = Object.fromEntries(PROPERTIES.map((property) => [property.id, 0]));
  Object.values(rankings).forEach((order) => {
    order.forEach((propertyId, index) => {
      if (points[propertyId] == null) return;
      points[propertyId] += 3 - index;
    });
  });
  return points;
}

export function winningPropertyId(rankings, guests) {
  const points = rankingPoints(rankings);
  const ranked = [...PROPERTIES].sort((a, b) => {
    const delta = points[b.id] - points[a.id];
    if (delta) return delta;
    return matchPercent(b, guests) - matchPercent(a, guests);
  });
  return ranked[0].id;
}
