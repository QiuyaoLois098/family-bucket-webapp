export const DESTINATIONS = [
{
    id: "costa-rica",
    title: "Sunset by the beach in Costa Rica",
    shortTitle: "Costa Rica",
    location: "Manuel Antonio",
    invitation: "Golden hour along a wild shoreline.",
    image: "/images/Expedia-images/destinations/costa-rica.png",
    gallery: [
      "/images/Expedia-images/destinations/costa-rica.png",
      "/images/Expedia-images/options/q1_2.png",
      "/images/Expedia-images/options/q2-1.png",
      "/images/Expedia-images/options/q1_1.png",
      "/images/Expedia-images/options/q3-1.png",
    ],
    crops: ["center 40%", "center 70%", "left center", "right 30%", "center 50%"],
    palette: {
      wash: "linear-gradient(180deg, #191e3b 0%, #4a7aa0 55%, #ffffff 100%)",
      accent: "#fddb32",
    },
    imagePromptBase:
      "Cinematic premium travel photograph of a Costa Rican Pacific coastline at sunset: palm silhouettes, wet sand reflecting molten sky, turquoise water turning gold, distant rainforest meeting the shore. Editorial Expedia campaign quality, large-format photography, no people, no text, no logos.",
    fallbackItinerary: {
      title: "Your Family Escape to Costa Rica",
      subtitle: "A warm, slow journey along the Pacific coast",
      headline: "Big adventures, little explorers.",
      moments: [
        {
          time: "Day 1",
          title: "Beach discovery",
          description:
            "Explore Espadilla Norte after check-in; spot shorebirds together. Dinner at Soda Mar Azul, known for Costa Rican home cooking by Espadilla.",
        },
        {
          time: "Day 2",
          title: "Spot wild wonders",
          description:
            "A guided Manuel Antonio park walk, with kids choosing what to look for. Lunch at Sendero Tico, a local-style soda near the park entrance.",
        },
        {
          time: "Day 3",
          title: "Catch a first wave",
          description:
            "A private family surf lesson at Espadilla. Back to the hotel to rest. Lunch at La Olla Tica, a casual spot for local flavors near Espadilla.",
        },
        {
          time: "Day 4",
          title: "Paddle & discover",
          description:
            "Explore Damas mangroves by guided kayak, with an adult paddling alongside. Dinner at Casa Quereña in Quepos, a welcoming spot for traditional Costa Rican cooking.",
        },
        {
          time: "Day 5",
          title: "One last seaside stop",
          description:
            "After breakfast in Quepos, let the kids pick one last waterfront stop before your transfer. Breakfast at Café del Malecón, a traditional Costa Rican café by Quepos' waterfront.",
        },
      ],
    },
  },
{
    id: "lake-tahoe",
    title: "A lakeside afternoon at Lake Tahoe",
    shortTitle: "Lake Tahoe",
    location: "California / Nevada",
    invitation: "A moment made for all of you.",
    image: "/images/Expedia-images/destinations/lake-taho.png",
    gallery: [
      "/images/Expedia-images/destinations/lake-taho.png",
      "/images/memories/drive.png",
      "/images/memories/food.jpg",
      "/images/memories/forest.png",
    ],
    crops: ["center 45%", "right 30%", "left 50%", "center 75%"],
    palette: {
      wash: "linear-gradient(180deg, #191e3b 0%, #4a7aa0 45%, #fddb32 100%)",
      accent: "#4a7aa0",
    },
    imagePromptBase:
      "Cinematic premium travel photograph of Lake Tahoe: clear alpine water, pine forest, snow-capped peaks, rocky shoreline, bright mountain light. Editorial family travel campaign quality, no text, no logos.",
    fallbackItinerary: {
      title: "Your Family Escape to Lake Tahoe",
      subtitle: "Clear water, mountain air, and a day made for everyone",
      moments: [
        {
          time: "Morning",
          title: "Shoreline Walk",
          description:
            "Start where the pines meet the water. The lake is cold and bright, and everyone finds their own pace along the rocks.",
        },
        {
          time: "Afternoon",
          title: "Picnic by the Water",
          description:
            "Find a flat stone or a quiet beach. Pack something simple and stay until the light turns warmer on the peaks.",
        },
        {
          time: "Sunset",
          title: "Mountain Gold",
          description:
            "Watch the summits catch the last light while the lake goes still. This is the hour the photos never quite capture.",
        },
        {
          time: "Evening",
          title: "Cabin Supper",
          description:
            "Come in for a long table dinner. Outside, the water keeps reflecting the night. Inside, no one is in a hurry.",
        },
      ],
    },
  },
{
    id: "catskills",
    title: "Campfire stories in the Catskills",
    shortTitle: "The Catskills",
    location: "New York",
    invitation: "Woodsmoke, pines, and a sky full of quiet.",
    image: "/images/Expedia-images/destinations/catskills.png",
    gallery: [
      "/images/Expedia-images/destinations/catskills.png",
      "/images/memories/forest.png",
      "/images/memories/food.jpg",
      "/images/memories/drive.png",
    ],
    crops: ["center 30%", "center center", "left 40%", "center 80%"],
    palette: {
      wash: "linear-gradient(180deg, #191e3b 0%, #4a7aa0 50%, #ffffff 100%)",
      accent: "#fddb32",
    },
    imagePromptBase:
      "Cinematic premium travel photograph of a Catskills mountain evening: a stone fire ring with glowing embers, Adirondack chairs, pine forest, cedar cabin porch light, autumn-toned woods, star-faint sky. Editorial, intimate, no people, no text, no logos.",
    fallbackItinerary: {
      title: "Your Family Escape to the Catskills",
      subtitle: "Woodsmoke, pine air, and stories that last past midnight",
      moments: [
        {
          time: "Morning",
          title: "Trail Above the Creek",
          description:
            "A leaf-strewn path follows cold water through hemlock and birch. Stop where the creek pools - the kind of place that makes everyone walk a little slower.",
        },
        {
          time: "Afternoon",
          title: "Porch and Provisions",
          description:
            "Return to a cabin porch with a board of local cheese, apples, and something baked that morning in town. The mountains do the rest of the talking.",
        },
        {
          time: "Sunset",
          title: "Ridge Light",
          description:
            "Drive or walk to a western ridge as the valleys fill with gold. The Catskills turn blue in layers, one after another.",
        },
        {
          time: "Evening",
          title: "Firepit Stories",
          description:
            "Build the fire before the cold settles. Sparks lift into the pines. This is the night you will remember when someone says, tell that one again.",
        },
      ],
    },
  },
{
    id: "alps",
    title: "A winter escape in the Alps",
    shortTitle: "The Alps",
    location: "Europe",
    invitation: "Snow light, timber rooms, and mountain quiet.",
    image: "/images/Expedia-images/destinations/apls.png",
    gallery: [
      "/images/Expedia-images/destinations/apls.png",
      "/images/memories/snow.png",
      "/images/memories/food.jpg",
      "/images/memories/drive.png",
    ],
    crops: ["center 30%", "center 60%", "left 20%", "right 40%"],
    palette: {
      wash: "linear-gradient(180deg, #191e3b 0%, #4a7aa0 48%, #fddb32 100%)",
      accent: "#4a7aa0",
    },
    imagePromptBase:
      "Cinematic premium travel photograph of a snow-covered Alpine village at dusk: timber chalets, warm window light, pine forest, mountains, freshly fallen snow, blue-hour sky. Editorial luxury winter travel, no prominent people, no text, no logos.",
    fallbackItinerary: {
      title: "Your Family Escape to the Alps",
      subtitle: "Snow light, timber rooms, and the hush of high winter",
      moments: [
        {
          time: "Morning",
          title: "First Tracks",
          description:
            "Step into air so cold it feels new. Whether you ski or simply walk the packed village path, the mountains are close enough to touch.",
        },
        {
          time: "Afternoon",
          title: "Fireside Pause",
          description:
            "Come in while the light is still white on the peaks. Cocoa, a heavy blanket, and windows that frame the whole range.",
        },
        {
          time: "Sunset",
          title: "Alpenglow",
          description:
            "Watch the summits go rose, then violet. It lasts only minutes. Everyone goes quiet without being asked.",
        },
        {
          time: "Evening",
          title: "Mountain Supper",
          description:
            "A wood-paneled room, candlelight, and the kind of dinner that makes winter feel like a gift. Snow keeps falling in the dark.",
        },
      ],
    },
  },
{
    id: "desert",
    title: "Stargazing in the desert",
    shortTitle: "The Desert",
    location: "Arizona",
    invitation: "Red rock, wide sky, and a silence that goes on forever.",
    image: "/images/Expedia-images/destinations/the-desert.png",
    gallery: [
      "/images/Expedia-images/destinations/the-desert.png",
      "/images/memories/drive.png",
      "/images/memories/food.jpg",
      "/images/memories/forest.png",
    ],
    crops: ["center 20%", "center 70%", "left 40%", "right 25%"],
    palette: {
      wash: "linear-gradient(180deg, #191e3b 0%, #4a7aa0 48%, #ffffff 100%)",
      accent: "#fddb32",
    },
    imagePromptBase:
      "Cinematic premium travel photograph of the Arizona desert: red sandstone mesas and buttes like Monument Valley, warm late-afternoon light, sparse scrub, immense blue sky turning gold at the horizon. Editorial Southwest travel campaign quality, no people, no text, no logos.",
    fallbackItinerary: {
      title: "Your Family Escape to the Desert",
      subtitle: "Red earth by day, and a sky that rewrites the night",
      moments: [
        {
          time: "Morning",
          title: "First Light on the Rocks",
          description:
            "Wake for the hour when the mesas catch fire. The desert is cool, quiet, and briefly gentle.",
        },
        {
          time: "Afternoon",
          title: "Shade and Stillness",
          description:
            "Retreat to a casita or canyon wall when the sun is high. Cold drinks, a slow lunch, and the luxury of doing almost nothing.",
        },
        {
          time: "Sunset",
          title: "Dune Horizon",
          description:
            "Walk out as the temperature drops. Shadows lengthen into geometry. The first stars appear before the sky is fully dark.",
        },
        {
          time: "Evening",
          title: "The Whole Sky",
          description:
            "Blankets, a thermos, and no city glow. The Milky Way arrives as if someone opened a door. This is the memory you came for.",
        },
      ],
    },
  },
{
    id: "kyoto",
    title: "Cherry blossom season in Kyoto",
    shortTitle: "Kyoto",
    location: "Japan",
    invitation: "Petals, temple gardens, and pale spring light.",
    image: "/images/Expedia-images/destinations/kyoto.png",
    gallery: [
      "/images/Expedia-images/destinations/kyoto.png",
      "/images/memories/sakura.png",
      "/images/memories/sushi.png",
      "/images/memories/drive.png",
    ],
    crops: ["center 25%", "center 60%", "right center", "left 20%"],
    palette: {
      wash: "linear-gradient(180deg, #191e3b 0%, #4a7aa0 48%, #fddb32 100%)",
      accent: "#4a7aa0",
    },
    imagePromptBase:
      "Cinematic premium travel photograph of Kyoto in cherry blossom season: a quiet temple garden path, pale pink petals over still water, wooden architecture, stone lanterns, morning mist. Editorial, serene, no prominent people, no text, no logos.",
    fallbackItinerary: {
      title: "Your Family Escape to Kyoto",
      subtitle: "A pale-pink spring among gardens, rivers, and quiet streets",
      moments: [
        {
          time: "Morning",
          title: "Temple Garden",
          description:
            "Arrive before the lanes fill. Petals rest on moss and pond water. Walk slowly - Kyoto rewards the unhurried.",
        },
        {
          time: "Afternoon",
          title: "Philosopher’s Path",
          description:
            "Follow the canal under a vault of blossom. Stop for tea and a sweet; watch the current carry petals like small boats.",
        },
        {
          time: "Sunset",
          title: "Kamo River Light",
          description:
            "Sit on the riverbank as the sky turns the color of silk. The city softens. Spring feels briefly endless.",
        },
        {
          time: "Evening",
          title: "Lantern Streets",
          description:
            "Wander Gion or Ponto-cho as lanterns warm the wood facades. Dinner is seasonal, careful, and meant to be remembered.",
        },
      ],
    },
  }
];

export function getDestination(id) {
  return DESTINATIONS.find((item) => item.id === id) || null;
}
