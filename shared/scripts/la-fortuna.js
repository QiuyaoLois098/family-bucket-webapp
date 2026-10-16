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
  },
  /** Building phase — left memory card */
  memoryCard: {
    headline: "Your next family memory awaits",
    eyebrow: "Your personalized family itinerary",
    title: "La Fortuna",
    duration: "5 days",
    footer: "Created with AI Activity Planner",
    image: "/images/Expedia-images/destinations/costa-rica.png",
  },

  questions: {
    q1: {
      id: "q1",
      text: "Great — I’ll plan around what you already have booked. What sounds most like your family?",
      answerIds: ["a1-1", "a1-2"],
    },
    "q2-1": {
      id: "q2-1",
      text: "Rainforest canopy, or lava trails? Which adventure should come first?",
      answerIds: ["a2-1", "a2-2"],
    },
    "q2-2": {
      id: "q2-2",
      text: "A gentle river float or warm pools? Which comes first?",
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
      image: "/images/Expedia-images/options/q1_1.png",
      replyMsg:
        "We love the outdoors—the kids can't wait to zip through the rainforest and explore the lava trails below Arenal.",
      aiReplyMsg: "",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it easy",
      subtitle: "Gentle river floats, warm pools, and volcano views.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "We'd like to take it slow—wildlife, warm pools, and volcano views sound perfect for our family.",
      aiReplyMsg: "",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Arenal rainforest zipline",
      subtitle: "Glide through the canopy at Arenal EcoGlide.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q2-ropes-1.png",
      replyMsg:
        "Let's start with the zipline—the kids can't wait to see the rainforest from above!",
      aiReplyMsg:
        "Perfect—I'll start with Arenal EcoGlide, then add the Arenal 1968 lava trails the next day.",
      nextQuestionId: null,
    },
    "a2-2": {
      id: "a2-2",
      text: "Arenal 1968 lava trail",
      subtitle: "Walk the landscape shaped by historic eruption.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg:
        "Let's start with Arenal 1968—the kids would love to explore the old lava fields!",
      aiReplyMsg:
        "Perfect—I'll start with Arenal 1968 lava trails, then add the EcoGlide zipline the next day.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Peñas Blancas safari float",
      subtitle: "Drift with a guide and look for rainforest wildlife.",
      chipText: "Expedia · Partners",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg:
        "Let's start with the safari float—the kids would love to spot wildlife from the river!",
      aiReplyMsg:
        "Perfect—I'll start with the Peñas Blancas safari float, then add Baldi Hot Springs the next day.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Baldi Hot Springs afternoon",
      subtitle: "Enjoy warm pools for a chill afternoon soak.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "Let's start with the hot springs—a warm soak sounds perfect for everyone!",
      aiReplyMsg:
        "Perfect—I'll start with Baldi Hot Springs, then add the Peñas Blancas safari float the next day.",
      nextQuestionId: null,
    },

    "a3-1": {
      id: "a3-1",
      text: "A paddle below the volcano",
      subtitle: "Add a guided kayak on the lake.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg: "Can you recommend a guided paddle with a view of Arenal?",
      aiReplyMsg:
        "Try the Lake Arenal kayak tour for a guided morning on the water, with Arenal Volcano above the far shore and a break along the way.",
      aiReplyChip: {
        title: "Lake Arenal guided kayak",
        subtitle: "A morning paddle with volcano views.",
        chipText: "Expedia · Partners",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "A quieter rainforest day",
      subtitle: "Make room for a picnic and spotting wildlife.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Where would you recommend a quieter day with volcano views?",
      aiReplyMsg:
        "Stay around Arenal Volcano for a slower day: pack a picnic, take a short rainforest walk, and look for toucans or sloths in the treetops.",
      aiReplyChip: {
        title: "Arenal rainforest picnic",
        subtitle: "Outdoor picnic and short forest walk.",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "A meal with volcano views",
      subtitle: "Find local dishes and big views for the kids.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg: "Can you recommend a family restaurant with a volcano view?",
      aiReplyMsg:
        "Try Que Rico Arenal for open-air dining with volcano views, Costa Rican and Italian dishes, and kids' meals on the menu.",
      aiReplyChip: {
        title: "Que Rico Arenal",
        subtitle: "Open-air dining with volcano views.",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
  },
};

export default laFortuna;
