/**
 * Sedona branching Q&A script.
 *
 *   q1 → a1-1 → q2-1 → a2-1 → q3-1 → a3-1 / a3-2
 *                    → a2-2 → q3-1
 *        a1-2 → q2-2 → a2-3 → q3-2 → a3-3 / a3-2 (shared)
 *                    → a2-4 → q3-2
 */
const sedona = {
  destinationId: "sedona",
  startQuestionId: "q1",

  /** Shown on the briefing / Q&A pages */
  tripTitle: "Sedona · Apr 6 – 11",
  intro:
    "We're heading to Sedona from April 6–11. Our flights from Minneapolis to Phoenix are booked, and we're staying here.",
  introChip: {
    title: "Sky Rock Sedona Lodge",
    subtitle: "Sedona, AZ · April 6–11 · Confirmed",
    chipText: "Booked · Expedia",
    image: "/images/Expedia-images/options/sedona/intro.png",
  },
  /** Building phase — left memory card */
  memoryCard: {
    headline: "Your next family\nmemory awaits",
    eyebrow: "Your personalized family itinerary",
    title: "Sedona",
    duration: "5 days",
    footer: "Created with Activity Planner",
    image: "/images/Expedia-images/destination-view/sedona.png",
  },

  /** Right screen images during briefing / Q&A (keyed by step) */
  displayImages: {
    briefing: "/images/Expedia-images/destination-view/sedona.png",
    q1: "/images/Expedia-images/destination-view/sedona.png",
    "q2-1": "/images/Expedia-images/destination-view/sedona.png",
    "q2-2": "/images/Expedia-images/destination-view/sedona.png",
    "q3-1": "/images/Expedia-images/destination-view/sedona.png",
    "q3-2": "/images/Expedia-images/destination-view/sedona.png",
    default: "/images/Expedia-images/destination-view/sedona.png",
  },

  /**
   * Arrangement (design board):
   *   Day 1 — shared welcome
   *   Days 2–3 — Q2 order swap (adventure: Bell Rock↔treetops; relax: trolley↔village)
   *   Day 4 — Q3 add-on (Oak Creek picnic shared)
   *   Day 5 — branch ending
   */
  itinerary: {
    headline: "Five days built for your family",
    meta: "Sedona · Apr 6 – 11",
    summary: "Red rocks, easy outings, and time by Oak Creek",
  },

  /** Reusable one-day modules (images: /images/Expedia-images/itinerary/sedona/) */
  dayModules: {
    "welcome-red-rock": {
      title: "Welcome to Red Rock Country",
      description:
        "Arrive via Phoenix, settle into Sedona, and take in the red-rock buttes above town.",
      image: "/images/Expedia-images/itinerary/sedona/welcome-red-rock.jpg",
    },
    "among-the-red-rocks": {
      title: "Among the Red Rocks",
      description:
        "Explore Bell Rock Pathway together, taking in the red-rock formations at your family's pace.",
      image: "/images/Expedia-images/itinerary/sedona/among-the-red-rocks.jpg",
    },
    "ropes-among-the-pines": {
      title: "Ropes Among the Pines",
      description:
        "Head to Flagstaff Extreme for a treetop ropes course among the ponderosa pines.",
      image: "/images/Expedia-images/itinerary/sedona/ropes-among-the-pines.jpg",
    },
    "down-the-verde": {
      title: "Down the Verde",
      description:
        "Join CenterFocus for a guided Verde River paddle past cottonwood groves and canyon walls.",
      image: "/images/Expedia-images/itinerary/sedona/down-the-verde.jpg",
    },
    "oak-creek-afternoon": {
      title: "An Oak Creek Afternoon",
      description:
        "Settle into the shade for a family picnic beside Oak Creek, with red-rock views and hawks overhead.",
      image: "/images/Expedia-images/itinerary/sedona/oak-creek-afternoon.jpg",
    },
    "red-rocks-easy-pace": {
      title: "Red Rocks, Easy Pace",
      description:
        "Ride the Sedona Trolley past local landmarks, with narration and photo stops along the way.",
      image: "/images/Expedia-images/itinerary/sedona/red-rocks-easy-pace.png",
    },
    "courtyards-galleries": {
      title: "Courtyards & Galleries",
      description:
        "Wander through Tlaquepaque's shaded courtyards and browse its galleries at an easy pace.",
      image: "/images/Expedia-images/itinerary/sedona/courtyards-galleries.jpg",
    },
    "breakfast-sedona-style": {
      title: "Breakfast, Sedona Style",
      description:
        "Sit down at Coffee Pot Restaurant for a casual family meal with omelets and a kids’ menu.",
      image: "/images/Expedia-images/itinerary/sedona/breakfast-sedona-style.png",
    },
    "one-last-red-rock-view": {
      title: "One Last Red-Rock View",
      description:
        "Pause at a final red-rock overlook before the drive back to Phoenix and your flight home.",
      image: "/images/Expedia-images/itinerary/sedona/one-last-red-rock-view.jpg",
    },
    "quiet-sedona-morning": {
      title: "A Quiet Sedona Morning",
      description:
        "Enjoy one last view of Sedona’s red rocks before checking out and heading back to Phoenix.",
      image: "/images/Expedia-images/itinerary/sedona/quiet-sedona-morning.jpg",
    },
  },

  itineraryPaths: {
    default: [
      "welcome-red-rock",
      "among-the-red-rocks",
      "ropes-among-the-pines",
      "down-the-verde",
      "one-last-red-rock-view",
    ],
    // Adventure · Bell Rock first · river paddle
    "a1-1|a2-1|a3-1": [
      "welcome-red-rock",
      "among-the-red-rocks",
      "ropes-among-the-pines",
      "down-the-verde",
      "one-last-red-rock-view",
    ],
    // Adventure · Bell Rock first · Oak Creek
    "a1-1|a2-1|a3-2": [
      "welcome-red-rock",
      "among-the-red-rocks",
      "ropes-among-the-pines",
      "oak-creek-afternoon",
      "one-last-red-rock-view",
    ],
    // Adventure · treetops first · river paddle
    "a1-1|a2-2|a3-1": [
      "welcome-red-rock",
      "ropes-among-the-pines",
      "among-the-red-rocks",
      "down-the-verde",
      "one-last-red-rock-view",
    ],
    // Adventure · treetops first · Oak Creek
    "a1-1|a2-2|a3-2": [
      "welcome-red-rock",
      "ropes-among-the-pines",
      "among-the-red-rocks",
      "oak-creek-afternoon",
      "one-last-red-rock-view",
    ],
    // Relax · trolley first · breakfast
    "a1-2|a2-3|a3-3": [
      "welcome-red-rock",
      "red-rocks-easy-pace",
      "courtyards-galleries",
      "breakfast-sedona-style",
      "quiet-sedona-morning",
    ],
    // Relax · trolley first · Oak Creek
    "a1-2|a2-3|a3-2": [
      "welcome-red-rock",
      "red-rocks-easy-pace",
      "courtyards-galleries",
      "oak-creek-afternoon",
      "quiet-sedona-morning",
    ],
    // Relax · village first · breakfast
    "a1-2|a2-4|a3-3": [
      "welcome-red-rock",
      "courtyards-galleries",
      "red-rocks-easy-pace",
      "breakfast-sedona-style",
      "quiet-sedona-morning",
    ],
    // Relax · village first · Oak Creek
    "a1-2|a2-4|a3-2": [
      "welcome-red-rock",
      "courtyards-galleries",
      "red-rocks-easy-pace",
      "oak-creek-afternoon",
      "quiet-sedona-morning",
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
      text: "Red rocks or treetops? Which adventure should come first?",
      answerIds: ["a2-1", "a2-2"],
    },
    "q2-2": {
      id: "q2-2",
      text: "A trolley ride or a village stroll? Which comes first?",
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
      answerIds: ["a3-3", "a3-2"],
    },
  },

  answers: {
    "a1-1": {
      id: "a1-1",
      text: "Try something adventurous",
      subtitle: "Red rock trails, jeep tours, and dusty paths.",
      chipText: "",
      image: "/images/Expedia-images/options/sedona/a1-1.jpg",
      replyMsg:
        "We love the outdoors. The kids can’t wait to explore Sedona’s red rock trails and maybe a jeep tour too.",
      aiReplyMsg: "",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Valley views, slow strolls, and good food.",
      chipText: "",
      image: "/images/Expedia-images/options/sedona/a1-2.jpg",
      replyMsg:
        "We’d like to take it slow. Valley views, shaded courtyards, and good food sound perfect for our family.",
      aiReplyMsg: "",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Bell Rock family walk",
      subtitle: "Follow a family path below massive red rocks.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/sedona/a2-1.jpg",
      replyMsg:
        "Let's start with Bell Rock. The kids can't wait to explore the red-rock trails!",
      aiReplyMsg:
        "Perfect. I'll start with Bell Rock Pathway, then add Flagstaff Extreme's treetop course the next day.",
      nextQuestionId: "q3-1",
    },
    "a2-2": {
      id: "a2-2",
      text: "Flagstaff treetop challenge",
      subtitle: "Climb ropes and bridges among the ponderosa pines.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/sedona/a2-2.png",
      replyMsg:
        "Let's start with Flagstaff Extreme. The kids can't wait to tackle the treetop course!",
      aiReplyMsg:
        "Perfect. I'll start with Flagstaff Extreme's treetop course, then add Bell Rock Pathway the next day.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Sedona Trolley tour",
      subtitle: "See Sedona's landmarks with short photo stops.",
      chipText: "Expedia Exclusive",
      image: "/images/Expedia-images/options/sedona/a2-3.png",
      replyMsg:
        "Let's start with the trolley. A relaxed introduction to Sedona sounds just right!",
      aiReplyMsg:
        "Perfect. I'll start with the Sedona Trolley, then add a Tlaquepaque village stroll the next day.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Tlaquepaque village stroll",
      subtitle: "Explore shaded courtyards, galleries, and craft shops.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/sedona/a2-4.jpg",
      replyMsg:
        "Let's start with Tlaquepaque. The kids can explore while we browse the courtyards!",
      aiReplyMsg:
        "Perfect. I'll start with Tlaquepaque's courtyards, then add the Sedona Trolley the next day.",
      nextQuestionId: "q3-2",
    },

    "a3-1": {
      id: "a3-1",
      text: "A guided river paddle",
      subtitle: "Admire cliffs from the Verde River.",
      chipText: "",
      image: "/images/Expedia-images/options/sedona/a3-1.png",
      replyMsg: "Can you recommend a river adventure to add to our trip?",
      aiReplyMsg:
        "Try the guided Verde River kayak tour with Clarkdale. A family-friendly float past cottonwoods and canyon walls.",
      aiReplyChip: {
        title: "Verde River guided kayak",
        subtitle: "A guided paddle near Clarkdale",
        chipText: "Expedia Exclusive",
        image: "/images/Expedia-images/options/sedona/r3-1.png",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "A creekside picnic",
      subtitle: "Make time for water, shade, and canyon views.",
      chipText: "",
      image: "/images/Expedia-images/options/sedona/a3-2.png",
      replyMsg: "Where would you recommend a slower afternoon by the water?",
      aiReplyMsg:
        "Try a picnic beside Oak Creek for a slower afternoon after your adventures. Settle into the shade, enjoy the red-rock views, and watch for hawks overhead.",
      aiReplyChip: {
        title: "Oak Creek family picnic",
        subtitle: "Water, shade, and views together",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/sedona/r3-2.jpg",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "A relaxed family breakfast",
      subtitle: "Find a casual spot with choices for the kids.",
      chipText: "",
      image: "/images/Expedia-images/options/sedona/a3-3.png",
      replyMsg: "Can you recommend a casual breakfast spot the kids will like?",
      aiReplyMsg:
        "Try Coffee Pot Restaurant for a relaxed family meal, with plenty of omelet choices and a dedicated kids' menu.",
      aiReplyChip: {
        title: "Coffee Pot Restaurant",
        subtitle: "Omelets and a dedicated kids' menu",
        chipText: "From Google Maps",
        image: "/images/Expedia-images/options/sedona/r3-3.png",
      },
      nextQuestionId: null,
    },
  },
};

export default sedona;
