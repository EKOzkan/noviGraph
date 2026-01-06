/**
 * Bloom/glow effect.
 */

import { assertImageDataLike, clampByte, createImageData, clamp } from '../utils/imageData.js';
import { luminance } from '../utils/color.js';
import { boxBlurRGBA } from '../utils/blur.js';

/**
 * Bloom effect.
 *
 * Extracts bright areas, blurs them, and adds them back onto the image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.threshold=200] - Brightness threshold (range: 0-255)
 * @param {number} [options.radius=8] - Blur radius in pixels (range: 0-64)
 * @param {number} [options.intensity=0.8] - Bloom intensity (range: 0-3)
 * @returns {ImageData} Processed image data
 */
export function bloom(imageData, options = {}) {
  assertImageDataLike(imageData);

  const threshold = clamp(options.threshold ?? 200, 0, 255);
  const radius = Math.max(0, Math.min(64, (options.radius ?? 8) | 0));
  const intensity = clamp(options.intensity ?? 0.8, 0, 3);

  const { width, height } = imageData;
  const src = imageData.data;

  const bright = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const l = luminance(src[i], src[i + 1], src[i + 2]);
    if (l >= threshold) {
      bright[i] = src[i];
      bright[i + 1] = src[i + 1];
      bright[i + 2] = src[i + 2];
      bright[i + 3] = src[i + 3];
    } else {
      bright[i + 3] = 0;
    }
  }

  const blurred = radius > 0 ? boxBlurRGBA(bright, width, height, radius) : bright;

  const out = createImageData(width, height);
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    dst[i] = clampByte(src[i] + blurred[i] * intensity);
    dst[i + 1] = clampByte(src[i + 1] + blurred[i + 1] * intensity);
    dst[i + 2] = clampByte(src[i + 2] + blurred[i + 2] * intensity);
    dst[i + 3] = src[i + 3];
  }

  return out;
}
