/**
 * Tokyo branching Q&A script.
 *
 * Same Q1/Q2 branching as Tahoe, but four distinct a3 answers:
 *   q3-1 → a3-1, a3-2
 *   q3-2 → a3-3, a3-4
 */
const tokyo = {
  destinationId: "tokyo",
  startQuestionId: "q1",

  /** Shown on the briefing page before q1 */
  intro:
    "We're heading to Tokyo from April 6–11. Our flights from Seattle to Tokyo are booked, and we're staying here.",
  introChip: {
    title: "Sakura Family Lodge",
    subtitle: "Tokyo, Japan · April 6–11 · Confirmed",
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
      subtitle: "Neighborhoods, towers, and lively city days.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_1.png",
      replyMsg:
        "We love exploring—the kids are dying to see Tokyo’s skyline and try a big city day over spring break.",
      aiReplyMsg: "A little adventure it is!",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Parks, temples, and easy food stops.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "We'd like to take it slow—parks, temples, and easy food stops sound perfect for our family.",
      aiReplyMsg: "Taking it slow it is!",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "teamLab Planets",
      subtitle: "Immersive art rooms the whole family can wander.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q2-kayak-1.png",
      replyMsg:
        "Let's start with teamLab Planets—the kids can't wait to walk through the lights!",
      aiReplyMsg:
        "Perfect—I'll start with teamLab Planets, then add a Shibuya lookout the next day to round out your itinerary.",
      nextQuestionId: null,
    },
    "a2-2": {
      id: "a2-2",
      text: "Shibuya Sky",
      subtitle: "Open-air views over the scramble and skyline.",
      chipText: "Expedia · Bookable",
      image: "/images/Expedia-images/options/q2-ropes-1.png",
      replyMsg:
        "Let's start with Shibuya Sky—the kids can't wait to see the city from above!",
      aiReplyMsg:
        "Perfect—I'll start with Shibuya Sky, then add teamLab the next day to round out your itinerary.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Ueno Park afternoon",
      subtitle: "Ponds, paths, and an easy outdoor pace.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg:
        "Let's start with Ueno Park—the kids will love the open space!",
      aiReplyMsg:
        "Perfect—I'll start with Ueno Park, then add a quiet temple stop the next day to round out your easygoing itinerary.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Senso-ji temple visit",
      subtitle: "Incense, gates, and a gentle neighborhood wander.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "Let's start with Senso-ji—the kids can ease into Tokyo with snacks and temple gates!",
      aiReplyMsg:
        "Perfect—I'll start with Senso-ji, then add a park afternoon the next day to round out your easygoing itinerary.",
      nextQuestionId: null,
    },

    "a3-1": {
      id: "a3-1",
      text: "A nearby family stroll",
      subtitle: "An easy walk close to the hotel, before dinner",
      chipText: "",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg: "Can we add an easy family stroll near our hotel?",
      aiReplyMsg:
        "Imperial Palace East Gardens is a short ride away, so it’s easy to fit in a family walk before dinner.",
      aiReplyChip: {
        title: "Imperial Palace East Gardens",
        subtitle: "Short ride from your hotel",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "More time for snacks",
      subtitle: "A slower afternoon hopping easy food stops.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Can we add more time for snacks around the city?",
      aiReplyMsg:
        "Absolutely—I’ll leave an open afternoon in a food-friendly neighborhood so everyone can graze at their own pace.",
      aiReplyChip: {
        title: "Neighborhood snack crawl",
        subtitle: "Easy bites for the whole family",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "Family dinner with a city view",
      subtitle: "Casual plates and skyline lights.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg: "Can we add a family dinner with a city view?",
      aiReplyMsg:
        "Tokyo Skytree Town has plenty of kid-friendly dinner options with big-city energy nearby.",
      aiReplyChip: {
        title: "Tokyo Skytree Town dining",
        subtitle: "Family meal near the lights",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-4": {
      id: "a3-4",
      text: "More time in a park",
      subtitle: "A slower afternoon with open space to roam.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Can we add more park time?",
      aiReplyMsg:
        "Yoyogi Park is a great fit for a slower afternoon—open lawns, people-watching, and room for the kids to run.",
      aiReplyChip: {
        title: "Yoyogi Park afternoon",
        subtitle: "Open lawns and easy wandering",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
  },
};

export default tokyo;
