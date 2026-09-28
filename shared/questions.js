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
    id: "place",
    prompt: "What kind of place stays with you?",
    options: [
      {
        id: "wild",
        label: "Somewhere wild and untouched",
        promptHint: "untamed landscape, pristine nature, no crowds, raw geography",
      },
      {
        id: "character",
        label: "Somewhere full of local character",
        promptHint: "local architecture, textured streets, craft, markets, a place with a distinct cultural identity",
      },
      {
        id: "hidden",
        label: "Somewhere quiet and hidden",
        promptHint: "a secluded, intimate setting, soft light, a secret corner of the destination",
      },
    ],
  },
  {
    id: "tone",
    prompt: "How should this trip feel?",
    options: [
      {
        id: "adventurous",
        label: "Bright and adventurous",
        promptHint: "bright, energetic light, vivid color, a feeling of possibility and motion",
      },
      {
        id: "nostalgic",
        label: "Warm and nostalgic",
        promptHint: "warm golden tones, filmic grain, late-afternoon nostalgia, amber light",
      },
      {
        id: "dreamy",
        label: "Calm and dreamy",
        promptHint: "soft, dreamy, ethereal atmosphere, gentle haze, calm and lyrical",
      },
    ],
  },
];

export const BLUR_LEVELS = [40, 28, 14, 0];

/** How much of the destination image is visible (center crop) after each answer. */
export const REVEAL_VISIBLE = [0.3, 0.5, 0.8, 1];
