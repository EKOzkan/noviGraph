/**
 * Clarity enhancement (mid-tone local contrast).
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { gaussianBlur as gaussianBlurUtil } from '../utils/convolution.js';

/**
 * Apply clarity enhancement.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=0.3] - Clarity strength (-1 to 1)
 * @param {number} [options.radius=10] - Local contrast radius (1-50)
 * @returns {ImageData} Enhanced image data
 */
export function clarity(imageData, options = {}) {
  assertImageDataLike(imageData);

  const amount = clamp(options.amount ?? 0.3, -1, 1);
  const radius = clamp(options.radius ?? 10, 1, 50);

  const sigma = radius / 3;
  const kernelSize = Math.ceil(radius * 4);
  const finalKernelSize = kernelSize % 2 === 0 ? kernelSize + 1 : kernelSize;

  // Create blurred version
  const blurred = gaussianBlurUtil(imageData, sigma, finalKernelSize);

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const blurData = blurred.data;
  const out = new Uint8ClampedArray(src.length);

  for (let i = 0; i < src.length; i += 4) {
    // Calculate local contrast
    const localContrastR = src[i] - blurData[i];
    const localContrastG = src[i + 1] - blurData[i + 1];
    const localContrastB = src[i + 2] - blurData[i + 2];

    // Enhance local contrast
    const r = src[i] + localContrastR * amount;
    const g = src[i + 1] + localContrastG * amount;
    const b = src[i + 2] + localContrastB * amount;

    out[i] = clamp(r, 0, 255);
    out[i + 1] = clamp(g, 0, 255);
    out[i + 2] = clamp(b, 0, 255);
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}
