/**
 * Stucki error diffusion dithering.
 * Similar to Jarvis-Judice-Ninke but slightly faster and often cleaner.
 */

import { errorDiffusion } from './errorDiffusion.js';
import { bw as defaultBwPalette } from '../palettes/index.js';
import { applyPixelSizeEffect } from '../utils/pixelSize.js';

const STUCKI = [
  { dx: 1, dy: 0, weight: 8 / 42 },
  { dx: 2, dy: 0, weight: 4 / 42 },
  { dx: -2, dy: 1, weight: 2 / 42 },
  { dx: -1, dy: 1, weight: 4 / 42 },
  { dx: 0, dy: 1, weight: 8 / 42 },
  { dx: 1, dy: 1, weight: 4 / 42 },
  { dx: 2, dy: 1, weight: 2 / 42 },
  { dx: -2, dy: 2, weight: 1 / 42 },
  { dx: -1, dy: 2, weight: 2 / 42 },
  { dx: 0, dy: 2, weight: 4 / 42 },
  { dx: 1, dy: 2, weight: 2 / 42 },
  { dx: 2, dy: 2, weight: 1 / 42 },
];

/**
 * Stucki dithering.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {Array<[number,number,number]>} [options.palette] - Output palette (default: black/white)
 * @param {boolean} [options.serpentine=true] - Alternate scan direction per row
 * @param {number} [options.intensity=1] - Error diffusion strength (range: 0-1)
 * @param {number} [options.Size_=1] - Pixel size for downsample-upsample effect (range: 1-32)
 * @returns {ImageData} Processed image data
 */
export function stucki(imageData, options = {}) {
  const Size_ = options.Size_ ?? 1;

  const doDither = (img, opts) => {
    return errorDiffusion(img, {
      palette: opts.palette ?? defaultBwPalette,
      serpentine: opts.serpentine ?? true,
      intensity: opts.intensity ?? 1,
      matrix: STUCKI,
    });
  };

  return applyPixelSizeEffect(imageData, Size_, doDither, options);
}
