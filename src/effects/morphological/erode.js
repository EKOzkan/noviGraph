/**
 * Erode effect (minimum filter).
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';

/**
 * Apply erosion.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.radius=1] - Erosion radius (1-10)
 * @param {number} [options.iterations=1] - Number of iterations (1-4)
 * @returns {ImageData} Eroded image data
 */
export function erode(imageData, options = {}) {
  assertImageDataLike(imageData);

  const radius = Math.round(clamp(options.radius ?? 1, 1, 10));
  const iterations = Math.round(clamp(options.iterations ?? 1, 1, 4));

  let result = imageData;

  for (let iter = 0; iter < iterations; iter++) {
    result = erodeOnce(result, radius);
  }

  return result;
}

function erodeOnce(imageData, radius) {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minR = 255, minG = 255, minB = 255, minA = 255;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const pi = (py * width + px) * 4;

          minR = Math.min(minR, src[pi]);
          minG = Math.min(minG, src[pi + 1]);
          minB = Math.min(minB, src[pi + 2]);
          minA = Math.min(minA, src[pi + 3]);
        }
      }

      const i = (y * width + x) * 4;
      out[i] = minR;
      out[i + 1] = minG;
      out[i + 2] = minB;
      out[i + 3] = minA;
    }
  }

  return new ImageData(out, width, height);
}
