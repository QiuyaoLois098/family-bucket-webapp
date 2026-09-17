export const QUESTIONS = [
  {
    id: "activity",
    prompt: "What would you want to do first?",
    options: [
      {
        id: "explore",
        label: "Explore somewhere unexpected",
        promptHint: "an unexpected discovery just off the usual path, a sense of wandering into somewhere new",
      },
      {
        id: "eat",
        label: "Find something amazing to eat",
        promptHint: "a memorable meal, local ingredients, a beautiful table or market, atmosphere of hospitality",
      },
      {
        id: "view",
        label: "Slow down and take in the view",
        promptHint: "a cinematic overlook, open sky, still water or distant mountains, a place to pause",
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
