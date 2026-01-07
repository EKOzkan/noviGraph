/**
 * Jarvis-Judice-Ninke error diffusion dithering.
 * A more complex algorithm that produces smoother results than Floyd–Steinberg.
 */

import { errorDiffusion } from './errorDiffusion.js';
import { bw as defaultBwPalette } from '../palettes/index.js';
import { applyPixelSizeEffect } from '../utils/pixelSize.js';

const JARVIS_JUDICE_NINKE = [
  { dx: 1, dy: 0, weight: 7 / 48 },
  { dx: 2, dy: 0, weight: 5 / 48 },
  { dx: -2, dy: 1, weight: 3 / 48 },
  { dx: -1, dy: 1, weight: 5 / 48 },
  { dx: 0, dy: 1, weight: 7 / 48 },
  { dx: 1, dy: 1, weight: 5 / 48 },
  { dx: 2, dy: 1, weight: 3 / 48 },
  { dx: -2, dy: 2, weight: 1 / 48 },
  { dx: -1, dy: 2, weight: 3 / 48 },
  { dx: 0, dy: 2, weight: 5 / 48 },
  { dx: 1, dy: 2, weight: 3 / 48 },
  { dx: 2, dy: 2, weight: 1 / 48 },
];

/**
 * Jarvis-Judice-Ninke dithering.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {Array<[number,number,number]>} [options.palette] - Output palette (default: black/white)
 * @param {boolean} [options.serpentine=true] - Alternate scan direction per row
 * @param {number} [options.intensity=1] - Error diffusion strength (range: 0-1)
 * @param {number} [options.Size_=1] - Pixel size for downsample-upsample effect (range: 1-32)
 * @returns {ImageData} Processed image data
 */
export function jarvisJudiceNinke(imageData, options = {}) {
  const Size_ = options.Size_ ?? 1;

  const doDither = (img, opts) => {
    return errorDiffusion(img, {
      palette: opts.palette ?? defaultBwPalette,
      serpentine: opts.serpentine ?? true,
      intensity: opts.intensity ?? 1,
      matrix: JARVIS_JUDICE_NINKE,
    });
  };

  return applyPixelSizeEffect(imageData, Size_, doDither, options);
}
