export const QUESTIONS = [
  {
    id: "activity",
    prompt: "What do you have in mind for your trip?",
    options: [
      {
        id: "adventurous",
        label: "Try something adventurous",
        image: "/images/Expedia-images/options/q1_1.png",
        youSay: "We'd like to try something adventurous.",
        aiSay: "A little adventure it is!",
        promptHint:
          "an adventurous family moment, suspension bridge or rainforest trail, sense of discovery and energy",
      },
      {
        id: "slow",
        label: "Take it slow",
        image: "/images/Expedia-images/options/q1_2.png",
        youSay: "We'd like to take it slow.",
        aiSay: "Taking it slow it is!",
        promptHint:
          "a slow beach afternoon together, soft light, calm water, unhurried family time",
      },
    ],
  },
  {
    id: "hero",
    prompt: "Who gets to be the hero of this trip?",
    options: [
      {
        id: "kids",
        label: "The kids take the lead",
        image: "/images/Expedia-images/options/q2-1.png",
        youSay: "Let the kids take the lead.",
        aiSay: "I'll keep your little explorers in mind.",
        promptHint:
          "kids leading the adventure, wonder and discovery, wildlife or rainforest moments from a child's point of view",
      },
      {
        id: "grownups",
        label: "The grown-ups get to unwind",
        image: "/images/Expedia-images/options/q2-2.png",
        youSay: "Let the grown-ups unwind.",
        aiSay: "I'll leave room for the grown-ups to recharge.",
        promptHint:
          "parents unwinding together, quiet porch or sunset table, kids happily occupied nearby, soft tropical light",
      },
      {
        id: "everyone",
        label: "Everyone gets their moment",
        image: "/images/Expedia-images/options/q2-3.png",
        youSay: "Everyone gets their moment.",
        aiSay: "I'll make sure everyone gets a turn.",
        promptHint:
          "a multi-generational family moment on the beach, shared joy, grandparents and kids together, warm daylight",
      },
    ],
  },
  {
    id: "food",
    prompt: "What kind of food would you like to try?",
    options: [
      {
        id: "local",
        label: "Local favorites",
        image: "/images/Expedia-images/options/q3-1.png",
        youSay: "We'd like to try local favorites.",
        aiSay: "I'll include local flavors for your family to discover.",
        promptHint:
          "a memorable local meal, regional specialties, grilled catch, rice and plantains, warm outdoor dining atmosphere",
      },
      {
        id: "fresh",
        label: "Fresh & healthy",
        image: "/images/Expedia-images/options/q3-2.png",
        youSay: "We'd like something fresh and healthy.",
        aiSay: "I'll keep things fresh and healthy for your family.",
        promptHint:
          "fresh tropical fruit, bright healthy plates, light coastal dining, vivid natural ingredients",
      },
    ],
  },
];

export const BLUR_LEVELS = [40, 28, 14, 0];

/** How much of the destination image is visible (center crop) after each answer. */
export const REVEAL_VISIBLE = [0.3, 0.5, 0.8, 1];
