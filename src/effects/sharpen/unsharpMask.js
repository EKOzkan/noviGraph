/**
 * Unsharp mask effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { gaussianBlur as gaussianBlurUtil } from '../utils/convolution.js';

/**
 * Apply unsharp mask.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.radius=2] - Blur radius (0.5-50)
 * @param {number} [options.amount=1.5] - Sharpening strength (0-3)
 * @param {number} [options.threshold=0] - Minimum difference to sharpen (0-255)
 * @returns {ImageData} Sharpened image data
 */
export function unsharpMask(imageData, options = {}) {
  assertImageDataLike(imageData);

  const radius = clamp(options.radius ?? 2, 0.5, 50);
  const amount = clamp(options.amount ?? 1.5, 0, 3);
  const threshold = clamp(options.threshold ?? 0, 0, 255);

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
    // Calculate difference (high pass)
    const diffR = src[i] - blurData[i];
    const diffG = src[i + 1] - blurData[i + 1];
    const diffB = src[i + 2] - blurData[i + 2];

    // Calculate absolute difference for threshold
    const absDiff = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

    // Apply sharpening
    let r, g, b;

    if (absDiff < threshold) {
      // Below threshold, don't sharpen
      r = src[i];
      g = src[i + 1];
      b = src[i + 2];
    } else {
      r = src[i] + diffR * amount;
      g = src[i + 1] + diffG * amount;
      b = src[i + 2] + diffB * amount;
    }

    out[i] = clamp(r, 0, 255);
    out[i + 1] = clamp(g, 0, 255);
    out[i + 2] = clamp(b, 0, 255);
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}
