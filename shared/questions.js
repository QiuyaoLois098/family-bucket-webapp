const KAYAK_OPTIONS = [
  {
    id: "emerald-bay",
    label: "Guided Kayak Tour on Emerald Bay",
    shortLabel: "kayaking on Emerald Bay",
    badge: "Expedia · Bookable",
    badgeTone: "bookable",
    image: "/images/Expedia-images/options/q2-kayak-1.png",
  },
  {
    id: "sand-harbor",
    label: "Clear-Bottom Kayak Tour at Sand Harbor",
    shortLabel: "kayaking at Sand Harbor",
    badge: "From Google Maps",
    badgeTone: "maps",
    image: "/images/Expedia-images/options/q2-kayak-2.png",
  },
];

const ROPES_OPTIONS = [
  {
    id: "tahoe-city",
    label: "Ropes Course in Tahoe City",
    shortLabel: "the ropes course in Tahoe City",
    badge: "From Google Maps",
    badgeTone: "maps",
    image: "/images/Expedia-images/options/q2-ropes-1.png",
  },
  {
    id: "treetop",
    label: "Tahoe Treetop Adventure Ropes Course",
    shortLabel: "the ropes course at Heavenly",
    badge: "Heavenly · Bookable",
    badgeTone: "bookable",
    image: "/images/Expedia-images/options/q2-ropes-2.png",
  },
];

/** Flatten activity-pair choices for session / itinerary lookup. */
function buildActivityPairOptions(groups) {
  const [left, right] = groups;
  const options = [];
  for (const a of left.options) {
    for (const b of right.options) {
      options.push({
        id: `${a.id}|${b.id}`,
        label: `${a.label}; ${b.label}`,
        youSay: `Let’s build around the ${a.label} and ${b.label}.`,
        aiSay: `Perfect — I’ll start with ${a.shortLabel}, then add ${b.shortLabel}.`,
        promptHint: `${a.label}, ${b.label}, family outdoor adventure near South Lake Tahoe`,
      });
    }
  }
  return options;
}

const ACTIVITY_GROUPS = [
  { id: "kayak", label: "KAYAK", options: KAYAK_OPTIONS },
  { id: "ropes", label: "ROPES COURSE", options: ROPES_OPTIONS },
];

export const QUESTIONS = [
  {
    id: "activity",
    prompt:
      "Great — I’ll plan around what you already have booked. What sounds most like your family?",
    pickHint: "(Pick 1 option)",
    bridgeBubble:
      "We love the outdoors—the kids are dying to try kayaking and a ropes course near South Lake Tahoe over spring break.",
    options: [
      {
        id: "adventurous",
        label: "Try something adventurous",
        description: "Kayaking, ropes courses, and family hikes.",
        image: "/images/Expedia-images/options/q1_1.png",
        youSay: "We'd like to try something adventurous.",
        aiSay: "A little adventure it is!",
        promptHint:
          "an adventurous family moment, suspension bridge or rainforest trail, sense of discovery and energy",
      },
      {
        id: "slow",
        label: "Take it slow",
        description: "Calm lake views, easy outings, and good food.",
        image: "/images/Expedia-images/options/q1_2.png",
        youSay: "We'd like to take it slow.",
        aiSay: "Taking it slow it is!",
        promptHint:
          "a slow beach afternoon together, soft light, calm water, unhurried family time",
      },
    ],
  },
  {
    id: "activities",
    type: "activity-pair",
    userBubble:
      "We love the outdoors—the kids are dying to try kayaking and a ropes course near South Lake Tahoe over spring break.",
    prompt: "Here are a few kayak and ropes course options.",
    pickHint: "(Pick 1 option for each activity)",
    groups: ACTIVITY_GROUPS,
    options: buildActivityPairOptions(ACTIVITY_GROUPS),
  },
  {
    id: "add-on",
    prompt: "What should we add around those adventures?",
    pickHint: "(Pick 1 option)",
    options: [
      {
        id: "hike",
        label: "A nearby family hike",
        description: "An easy trail close to the hotel, before dinner",
        image: "/images/Expedia-images/options/q3-hike.png",
        youSay: "Can we add an easy family hike near our hotel?",
        aiSay:
          "Van Sickle Bi-State Park is about an 8-minute drive from your hotel, so it’s easy to fit in a family hike before dinner.",
        answerCard: {
          title: "Van Sickle Bi-State Park",
          meta: "8 min from your hotel",
          badge: "From Google Maps",
          image: "/images/Expedia-images/options/q3-vansickle.png",
        },
        promptHint:
          "easy family hike near the hotel, forest trail, mountain light, before dinner",
      },
      {
        id: "lake",
        label: "More time by the lake",
        description: "A slower afternoon with calm views by the water.",
        image: "/images/Expedia-images/options/q3-lake.png",
        youSay: "Can we keep more free time by the lake?",
        aiSay:
          "Absolutely — I’ll leave an open afternoon by the shoreline so everyone can slow down between adventures.",
        answerCard: {
          title: "Lakeside afternoon",
          meta: "Near your hotel",
          badge: "From Google Maps",
          image: "/images/Expedia-images/options/q3-lake.png",
        },
        promptHint:
          "calm lakeside afternoon, clear alpine water, pines, unhurried family time",
      },
    ],
  },
];

export function defaultAnswerId(question) {
  if (!question) return null;
  if (question.type === "activity-pair") {
    const [left, right] = question.groups;
    return `${left.options[0].id}|${right.options[0].id}`;
  }
  return question.options?.[0]?.id ?? null;
}

export function resolveAnswerOption(question, answerId) {
  if (!question || answerId == null) return null;
  return question.options?.find((item) => item.id === answerId) || null;
}

export function isValidAnswer(question, answerId) {
  return Boolean(resolveAnswerOption(question, answerId));
}

export const BLUR_LEVELS = [40, 28, 14, 0];

/** How much of the destination image is visible (center crop) after each answer. */
export const REVEAL_VISIBLE = [0.3, 0.5, 0.8, 1];
