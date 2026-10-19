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

  /** Shown on the briefing / Q&A pages */
  tripTitle: "Reykjavík · Apr 6 – 11",
  intro:
    "We're heading to Reykjavík from April 6–11. Our flights from Boston to Reykjavík are booked, and we're staying here.",
  introChip: {
    title: "Reykjavík Family Harbour Hotel",
    subtitle: "Reykjavík, Iceland · April 6–11 · Confirmed",
    chipText: "Booked · Expedia",
    image: "/images/Expedia-images/options/iceland/intro.png",
  },
  /** Building phase — left memory card */
  memoryCard: {
    headline: "Your next family\nmemory awaits",
    eyebrow: "Your personalized family itinerary",
    title: "Reykjavík",
    duration: "5 days",
    footer: "Created with Activity Planner",
    image: "/images/Expedia-images/destination-view/iceland.png",
  },

  /** Right screen images during briefing / Q&A (keyed by step) */
  displayImages: {
    briefing: "/images/Expedia-images/destination-view/iceland.png",
    q1: "/images/Expedia-images/destination-view/iceland.png",
    "q2-1": "/images/Expedia-images/destination-view/iceland.png",
    "q2-2": "/images/Expedia-images/destination-view/iceland.png",
    "q3-1": "/images/Expedia-images/destination-view/iceland.png",
    "q3-2": "/images/Expedia-images/destination-view/iceland.png",
    default: "/images/Expedia-images/destination-view/iceland.png",
  },

  /**
   * Arrangement (design board):
   *   Day 1 — shared welcome
   *   Days 2–3 — Q2 order swap (adventure: lava↔lighthouse; relax: Golden Circle↔pools)
   *   Day 4 — Q3 add-on (or softer default when Q3 skipped)
   *   Day 5 — branch ending
   */
  itinerary: {
    headline: "Five days built for your family",
    meta: "Reykjavík · Apr 6 – 11",
    summary: "Lava tunnels, lighthouse shores, warm pools, and harbor days",
  },

  dayModules: {
    "welcome-iceland": {
      title: "Welcome to Iceland",
      description:
        "Land at Keflavík, settle into Reykjavík, and enjoy the spring evening light over the harbor.",
      image: "/images/Expedia-images/itinerary/iceland/welcome-iceland.jpg",
    },
    "into-the-lava-tunnel": {
      title: "Into the Lava Tunnel",
      description:
        "Explore Raufarhólshellir with a guide, helmets, and headlamps beneath the lava fields.",
      image: "/images/Expedia-images/itinerary/iceland/into-the-lava-tunnel.jpg",
    },
    "along-the-lighthouse-shore": {
      title: "Along the Lighthouse Shore",
      description:
        "Explore the shore near Grótta Lighthouse and look for eider ducks and oystercatchers.",
      image: "/images/Expedia-images/itinerary/iceland/along-the-lighthouse-shore.jpg",
    },
    "above-the-valley": {
      title: "Above the Valley",
      description:
        "Ride Mega Zipline Iceland above the Reykjadalur valley, subject to age and operating conditions.",
      image: "/images/Expedia-images/itinerary/iceland/above-the-valley.png",
    },
    "view-from-mt-esja": {
      title: "A View from Mt. Esja",
      description:
        "Explore a suitable Mt. Esja trail for city views, adapting the walk to April conditions.",
      image: "/images/Expedia-images/itinerary/iceland/view-from-mt-esja.png",
    },
    "golden-circle-easily": {
      title: "The Golden Circle, Easily",
      description:
        "Take a coach tour to Þingvellir, Gullfoss, and the Geysir area, with big views along the way.",
      image: "/images/Expedia-images/itinerary/iceland/golden-circle-easily.jpg",
    },
    "warm-pool-afternoon": {
      title: "A Warm Pool Afternoon",
      description:
        "Spend an easy afternoon at Laugardalslaug, with geothermal pools, hot tubs, and a waterslide.",
      image: "/images/Expedia-images/itinerary/iceland/warm-pool-afternoon.jpg",
    },
    "lunch-by-the-harbor": {
      title: "Lunch by the Harbor",
      description:
        "Enjoy fish and chips at Kaffivagninn, with fishing boats and harbor views nearby.",
      image: "/images/Expedia-images/itinerary/iceland/lunch-by-the-harbor.png",
    },
    "slower-seaside-day": {
      title: "A Slower Seaside Day",
      description:
        "Picnic near Grótta Lighthouse and watch seabirds, checking the tide before any causeway walk.",
      image: "/images/Expedia-images/itinerary/iceland/slower-seaside-day.jpg",
    },
    "one-last-coastal-view": {
      title: "One Last Coastal View",
      description:
        "Enjoy one last view of Reykjavík’s coast before heading to the airport for your flight home.",
      image: "/images/Expedia-images/itinerary/iceland/one-last-coastal-view.png",
    },
    "quiet-coastal-farewell": {
      title: "A Quiet Coastal Farewell",
      description:
        "Take in one last coastal view before checking out and heading to the airport.",
      image: "/images/Expedia-images/itinerary/iceland/quiet-coastal-farewell.png",
    },
  },

  itineraryPaths: {
    default: [
      "welcome-iceland",
      "into-the-lava-tunnel",
      "along-the-lighthouse-shore",
      "view-from-mt-esja",
      "one-last-coastal-view",
    ],
    // Adventure · lava first · zipline
    "a1-1|a2-1|a3-1": [
      "welcome-iceland",
      "into-the-lava-tunnel",
      "along-the-lighthouse-shore",
      "above-the-valley",
      "one-last-coastal-view",
    ],
    // Adventure · lava first · Mt. Esja
    "a1-1|a2-1|a3-2": [
      "welcome-iceland",
      "into-the-lava-tunnel",
      "along-the-lighthouse-shore",
      "view-from-mt-esja",
      "one-last-coastal-view",
    ],
    // Adventure · lighthouse first · zipline
    "a1-1|a2-2|a3-1": [
      "welcome-iceland",
      "along-the-lighthouse-shore",
      "into-the-lava-tunnel",
      "above-the-valley",
      "one-last-coastal-view",
    ],
    // Adventure · lighthouse first · Mt. Esja
    "a1-1|a2-2|a3-2": [
      "welcome-iceland",
      "along-the-lighthouse-shore",
      "into-the-lava-tunnel",
      "view-from-mt-esja",
      "one-last-coastal-view",
    ],
    // Relax · Golden Circle first · harbor lunch
    "a1-2|a2-3|a3-3": [
      "welcome-iceland",
      "golden-circle-easily",
      "warm-pool-afternoon",
      "lunch-by-the-harbor",
      "quiet-coastal-farewell",
    ],
    // Relax · Golden Circle first · seaside picnic
    "a1-2|a2-3|a3-4": [
      "welcome-iceland",
      "golden-circle-easily",
      "warm-pool-afternoon",
      "slower-seaside-day",
      "quiet-coastal-farewell",
    ],
    // Relax · warm pools first · harbor lunch
    "a1-2|a2-4|a3-3": [
      "welcome-iceland",
      "warm-pool-afternoon",
      "golden-circle-easily",
      "lunch-by-the-harbor",
      "quiet-coastal-farewell",
    ],
    // Relax · warm pools first · seaside picnic
    "a1-2|a2-4|a3-4": [
      "welcome-iceland",
      "warm-pool-afternoon",
      "golden-circle-easily",
      "slower-seaside-day",
      "quiet-coastal-farewell",
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
      text: "A lava tunnel or lighthouse shores? Which adventure should come first?",
      answerIds: ["a2-1", "a2-2"],
    },
    "q2-2": {
      id: "q2-2",
      text: "Golden Circle sights or warm pools? Which comes first?",
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
      answerIds: ["a3-3", "a3-4"],
    },
  },

  answers: {
    "a1-1": {
      id: "a1-1",
      text: "Try something adventurous",
      subtitle: "Lava tunnels, lighthouse shores, and wild landscapes.",
      chipText: "",
      image: "/images/Expedia-images/options/iceland/a1-1.jpg",
      replyMsg:
        "We love exploring. The kids can't wait to walk through a lava tunnel and discover the coast around Grótta Lighthouse.",
      aiReplyMsg: "",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Geysers, warm pools, and easy harbor days.",
      chipText: "",
      image: "/images/Expedia-images/options/iceland/a1-2.jpg",
      replyMsg:
        "We'd like to take it slow. Big views, warm pools, and good food by the harbor sound perfect.",
      aiReplyMsg: "",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Raufarhólshellir lava tunnel",
      subtitle: "Explore a lava tube with helmets and headlamps.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/iceland/a2-1.jpg",
      replyMsg:
        "Let's start with the lava tunnel. The kids can't wait to explore underground!",
      aiReplyMsg:
        "Perfect. I'll start with Raufarhólshellir lava tunnel, then add the Grótta coastline the next day.",
      nextQuestionId: "q3-1",
    },
    "a2-2": {
      id: "a2-2",
      text: "Grótta lighthouse coast",
      subtitle: "Look for seabirds along the lighthouse shore.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/iceland/a2-2.jpg",
      replyMsg:
        "Let's start with Grótta. The kids would love to explore the shore and spot seabirds!",
      aiReplyMsg:
        "Perfect. I'll start with Grótta's lighthouse shore, then add the Raufarhólshellir lava tunnel the next day.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Golden Circle day tour",
      subtitle: "See Þingvellir, Gullfoss, and the Geysir area.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/iceland/a2-3.jpg",
      replyMsg:
        "Let's start with the Golden Circle. The kids can't wait to see the geyser erupt!",
      aiReplyMsg:
        "Perfect. I'll start with the Golden Circle tour, then add Laugardalslaug's warm pools the next day.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Laugardalslaug warm pools",
      subtitle: "Enjoy geothermal pools, hot tubs, and a slide.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/iceland/a2-4.jpg",
      replyMsg:
        "Let's start with the warm pools. A gentle afternoon sounds just right after traveling!",
      aiReplyMsg:
        "Perfect. I'll start with Laugardalslaug's warm pools, then add the Golden Circle tour the next day.",
      nextQuestionId: "q3-2",
    },

    "a3-1": {
      id: "a3-1",
      text: "A valley zipline ride",
      subtitle: "Add a high-flying outing in Hveragerði.",
      chipText: "",
      image: "/images/Expedia-images/options/iceland/a3-1.jpg",
      replyMsg: "Can you recommend a zipline adventure to add to our trip?",
      aiReplyMsg:
        "Try Mega Zipline Iceland in Hveragerði for a high-flying view of the Reykjadalur valley . A different way to see Iceland's wild landscape.",
      aiReplyChip: {
        title: "Mega Zipline Iceland",
        subtitle: "A zipline above the Reykjadalur valley",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/iceland/a3-1.jpg",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "A mountain-view walk",
      subtitle: "Explore a trail on Mt. Esja outside the city.",
      chipText: "",
      image: "/images/Expedia-images/options/iceland/a3-2.jpg",
      replyMsg: "Which mountain would you recommend for a family walk?",
      aiReplyMsg:
        "Mt. Esja is the mountain-walk option in your plan, with views back toward Reykjavík. Choose a route that suits your family and the April conditions.",
      aiReplyChip: {
        title: "Mt. Esja family walk",
        subtitle: "Mountain trails with views toward the city",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/iceland/a3-2.jpg",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "A family meal by the harbor",
      subtitle: "Find fresh fish and easy choices for the kids.",
      chipText: "",
      image: "/images/Expedia-images/options/iceland/a3-3.jpg",
      replyMsg: "Can you recommend a family-friendly meal by the harbor?",
      aiReplyMsg:
        "Try Kaffivagninn on Grandi harbor for fish and chips, with views of the boats from its waterside setting.",
      aiReplyChip: {
        title: "Kaffivagninn",
        subtitle: "Fish and chips beside the harbor",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/iceland/a3-3.jpg",
      },
      nextQuestionId: null,
    },
    "a3-4": {
      id: "a3-4",
      text: "A seaside picnic",
      subtitle: "Make time for lighthouse views and seabirds.",
      chipText: "",
      image: "/images/Expedia-images/options/iceland/a3-4.jpg",
      replyMsg: "Where would you recommend a relaxed picnic by the sea?",
      aiReplyMsg:
        "Try the shore by Grótta Lighthouse for a picnic and seabird spotting. The causeway walk depends on the tide, so check access before heading out.",
      aiReplyChip: {
        title: "Grótta Lighthouse afternoon",
        subtitle: "A coastal picnic spot and seabird spotting",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/iceland/a3-4.jpg",
      },
      nextQuestionId: null,
    },
  },
};

export default reykjavik;
