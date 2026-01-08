/**
 * Laplacian edge detection effect.
 */

import { assertImageDataLike, createImageData, clampByte } from '../utils/imageData.js';
import { applyConvolution, laplacianKernel } from '../utils/convolution.js';

/**
 * Apply Laplacian edge detection.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.threshold=0] - Edge threshold (0-255)
 * @param {boolean} [options.invert=false] - Invert result
 * @returns {ImageData} Edge-detected image data
 */
export function laplacianEdge(imageData, options = {}) {
  assertImageDataLike(imageData);

  const threshold = Math.round(options.threshold ?? 0);
  const invert = options.invert ?? false;

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const kernel = laplacianKernel;
  const kHalf = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let edge = 0;

      // Apply Laplacian kernel
      for (let ky = -kHalf; ky <= kHalf; ky++) {
        for (let kx = -kHalf; kx <= kHalf; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const pi = (py * width + px) * 4;

          // Use luminance
          const value = src[pi] * 0.299 + src[pi + 1] * 0.587 + src[pi + 2] * 0.114;
          edge += value * kernel[ky + kHalf][kx + kHalf];
        }
      }

      edge = Math.abs(edge);

      // Apply threshold
      if (edge < threshold) {
        edge = 0;
      }

      // Invert if requested
      if (invert) {
        edge = 255 - edge;
      }

      const idx = (y * width + x) * 4;
      out[idx] = clampByte(edge);
      out[idx + 1] = clampByte(edge);
      out[idx + 2] = clampByte(edge);
      out[idx + 3] = src[idx + 3];
    }
  }

  return new ImageData(out, width, height);
}
