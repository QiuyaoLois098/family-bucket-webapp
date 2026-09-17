export const DESTINATIONS = [
  {
    id: "costa-rica",
    title: "Sunset by the beach in Costa Rica",
    shortTitle: "Costa Rica",
    location: "Pacific Coast",
    invitation: "Golden hour along a wild shoreline.",
    image: "/images/destinations/costa-rica.jpg",
    gallery: [
      "/images/destinations/costa-rica.jpg",
      "/images/memories/water.jpg",
      "/images/memories/forest.jpg",
      "/images/memories/food.jpg",
    ],
    crops: ["center 40%", "center 70%", "left center", "right 30%"],
    palette: {
      wash: "linear-gradient(180deg, #1b3a4a 0%, #c47a3a 55%, #f2c98a 100%)",
      accent: "#e8b56a",
    },
    imagePromptBase:
      "Cinematic premium travel photograph of a Costa Rican Pacific coastline at sunset: palm silhouettes, wet sand reflecting molten sky, turquoise water turning gold, distant rainforest meeting the shore. Editorial Expedia campaign quality, large-format photography, no people, no text, no logos.",
    fallbackItinerary: {
      title: "Your Family Escape to Costa Rica",
      subtitle: "A warm, slow journey along the Pacific coast",
      moments: [
        {
          time: "Morning",
          title: "Rainforest Walk",
          description:
            "Begin under a canopy still wet with night rain. Howler monkeys call from somewhere above, and the path opens onto a hidden lookout over the Pacific.",
        },
        {
          time: "Afternoon",
          title: "Hidden Beach",
          description:
            "A crescent of dark sand that only appears at low tide. Pack a simple lunch, find a palm for shade, and let the afternoon unspool.",
        },
        {
          time: "Sunset",
          title: "Pacific Lookout",
          description:
            "Climb to a bluff as the sky turns copper. The tide draws long mirrors across the sand, and the day becomes a photograph you will keep.",
        },
        {
          time: "Evening",
          title: "Dinner by the Water",
          description:
            "Grilled catch, lime, and something cold as the last light leaves the water. The night is warm enough to linger.",
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
    image: "/images/destinations/catskills.jpg",
    gallery: [
      "/images/destinations/catskills.jpg",
      "/images/memories/forest.jpg",
      "/images/memories/food.jpg",
      "/images/memories/night.jpg",
    ],
    crops: ["center 30%", "center center", "left 40%", "center 80%"],
    palette: {
      wash: "linear-gradient(180deg, #1c2418 0%, #5c3a22 50%, #c4a574 100%)",
      accent: "#c4a574",
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
            "A leaf-strewn path follows cold water through hemlock and birch. Stop where the creek pools — the kind of place that makes everyone walk a little slower.",
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
    id: "kyoto",
    title: "Cherry blossom season in Kyoto",
    shortTitle: "Kyoto",
    location: "Japan",
    invitation: "Petals, temple gardens, and pale spring light.",
    image: "/images/destinations/kyoto.jpg",
    gallery: [
      "/images/destinations/kyoto.jpg",
      "/images/memories/architecture.jpg",
      "/images/memories/water.jpg",
      "/images/memories/food.jpg",
    ],
    crops: ["center 25%", "center 60%", "right center", "left 20%"],
    palette: {
      wash: "linear-gradient(180deg, #4a3040 0%, #d9a7b0 48%, #f7e6d8 100%)",
      accent: "#d9a7b0",
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
            "Arrive before the lanes fill. Petals rest on moss and pond water. Walk slowly — Kyoto rewards the unhurried.",
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
  },
  {
    id: "lake-como",
    title: "A summer afternoon on Lake Como",
    shortTitle: "Lake Como",
    location: "Italy",
    invitation: "Villas, still water, and a long Italian light.",
    image: "/images/destinations/lake-como.jpg",
    gallery: [
      "/images/destinations/lake-como.jpg",
      "/images/memories/water.jpg",
      "/images/memories/architecture.jpg",
      "/images/memories/food.jpg",
    ],
    crops: ["center 45%", "right 30%", "left 50%", "center 75%"],
    palette: {
      wash: "linear-gradient(180deg, #1e3a4c 0%, #6a8aa0 45%, #f0e2c8 100%)",
      accent: "#c9a06c",
    },
    imagePromptBase:
      "Cinematic premium travel photograph of Lake Como in summer: glassy alpine water, terracotta villas, cypress and oleander, a wooden boat dock, mountains fading into haze. Editorial Italian glamour, no people, no text, no logos.",
    fallbackItinerary: {
      title: "Your Family Escape to Lake Como",
      subtitle: "A long, luminous afternoon on still alpine water",
      moments: [
        {
          time: "Morning",
          title: "Villa Gardens",
          description:
            "Wander terraces of lemon trees and statues before the heat arrives. The lake sits below like a sheet of metal.",
        },
        {
          time: "Afternoon",
          title: "Boat Across the Water",
          description:
            "A wooden boat traces the shoreline from village to village. Water slaps the hull. Time becomes the distance between bell towers.",
        },
        {
          time: "Sunset",
          title: "Promenade Gold",
          description:
            "Walk the lungolago as shutters open and the mountains go rose. Order something cold. Stay until the lights come on in the villas.",
        },
        {
          time: "Evening",
          title: "Supper on the Terrace",
          description:
            "Pasta, lake fish, and a bottle that does not need a label to be perfect. The night smells of jasmine and warm stone.",
        },
      ],
    },
  },
  {
    id: "desert",
    title: "Stargazing in the desert",
    shortTitle: "The Desert",
    location: "The American Southwest",
    invitation: "Silence, red earth, and a sky that goes on forever.",
    image: "/images/destinations/desert.jpg",
    gallery: [
      "/images/destinations/desert.jpg",
      "/images/memories/night.jpg",
      "/images/memories/architecture.jpg",
      "/images/memories/food.jpg",
    ],
    crops: ["center 20%", "center 70%", "left 40%", "right 25%"],
    palette: {
      wash: "linear-gradient(180deg, #0b1020 0%, #7a3d2a 48%, #e8c9a0 100%)",
      accent: "#e0a35a",
    },
    imagePromptBase:
      "Cinematic premium travel photograph of a vast desert at blue hour into night: sculpted dunes or red-rock mesas, a clear Milky Way, a simple canvas tent or low fireglow far in the distance, immense sky. No prominent people, no text, no logos. Editorial, awe-filled.",
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
    id: "alps",
    title: "A winter escape in the Alps",
    shortTitle: "The Alps",
    location: "Europe",
    invitation: "Snow light, timber rooms, and mountain quiet.",
    image: "/images/destinations/alps.jpg",
    gallery: [
      "/images/destinations/alps.jpg",
      "/images/memories/snow.jpg",
      "/images/memories/architecture.jpg",
      "/images/memories/food.jpg",
    ],
    crops: ["center 30%", "center 60%", "left 20%", "right 40%"],
    palette: {
      wash: "linear-gradient(180deg, #1a2838 0%, #6b7c8c 50%, #f2efe9 100%)",
      accent: "#c5d4e0",
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
];

export function getDestination(id) {
  return DESTINATIONS.find((item) => item.id === id) || null;
}
