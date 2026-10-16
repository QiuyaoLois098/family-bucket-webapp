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

  /** Shown on the briefing page before q1 */
  intro:
    "We're heading to La Fortuna from April 6–11. Our flights from Seattle to Liberia are booked, and we're staying here.",
  introChip: {
    title: "Arenal Family Lodge",
    subtitle: "La Fortuna, Costa Rica · April 6–11 · Confirmed",
    chipText: "Booked · Expedia",
  },

  questions: {
    q1: {
      id: "q1",
      text: "Great — I’ll plan around what you already have booked. What sounds most like your family?",
      answerIds: ["a1-1", "a1-2"],
    },
    "q2-1": {
      id: "q2-1",
      text: "I found two options your family might love. Which adventure should come first?",
      answerIds: ["a2-1", "a2-2"],
    },
    "q2-2": {
      id: "q2-2",
      text: "I found two calm options your family might love. Which comes first?",
      answerIds: ["a2-3", "a2-4"],
    },
    "q3-1": {
      id: "q3-1",
      text: "What should we add around those adventures?",
      answerIds: ["a3-1", "a3-2"],
    },
    "q3-2": {
      id: "q3-2",
      text: "What should we add around this slower trip?",
      answerIds: ["a3-3", "a3-2"],
    },
  },

  answers: {
    "a1-1": {
      id: "a1-1",
      text: "Try something adventurous",
      subtitle: "Hanging bridges, rainforest walks, and volcano views.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_1.png",
      replyMsg:
        "We love the outdoors—the kids are dying to walk hanging bridges and see Arenal up close over spring break.",
      aiReplyMsg: "A little adventure it is!",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Hot springs, wildlife, and easy garden paths.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "We'd like to take it slow—hot springs, wildlife, and easy garden paths sound perfect for our family.",
      aiReplyMsg: "Taking it slow it is!",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Mistico Hanging Bridges",
      subtitle: "Rainforest canopy walkways with wildlife stops.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q2-ropes-1.png",
      replyMsg:
        "Let's start with Mistico Hanging Bridges—the kids can't wait to walk above the forest!",
      aiReplyMsg:
        "Perfect—I'll start with Mistico, then add a waterfall stop the next day to round out your itinerary.",
      nextQuestionId: null,
    },
    "a2-2": {
      id: "a2-2",
      text: "La Fortuna Waterfall",
      subtitle: "A scenic staircase hike to a swimming pool below.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg:
        "Let's start with La Fortuna Waterfall—the kids can't wait to cool off at the bottom!",
      aiReplyMsg:
        "Perfect—I'll start with La Fortuna Waterfall, then add hanging bridges the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Tabacón hot springs",
      subtitle: "Warm pools and rainforest soak time.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg:
        "Let's start with Tabacón—the kids will love the warm pools!",
      aiReplyMsg:
        "Perfect—I'll start with Tabacón, then add a calm wildlife garden the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Ecocentro Danaus gardens",
      subtitle: "Butterflies, frogs, and an easy nature loop.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "Let's start with Ecocentro Danaus—the kids can ease into the trip with butterflies and frogs!",
      aiReplyMsg:
        "Perfect—I'll start with Ecocentro Danaus, then add a hot-springs soak the next day to round out your easygoing itinerary.",
      nextQuestionId: null,
    },

    "a3-1": {
      id: "a3-1",
      text: "A nearby family hike",
      subtitle: "An easy trail close to the lodge, before dinner",
      chipText: "",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg: "Can we add an easy family hike near our lodge?",
      aiReplyMsg:
        "Arenal 1968 is a short drive away, so it’s easy to fit in a family lava-trail walk before dinner.",
      aiReplyChip: {
        title: "Arenal 1968 Trails",
        subtitle: "Short drive from your lodge",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "More time in the hot springs",
      subtitle: "A slower afternoon soaking and resting.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Can we add more hot-springs time?",
      aiReplyMsg:
        "Absolutely—I’ll leave an open afternoon in the warm pools so everyone can slow down between adventures.",
      aiReplyChip: {
        title: "Hot springs afternoon",
        subtitle: "Soak, splash, and rest",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "Family dinner with volcano views",
      subtitle: "Casual plates and Arenal in the background.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg: "Can we add a family dinner with a volcano view?",
      aiReplyMsg:
        "Don Rufino is a solid pick—family-friendly plates and an easy stop in town after a slow day.",
      aiReplyChip: {
        title: "Don Rufino",
        subtitle: "Family dinner in La Fortuna",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
  },
};

export default laFortuna;
