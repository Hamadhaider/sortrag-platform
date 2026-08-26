/**
 * Seeded pseudo-random number generator (mulberry32).
 *
 * Given the same numeric seed, this always produces the same sequence of
 * floats in [0, 1). This is what makes "seed: 12345, size: 1000,
 * distribution: random" reproducible across runs, machines, and time —
 * required by section 14 of the research spec.
 *
 * Not cryptographically secure. Not intended to be. Only determinism matters
 * here, not unpredictability.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Parses a user-entered seed (string or number) into a stable 32-bit integer seed. */
export function normalizeSeed(seed: string | number): number {
  if (typeof seed === "number") return Math.floor(seed) >>> 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}
