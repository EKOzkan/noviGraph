/**
 * Glow/Bloom enhancement effect.
 */

import { assertImageDataLike, createImageData, clampByte, clamp } from '../utils/imageData.js';
import { gaussianBlur as gaussianBlurUtil } from '../utils/convolution.js';

/**
 * Apply glow/bloom enhancement.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.threshold=200] - Brightness threshold (0-255)
 * @param {number} [options.radius=10] - Glow radius (1-50)
 * @param {number} [options.intensity=0.8] - Glow intensity (0-2)
 * @param {number} [options.blend=0.5] - Blend with original (0-1)
 * @returns {ImageData} Glow-enhanced image data
 */
export function glowEnhance(imageData, options = {}) {
  assertImageDataLike(imageData);

  const threshold = clamp(options.threshold ?? 200, 0, 255);
  const radius = clamp(options.radius ?? 10, 1, 50);
  const intensity = clamp(options.intensity ?? 0.8, 0, 2);
  const blend = clamp(options.blend ?? 0.5, 0, 1);

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  // Extract bright areas
  const bright = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const lum = src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114;
    if (lum > threshold) {
      const factor = (lum - threshold) / (255 - threshold);
      bright[i] = src[i] * factor;
      bright[i + 1] = src[i + 1] * factor;
      bright[i + 2] = src[i + 2] * factor;
      bright[i + 3] = src[i + 3];
    } else {
      bright[i] = 0;
      bright[i + 1] = 0;
      bright[i + 2] = 0;
      bright[i + 3] = 0;
    }
  }

  // Blur bright areas
  const brightData = new ImageData(bright, width, height);
  const sigma = radius / 3;
  const kernelSize = Math.ceil(radius * 4) % 2 === 0 ? Math.ceil(radius * 4) + 1 : Math.ceil(radius * 4);
  const blurred = gaussianBlurUtil(brightData, sigma, kernelSize);
  const blurData = blurred.data;

  // Blend with original
  for (let i = 0; i < src.length; i += 4) {
    const glowR = blurData[i] * intensity;
    const glowG = blurData[i + 1] * intensity;
    const glowB = blurData[i + 2] * intensity;

    out[i] = clampByte(src[i] * (1 - blend) + glowR * blend);
    out[i + 1] = clampByte(src[i + 1] * (1 - blend) + glowG * blend);
    out[i + 2] = clampByte(src[i + 2] * (1 - blend) + glowB * blend);
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}
