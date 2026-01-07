/**
 * Feather (blur) the alpha channel of an image.
 */

import { assertImageDataLike, createImageData } from '../utils/imageData.js';
import { boxBlurAlpha } from '../utils/blur.js';

/**
 * Feather the alpha channel of an image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.radius=8] - Blur radius (range: 0-64)
 * @param {number} [options.iterations=1] - Number of blur iterations (range: 1-4)
 * @returns {ImageData} Processed image data
 */
export function featherMask(imageData, options = {}) {
  assertImageDataLike(imageData);

  const radius = Math.max(0, Math.min(64, (options.radius ?? 8) | 0));
  const iterations = Math.max(1, Math.min(4, (options.iterations ?? 1) | 0));

  const { width, height } = imageData;
  const src = imageData.data;

  const alpha = new Uint8ClampedArray(width * height);
  for (let p = 0, i = 0; i < src.length; i += 4, p++) {
    alpha[p] = src[i + 3];
  }

  let blurred = alpha;
  for (let it = 0; it < iterations; it++) {
    blurred = boxBlurAlpha(blurred, width, height, radius);
  }

  const out = createImageData(width, height);
  const dst = out.data;
  dst.set(src);

  for (let p = 0, i = 0; i < dst.length; i += 4, p++) {
    dst[i + 3] = blurred[p];
  }

  return out;
}
