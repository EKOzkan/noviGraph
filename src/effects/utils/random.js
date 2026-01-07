/**
 * Small deterministic RNG helpers.
 */

/**
 * @param {number} seed
 */
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param {number|undefined|null} seed
 * @returns {() => number} random function returning [0,1)
 */
export function createRng(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) return mulberry32(seed);
  return Math.random;
}
