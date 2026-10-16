/**
 * Reykjavík (Iceland) branching Q&A script.
 *
 * Same Q1/Q2 branching as Tahoe, but four distinct a3 answers:
 *   q3-1 → a3-1, a3-2
 *   q3-2 → a3-3, a3-4
 */
const reykjavik = {
  destinationId: "reykjavik",
  startQuestionId: "q1",

  /** Shown on the briefing page before q1 */
  intro:
    "We're heading to Reykjavík from April 6–11. Our flights from Seattle to Keflavík are booked, and we're staying here.",
  introChip: {
    title: "Harbor Light Family Lodge",
    subtitle: "Reykjavík, Iceland · April 6–11 · Confirmed",
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
      answerIds: ["a3-3", "a3-4"],
    },
  },

  answers: {
    "a1-1": {
      id: "a1-1",
      text: "Try something adventurous",
      subtitle: "Geysers, waterfalls, and wide open landscapes.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_1.png",
      replyMsg:
        "We love the outdoors—the kids are dying to see geysers and waterfalls near Reykjavík over spring break.",
      aiReplyMsg: "A little adventure it is!",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Hot pools, harbor walks, and easy town days.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "We'd like to take it slow—hot pools, harbor walks, and easy town days sound perfect for our family.",
      aiReplyMsg: "Taking it slow it is!",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Golden Circle highlights",
      subtitle: "Geysir, Gullfoss, and Þingvellir at a family pace.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q2-kayak-1.png",
      replyMsg:
        "Let's start with the Golden Circle—the kids can't wait to see a geyser erupt!",
      aiReplyMsg:
        "Perfect—I'll start with the Golden Circle, then add a waterfall stop the next day to round out your itinerary.",
      nextQuestionId: null,
    },
    "a2-2": {
      id: "a2-2",
      text: "Reynisfjara day trip",
      subtitle: "Black sand beach and sea-stack views.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg:
        "Let's start with Reynisfjara—the kids can't wait to see the black sand beach!",
      aiReplyMsg:
        "Perfect—I'll start with Reynisfjara, then add Golden Circle highlights the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Sky Lagoon soak",
      subtitle: "Warm water, ocean views, and an easy reset.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg:
        "Let's start with Sky Lagoon—the kids will love the warm water!",
      aiReplyMsg:
        "Perfect—I'll start with Sky Lagoon, then add a harbor stroll the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Old Harbor afternoon",
      subtitle: "Boats, ice cream, and a calm waterfront walk.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "Let's start at the Old Harbor—the kids can ease into Reykjavík by the water!",
      aiReplyMsg:
        "Perfect—I'll start at the Old Harbor, then add a hot-pool soak the next day to round out your easygoing itinerary.",
      nextQuestionId: null,
    },

    "a3-1": {
      id: "a3-1",
      text: "A nearby family walk",
      subtitle: "An easy trail close to town, before dinner",
      chipText: "",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg: "Can we add an easy family walk near town?",
      aiReplyMsg:
        "Perlan’s forest paths are close by, so it’s easy to fit in a family walk before dinner.",
      aiReplyChip: {
        title: "Perlan forest paths",
        subtitle: "Close to Reykjavík",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "More time in the hot pools",
      subtitle: "A slower afternoon soaking and resting.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Can we add more hot-pool time?",
      aiReplyMsg:
        "Absolutely—I’ll leave an open afternoon in the warm water so everyone can slow down between adventures.",
      aiReplyChip: {
        title: "Hot pool afternoon",
        subtitle: "Soak, splash, and rest",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "Family dinner by the harbor",
      subtitle: "Casual plates and easy options for the kids.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg: "Can we add a family dinner by the harbor?",
      aiReplyMsg:
        "Fish Market is nearby for a special night, with plenty of approachable dishes for the family.",
      aiReplyChip: {
        title: "Fish Market",
        subtitle: "Family dinner near the harbor",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-4": {
      id: "a3-4",
      text: "More time downtown",
      subtitle: "A slower afternoon of shops, snacks, and strolling.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Can we add more downtown wandering?",
      aiReplyMsg:
        "Laugavegur is perfect for a slower afternoon—snacks, souvenir stops, and short walks between warm shops.",
      aiReplyChip: {
        title: "Laugavegur stroll",
        subtitle: "Snacks, shops, and easy walking",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
  },
};

export default reykjavik;
