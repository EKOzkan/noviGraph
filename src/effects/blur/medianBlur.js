/**
 * Median blur effect (good for noise reduction).
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';

/**
 * Apply median blur.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.radius=2] - Kernel radius (1-8)
 * @returns {ImageData} Blurred image data
 */
export function medianBlur(imageData, options = {}) {
  assertImageDataLike(imageData);

  const radius = Math.round(clamp(options.radius ?? 2, 1, 8));
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const diameter = radius * 2 + 1;
  const windowSize = diameter * diameter;

  // Pre-allocate arrays for median calculation
  const rValues = new Float32Array(windowSize);
  const gValues = new Float32Array(windowSize);
  const bValues = new Float32Array(windowSize);
  const aValues = new Float32Array(windowSize);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let idx = 0;

      // Collect pixels in window
      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const pi = (py * width + px) * 4;

          rValues[idx] = src[pi];
          gValues[idx] = src[pi + 1];
          bValues[idx] = src[pi + 2];
          aValues[idx] = src[pi + 3];
          idx++;
        }
      }

      // Find median values
      const r = findMedian(rValues);
      const g = findMedian(gValues);
      const b = findMedian(bValues);
      const a = findMedian(aValues);

      const i = (y * width + x) * 4;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = a;
    }
  }

  return new ImageData(out, width, height);
}

/**
 * Find median value in sorted array.
 * Uses quickselect for efficiency.
 */
function findMedian(arr) {
  const n = arr.length;
  const mid = Math.floor(n / 2);

  // Simple selection sort for small arrays
  const copy = new Float32Array(arr);
  for (let i = 0; i <= mid; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (copy[j] < copy[minIdx]) {
        minIdx = j;
      }
    }
    [copy[i], copy[minIdx]] = [copy[minIdx], copy[i]];
  }

  return copy[mid];
}
