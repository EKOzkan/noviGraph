/**
 * Levels effect for black/white point and gamma adjustment.
 */

import { assertImageDataLike, createImageData, clampByte, clamp } from '../utils/imageData.js';

/**
 * Apply levels adjustment.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.inputBlack=0] - Input black point (0-255)
 * @param {number} [options.inputWhite=255] - Input white point (0-255)
 * @param {number} [options.gamma=1] - Gamma correction (0.1-5)
 * @param {number} [options.outputBlack=0] - Output black point (0-255)
 * @param {number} [options.outputWhite=255] - Output white point (0-255)
 * @returns {ImageData} Processed image data
 */
export function levels(imageData, options = {}) {
  assertImageDataLike(imageData);

  const {
    inputBlack = clamp(options.inputBlack ?? 0, 0, 255),
    inputWhite = clamp(options.inputWhite ?? 255, 0, 255),
    gamma = clamp(options.gamma ?? 1, 0.1, 5),
    outputBlack = clamp(options.outputBlack ?? 0, 0, 255),
    outputWhite = clamp(options.outputWhite ?? 255, 0, 255),
  } = options;

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  const inputRange = inputWhite - inputBlack;
  const outputRange = outputWhite - outputBlack;
  const invGamma = 1 / gamma;

  // Build lookup table
  const lut = new Uint8Array(256);

  for (let i = 0; i < 256; i++) {
    let value;

    if (i <= inputBlack) {
      value = 0;
    } else if (i >= inputWhite) {
      value = 1;
    } else {
      value = (i - inputBlack) / inputRange;
    }

    // Apply gamma
    value = Math.pow(value, invGamma);

    // Map to output range
    value = outputBlack + value * outputRange;

    lut[i] = clampByte(value);
  }

  for (let i = 0; i < src.length; i += 4) {
    dst[i] = lut[src[i]];
    dst[i + 1] = lut[src[i + 1]];
    dst[i + 2] = lut[src[i + 2]];
    dst[i + 3] = src[i + 3];
  }

  return out;
}
