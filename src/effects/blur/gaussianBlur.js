/**
 * Gaussian blur effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { gaussianBlur as gaussianBlurUtil } from '../utils/convolution.js';

/**
 * Apply Gaussian blur.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.radius=5] - Blur radius in pixels (0.5-50)
 * @param {string} [options.quality='medium'] - Quality: 'low', 'medium', 'high'
 * @returns {ImageData} Blurred image data
 */
export function gaussianBlur(imageData, options = {}) {
  assertImageDataLike(imageData);

  const radius = clamp(options.radius ?? 5, 0.5, 50);
  const quality = options.quality ?? 'medium';

  // Calculate kernel size based on radius and quality
  let kernelMultiplier;
  if (quality === 'low') {
    kernelMultiplier = 3;
  } else if (quality === 'high') {
    kernelMultiplier = 5;
  } else {
    kernelMultiplier = 4; // medium
  }

  // Sigma is proportional to radius
  const sigma = radius / 3;
  const kernelSize = Math.ceil(radius * kernelMultiplier);

  // Ensure odd kernel size
  const finalKernelSize = kernelSize % 2 === 0 ? kernelSize + 1 : kernelSize;

  return gaussianBlurUtil(imageData, sigma, finalKernelSize);
}
