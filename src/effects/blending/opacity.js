/**
 * Opacity control effect.
 */

import { assertImageDataLike, createImageData, clampByte } from '../utils/imageData.js';

/**
 * Adjust opacity.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.opacity=1] - Opacity (0-1)
 * @param {boolean} [options.preserveAlpha=false] - Preserve original alpha values
 * @returns {ImageData} Processed image data
 */
export function opacity(imageData, options = {}) {
  assertImageDataLike(imageData);

  const opacityValue = Math.max(0, Math.min(1, options.opacity ?? 1));
  const preserveAlpha = options.preserveAlpha ?? false;

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  if (preserveAlpha) {
    // Multiply alpha channel while keeping original alpha as base
    for (let i = 0; i < src.length; i += 4) {
      dst[i] = src[i];
      dst[i + 1] = src[i + 1];
      dst[i + 2] = src[i + 2];
      dst[i + 3] = clampByte(src[i + 3] * opacityValue);
    }
  } else {
    // Replace alpha channel
    const alpha = clampByte(opacityValue * 255);
    for (let i = 0; i < src.length; i += 4) {
      dst[i] = src[i];
      dst[i + 1] = src[i + 1];
      dst[i + 2] = src[i + 2];
      dst[i + 3] = alpha;
    }
  }

  return out;
}
