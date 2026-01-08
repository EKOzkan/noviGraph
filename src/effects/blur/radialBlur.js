/**
 * Radial/Zoom blur effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { samplePixel } from '../utils/transforms.js';

/**
 * Apply radial/zoom blur.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.centerX=0.5] - Blur center X (normalized 0-1)
 * @param {number} [options.centerY=0.5] - Blur center Y (normalized 0-1)
 * @param {number} [options.amount=0.2] - Blur strength (0-1)
 * @param {number} [options.samples=8] - Quality samples (4-32)
 * @returns {ImageData} Blurred image data
 */
export function radialBlur(imageData, options = {}) {
  assertImageDataLike(imageData);

  const centerX = clamp(options.centerX ?? 0.5, 0, 1);
  const centerY = clamp(options.centerY ?? 0.5, 0, 1);
  const amount = clamp(options.amount ?? 0.2, 0, 1);
  const samples = Math.round(clamp(options.samples ?? 8, 4, 32));

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const maxOffset = amount * 0.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const ny = y / height;

      // Calculate direction from center
      const dx = nx - centerX;
      const dy = ny - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 0, g = 0, b = 0, a = 0;

      // Sample along radial direction
      for (let s = 0; s < samples; s++) {
        const t = s / (samples - 1);
        const offset = t * maxOffset * dist;

        const sampleX = nx + dx * offset;
        const sampleY = ny + dy * offset;

        const [sr, sg, sb, sa] = samplePixel(src, width, height, sampleX, sampleY, 'bilinear');
        r += sr;
        g += sg;
        b += sb;
        a += sa;
      }

      const idx = (y * width + x) * 4;
      out[idx] = r / samples;
      out[idx + 1] = g / samples;
      out[idx + 2] = b / samples;
      out[idx + 3] = a / samples;
    }
  }

  return new ImageData(out, width, height);
}
