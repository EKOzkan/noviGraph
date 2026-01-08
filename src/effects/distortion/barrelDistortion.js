/**
 * Barrel/Pincushion distortion effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { samplePixel } from '../utils/transforms.js';

/**
 * Apply barrel/pincushion distortion.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=0.3] - Distortion strength (-1 to 1, negative=pincushion)
 * @param {number} [options.centerX=0.5] - Center X (0-1)
 * @param {number} [options.centerY=0.5] - Center Y (0-1)
 * @returns {ImageData} Distorted image data
 */
export function barrelDistortion(imageData, options = {}) {
  assertImageDataLike(imageData);

  const amount = clamp(options.amount ?? 0.3, -1, 1);
  const centerX = clamp(options.centerX ?? 0.5, 0, 1);
  const centerY = clamp(options.centerY ?? 0.5, 0, 1);

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const maxDist = Math.sqrt(Math.pow(Math.max(centerX, 1 - centerX), 2) + Math.pow(Math.max(centerY, 1 - centerY), 2));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const ny = y / height;

      // Calculate distance from center
      const dx = nx - centerX;
      const dy = ny - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normalizedDist = dist / maxDist;

      // Apply distortion
      const distortion = amount * Math.pow(normalizedDist, 2);
      const newDist = dist * (1 + distortion);

      // Calculate new position
      const scale = newDist / (dist || 1);
      const srcX = centerX + dx * scale;
      const srcY = centerY + dy * scale;

      const [r, g, b, a] = samplePixel(src, width, height, srcX, srcY, 'bilinear');

      const idx = (y * width + x) * 4;
      out[idx] = r;
      out[idx + 1] = g;
      out[idx + 2] = b;
      out[idx + 3] = a;
    }
  }

  return new ImageData(out, width, height);
}
