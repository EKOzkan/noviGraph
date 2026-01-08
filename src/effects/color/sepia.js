/**
 * Sepia tone effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { luminance } from '../utils/color.js';

/**
 * Apply sepia tone to image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.intensity=1] - Sepia intensity (0-1)
 * @param {number} [options.tone=0.5] - Tone warmth/coolness (0-1)
 * @returns {ImageData} Processed image data
 */
export function sepia(imageData, options = {}) {
  assertImageDataLike(imageData);

  const intensity = clamp(options.intensity ?? 1, 0, 1);
  const tone = clamp(options.tone ?? 0.5, 0, 1);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  // Traditional sepia toning matrix
  const rBase = 1.191;
  const gBase = 0.953;
  const bBase = 0.688;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    // Convert to grayscale first
    const gray = luminance(r, g, b);

    // Apply sepia toning
    let sepiaR = gray * rBase;
    let sepiaG = gray * gBase;
    let sepiaB = gray * bBase;

    // Adjust tone (warmth vs coolness)
    if (tone < 0.5) {
      // Cooler (more cyan/blue)
      const t = (0.5 - tone) * 2;
      sepiaR *= (1 - t * 0.3);
      sepiaG *= (1 - t * 0.1);
      sepiaB += t * 30;
    } else {
      // Warmer (more red/yellow)
      const t = (tone - 0.5) * 2;
      sepiaR += t * 30;
      sepiaG += t * 10;
      sepiaB *= (1 - t * 0.2);
    }

    // Blend with original based on intensity
    dst[i] = clamp(r + (sepiaR - r) * intensity);
    dst[i + 1] = clamp(g + (sepiaG - g) * intensity);
    dst[i + 2] = clamp(b + (sepiaB - b) * intensity);
    dst[i + 3] = src[i + 3];
  }

  return out;
}
