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
];

export function projectFromPath(pathname) {
  return PROJECTS.find((project) => project.match(pathname)) || PROJECTS[0];
}

export const NYC_HOTELS = [
  { id: 1, name: "Hotel 1", lat: 40.7642, lng: -73.9828, label: "left" },
  { id: 2, name: "Hotel 2", lat: 40.7738, lng: -73.9596, label: "right" },
  { id: 3, name: "Hotel 3", lat: 40.7614, lng: -73.9678, label: "right" },
  { id: 4, name: "Hotel 4", lat: 40.7426, lng: -73.9894, label: "right" },
  { id: 5, name: "Hotel 5", lat: 40.7478, lng: -74.0048, label: "left" },
];
