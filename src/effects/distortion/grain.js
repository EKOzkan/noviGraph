/**
 * Film grain / noise.
 */

import { assertImageDataLike, clampByte, createImageData, clamp } from '../utils/imageData.js';
import { createRng } from '../utils/random.js';

/**
 * Add grain/noise to an image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=0.2] - Noise amount (range: 0-1)
 * @param {boolean} [options.monochrome=true] - If true, add the same noise to RGB
 * @param {number|null} [options.seed=null] - Seed for deterministic noise (optional)
 * @returns {ImageData} Processed image data
 */
export function grain(imageData, options = {}) {
  assertImageDataLike(imageData);

  const amount = clamp(options.amount ?? 0.2, 0, 1);
  const monochrome = options.monochrome ?? true;
  const rng = createRng(options.seed ?? null);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  const amp = amount * 255;

  for (let i = 0; i < src.length; i += 4) {
    if (monochrome) {
      const n = (rng() * 2 - 1) * amp;
      dst[i] = clampByte(src[i] + n);
      dst[i + 1] = clampByte(src[i + 1] + n);
      dst[i + 2] = clampByte(src[i + 2] + n);
    } else {
      dst[i] = clampByte(src[i] + (rng() * 2 - 1) * amp);
      dst[i + 1] = clampByte(src[i + 1] + (rng() * 2 - 1) * amp);
      dst[i + 2] = clampByte(src[i + 2] + (rng() * 2 - 1) * amp);
    }
    dst[i + 3] = src[i + 3];
  }

  return out;
}
