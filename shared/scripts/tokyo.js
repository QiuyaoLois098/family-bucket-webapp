/**
 * Tokyo branching Q&A script.
 *
 *   q1 → a1-1 → q2-1 → a2-1/a2-2 → q3-1 → a3-1, a3-2
 *        a1-2 → q2-2 → a2-3/a2-4 → q3-2 → a3-3, a3-4
 */
const tokyo = {
  destinationId: "tokyo",
  startQuestionId: "q1",

  /** Shown on the briefing / Q&A pages */
  tripTitle: "Tokyo · Apr 6 – 11",
  intro:
    "We're heading to Tokyo from April 6–11. Our flights from Los Angeles to Tokyo are booked, and we're staying here.",
  introChip: {
    title: "Tokyo Family Garden Hotel",
    subtitle: "Tokyo, Japan · April 6–11 · Confirmed",
    chipText: "Booked · Expedia",
  },
  /** Building phase — left memory card */
  memoryCard: {
    headline: "Your next family memory awaits",
    eyebrow: "Your personalized family itinerary",
    title: "Tokyo",
    duration: "5 days",
    footer: "Created with AI Activity Planner",
    image: "/images/Expedia-images/destinations/tokyo.png",
  },

  itinerary: {
    headline: "Five days built for your family",
    meta: "Tokyo · Apr 6 – 11",
    summary: "Neighborhoods, parks, and easy evenings made for everyone",
  },

  dayModules: {
    "arrive-settle": {
      title: "Arrive & settle",
      description:
        "Check in, walk a nearby street, and keep the first night simple.",
      image: "/images/Expedia-images/03-itinerary/it1.png",
    },
    "park-morning": {
      title: "Park morning",
      description:
        "A garden or park stroll, then an afternoon break back at the hotel.",
      image: "/images/Expedia-images/03-itinerary/it2.png",
    },
    "neighborhood-day": {
      title: "Neighborhood day",
      description:
        "Let everyone pick a snack stop while you wander a lively district.",
      image: "/images/Expedia-images/03-itinerary/it3.png",
    },
    "skyline-evening": {
      title: "Skyline evening",
      description:
        "Catch the city lights from a viewpoint, then a relaxed dinner.",
      image: "/images/Expedia-images/03-itinerary/it4.png",
    },
    "one-last-stroll": {
      title: "One last stroll",
      description:
        "A final walk under the blossoms or neon before you head home.",
      image: "/images/Expedia-images/03-itinerary/it5.png",
    },
  },

  itineraryPaths: {
    default: [
      "arrive-settle",
      "park-morning",
      "neighborhood-day",
      "skyline-evening",
      "one-last-stroll",
    ],
    "a1-1|a2-1|a3-1": [
      "arrive-settle",
      "park-morning",
      "skyline-evening",
      "neighborhood-day",
      "one-last-stroll",
    ],
    "a1-1|a2-1|a3-2": [
      "arrive-settle",
      "park-morning",
      "neighborhood-day",
      "skyline-evening",
      "one-last-stroll",
    ],
    "a1-1|a2-2|a3-1": [
      "arrive-settle",
      "neighborhood-day",
      "park-morning",
      "skyline-evening",
      "one-last-stroll",
    ],
    "a1-1|a2-2|a3-2": [
      "arrive-settle",
      "park-morning",
      "neighborhood-day",
      "skyline-evening",
      "one-last-stroll",
    ],
    "a1-2|a2-3|a3-3": [
      "arrive-settle",
      "neighborhood-day",
      "skyline-evening",
      "park-morning",
      "one-last-stroll",
    ],
    "a1-2|a2-3|a3-4": [
      "arrive-settle",
      "neighborhood-day",
      "park-morning",
      "skyline-evening",
      "one-last-stroll",
    ],
    "a1-2|a2-4|a3-3": [
      "arrive-settle",
      "skyline-evening",
      "neighborhood-day",
      "park-morning",
      "one-last-stroll",
    ],
    "a1-2|a2-4|a3-4": [
      "arrive-settle",
      "park-morning",
      "skyline-evening",
      "neighborhood-day",
      "one-last-stroll",
    ],
  },

  questions: {
    q1: {
      id: "q1",
      text: "Great — I’ll plan around what you already have booked. What sounds most like your family?",
      answerIds: ["a1-1", "a1-2"],
    },
    "q2-1": {
      id: "q2-1",
      text: "Treetops or a mountain kayak? Which outing should come first?",
      answerIds: ["a2-1", "a2-2"],
    },
    "q2-2": {
      id: "q2-2",
      text: "River views or spring gardens? Which comes first?",
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
      subtitle: "Treetop challenges, mountain kayaking, and roadside go-karts.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_1.png",
      replyMsg:
        "We love getting outside—the kids can’t wait to try a treetop course and kayak in Tokyo’s mountains.",
      aiReplyMsg: "",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "River views, garden strolls, and family-friendly sushi.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "We’d like to take it slow—river views, spring gardens, and sushi the kids can try sound perfect.",
      aiReplyMsg: "",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Forest Adventure Yokohama",
      subtitle: "Take on forest ropes and bridges near Yokohama.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q2-ropes-1.png",
      replyMsg:
        "Let's start with Forest Adventure Yokohama—the kids can't wait to hit the treetops!",
      aiReplyMsg:
        "Perfect—I'll start with Forest Adventure Yokohama, then add Lake Shiromaru kayak lesson the next day.",
      nextQuestionId: "q3-1",
    },
    "a2-2": {
      id: "a2-2",
      text: "Lake Shiromaru kayak lesson",
      subtitle: "Learn to paddle through emerald waters in Okutama.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q2-kayak-1.png",
      replyMsg:
        "Let's start with Lake Shiromaru—the kids can't wait to paddle!",
      aiReplyMsg:
        "Perfect—I'll start with Lake Shiromaru, then add Forest Adventure Yokohama the next day.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Sumida River cruise",
      subtitle: "Cruise from Asakusa toward Odaiba Marine Park.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg:
        "Let's start with the Sumida River cruise—the kids will love being out on the water!",
      aiReplyMsg:
        "Perfect—I'll start with the Sumida River cruise, then add Shinjuku Gyoen gardens the next day.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Shinjuku Gyoen gardens",
      subtitle: "Enjoy vast lawns and late-blooming cherry trees.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "Let's start with Shinjuku Gyoen—the kids can ease into Tokyo among the spring trees!",
      aiReplyMsg:
        "Perfect—I'll start with Shinjuku Gyoen, then add the Sumida River cruise the next day.",
      nextQuestionId: "q3-2",
    },

    "a3-1": {
      id: "a3-1",
      text: "A picnic by the pond",
      subtitle: "A relaxed afternoon with water and spring trees.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Which park would you recommend for a relaxed family afternoon?",
      aiReplyMsg:
        "Inokashira Park is a great fit: enjoy a picnic beneath the spring trees and look for koi and turtles around the pond.",
      aiReplyChip: {
        title: "Inokashira Park afternoon",
        subtitle: "Picnic, koi, and spring trees",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "A mountain trail day",
      subtitle: "An easy family walk with big views.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg: "Which mountain trail would you recommend for a family outing?",
      aiReplyMsg:
        "Mt. Takao’s Trail 1 is the family-walk option in your plan. Take the Keio Line from Shinjuku to Takaosanguchi, then start at the mountain’s base.",
      aiReplyChip: {
        title: "Mt. Takao Trail 1",
        subtitle: "Family walk from Takaosanguchi",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "An easy sushi outing",
      subtitle: "Casual conveyor-belt sushi the kids can try.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg: "Can you recommend somewhere casual for the kids to try sushi?",
      aiReplyMsg:
        "Try Kura Sushi Harajuku for conveyor-belt sushi and familiar sides like udon and fries, plus the Bikkura-pon prize game.",
      aiReplyChip: {
        title: "Kura Sushi Harajuku",
        subtitle: "Conveyor-belt sushi and kids’ sides",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-4": {
      id: "a3-4",
      text: "A picnic by the pond",
      subtitle: "A relaxed afternoon with water and spring trees.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Which park would you recommend for a relaxed family afternoon?",
      aiReplyMsg:
        "Inokashira Park is a great fit: enjoy a picnic, try a swan boat on the pond, and look for koi and turtles beneath the spring trees.",
      aiReplyChip: {
        title: "Inokashira Park afternoon",
        subtitle: "Picnic, swan boats, and spring trees",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
  },
};

export default tokyo;
