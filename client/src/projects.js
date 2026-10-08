export const PROJECTS = [
  {
    id: "family-bucket-list",
    title: "The Family Bucket List",
    subtitle: "Two-screen travel installation",
    path: "/",
    match: (pathname) =>
      pathname === "/" ||
      pathname.startsWith("/control") ||
      pathname.startsWith("/display") ||
      pathname === "/expedia-left" ||
      pathname === "/expedia-right" ||
      pathname === "/expedia-ba",
  },
  {
    id: "vrbo-group-trip-v2",
    title: "Vrbo Group Trip v2",
    subtitle: "Five-screen group booking flow · v2",
    path: "/vrbo-v2",
    match: (pathname) =>
      pathname.startsWith("/vrbo-v2") ||
      pathname === "/vrbo-left" ||
      pathname === "/vrbo-right" ||
      pathname === "/vrbo-ip1" ||
      pathname === "/vrbo-ip2" ||
      pathname === "/vrbo-ip3" ||
      pathname === "/vrbo-ba",
  },
];

export function projectFromPath(pathname) {
  return PROJECTS.find((project) => project.match(pathname)) || PROJECTS[0];
}
