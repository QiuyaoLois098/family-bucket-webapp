/**
 * Vrbo UI defaults for production device URLs.
 * Dev compare + pink guideline: use /vrbo-left-dev and /vrbo-right-dev.
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

export const VRBO_DEV_COMPARE_PATHS = new Set([
  "/vrbo-left-dev",
  "/vrbo-right-dev",
]);

export function isVrboDevComparePath(pathname) {
  return VRBO_DEV_COMPARE_PATHS.has(pathname);
}
