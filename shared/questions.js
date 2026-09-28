export const QUESTIONS = [
  {
    id: "activity",
    prompt: "What would you like to do?",
    options: [
      {
        id: "adventurous",
        label: "Try something adventurous",
        image: "/images/Expedia-images/options/q1_1.png",
        promptHint:
          "an adventurous family moment, suspension bridge or rainforest trail, sense of discovery and energy",
      },
      {
        id: "slow",
        label: "Take it slow",
        image: "/images/Expedia-images/options/q1_2.png",
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
        promptHint:
          "kids leading the adventure, wonder and discovery, wildlife or rainforest moments from a child's point of view",
      },
      {
        id: "grownups",
        label: "The grown-ups get to unwind",
        image: "/images/Expedia-images/options/q2-2.png",
        promptHint:
          "parents unwinding together, quiet porch or sunset table, kids happily occupied nearby, soft tropical light",
      },
      {
        id: "everyone",
        label: "Everyone gets their moment",
        image: "/images/Expedia-images/options/q2-3.png",
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
        promptHint:
          "a memorable local meal, regional specialties, grilled catch, rice and plantains, warm outdoor dining atmosphere",
      },
      {
        id: "fresh",
        label: "Fresh & healthy",
        image: "/images/Expedia-images/options/q3-2.png",
        promptHint:
          "fresh tropical fruit, bright healthy plates, light coastal dining, vivid natural ingredients",
      },
    ],
  },
];

export const BLUR_LEVELS = [40, 28, 14, 0];

/** How much of the destination image is visible (center crop) after each answer. */
export const REVEAL_VISIBLE = [0.3, 0.5, 0.8, 1];
