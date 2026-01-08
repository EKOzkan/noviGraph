/**
 * Negative/Invert effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';

/**
 * Invert image colors (negative).
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.intensity=1] - Invert intensity (0-1)
 * @returns {ImageData} Inverted image data
 */
export function negative(imageData, options = {}) {
  assertImageDataLike(imageData);

  const intensity = clamp(options.intensity ?? 1, 0, 1);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    dst[i] = src[i] + (255 - 2 * src[i]) * intensity;
    dst[i + 1] = src[i + 1] + (255 - 2 * src[i + 1]) * intensity;
    dst[i + 2] = src[i + 2] + (255 - 2 * src[i + 2]) * intensity;
    dst[i + 3] = src[i + 3];
  }

  return out;
}
