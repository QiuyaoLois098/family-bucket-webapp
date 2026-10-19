/**
 * La Fortuna (Costa Rica) branching Q&A script (same tree as South Lake Tahoe).
 *
 *   q1 → a1-1 → q2-1 → a2-1 (end)
 *                    → a2-2 → q3-1 → a3-1 / a3-2
 *        a1-2 → q2-2 → a2-3 → q3-2 → a3-3 / a3-2 (shared)
 *                    → a2-4 (end)
 */
const laFortuna = {
  destinationId: "la-fortuna",
  startQuestionId: "q1",

  /** Shown on the briefing / Q&A pages */
  tripTitle: "La Fortuna · Apr 6 – 11",
  intro:
    "We're heading to La Fortuna from April 6–11. Our flights from Houston to San José are booked, and we're staying here.",
  introChip: {
    title: "Arenal Family Rainforest Lodge",
    subtitle: "La Fortuna, Costa Rica · April 6–11 · Confirmed",
    chipText: "Booked · Expedia",
    image: "/images/Expedia-images/options/costa-rica/intro.png",
  },
  /** Building phase — left memory card */
  memoryCard: {
    headline: "Your next family\nmemory awaits",
    eyebrow: "Your personalized family itinerary",
    title: "La Fortuna",
    duration: "5 days",
    footer: "Created with Activity Planner",
    image: "/images/Expedia-images/destination-view/costa-rica.jpg",
  },

  /** Right screen images during briefing / Q&A (keyed by step) */
  displayImages: {
    briefing: "/images/Expedia-images/destination-view/costa-rica.jpg",
    q1: "/images/Expedia-images/destination-view/costa-rica.jpg",
    "q2-1": "/images/Expedia-images/destination-view/costa-rica.jpg",
    "q2-2": "/images/Expedia-images/destination-view/costa-rica.jpg",
    "q3-1": "/images/Expedia-images/destination-view/costa-rica.jpg",
    "q3-2": "/images/Expedia-images/destination-view/costa-rica.jpg",
    default: "/images/Expedia-images/destination-view/costa-rica.jpg",
  },

  /**
   * Arrangement (design board):
   *   Day 1 — shared welcome
   *   Days 2–3 — Q2 order swap (adventure: zipline↔lava; relax: float↔hot springs)
   *   Day 4 — Q3 add-on (slower jungle shared; or default when Q3 skipped)
   *   Day 5 — branch ending
   */
  itinerary: {
    headline: "Five days built for your family",
    meta: "La Fortuna · Apr 6 – 11",
    summary: "Rainforest canopy, lava trails, warm pools, and volcano views",
  },

  /** Reusable one-day modules (images: /images/Expedia-images/itinerary/costa-rica/) */
  dayModules: {
    "welcome-rainforest": {
      title: "Welcome to the Rainforest",
      description:
        "Arrive via San José, settle into La Fortuna, and watch the clouds drift around Arenal Volcano.",
      image: "/images/Expedia-images/itinerary/costa-rica/welcome-rainforest.jpg",
    },
    "above-the-rainforest": {
      title: "Above the Rainforest",
      description:
        "Try Arenal EcoGlide’s zipline circuit for a new view through the rainforest canopy.",
      image: "/images/Expedia-images/itinerary/costa-rica/above-the-rainforest.jpg",
    },
    "across-the-lava-fields": {
      title: "Across the Lava Fields",
      description:
        "Explore Arenal 1968’s Lava Flow trail through the landscape left by the volcano’s eruption.",
      image: "/images/Expedia-images/itinerary/costa-rica/across-the-lava-fields.jpg",
    },
    "onto-lake-arenal": {
      title: "Onto Lake Arenal",
      description:
        "Join a guided morning paddle on Lake Arenal and take in the volcano across the water.",
      image: "/images/Expedia-images/itinerary/costa-rica/onto-lake-arenal.jpg",
    },
    "slower-jungle-day": {
      title: "A Slower Jungle Day",
      description:
        "Enjoy a picnic with Arenal in view, a short rainforest walk, and time to look for wildlife.",
      image: "/images/Expedia-images/itinerary/costa-rica/slower-jungle-day.png",
    },
    "down-the-river-slowly": {
      title: "Down the River, Slowly",
      description:
        "Float the Peñas Blancas with a naturalist, watching for monkeys, toucans, and sloths.",
      image: "/images/Expedia-images/itinerary/costa-rica/down-the-river-slowly.jpg",
    },
    "warm-soak-afternoon": {
      title: "A Warm Soak Afternoon",
      description:
        "Relax in Baldi Hot Springs’ naturally heated pools, with a dedicated area for the kids.",
      image: "/images/Expedia-images/itinerary/costa-rica/warm-soak-afternoon.jpg",
    },
    "meal-below-arenal": {
      title: "A Meal Below Arenal",
      description:
        "Enjoy a family meal at Que Rico Arenal, with volcano views and options for the kids.",
      image: "/images/Expedia-images/itinerary/costa-rica/meal-below-arenal.jpg",
    },
    "one-last-volcano-view": {
      title: "One Last Volcano View",
      description:
        "Take one last look at Arenal before the drive back to San José and your flight home.",
      image: "/images/Expedia-images/itinerary/costa-rica/one-last-volcano-view.png",
    },
    "quiet-arenal-morning": {
      title: "A Quiet Arenal Morning",
      description:
        "Enjoy a final peaceful morning beneath Arenal before checking out and heading to San José.",
      image: "/images/Expedia-images/itinerary/costa-rica/quiet-arenal-morning.png",
    },
  },

  itineraryPaths: {
    default: [
      "welcome-rainforest",
      "above-the-rainforest",
      "across-the-lava-fields",
      "onto-lake-arenal",
      "one-last-volcano-view",
    ],
    // Adventure · zipline first · lake paddle
    "a1-1|a2-1|a3-1": [
      "welcome-rainforest",
      "above-the-rainforest",
      "across-the-lava-fields",
      "onto-lake-arenal",
      "one-last-volcano-view",
    ],
    // Adventure · zipline first · slower jungle
    "a1-1|a2-1|a3-2": [
      "welcome-rainforest",
      "above-the-rainforest",
      "across-the-lava-fields",
      "slower-jungle-day",
      "one-last-volcano-view",
    ],
    // Adventure · lava first · lake paddle
    "a1-1|a2-2|a3-1": [
      "welcome-rainforest",
      "across-the-lava-fields",
      "above-the-rainforest",
      "onto-lake-arenal",
      "one-last-volcano-view",
    ],
    // Adventure · lava first · slower jungle
    "a1-1|a2-2|a3-2": [
      "welcome-rainforest",
      "across-the-lava-fields",
      "above-the-rainforest",
      "slower-jungle-day",
      "one-last-volcano-view",
    ],
    // Relax · safari float first · meal
    "a1-2|a2-3|a3-3": [
      "welcome-rainforest",
      "down-the-river-slowly",
      "warm-soak-afternoon",
      "meal-below-arenal",
      "quiet-arenal-morning",
    ],
    // Relax · safari float first · slower jungle
    "a1-2|a2-3|a3-2": [
      "welcome-rainforest",
      "down-the-river-slowly",
      "warm-soak-afternoon",
      "slower-jungle-day",
      "quiet-arenal-morning",
    ],
    // Relax · hot springs first · meal
    "a1-2|a2-4|a3-3": [
      "welcome-rainforest",
      "warm-soak-afternoon",
      "down-the-river-slowly",
      "meal-below-arenal",
      "quiet-arenal-morning",
    ],
    // Relax · hot springs first · slower jungle
    "a1-2|a2-4|a3-2": [
      "welcome-rainforest",
      "warm-soak-afternoon",
      "down-the-river-slowly",
      "slower-jungle-day",
      "quiet-arenal-morning",
    ],
  },

  questions: {
    q1: {
      id: "q1",
      text: "Great. I’ll plan around what you already have booked. What sounds most like your family?",
      answerIds: ["a1-1", "a1-2"],
    },
    "q2-1": {
      id: "q2-1",
      text: "Rainforest canopy, or lava trails? Which should come first?",
      answerIds: ["a2-1", "a2-2"],
    },
    "q2-2": {
      id: "q2-2",
      text: "A gentle river float or warm pools? Which should come first?",
      answerIds: ["a2-3", "a2-4"],
    },
    "q3-1": {
      id: "q3-1",
      text: "What else would your family like to explore?",
      answerIds: ["a3-1", "a3-2"],
    },
    "q3-2": {
      id: "q3-2",
      text: "What would round out your slower trip?",
      answerIds: ["a3-3", "a3-2"],
    },
  },

  answers: {
    "a1-1": {
      id: "a1-1",
      text: "Try something adventurous",
      subtitle: "Rainforest ziplines, lava trails, and volcano views.",
      chipText: "",
      image: "/images/Expedia-images/options/costa-rica/a1-1.jpg",
      replyMsg:
        "We love the outdoors. The kids can't wait to zip through the rainforest and explore the lava trails below Arenal.",
      aiReplyMsg: "",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it easy",
      subtitle: "Gentle river floats, warm pools, and volcano views.",
      chipText: "",
      image: "/images/Expedia-images/options/costa-rica/a1-2.jpg",
      replyMsg:
        "We'd like to take it slow. Wildlife, warm pools, and volcano views sound perfect for our family.",
      aiReplyMsg: "",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Arenal rainforest zipline",
      subtitle: "Glide through the canopy at Arenal EcoGlide.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/costa-rica/a2-1.jpg",
      replyMsg:
        "Let's start with the zipline. The kids can't wait to see the rainforest from above!",
      aiReplyMsg:
        "Perfect. I'll start with Arenal EcoGlide, then add the Arenal 1968 lava trails the next day.",
      nextQuestionId: "q3-1",
    },
    "a2-2": {
      id: "a2-2",
      text: "Arenal 1968 lava trail",
      subtitle: "Walk the landscape shaped by historic eruption.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/costa-rica/a2-2.jpg",
      replyMsg:
        "Let's start with Arenal 1968. The kids would love to explore the old lava fields!",
      aiReplyMsg:
        "Perfect. I'll start with Arenal 1968 lava trails, then add the EcoGlide zipline the next day.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Peñas Blancas safari float",
      subtitle: "Drift with a guide and look for rainforest wildlife.",
      chipText: "Expedia · Partners",
      image: "/images/Expedia-images/options/costa-rica/a2-3.jpg",
      replyMsg:
        "Let's start with the safari float. The kids would love to spot wildlife from the river!",
      aiReplyMsg:
        "Perfect. I'll start with the Peñas Blancas safari float, then add Baldi Hot Springs the next day.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Baldi Hot Springs afternoon",
      subtitle: "Enjoy warm pools for a chill afternoon soak.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/costa-rica/a2-4.jpg",
      replyMsg:
        "Let's start with the hot springs. A warm soak sounds perfect for everyone!",
      aiReplyMsg:
        "Perfect. I'll start with Baldi Hot Springs, then add the Peñas Blancas safari float the next day.",
      nextQuestionId: "q3-2",
    },

    "a3-1": {
      id: "a3-1",
      text: "A paddle below the volcano",
      subtitle: "Add a guided kayak on the lake.",
      chipText: "",
      image: "/images/Expedia-images/options/costa-rica/a3-1.jpg",
      replyMsg: "Can you recommend a guided paddle with a view of Arenal?",
      aiReplyMsg:
        "Try the Lake Arenal kayak tour for a guided morning on the water, with Arenal Volcano above the far shore and a break along the way.",
      aiReplyChip: {
        title: "Lake Arenal guided kayak",
        subtitle: "A morning paddle with volcano views.",
        chipText: "Expedia · Partners",
        image: "/images/Expedia-images/options/costa-rica/r3-1.jpg",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "A quieter rainforest day",
      subtitle: "Make room for a picnic and spotting wildlife.",
      chipText: "",
      image: "/images/Expedia-images/options/costa-rica/a3-2.png",
      replyMsg: "Where would you recommend a quieter day with volcano views?",
      aiReplyMsg:
        "Stay around Arenal Volcano for a slower day: pack a picnic, take a short rainforest walk, and look for toucans or sloths in the treetops.",
      aiReplyChip: {
        title: "Arenal rainforest picnic",
        subtitle: "Outdoor picnic and short forest walk.",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/costa-rica/r3-2.png",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "A meal with volcano views",
      subtitle: "Find local dishes and big views for the kids.",
      chipText: "",
      image: "/images/Expedia-images/options/costa-rica/a3-3.png",
      replyMsg: "Can you recommend a family restaurant with a volcano view?",
      aiReplyMsg:
        "Try Que Rico Arenal for open-air dining with volcano views, Costa Rican and Italian dishes, and kids' meals on the menu.",
      aiReplyChip: {
        title: "Que Rico Arenal",
        subtitle: "Open-air dining with volcano views.",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/costa-rica/r3-3.jpg",
      },
      nextQuestionId: null,
    },
  },
};

export default laFortuna;
