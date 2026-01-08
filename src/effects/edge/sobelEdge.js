/**
 * Sobel edge detection effect.
 */

import { assertImageDataLike, createImageData, clampByte } from '../utils/imageData.js';
import { applyConvolution, sobelKernelX, sobelKernelY } from '../utils/convolution.js';

/**
 * Apply Sobel edge detection.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {boolean} [options.horizontal=true] - Include horizontal edges
 * @param {boolean} [options.vertical=true] - Include vertical edges
 * @param {boolean} [options.magnitude=true] - Show edge magnitude
 * @param {number} [options.threshold=0] - Edge threshold (0-255)
 * @returns {ImageData} Edge-detected image data
 */
export function sobelEdge(imageData, options = {}) {
  assertImageDataLike(imageData);

  const horizontal = options.horizontal !== false;
  const vertical = options.vertical !== false;
  const magnitude = options.magnitude !== false;
  const threshold = Math.round(options.threshold ?? 0);

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const kHalf = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let gx = 0, gy = 0;

      // Apply Sobel kernels
      for (let ky = -kHalf; ky <= kHalf; ky++) {
        for (let kx = -kHalf; kx <= kHalf; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const pi = (py * width + px) * 4;

          // Use luminance for edge detection
          const value = src[pi] * 0.299 + src[pi + 1] * 0.587 + src[pi + 2] * 0.114;

          gx += value * sobelKernelX[ky + kHalf][kx + kHalf];
          gy += value * sobelKernelY[ky + kHalf][kx + kHalf];
        }
      }

      let edge;
      if (magnitude) {
        // Magnitude of gradient
        edge = Math.sqrt(gx * gx + gy * gy);
      } else if (horizontal && !vertical) {
        edge = Math.abs(gx);
      } else if (vertical && !horizontal) {
        edge = Math.abs(gy);
      } else {
        edge = Math.sqrt(gx * gx + gy * gy);
      }

      // Apply threshold
      if (edge < threshold) {
        edge = 0;
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
