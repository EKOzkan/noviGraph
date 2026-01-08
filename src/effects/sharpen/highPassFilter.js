/**
 * High-pass filter effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { gaussianBlur as gaussianBlurUtil } from '../utils/convolution.js';

/**
 * Apply high-pass filter.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.radius=5] - Filter radius (0.5-50)
 * @param {number} [options.blend=0.5] - Blend with original (0-1)
 * @returns {ImageData} Filtered image data
 */
export function highPassFilter(imageData, options = {}) {
  assertImageDataLike(imageData);

  const radius = clamp(options.radius ?? 5, 0.5, 50);
  const blend = clamp(options.blend ?? 0.5, 0, 1);

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
    // High-pass: original - blurred
    const hpR = src[i] - blurData[i];
    const hpG = src[i + 1] - blurData[i + 1];
    const hpB = src[i + 2] - blurData[i + 2];

    // Normalize and add to 50% gray (midpoint)
    const gray = 128;
    const r = gray + hpR;
    const g = gray + hpG;
    const b = gray + hpB;

    // Blend with original
    out[i] = clamp(src[i] * (1 - blend) + r * blend, 0, 255);
    out[i + 1] = clamp(src[i + 1] * (1 - blend) + g * blend, 0, 255);
    out[i + 2] = clamp(src[i + 2] * (1 - blend) + b * blend, 0, 255);
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}
