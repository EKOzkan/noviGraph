/**
 * Midtones adjustment effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { luminance } from '../utils/color.js';

/**
 * Adjust midtones.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.adjustment=0] - Midtone adjustment (-1 to 1)
 * @param {number} [options.range=0.5] - Midtone range (0-1)
 * @returns {ImageData} Adjusted image data
 */
export function midtones(imageData, options = {}) {
  assertImageDataLike(imageData);

  const adjustment = clamp(options.adjustment ?? 0, -1, 1);
  const range = clamp(options.range ?? 0.5, 0, 1);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    // Calculate luminance
    const lum = luminance(r, g, b) / 255;

    // Calculate midtone weight (bell curve centered at 0.5)
    const center = 0.5;
    const dist = Math.abs(lum - center);
    const weight = Math.max(0, 1 - (dist / (range / 2)));

    // Apply adjustment to midtones
    const factor = 1 + adjustment * weight;

    dst[i] = clamp(r * factor, 0, 255);
    dst[i + 1] = clamp(g * factor, 0, 255);
    dst[i + 2] = clamp(b * factor, 0, 255);
    dst[i + 3] = src[i + 3];
  }

  return out;
}
