export const QUESTIONS = [
  {
    id: "activity",
    prompt:
      "Great — I’ll plan around what you already have booked. What sounds most like your family?",
    pickHint: "(Pick 1 option)",
    /** After select: outdoors bubble + Thinking, then fade into Q2 */
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
    prompt: "I found two options your family might love. Which one should we add?",
    pickHint: "(Pick 1 option)",
    options: [
      {
        id: "emerald-bay",
        label: "Emerald Bay guided kayak",
        description: "Clear-bottom kayaking on Emerald Bay.",
        badge: "Expedia · Bookable",
        badgeTone: "bookable",
        image: "/images/Expedia-images/options/q2-kayak-1.png",
        youSay:
          "Let’s build around the Guided Kayak Tour on Emerald Bay and Tahoe Treetop Adventure Ropes Course.",
        aiSay:
          "Perfect — I’ll start with kayaking on Emerald Bay, then add the ropes course in Tahoe City.",
        promptHint:
          "clear-bottom kayaking on Emerald Bay, family outdoor adventure near South Lake Tahoe",
      },
      {
        id: "tahoe-city-ropes",
        label: "Tahoe City ropes course",
        description: "Take on a treetop ropes course in Tahoe City.",
        badge: "From Google Maps",
        badgeTone: "maps",
        image: "/images/Expedia-images/options/q2-ropes-1.png",
        youSay:
          "Let’s build around the Tahoe City ropes course and a clear-bottom kayak on Emerald Bay.",
        aiSay:
          "Perfect — I’ll start with the ropes course in Tahoe City, then add kayaking on Emerald Bay.",
        promptHint:
          "treetop ropes course in Tahoe City, family outdoor adventure near South Lake Tahoe",
      },
    ],
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
