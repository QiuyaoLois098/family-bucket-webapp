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
      subtitle: "Waterfalls, zip lines, and Blue Ridge hikes.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_1.png",
      replyMsg:
        "We love the outdoors—the kids are dying to chase waterfalls and try a zip line near Asheville over spring break.",
      aiReplyMsg: "A little adventure it is!",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Porch time, easy town strolls, and good food.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "We'd like to take it slow—porch time, easy town strolls, and good food sound perfect for our family.",
      aiReplyMsg: "Taking it slow it is!",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Looking Glass Falls walk",
      subtitle: "An easy waterfall stop in Pisgah National Forest.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q2-kayak-1.png",
      replyMsg:
        "Let's start with Looking Glass Falls—the kids can't wait to see a real waterfall!",
      aiReplyMsg:
        "Perfect—I'll start with Looking Glass Falls, then add a Blue Ridge Parkway overlook the next day to round out your itinerary.",
      nextQuestionId: null,
    },
    "a2-2": {
      id: "a2-2",
      text: "Navitat zip-line adventure",
      subtitle: "Tree-to-tree zip lines in the Blue Ridge.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q2-ropes-1.png",
      replyMsg:
        "Let's start with the Navitat zip-line adventure—the kids can't wait to fly through the trees!",
      aiReplyMsg:
        "Perfect—I'll start with Navitat, then add a waterfall stop the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Biltmore Conservatory stroll",
      subtitle: "Gardens and greenhouse wandering at an easy pace.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg:
        "Let's start with the Biltmore Conservatory—the kids will love the gardens!",
      aiReplyMsg:
        "Perfect—I'll start with the Biltmore Conservatory, then add a downtown Asheville stroll the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "River Arts District afternoon",
      subtitle: "Studios, snacks, and a calm riverside wander.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "Let's start with the River Arts District—the kids can ease into the trip with snacks and studios!",
      aiReplyMsg:
        "Perfect—I'll start with the River Arts District, then add a Biltmore gardens hour the next day to round out your easygoing itinerary.",
      nextQuestionId: null,
    },

    "a3-1": {
      id: "a3-1",
      text: "A nearby family hike",
      subtitle: "An easy trail close to the cabin, before dinner",
      chipText: "",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg: "Can we add an easy family hike near our cabin?",
      aiReplyMsg:
        "Craggy Gardens is about a short drive up the Parkway, so it’s easy to fit in a family hike before dinner.",
      aiReplyChip: {
        title: "Craggy Gardens",
        subtitle: "Short drive on the Parkway",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "More time on the porch",
      subtitle: "A slower afternoon with mountain air and downtime.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Can we add more porch and downtime?",
      aiReplyMsg:
        "Absolutely—I’ll leave an open afternoon back at the cabin so everyone can slow down between outings.",
      aiReplyChip: {
        title: "Cabin porch afternoon",
        subtitle: "Games, snacks, and mountain air",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "Family dinner downtown",
      subtitle: "Easy options near Pack Square for the kids.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg: "Can we add a family dinner downtown?",
      aiReplyMsg:
        "Early Girl Eatery is a great fit—casual plates, kid-friendly sides, and an easy walk from downtown.",
      aiReplyChip: {
        title: "Early Girl Eatery",
        subtitle: "Casual family dinner downtown",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
  },
};

export default asheville;
