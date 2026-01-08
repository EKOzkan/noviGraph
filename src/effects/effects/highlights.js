/**
 * Highlights adjustment effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { luminance } from '../utils/color.js';

/**
 * Adjust highlights.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.adjustment=0] - Highlight adjustment (-1 to 1)
 * @param {number} [options.threshold=128] - Highlight threshold (0-255)
 * @param {number} [options.softness=20] - Transition softness (0-100)
 * @returns {ImageData} Adjusted image data
 */
export function highlights(imageData, options = {}) {
  assertImageDataLike(imageData);

  const adjustment = clamp(options.adjustment ?? 0, -1, 1);
  const threshold = clamp(options.threshold ?? 128, 0, 255);
  const softness = clamp(options.softness ?? 20, 0, 100);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    // Calculate luminance
    const lum = luminance(r, g, b);

    // Calculate highlight weight (smooth step function)
    const lowerBound = threshold - softness;
    const upperBound = threshold + softness;

    let weight;
    if (lum <= lowerBound) {
      weight = 0;
    } else if (lum >= upperBound) {
      weight = 1;
    } else {
      // Smooth step
      const t = (lum - lowerBound) / (upperBound - lowerBound);
      weight = t * t * (3 - 2 * t);
    }

    // Apply adjustment to highlights
    const factor = 1 + adjustment * weight;

    dst[i] = clamp(r * factor, 0, 255);
    dst[i + 1] = clamp(g * factor, 0, 255);
    dst[i + 2] = clamp(b * factor, 0, 255);
    dst[i + 3] = src[i + 3];
  }

  return out;
}
