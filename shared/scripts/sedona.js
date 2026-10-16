/**
 * Sedona branching Q&A script (same tree as South Lake Tahoe).
 *
 *   q1 → a1-1 → q2-1 → a2-1 (end)
 *                    → a2-2 → q3-1 → a3-1 / a3-2
 *        a1-2 → q2-2 → a2-3 → q3-2 → a3-3 / a3-2 (shared)
 *                    → a2-4 (end)
 */
const sedona = {
  destinationId: "sedona",
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
      subtitle: "Red-rock hikes, jeep views, and vortex trails.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_1.png",
      replyMsg:
        "We love the outdoors—the kids are dying to hike the red rocks and try a jeep outing near Sedona over spring break.",
      aiReplyMsg: "A little adventure it is!",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Overlooks, easy strolls, and sunset views.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "We'd like to take it slow—overlooks, easy strolls, and sunset views sound perfect for our family.",
      aiReplyMsg: "Taking it slow it is!",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Cathedral Rock viewpoint hike",
      subtitle: "A short scenic climb with big red-rock views.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg:
        "Let's start with Cathedral Rock—the kids can't wait to see those red rocks up close!",
      aiReplyMsg:
        "Perfect—I'll start with Cathedral Rock, then add a jeep overlook the next day to round out your itinerary.",
      nextQuestionId: null,
    },
    "a2-2": {
      id: "a2-2",
      text: "Pink Jeep scenic tour",
      subtitle: "Off-road views without a long hike.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q2-ropes-1.png",
      replyMsg:
        "Let's start with a Pink Jeep tour—the kids can't wait to ride through the desert!",
      aiReplyMsg:
        "Perfect—I'll start with the Pink Jeep tour, then add an easy red-rock walk the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Airport Mesa sunset",
      subtitle: "An easy overlook for golden-hour photos.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg:
        "Let's start with Airport Mesa at sunset—the kids will love the colors!",
      aiReplyMsg:
        "Perfect—I'll start with Airport Mesa, then add a calm creek stroll the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Oak Creek Canyon picnic",
      subtitle: "Shade, water, and a slow afternoon outdoors.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "Let's start with an Oak Creek picnic—the kids can ease into the trip by the water!",
      aiReplyMsg:
        "Perfect—I'll start with Oak Creek, then add a sunset overlook the next day to round out your easygoing itinerary.",
      nextQuestionId: null,
    },

    "a3-1": {
      id: "a3-1",
      text: "A nearby family hike",
      subtitle: "An easy trail close to the hotel, before dinner",
      chipText: "",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg: "Can we add an easy family hike near our hotel?",
      aiReplyMsg:
        "Bell Rock Pathway is a short drive away, so it’s easy to fit in a family hike before dinner.",
      aiReplyChip: {
        title: "Bell Rock Pathway",
        subtitle: "Short drive from your hotel",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "More time under the stars",
      subtitle: "A slower evening with wide desert skies.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Can we add more time for stargazing?",
      aiReplyMsg:
        "Absolutely—I’ll leave an open evening near camp so everyone can slow down and watch the sky.",
      aiReplyChip: {
        title: "Desert stargazing evening",
        subtitle: "Blankets, quiet, and big sky",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "Family dinner with a view",
      subtitle: "Casual plates and red-rock scenery.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg: "Can we add a family dinner with a view?",
      aiReplyMsg:
        "Elote Cafe is a crowd-pleaser—bold flavors, shareable plates, and an easy family vibe.",
      aiReplyChip: {
        title: "Elote Cafe",
        subtitle: "Family dinner with Sedona flavor",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
  },
};

export default sedona;
