/**
 * Floyd–Steinberg error diffusion dithering.
 */

import { errorDiffusion } from './errorDiffusion.js';
import { bw as defaultBwPalette } from '../palettes/index.js';

const FLOYD_STEINBERG = [
  { dx: 1, dy: 0, weight: 7 / 16 },
  { dx: -1, dy: 1, weight: 3 / 16 },
  { dx: 0, dy: 1, weight: 5 / 16 },
  { dx: 1, dy: 1, weight: 1 / 16 },
];

/**
 * Floyd–Steinberg dithering.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {Array<[number,number,number]>} [options.palette] - Output palette (default: black/white)
 * @param {boolean} [options.serpentine=true] - Alternate scan direction per row
 * @param {number} [options.intensity=1] - Error diffusion strength (range: 0-1)
 * @returns {ImageData} Processed image data
 */
export function floydSteinberg(imageData, options = {}) {
  return errorDiffusion(imageData, {
    palette: options.palette ?? defaultBwPalette,
    serpentine: options.serpentine ?? true,
    intensity: options.intensity ?? 1,
    matrix: FLOYD_STEINBERG,
  });
}
