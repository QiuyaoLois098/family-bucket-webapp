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
      text: "I found two options your family might love. Which outing should come first?",
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
      image: "/images/Expedia-images/options/q1_1.png",
      replyMsg:
        "We love the outdoors—the kids can’t wait to paddle the French Broad and try Asheville’s treetop ziplines this spring.",
      aiReplyMsg: "",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Mountain views, easy outings, and good food.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "We’d like to take it slow—mountain views, easy outings, and good food sound perfect for our family.",
      aiReplyMsg: "",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "French Broad River kayak",
      subtitle: "A guided paddle on the French Broad River.",
      chipText: "Expedia · Bestseller",
      image: "/images/Expedia-images/options/q2-kayak-1.png",
      replyMsg:
        "Let's start with the French Broad River kayak tour—the kids can't wait to get on the water!",
      aiReplyMsg:
        "Perfect—I'll start with kayaking on the French Broad River, then add Navitat the next day to round out your itinerary.",
      nextQuestionId: null,
    },
    "a2-2": {
      id: "a2-2",
      text: "Navitat treetop adventure",
      subtitle: "Treetop ziplines and ropes in the Blue Ridge.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q2-ropes-1.png",
      replyMsg:
        "Let's start with Navitat's treetop ziplines—the kids can't wait to soar through the trees!",
      aiReplyMsg:
        "Perfect—I'll start with the Navitat treetop adventure, then add French Broad River kayaking the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Gray Line trolley tour",
      subtitle: "A narrated trolley ride around Asheville.",
      chipText: "Expedia · Bestseller",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg:
        "Let's start with the Gray Line trolley—the kids will love seeing the sights around town!",
      aiReplyMsg:
        "Perfect—I'll start with the Gray Line trolley, then add the Botanical Gardens the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Botanical Gardens stroll",
      subtitle: "Five garden paths and native wildflowers.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "Let's start with the gardens—the kids can ease into the trip among the flowers!",
      aiReplyMsg:
        "Perfect—I'll start with the Botanical Gardens, then add the Gray Line trolley the next day to round out your easygoing itinerary.",
      nextQuestionId: null,
    },

    "a3-1": {
      id: "a3-1",
      text: "A gentle forest walk",
      subtitle: "An easy woodland trail, with time to explore.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg: "Can we add a gentle forest walk before dinner?",
      aiReplyMsg:
        "Bent Creek Experimental Forest is about a 15-minute drive from your hotel, so it’s easy to fit in a forest walk before dinner.",
      aiReplyChip: {
        title: "Bent Creek Experimental Forest",
        subtitle: "15 min drive from your hotel",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "A riverside picnic",
      subtitle: "An unhurried picnic with a short riverside walk.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Can we add a picnic by the river?",
      aiReplyMsg:
        "Amboy Riverfront Park is a great fit for a slower afternoon, with a shady spot for a picnic and an easy walk along the French Broad River Greenway.",
      aiReplyChip: {
        title: "Amboy Riverfront Park",
        subtitle: "Riverside picnic and an easy greenway walk",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "A Southern family meal",
      subtitle: "Biscuits, homemade jams, and local favorites.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg: "Can we try a Southern meal with the kids?",
      aiReplyMsg:
        "Biscuit Head has Southern biscuits, homemade jams, and easy options for the whole family.",
      aiReplyChip: {
        title: "Biscuit Head",
        subtitle: "Southern biscuits and homemade jams",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
  },
};

export default asheville;
