/**
 * Device UI defaults for production URLs.
 * Dev compare + pink guideline: /vrbo-*-dev, /expedia-*-dev.
 */
export const VRBO_UI = {
  /** Magenta height guideline on prod routes (dev routes force this on). */
  heightGuide: false,

  /**
   * Side-by-side live + reference on prod /vrbo-left|/vrbo-right|/vrbo-ip*.
   * Dev routes pass compareLayout={true} explicitly.
   */
  compareLayout: false,
};

export const DEV_COMPARE_PATHS = new Set([
  "/vrbo-left-dev",
  "/vrbo-right-dev",
  "/vrbo-ip1-dev",
  "/expedia-left-dev",
  "/expedia-right-dev",
]);

/** @deprecated use isDevComparePath */
export const VRBO_DEV_COMPARE_PATHS = DEV_COMPARE_PATHS;

export function isDevComparePath(pathname) {
  return DEV_COMPARE_PATHS.has(pathname);
}

/** @deprecated use isDevComparePath */
export function isVrboDevComparePath(pathname) {
  return isDevComparePath(pathname);
}
