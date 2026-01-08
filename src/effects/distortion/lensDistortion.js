/**
 * Lens distortion effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { samplePixel } from '../utils/transforms.js';

/**
 * Apply lens distortion with vignette and chromatic aberration.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.distortion=0] - Lens curvature (-1 to 1)
 * @param {number} [options.vignette=0.3] - Vignette strength (0-1)
 * @param {number} [options.chromatic=0] - Chromatic aberration (0-1)
 * @returns {ImageData} Distorted image data
 */
export function lensDistortion(imageData, options = {}) {
  assertImageDataLike(imageData);

  const distortion = clamp(options.distortion ?? 0, -1, 1);
  const vignette = clamp(options.vignette ?? 0.3, 0, 1);
  const chromatic = clamp(options.chromatic ?? 0, 1);

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const centerX = 0.5;
  const centerY = 0.5;
  const maxDist = Math.sqrt(0.5 * 0.5 + 0.5 * 0.5);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const ny = y / height;

      // Calculate distance from center
      const dx = nx - centerX;
      const dy = ny - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normalizedDist = dist / maxDist;

      // Apply barrel/pincushion distortion
      const lensDistortion = distortion * Math.pow(normalizedDist, 2);
      const newDist = dist * (1 + lensDistortion);

      // Chromatic aberration offset
      const chromaOffset = chromatic * 0.02 * normalizedDist;

      const scale = newDist / (dist || 1);

      // Sample RGB channels separately for chromatic aberration
      const redX = centerX + dx * scale - chromaOffset;
      const redY = centerY + dy * scale;
      const [r] = samplePixel(src, width, height, redX, redY, 'bilinear');

      const greenX = centerX + dx * scale;
      const greenY = centerY + dy * scale;
      const [g] = samplePixel(src, width, height, greenX, greenY, 'bilinear');

      const blueX = centerX + dx * scale + chromaOffset;
      const blueY = centerY + dy * scale;
      const [b, a] = samplePixel(src, width, height, blueX, blueY, 'bilinear');

      // Apply vignette
      const vignetteFactor = 1 - vignette * Math.pow(normalizedDist, 2);

      const idx = (y * width + x) * 4;
      out[idx] = clamp(r * vignetteFactor, 0, 255);
      out[idx + 1] = clamp(g * vignetteFactor, 0, 255);
      out[idx + 2] = clamp(b * vignetteFactor, 0, 255);
      out[idx + 3] = a;
    }
  }

  return new ImageData(out, width, height);
}
