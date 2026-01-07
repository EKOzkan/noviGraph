/**
 * Posterize effect (reduce color levels).
 */

import { assertImageDataLike, clampByte, createImageData } from '../utils/imageData.js';

/**
 * Posterize (quantize) the image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.levels=6] - Quantization levels per channel (range: 2-64)
 * @returns {ImageData} Processed image data
 */
export function posterize(imageData, options = {}) {
  assertImageDataLike(imageData);

  const levels = Math.max(2, Math.min(64, (options.levels ?? 6) | 0));
  const step = 255 / (levels - 1);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    dst[i] = clampByte(Math.round(src[i] / step) * step);
    dst[i + 1] = clampByte(Math.round(src[i + 1] / step) * step);
    dst[i + 2] = clampByte(Math.round(src[i + 2] / step) * step);
    dst[i + 3] = src[i + 3];
  }

  return out;
}
