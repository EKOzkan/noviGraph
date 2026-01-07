/**
 * Random noise pattern ordered dither.
 */

import { orderedDither } from './orderedDither.js';

/**
 * Random ordered dithering.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.levels=2] - Quantization levels per channel
 * @param {number} [options.strength=1] - Dither threshold modulation strength
 * @param {boolean} [options.grayscale=true] - Dither using luminance only
 * @param {number} [options.Size_=1] - Pixel size for downsample-upsample effect
 * @returns {ImageData} Processed image data
 */
export function randomOrdered(imageData, options = {}) {
  return orderedDither(imageData, {
    ...options,
    matrixSize: 'random',
  });
}
