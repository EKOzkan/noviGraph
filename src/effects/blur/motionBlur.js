/**
 * Motion blur effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { samplePixel } from '../utils/transforms.js';

/**
 * Apply motion blur.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.angle=0] - Motion direction in degrees (0-360)
 * @param {number} [options.distance=10] - Blur distance in pixels (1-100)
 * @param {number} [options.quality=8] - Number of samples (4-32)
 * @returns {ImageData} Blurred image data
 */
export function motionBlur(imageData, options = {}) {
  assertImageDataLike(imageData);

  const angle = (options.angle ?? 0) % 360;
  const distance = clamp(options.distance ?? 10, 1, 100);
  const quality = Math.round(clamp(options.quality ?? 8, 4, 32));

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  // Convert angle to radians and direction vector
  const rad = angle * (Math.PI / 180);
  const dx = Math.cos(rad) * distance / width;
  const dy = Math.sin(rad) * distance / height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;

      // Sample along the motion direction
      for (let s = 0; s < quality; s++) {
        const t = s / (quality - 1);
        const nx = x / width + dx * t;
        const ny = y / height + dy * t;

        const [sr, sg, sb, sa] = samplePixel(src, width, height, nx, ny, 'bilinear');
        r += sr;
        g += sg;
        b += sb;
        a += sa;
      }

      const idx = (y * width + x) * 4;
      out[idx] = r / quality;
      out[idx + 1] = g / quality;
      out[idx + 2] = b / quality;
      out[idx + 3] = a / quality;
    }
  }

  return new ImageData(out, width, height);
}
