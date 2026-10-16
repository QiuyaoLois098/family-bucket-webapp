/**
 * South Lake Tahoe branching Q&A script.
 *
 * Tree:
 *   q1 → a1-1 → q2-1 → a2-1 (end)
 *                    → a2-2 → q3-1 → a3-1 (end)
 *                                  → a3-2 (end, shared)
 *        a1-2 → q2-2 → a2-3 → q3-2 → a3-3 (end)
 *                                  → a3-2 (end, shared)
 *                    → a2-4 (end)
 *
 * Script fields:
 *   tripTitle — top line on briefing / Q&A pages
 *   intro / introChip — briefing page before q1
 *   memoryCard — building / memory reveal card
 *   replyMsg / aiReplyMsg / aiReplyChip — after selecting an answer
 */
const southLakeTahoe = {
  destinationId: "south-lake-tahoe",
  startQuestionId: "q1",

  /** Shown on the briefing / Q&A pages */
  tripTitle: "South Lake Tahoe · Apr 6 – 11",
  intro:
    "We're heading to South Lake Tahoe from April 6–11. Our flights from Seattle to Reno are booked, and we're staying here.",
  introChip: {
    title: "Sierra Shore Family Lodge",
    subtitle: "South Lake Tahoe, CA · April 6–11 · Confirmed",
    chipText: "Booked · Expedia",
  },
  /** Building phase — left memory card */
  memoryCard: {
    headline: "Your next family memory awaits",
    eyebrow: "Your personalized family itinerary",
    title: "South Lake Tahoe",
    duration: "5 days",
    footer: "Created with AI Activity Planner",
    image: "/images/Expedia-images/destinations/lake-tahoe.png",
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
      subtitle: "Kayaking, ropes courses, and family hikes.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_1.png",
      replyMsg:
        "We love the outdoors—the kids are dying to try kayaking and a ropes course near South Lake Tahoe over spring break.",
      aiReplyMsg: "A little adventure it is!",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Calm lake views, easy outings, and good food.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "We'd like to take it slow—calm lake views, easy outings, and good food sound perfect for our family.",
      aiReplyMsg: "Taking it slow it is!",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Emerald Bay guided kayak",
      subtitle: "Clear-bottom kayaking on Emerald Bay.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q2-kayak-1.png",
      replyMsg:
        "Let's start with the Guided Kayak Tour on Emerald Bay—the kids can't wait to get on the water!",
      aiReplyMsg:
        "Perfect—I'll start with kayaking on Emerald Bay, then add the Tahoe City ropes course the next day to round out your itinerary.",
      nextQuestionId: null,
    },
    "a2-2": {
      id: "a2-2",
      text: "Tahoe City ropes course",
      subtitle: "Take on a treetop ropes course in Tahoe City.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q2-ropes-1.png",
      replyMsg:
        "Let's start with the Tahoe City ropes course—the kids can't wait to climb through the treetops!",
      aiReplyMsg:
        "Perfect—I'll start with the Tahoe City ropes course, then add kayaking on Emerald Bay the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "M.S. Dixie II scenic cruise",
      subtitle: "Paddlewheel boat cruise from Zephyr Cove to Emerald Bay.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg:
        "Let's start with the M.S. Dixie II cruise—the kids will love being out on the lake!",
      aiReplyMsg:
        "Perfect—I'll start with the M.S. Dixie II cruise, then add Kings Beach the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Kings Beach afternoon",
      subtitle: "Calm, shallow water for the kids to wade.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q2-kayak-1.png",
      replyMsg:
        "Let's start with Kings Beach—the kids can ease into the trip by the water!",
      aiReplyMsg:
        "Perfect—I'll start with Kings Beach, then add the M.S. Dixie II cruise the next day to round out your easygoing itinerary.",
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
        "Van Sickle Bi-State Park is about an 8-minute drive from your hotel, so it’s easy to fit in a family hike before dinner.",
      aiReplyChip: {
        title: "Van Sickle Bi-State Park",
        subtitle: "8 min from your hotel",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "More time by the lake",
      subtitle: "A slower afternoon with lake views by the water.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Can we add more time by the lake?",
      aiReplyMsg:
        "Sand Harbor is a great fit for a slower afternoon, with a lakeside picnic, an easy paddle near the beach, and local wildlife.",
      aiReplyChip: {
        title: "Sand Harbor shoreline afternoon",
        subtitle: "Lakeside picnic, paddle, and wildlife.",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "Family dinner by the lake",
      subtitle: "Lake views and easy options for the kids.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg: "Can we add a family dinner with a lake view?",
      aiReplyMsg:
        "Sunnyside Restaurant & Lodge has a lakeside deck, kids’ menu, fish tacos, and Hula Pie.",
      aiReplyChip: {
        title: "Sunnyside Restaurant & Lodge",
        subtitle: "Family meal with lake views",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
  },
};

export default southLakeTahoe;
