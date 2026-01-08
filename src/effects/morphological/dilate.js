/**
 * Dilate effect (maximum filter).
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';

/**
 * Apply dilation.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.radius=1] - Dilation radius (1-10)
 * @param {number} [options.iterations=1] - Number of iterations (1-4)
 * @returns {ImageData} Dilated image data
 */
export function dilate(imageData, options = {}) {
  assertImageDataLike(imageData);

  const radius = Math.round(clamp(options.radius ?? 1, 1, 10));
  const iterations = Math.round(clamp(options.iterations ?? 1, 1, 4));

  let result = imageData;

  for (let iter = 0; iter < iterations; iter++) {
    result = dilateOnce(result, radius);
  }

  return result;
}

function dilateOnce(imageData, radius) {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxR = 0, maxG = 0, maxB = 0, maxA = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const pi = (py * width + px) * 4;

          maxR = Math.max(maxR, src[pi]);
          maxG = Math.max(maxG, src[pi + 1]);
          maxB = Math.max(maxB, src[pi + 2]);
          maxA = Math.max(maxA, src[pi + 3]);
        }
      }

      const i = (y * width + x) * 4;
      out[i] = maxR;
      out[i + 1] = maxG;
      out[i + 2] = maxB;
      out[i + 3] = maxA;
    }
  }

  return new ImageData(out, width, height);
}
