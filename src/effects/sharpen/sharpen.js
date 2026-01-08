/**
 * Sharpen effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { applyConvolution, sharpenKernel } from '../utils/convolution.js';

/**
 * Apply sharpening.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=1] - Sharpening strength (0-2)
 * @param {number} [options.radius=1] - Sharpening radius (0.5-10)
 * @returns {ImageData} Sharpened image data
 */
export function sharpen(imageData, options = {}) {
  assertImageDataLike(imageData);

  const amount = clamp(options.amount ?? 1, 0, 2);
  const radius = clamp(options.radius ?? 1, 0.5, 10);

  // Create kernel based on amount
  const center = 1 + 4 * amount;
  const surround = -amount;

  const kernel = [
    [surround, surround, surround],
    [surround, center, surround],
    [surround, surround, surround],
  ];

  return applyConvolution(imageData, kernel, { preserveAlpha: true });
}
