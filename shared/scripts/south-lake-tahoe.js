/**
 * South Lake Tahoe branching Q&A script.
 *
 * Tree:
 *   q1 → a1-1 → q2-1 → a2-1 → q3-1 → a3-1 | a3-2
 *                    → a2-2 → q3-1 → a3-1 | a3-2
 *        a1-2 → q2-2 → a2-3 → q3-2 → a3-3 | a3-2
 *                    → a2-4 → q3-2 → a3-3 | a3-2
 *
 * Script fields:
 *   tripTitle — top line on briefing / Q&A pages
 *   intro / introChip — briefing page before q1
 *   memoryCard — building / memory reveal card
 *   displayImages — right-screen art during briefing / Q&A
 *   dayModules / itinerary / itineraryPaths — finale 5-day schedule
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
    image: "/images/Expedia-images/options/tahoe/intro.jpg",
  },
  /** Building phase — left memory card */
  memoryCard: {
    headline: "Your next family\nmemory awaits",
    eyebrow: "Your personalized family itinerary",
    title: "South Lake Tahoe",
    duration: "5 days",
    footer: "Created with Activity Planner",
    image: "/images/Expedia-images/destination-view/tahoe.jpg",
  },

  /** Right screen images during briefing / Q&A (keyed by step) */
  displayImages: {
    briefing: "/images/Expedia-images/destination-view/tahoe.jpg",
    q1: "/images/Expedia-images/destination-view/tahoe.jpg",
    "q2-1": "/images/Expedia-images/destination-view/tahoe.jpg",
    "q2-2": "/images/Expedia-images/destination-view/tahoe.jpg",
    "q3-1": "/images/Expedia-images/destination-view/tahoe.jpg",
    "q3-2": "/images/Expedia-images/destination-view/tahoe.jpg",
    default: "/images/Expedia-images/destination-view/tahoe.jpg",
  },

  /**
   * Finale schedule header.
   *
   * Arrangement (see design board):
   *   Day 1 — shared welcome
   *   Days 2–3 — Q2 order swap (adventure: kayak↔ropes; relax: cruise↔beach)
   *   Day 4 — Q3 add-on (or slower-shoreline when Q3 is skipped)
   *   Day 5 — branch ending (adventure paddle vs relax lake morning)
   */
  itinerary: {
    headline: "Five days built for your family",
    meta: "South Lake Tahoe · Apr 6–11",
    summary: "Kayaking, ropes, family hikes, and time by the lake",
    bookings: {
      flight: "JFK ↔ RNO",
      stay: "Sierra Shore Family Lodge",
    },
  },

  /** Reusable one-day modules (images: /images/Expedia-images/itinerary/tahoe/) */
  dayModules: {
    "welcome-lake": {
      title: "Welcome to the Lake",
      description:
        "Arrive in Reno, settle into your lakefront hotel, and watch the sunset over the Sierra.",
      image: "/images/Expedia-images/itinerary/tahoe/welcome-lake.jpg",
    },
    "onto-the-water": {
      title: "Onto the Water",
      description:
        "Paddle across Emerald Bay and spot fish through the clear-bottom kayak.",
      image: "/images/Expedia-images/itinerary/tahoe/onto-the-water.jpg",
    },
    "ropes-in-the-pines": {
      title: "Ropes in the Pines",
      description:
        "Climb Tahoe City’s treetop ropes course among the pines.",
      image: "/images/Expedia-images/itinerary/tahoe/ropes-in-the-pines.jpg",
    },
    "easy-family-hike": {
      title: "An Easy Family Hike",
      description:
        "Van Sickle Bi-State Park is an 8-minute drive, perfect for a family hike before dinner.",
      image: "/images/Expedia-images/itinerary/tahoe/easy-family-hike.jpg",
    },
    "slower-shoreline-day": {
      title: "A Slower Shoreline Day",
      description:
        "Enjoy a lakeside picnic, an easy paddle near the beach, and local wildlife.",
      image: "/images/Expedia-images/itinerary/tahoe/slower-shoreline-day.jpg",
    },
    "onto-the-water-slowly": {
      title: "Onto the Water, Slowly",
      description:
        "Cruise from Zephyr Cove to Emerald Bay aboard the M.S. Dixie II.",
      image: "/images/Expedia-images/itinerary/tahoe/onto-the-water-slowly.jpg",
    },
    "quiet-beach-afternoon": {
      title: "A Quiet Beach Afternoon",
      description:
        "Wade in calm, shallow water during an easy Kings Beach afternoon.",
      image: "/images/Expedia-images/itinerary/tahoe/quiet-beach-afternoon.jpg",
    },
    "dinner-by-the-lake": {
      title: "Dinner by the Lake",
      description:
        "Enjoy a family meal on Sunnyside’s lakeside deck, with a kids’ menu and lake views.",
      image: "/images/Expedia-images/itinerary/tahoe/dinner-by-the-lake.jpg",
    },
    "one-last-paddle": {
      title: "One Last Paddle",
      description:
        "Spend one last morning on the lake, soaking in the views and fresh air before heading home.",
      image: "/images/Expedia-images/itinerary/tahoe/one-last-paddle.jpg",
    },
    "one-last-lake-morning": {
      title: "One Last Lake Morning",
      description:
        "Take in one final quiet morning by the lake, enjoying the calm views before checking out.",
      image: "/images/Expedia-images/itinerary/tahoe/one-last-lake-morning.jpg",
    },
  },

  /**
   * Answer path → [Day1, Day2, Day3, Day4, Day5].
   * Q1 = adventure (a1-1) vs relax (a1-2)
   * Q2 = which activity comes first on Days 2–3
   * Q3 = Day 4 add-on; if the path ends at Q2, Day 4 defaults to slower-shoreline-day
   */
  itineraryPaths: {
    default: [
      "welcome-lake",
      "onto-the-water",
      "ropes-in-the-pines",
      "easy-family-hike",
      "one-last-paddle",
    ],
    // Adventure · kayak first · family hike
    "a1-1|a2-1|a3-1": [
      "welcome-lake",
      "onto-the-water",
      "ropes-in-the-pines",
      "easy-family-hike",
      "one-last-paddle",
    ],
    // Adventure · kayak first · more lake time
    "a1-1|a2-1|a3-2": [
      "welcome-lake",
      "onto-the-water",
      "ropes-in-the-pines",
      "slower-shoreline-day",
      "one-last-paddle",
    ],
    // Adventure · ropes first · family hike
    "a1-1|a2-2|a3-1": [
      "welcome-lake",
      "ropes-in-the-pines",
      "onto-the-water",
      "easy-family-hike",
      "one-last-paddle",
    ],
    // Adventure · ropes first · more lake time
    "a1-1|a2-2|a3-2": [
      "welcome-lake",
      "ropes-in-the-pines",
      "onto-the-water",
      "slower-shoreline-day",
      "one-last-paddle",
    ],
    // Relax · cruise first · dinner
    "a1-2|a2-3|a3-3": [
      "welcome-lake",
      "onto-the-water-slowly",
      "quiet-beach-afternoon",
      "dinner-by-the-lake",
      "one-last-lake-morning",
    ],
    // Relax · cruise first · more lake time
    "a1-2|a2-3|a3-2": [
      "welcome-lake",
      "onto-the-water-slowly",
      "quiet-beach-afternoon",
      "slower-shoreline-day",
      "one-last-lake-morning",
    ],
    // Relax · Kings Beach first · dinner
    "a1-2|a2-4|a3-3": [
      "welcome-lake",
      "quiet-beach-afternoon",
      "onto-the-water-slowly",
      "dinner-by-the-lake",
      "one-last-lake-morning",
    ],
    // Relax · Kings Beach first · more lake time
    "a1-2|a2-4|a3-2": [
      "welcome-lake",
      "quiet-beach-afternoon",
      "onto-the-water-slowly",
      "slower-shoreline-day",
      "one-last-lake-morning",
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
      text: "I found two calm options your family might love. Which should come first?",
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
      image: "/images/Expedia-images/options/tahoe/a1-1.jpg",
      replyMsg:
        "We love the outdoors. The kids are dying to try kayaking and a ropes course near South Lake Tahoe over spring break.",
      aiReplyMsg: "A little adventure it is!",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Calm lake views, easy outings, and good food.",
      chipText: "",
      image: "/images/Expedia-images/options/tahoe/a1-2.jpg",
      replyMsg:
        "We'd like to take it slow. Calm lake views, easy outings, and good food sound perfect for our family.",
      aiReplyMsg: "Taking it slow it is!",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Emerald Bay guided kayak",
      subtitle: "Clear-bottom kayaking on Emerald Bay.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/tahoe/a2-1.jpg",
      replyMsg:
        "Let's start with the Guided Kayak Tour on Emerald Bay. The kids can't wait to get on the water!",
      aiReplyMsg:
        "Perfect. I'll start with kayaking on Emerald Bay, then add the Tahoe City ropes course the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },
    "a2-2": {
      id: "a2-2",
      text: "Tahoe City ropes course",
      subtitle: "Take on a treetop ropes course in Tahoe City.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/tahoe/a2-2.jpg",
      replyMsg:
        "Let's start with the Tahoe City ropes course. The kids can't wait to climb through the treetops!",
      aiReplyMsg:
        "Perfect. I'll start with the Tahoe City ropes course, then add kayaking on Emerald Bay the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "M.S. Dixie II scenic cruise",
      subtitle: "Paddlewheel boat cruise from Zephyr Cove to Emerald Bay.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/tahoe/a2-3.jpg",
      replyMsg:
        "Let's start with the M.S. Dixie II cruise. The kids will love being out on the lake!",
      aiReplyMsg:
        "Perfect. I'll start with the M.S. Dixie II cruise, then add Kings Beach the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Kings Beach afternoon",
      subtitle: "Calm, shallow water for the kids to wade.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/tahoe/a2-4.jpg",
      replyMsg:
        "Let's start with Kings Beach. The kids can ease into the trip by the water!",
      aiReplyMsg:
        "Perfect. I'll start with Kings Beach, then add the M.S. Dixie II cruise the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },

    "a3-1": {
      id: "a3-1",
      text: "A nearby family hike",
      subtitle: "An easy trail close to the hotel, before dinner",
      chipText: "",
      image: "/images/Expedia-images/options/tahoe/a3-1.jpg",
      replyMsg: "Can we add an easy family hike near our hotel?",
      aiReplyMsg:
        "Van Sickle Bi-State Park is about an 8-minute drive from your hotel, so it’s easy to fit in a family hike before dinner.",
      aiReplyChip: {
        title: "Van Sickle Bi-State Park",
        subtitle: "8 min from your hotel",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/tahoe/r3-1.png",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "More time by the lake",
      subtitle: "A slower afternoon with lake views by the water.",
      chipText: "",
      image: "/images/Expedia-images/options/tahoe/a3-2.jpg",
      replyMsg: "Can we add more time by the lake?",
      aiReplyMsg:
        "Sand Harbor is a great fit for a slower afternoon, with a lakeside picnic, an easy paddle near the beach, and local wildlife.",
      aiReplyChip: {
        title: "Sand Harbor shoreline afternoon",
        subtitle: "Lakeside picnic, paddle, and wildlife.",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/tahoe/r3-2.png",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "Family dinner by the lake",
      subtitle: "Lake views and easy options for the kids.",
      chipText: "",
      image: "/images/Expedia-images/options/tahoe/a3-3.jpg",
      replyMsg: "Can we add a family dinner with a lake view?",
      aiReplyMsg:
        "Sunnyside Restaurant & Lodge has a lakeside deck, kids’ menu, fish tacos, and Hula Pie.",
      aiReplyChip: {
        title: "Sunnyside Restaurant & Lodge",
        subtitle: "Family meal with lake views",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/tahoe/r3-3.png",
      },
      nextQuestionId: null,
    },
  },
};

export default southLakeTahoe;
