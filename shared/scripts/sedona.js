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
  },
  /** Building phase — left memory card */
  memoryCard: {
    headline: "Your next family memory awaits",
    eyebrow: "Your personalized family itinerary",
    title: "Sedona",
    duration: "5 days",
    footer: "Created with AI Activity Planner",
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

  dayModules: {
    "welcome-red-rock": {
      title: "Welcome to Red Rock Country",
      description:
        "Arrive via Phoenix, settle into Sedona, and take in the red-rock buttes above town.",
      image: "/images/Expedia-images/03-itinerary/it1.png",
    },
    "among-the-red-rocks": {
      title: "Among the Red Rocks",
      description:
        "Explore Bell Rock Pathway—an easy family walk with red-rock views and plenty of photo stops.",
      image: "/images/Expedia-images/03-itinerary/it2.png",
    },
    "ropes-among-the-pines": {
      title: "Ropes Among the Pines",
      description:
        "Take on the treetop ropes course at Flagstaff Extreme, with pines and cheers from the ground.",
      image: "/images/Expedia-images/03-itinerary/it3.png",
    },
    "down-the-verde": {
      title: "Down the Verde",
      description:
        "A guided Verde River paddle past cottonwood groves—cool water under red-rock sky.",
      image: "/images/Expedia-images/03-itinerary/it4.png",
    },
    "oak-creek-afternoon": {
      title: "An Oak Creek Afternoon",
      description:
        "A family picnic beside Oak Creek—shade, splash time, and an easy pace.",
      image: "/images/Expedia-images/03-itinerary/it4.png",
    },
    "red-rocks-easy-pace": {
      title: "Red Rocks, Easy Pace",
      description:
        "Ride the Sedona Trolley for red-rock overlooks without the hike.",
      image: "/images/Expedia-images/03-itinerary/it2.png",
    },
    "courtyards-galleries": {
      title: "Courtyards & Galleries",
      description:
        "Wander through Tlaquepaque’s courtyards, shops, and shady corners at an easy pace.",
      image: "/images/Expedia-images/03-itinerary/it3.png",
    },
    "breakfast-sedona-style": {
      title: "Breakfast, Sedona Style",
      description:
        "A relaxed family breakfast at Coffee Pot Restaurant—local favorite plates and an easy start.",
      image: "/images/Expedia-images/03-itinerary/it4.png",
    },
    "one-last-red-rock-view": {
      title: "One Last Red-Rock View",
      description:
        "Pause at a final red-rock overlook before the drive back to Phoenix and your flight home.",
      image: "/images/Expedia-images/03-itinerary/it5.png",
    },
    "quiet-sedona-morning": {
      title: "A Quiet Sedona Morning",
      description:
        "Enjoy one last view of Sedona’s red rocks before checking out and heading back to Phoenix.",
      image: "/images/Expedia-images/03-itinerary/it5.png",
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
      text: "Great — I’ll plan around what you already have booked. What sounds most like your family?",
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
      image: "/images/Expedia-images/options/q1_1.png",
      replyMsg:
        "We love the outdoors—the kids can’t wait to explore Sedona’s red rock trails and maybe a jeep tour too.",
      aiReplyMsg: "",
      nextQuestionId: "q2-1",
    },
    "a1-2": {
      id: "a1-2",
      text: "Take it slow",
      subtitle: "Valley views, slow strolls, and good food.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "We’d like to take it slow—valley views, shaded courtyards, and good food sound perfect for our family.",
      aiReplyMsg: "",
      nextQuestionId: "q2-2",
    },

    "a2-1": {
      id: "a2-1",
      text: "Bell Rock family walk",
      subtitle: "Follow a family path below massive red rocks.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q3-hike.png",
      replyMsg:
        "Let's start with Bell Rock—the kids can't wait to explore the red-rock trails!",
      aiReplyMsg:
        "Perfect—I'll start with Bell Rock Pathway, then add Flagstaff Extreme's treetop course the next day.",
      nextQuestionId: "q3-1",
    },
    "a2-2": {
      id: "a2-2",
      text: "Flagstaff treetop challenge",
      subtitle: "Climb ropes and bridges among the ponderosa pines.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q2-ropes-1.png",
      replyMsg:
        "Let's start with Flagstaff Extreme—the kids can't wait to tackle the treetop course!",
      aiReplyMsg:
        "Perfect—I'll start with Flagstaff Extreme's treetop course, then add Bell Rock Pathway the next day.",
      nextQuestionId: "q3-1",
    },

    "a2-3": {
      id: "a2-3",
      text: "Sedona Trolley tour",
      subtitle: "See Sedona's landmarks with short photo stops.",
      chipText: "Expedia Exclusive",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg:
        "Let's start with the trolley—a relaxed introduction to Sedona sounds just right!",
      aiReplyMsg:
        "Perfect—I'll start with the Sedona Trolley, then add a Tlaquepaque village stroll the next day.",
      nextQuestionId: "q3-2",
    },
    "a2-4": {
      id: "a2-4",
      text: "Tlaquepaque village stroll",
      subtitle: "Explore shaded courtyards, galleries, and craft shops.",
      chipText: "From Google Maps",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg:
        "Let's start with Tlaquepaque—the kids can explore while we browse the courtyards!",
      aiReplyMsg:
        "Perfect—I'll start with Tlaquepaque's courtyards, then add the Sedona Trolley the next day.",
      nextQuestionId: "q3-2",
    },

    "a3-1": {
      id: "a3-1",
      text: "A guided river paddle",
      subtitle: "Admire cliffs from the Verde River.",
      chipText: "",
      image: "/images/Expedia-images/options/q2-kayak-1.png",
      replyMsg: "Can you recommend a river adventure to add to our trip?",
      aiReplyMsg:
        "Try the guided Verde River kayak tour with Clarkdale—a family-friendly float past cottonwoods and canyon walls.",
      aiReplyChip: {
        title: "Verde River guided kayak",
        subtitle: "A guided paddle near Clarkdale",
        chipText: "Expedia Exclusive",
      },
      nextQuestionId: null,
    },
    "a3-2": {
      id: "a3-2",
      text: "A creekside picnic",
      subtitle: "Make time for water, shade, and canyon views.",
      chipText: "",
      image: "/images/Expedia-images/options/q3-lake.png",
      replyMsg: "Where would you recommend a slower afternoon by the water?",
      aiReplyMsg:
        "Try a picnic beside Oak Creek for a slower afternoon after your adventures. Settle into the shade, enjoy the red-rock views, and watch for hawks overhead.",
      aiReplyChip: {
        title: "Oak Creek family picnic",
        subtitle: "Water, shade, and views together",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
    "a3-3": {
      id: "a3-3",
      text: "A relaxed family breakfast",
      subtitle: "Find a casual spot with choices for the kids.",
      chipText: "",
      image: "/images/Expedia-images/options/q1_2.png",
      replyMsg: "Can you recommend a casual breakfast spot the kids will like?",
      aiReplyMsg:
        "Try Coffee Pot Restaurant for a relaxed family meal, with plenty of omelet choices and a dedicated kids' menu.",
      aiReplyChip: {
        title: "Coffee Pot Restaurant",
        subtitle: "Omelets and a dedicated kids' menu",
        chipText: "From Google Maps",
      },
      nextQuestionId: null,
    },
  },
};

export default sedona;
