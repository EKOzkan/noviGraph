/**
 * A small set of built-in palettes (RGB triplets).
 */

/** @type {Array<[number,number,number]>} */
export const bw = [
  [0, 0, 0],
  [255, 255, 255],
];

/** @type {Array<[number,number,number]>} */
export const grayscale4 = [
  [0, 0, 0],
  [85, 85, 85],
  [170, 170, 170],
  [255, 255, 255],
];

/** @type {Array<[number,number,number]>} */
export const gameboy = [
  [15, 56, 15],
  [48, 98, 48],
  [139, 172, 15],
  [155, 188, 15],
];

/** @type {Array<[number,number,number]>} */
export const cga = [
  [0, 0, 0],
  [0, 170, 170],
  [170, 0, 170],
  [170, 170, 170],
];

export const palettes = {
  bw,
  grayscale4,
  gameboy,
  cga,
};
