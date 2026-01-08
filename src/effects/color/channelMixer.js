/**
 * Channel mixer effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';

/**
 * Mix RGB channels.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.redFromRed=1] - Red contribution to red output (-2 to 2)
 * @param {number} [options.redFromGreen=0] - Green contribution to red output (-2 to 2)
 * @param {number} [options.redFromBlue=0] - Blue contribution to red output (-2 to 2)
 * @param {number} [options.greenFromRed=0] - Red contribution to green output (-2 to 2)
 * @param {number} [options.greenFromGreen=1] - Green contribution to green output (-2 to 2)
 * @param {number} [options.greenFromBlue=0] - Blue contribution to green output (-2 to 2)
 * @param {number} [options.blueFromRed=0] - Red contribution to blue output (-2 to 2)
 * @param {number} [options.blueFromGreen=0] - Green contribution to blue output (-2 to 2)
 * @param {number} [options.blueFromBlue=1] - Blue contribution to blue output (-2 to 2)
 * @param {boolean} [options.monochrome=false] - Convert to grayscale using mixed channel
 * @returns {ImageData} Processed image data
 */
export function channelMixer(imageData, options = {}) {
  assertImageDataLike(imageData);

  const {
    redFromRed = 1,
    redFromGreen = 0,
    redFromBlue = 0,
    greenFromRed = 0,
    greenFromGreen = 1,
    greenFromBlue = 0,
    blueFromRed = 0,
    blueFromGreen = 0,
    blueFromBlue = 1,
    monochrome = false,
  } = options;

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    // Calculate mixed values
    const mixedRed =
      r * clamp(redFromRed, -2, 2) +
      g * clamp(redFromGreen, -2, 2) +
      b * clamp(redFromBlue, -2, 2);

    const mixedGreen =
      r * clamp(greenFromRed, -2, 2) +
      g * clamp(greenFromGreen, -2, 2) +
      b * clamp(greenFromBlue, -2, 2);

    const mixedBlue =
      r * clamp(blueFromRed, -2, 2) +
      g * clamp(blueFromGreen, -2, 2) +
      b * clamp(blueFromBlue, -2, 2);

    if (monochrome) {
      // Use all three channels for grayscale
      const gray = (mixedRed + mixedGreen + mixedBlue) / 3;
      dst[i] = clamp(gray, 0, 255);
      dst[i + 1] = clamp(gray, 0, 255);
      dst[i + 2] = clamp(gray, 0, 255);
    } else {
      dst[i] = clamp(mixedRed, 0, 255);
      dst[i + 1] = clamp(mixedGreen, 0, 255);
      dst[i + 2] = clamp(mixedBlue, 0, 255);
    }

    dst[i + 3] = src[i + 3];
  }

  return out;
}
