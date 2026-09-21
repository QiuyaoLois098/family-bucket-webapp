export const PROJECTS = [
  {
    id: "family-bucket-list",
    title: "The Family Bucket List",
    subtitle: "Two-screen travel installation",
    path: "/",
    match: (pathname) =>
      pathname === "/" || pathname.startsWith("/control") || pathname.startsWith("/display"),
  },
  {
    id: "nyc-hotel-map",
    title: "NYC Hotel Map",
    subtitle: "Backlit Manhattan · five hotels",
    path: "/map",
    match: (pathname) => pathname.startsWith("/map"),
  },
  {
    id: "vrbo-group-trip",
    title: "Vrbo Group Trip",
    subtitle: "Five-screen group booking flow",
    path: "/vrbo",
    match: (pathname) => pathname.startsWith("/vrbo"),
  },
];

export function projectFromPath(pathname) {
  return PROJECTS.find((project) => project.match(pathname)) || PROJECTS[0];
}

export const NYC_HOTELS = [
  { id: 1, name: "Hotel 1", neighborhood: "Midtown West", reason: "Late-night streets around the event", lat: 40.7642, lng: -73.9828, label: "left" },
  { id: 2, name: "Hotel 2", neighborhood: "Upper East Side", reason: "Quieter nights above the park", lat: 40.7738, lng: -73.9596, label: "right" },
  { id: 3, name: "Hotel 3", neighborhood: "Midtown East", reason: "A short walk to the event site", lat: 40.7614, lng: -73.9678, label: "right" },
  { id: 4, name: "Hotel 4", neighborhood: "Flatiron / Chelsea", reason: "Coffee on every corner", lat: 40.7426, lng: -73.9894, label: "right" },
  { id: 5, name: "Hotel 5", neighborhood: "Hudson Yards", reason: "Best view of the sunset over the river", lat: 40.7478, lng: -74.0048, label: "left" },
];

export const HOTEL_CARDS = [
  { id: "sunset", src: "/images/hotel-cards/insert-card.png", label: "Best view of the sunset" },
  { id: "coffee", src: "/images/hotel-cards/insert-card.png", label: "Near the best cup of coffee" },
  { id: "night", src: "/images/hotel-cards/insert-card.png", label: "Late night hang" },
];

export const NYC_RECOMMENDATIONS = [5, 4, 1, 3];
