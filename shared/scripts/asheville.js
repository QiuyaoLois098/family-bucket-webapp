/**
 * Asheville branching Q&A script (same tree as South Lake Tahoe).
 *
 *   q1 → a1-1 → q2-1 → a2-1 (end)
 *                    → a2-2 → q3-1 → a3-1 / a3-2
 *        a1-2 → q2-2 → a2-3 → q3-2 → a3-3 / a3-2 (shared)
 *                    → a2-4 (end)
 */
const asheville = {
  destinationId: "asheville",
  startQuestionId: "q1",

  /** Shown on the briefing / Q&A pages */
  tripTitle: "Asheville · Apr 6 – 11",
  intro:
    "We're heading to Asheville from April 6–11. Our flights from Chicago to Asheville are booked, and we're staying here.",
  introChip: {
    title: "Blue Ridge Family Lodge",
    subtitle: "Asheville, NC · April 6–11 · Confirmed",
    chipText: "Booked · Expedia",
    image: "/images/Expedia-images/options/asheville/intro.jpg",
  },
  /** Building phase — left memory card */
  memoryCard: {
    headline: "Your next family\nmemory awaits",
    eyebrow: "Your personalized family itinerary",
    title: "Asheville",
    duration: "5 days",
    footer: "Created with Activity Planner",
    image: "/images/Expedia-images/destination-view/asheville.png",
  },

  /** Right screen images during briefing / Q&A (keyed by step) */
  displayImages: {
    briefing: "/images/Expedia-images/destination-view/asheville.jpg",
    q1: "/images/Expedia-images/destination-view/asheville.jpg",
    "q2-1": "/images/Expedia-images/destination-view/asheville.jpg",
    "q2-2": "/images/Expedia-images/destination-view/asheville.jpg",
    "q3-1": "/images/Expedia-images/destination-view/asheville.jpg",
    "q3-2": "/images/Expedia-images/destination-view/asheville.jpg",
    default: "/images/Expedia-images/destination-view/asheville.jpg",
  },

  /**
   * Arrangement (design board):
   *   Day 1 — shared welcome
   *   Days 2–3 — Q2 order swap (adventure: kayak↔Navitat; relax: trolley↔gardens)
   *   Day 4 — Q3 add-on (riverside picnic shared; or default when Q3 skipped)
   *   Day 5 — branch ending
   */
  itinerary: {
    headline: "Five days built for your family",
    meta: "Asheville · Apr 6–11",
    summary: "River paddles, treetops, gardens, and Blue Ridge views",
    bookings: {
      flight: "ORD ↔ AVL",
      stay: "Blue Ridge Family Lodge",
    },
  },

  /** Reusable one-day modules (images: /images/Expedia-images/itinerary/asheville/) */
  dayModules: {
    "welcome-mountains": {
      title: "Welcome to the Mountains",
      description:
        "Arrive in Asheville, settle into your downtown hotel, and take in the spring views of the Blue Ridge.",
      image: "/images/Expedia-images/itinerary/asheville/welcome-mountains.jpg",
    },
    "onto-the-water": {
      title: "Onto the Water",
      description:
        "Paddle along the French Broad River on a guided family kayak tour.",
      image: "/images/Expedia-images/itinerary/asheville/onto-the-water.jpg",
    },
    "above-the-trees": {
      title: "Above the Trees",
      description:
        "Explore Navitat’s treetop course and zip through the Blue Ridge forest.",
      image: "/images/Expedia-images/itinerary/asheville/above-the-trees.png",
    },
    "gentle-forest-walk": {
      title: "A Gentle Forest Walk",
      description:
        "Bent Creek Forest is a 15-minute drive, perfect for a woodland walk before dinner.",
      image: "/images/Expedia-images/itinerary/asheville/gentle-forest-walk.jpg",
    },
    "riverside-picnic": {
      title: "A Riverside Picnic",
      description:
        "Enjoy a riverside picnic, a short walk past wildflowers, and local wildlife.",
      image: "/images/Expedia-images/itinerary/asheville/riverside-picnic.png",
    },
    "easy-look-around": {
      title: "An Easy Look Around",
      description:
        "Ride the Gray Line trolley past Asheville’s sights, hopping off to explore.",
      image: "/images/Expedia-images/itinerary/asheville/easy-look-around.jpg",
    },
    "slow-garden-stroll": {
      title: "A Slow Garden Stroll",
      description:
        "Stroll along flat paths among native wildflowers at the Botanical Gardens.",
      image: "/images/Expedia-images/itinerary/asheville/slow-garden-stroll.jpg",
    },
    "southern-family-meal": {
      title: "A Southern Family Meal",
      description:
        "Enjoy a relaxed Southern meal at Biscuit Head, with biscuits and homemade jams.",
      image: "/images/Expedia-images/itinerary/asheville/southern-family-meal.jpg",
    },
    "blue-ridge-one-last-time": {
      title: "Blue Ridge, One Last Time",
      description:
        "Take in one last Blue Ridge view and a breath of mountain air before heading home.",
      image: "/images/Expedia-images/itinerary/asheville/blue-ridge-one-last-time.jpg",
    },
    "one-last-overlook": {
      title: "One Last Overlook",
      description:
        "Take in one final Blue Ridge overlook, enjoying the mountain views before heading home.",
      image: "/images/Expedia-images/itinerary/asheville/one-last-overlook.jpg",
    },
  },

  itineraryPaths: {
    default: [
      "welcome-mountains",
      "onto-the-water",
      "above-the-trees",
      "gentle-forest-walk",
      "blue-ridge-one-last-time",
    ],
    // Adventure · kayak first · forest walk
    "a1-1|a2-1|a3-1": [
      "welcome-mountains",
      "onto-the-water",
      "above-the-trees",
      "gentle-forest-walk",
      "blue-ridge-one-last-time",
    ],
    // Adventure · kayak first · riverside picnic
    "a1-1|a2-1|a3-2": [
      "welcome-mountains",
      "onto-the-water",
      "above-the-trees",
      "riverside-picnic",
      "blue-ridge-one-last-time",
    ],
    // Adventure · Navitat first · forest walk
    "a1-1|a2-2|a3-1": [
      "welcome-mountains",
      "above-the-trees",
      "onto-the-water",
      "gentle-forest-walk",
      "blue-ridge-one-last-time",
    ],
    // Adventure · Navitat first · riverside picnic
    "a1-1|a2-2|a3-2": [
      "welcome-mountains",
      "above-the-trees",
      "onto-the-water",
      "riverside-picnic",
      "blue-ridge-one-last-time",
    ],
    // Relax · trolley first · Southern meal
    "a1-2|a2-3|a3-3": [
      "welcome-mountains",
      "easy-look-around",
      "slow-garden-stroll",
      "southern-family-meal",
      "one-last-overlook",
    ],
    // Relax · trolley first · riverside picnic
    "a1-2|a2-3|a3-2": [
      "welcome-mountains",
      "easy-look-around",
      "slow-garden-stroll",
      "riverside-picnic",
      "one-last-overlook",
    ],
    // Relax · gardens first · Southern meal
    "a1-2|a2-4|a3-3": [
      "welcome-mountains",
      "slow-garden-stroll",
      "easy-look-around",
      "southern-family-meal",
      "one-last-overlook",
    ],
    // Relax · gardens first · riverside picnic
    "a1-2|a2-4|a3-2": [
      "welcome-mountains",
      "slow-garden-stroll",
      "easy-look-around",
      "riverside-picnic",
      "one-last-overlook",
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
      text: "I found two options your family might love. Which should come first?",
      answerIds: ["a2-1", "a2-2"],
    },
    "q2-2": {
      id: "q2-2",
      text: "I found two options your family might love. Which should come first?",
      answerIds: ["a2-3", "a2-4"],
    },
    "q3-1": {
      id: "q3-1",
      text: "How would you like to slow things down?",
      answerIds: ["a3-1", "a3-2"],
    },
    "q3-2": {
      id: "q3-2",
      text: "How should we round out your mountain getaway?",
      answerIds: ["a3-3", "a3-2"],
    },
  },

  answers: {
    "a1-1": {
      id: "a1-1",
      text: "Try something adventurous",
      subtitle: "River paddles, treetop ziplines, and forest walks.",
      chipText: "",
      image: "/images/Expedia-images/options/asheville/a1-1.jpg",
      replyMsg:
        "We love the outdoors. The kids can’t wait to paddle the French Broad and try Asheville’s treetop ziplines this spring.",
      aiReplyMsg: "",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Mountain views, easy outings, and good food.",
      chipText: "",
      image: "/images/Expedia-images/options/asheville/a1-2.jpg",
      replyMsg:
        "We’d like to take it slow. Mountain views, easy outings, and good food sound perfect for our family.",
      aiReplyMsg: "",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "French Broad River kayak",
      subtitle: "A guided paddle on the French Broad River.",
      chipText: "Expedia · Bestseller",
      image: "/images/Expedia-images/options/asheville/a2-1.jpg",
      replyMsg:
        "Let's start with the French Broad River kayak tour. The kids can't wait to get on the water!",
      aiReplyMsg:
        "Perfect. I'll start with kayaking on the French Broad River, then add Navitat the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },
    "a2-2": {
      id: "a2-2",
      text: "Navitat treetop adventure",
      subtitle: "Treetop ziplines and ropes in the Blue Ridge.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/asheville/a2-2.jpg",
      replyMsg:
        "Let's start with Navitat's treetop ziplines. The kids can't wait to soar through the trees!",
      aiReplyMsg:
        "Perfect. I'll start with the Navitat treetop adventure, then add French Broad River kayaking the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Gray Line trolley tour",
      subtitle: "A narrated trolley ride around Asheville.",
      chipText: "Expedia · Bestseller",
      image: "/images/Expedia-images/options/asheville/a2-3.jpg",
      replyMsg:
        "Let's start with the Gray Line trolley. The kids will love seeing the sights around town!",
      aiReplyMsg:
        "Perfect. I'll start with the Gray Line trolley, then add the Botanical Gardens the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Botanical Gardens stroll",
      subtitle: "Five garden paths and native wildflowers.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/asheville/a2-4.jpg",
      replyMsg:
        "Let's start with the gardens. The kids can ease into the trip among the flowers!",
      aiReplyMsg:
        "Perfect. I'll start with the Botanical Gardens, then add the Gray Line trolley the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },

    "a3-1": {
      id: "a3-1",
      text: "A gentle forest walk",
      subtitle: "An easy woodland trail, with time to explore.",
      chipText: "",
      image: "/images/Expedia-images/options/asheville/a3-1.jpg",
      replyMsg: "Can we add a gentle forest walk before dinner?",
      aiReplyMsg:
        "Bent Creek Experimental Forest is about a 15-minute drive from your hotel, so it’s easy to fit in a forest walk before dinner.",
      aiReplyChip: {
        title: "Bent Creek Experimental Forest",
        subtitle: "15 min drive from your hotel",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/asheville/r3-1.jpg",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "A riverside picnic",
      subtitle: "An unhurried picnic with a short riverside walk.",
      chipText: "",
      image: "/images/Expedia-images/options/asheville/a3-2.jpg",
      replyMsg: "Can we add a picnic by the river?",
      aiReplyMsg:
        "Amboy Riverfront Park is a great fit for a slower afternoon, with a shady spot for a picnic and an easy walk along the French Broad River Greenway.",
      aiReplyChip: {
        title: "Amboy Riverfront Park",
        subtitle: "Riverside picnic and an easy greenway walk",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/asheville/r3-2.jpg",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "A Southern family meal",
      subtitle: "Biscuits, homemade jams, and local favorites.",
      chipText: "",
      image: "/images/Expedia-images/options/asheville/a3-3.jpg",
      replyMsg: "Can we try a Southern meal with the kids?",
      aiReplyMsg:
        "Biscuit Head has Southern biscuits, homemade jams, and easy options for the whole family.",
      aiReplyChip: {
        title: "Biscuit Head",
        subtitle: "Southern biscuits and homemade jams",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/asheville/a3-3.jpg",
      },
      nextQuestionId: null,
    },
  },
};

export default asheville;
