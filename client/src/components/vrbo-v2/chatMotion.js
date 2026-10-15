/**
 * First socket sync seeds ids (no animation). Later new ids get one CSS enter.
 * Does NOT animate position of existing bubbles — that was the jank source.
 */
export function createEnterTracker() {
  let seeded = false;
  const seen = new Set();

  return {
    /** Call once per render before mapping — seeds only on the first call. */
    prepare(ids) {
      if (seeded) return;
      ids.forEach((id) => seen.add(id));
      seeded = true;
    },
    shouldEnter(id) {
      if (!seeded) {
        seen.add(id);
        return false;
      }
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    },
  };
}
