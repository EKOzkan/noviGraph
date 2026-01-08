/**
 * Vignette effect.
 */

import { assertImageDataLike, createImageData, clampByte, clamp } from '../utils/imageData.js';

/**
 * Apply vignette.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.darkness=0.5] - Vignette darkness (0-1)
 * @param {number} [options.radius=0.8] - Vignette size (0-1)
 * @param {number} [options.roundness=1] - Shape (1=circle, >1=rectangle)
 * @returns {ImageData} Vignetted image data
 */
export function vignette(imageData, options = {}) {
  assertImageDataLike(imageData);

  const darkness = clamp(options.darkness ?? 0.5, 0, 1);
  const radius = clamp(options.radius ?? 0.8, 0, 1);
  const roundness = clamp(options.roundness ?? 1, 0, 2);

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistX = centerX * (1 / radius);
  const maxDistY = centerY * (1 / radius);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (x - centerX) / maxDistX;
      const dy = (y - centerY) / maxDistY;

      // Calculate distance based on roundness
      const dist = Math.sqrt(Math.pow(Math.abs(dx), roundness * 2) + Math.pow(Math.abs(dy), roundness * 2));

      // Calculate vignette factor (1 at center, decreases outward)
      let vignetteFactor;
      if (dist >= 1) {
        vignetteFactor = 1 - darkness;
      } else {
        // Smooth falloff using cosine
        const t = dist * (Math.PI / 2);
        vignetteFactor = 1 - darkness * (1 - Math.cos(t));
      }

      const idx = (y * width + x) * 4;
      out[idx] = clampByte(src[idx] * vignetteFactor);
      out[idx + 1] = clampByte(src[idx + 1] * vignetteFactor);
      out[idx + 2] = clampByte(src[idx + 2] * vignetteFactor);
      out[idx + 3] = src[idx + 3];
    }
  }

  return new ImageData(out, width, height);
}
