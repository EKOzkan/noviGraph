/**
 * 4x4 Bayer ordered dithering.
 */

import { orderedDither } from './orderedDither.js';

/**
 * 4x4 Bayer dithering.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.levels=2] - Quantization levels per channel
 * @param {number} [options.strength=1] - Dither threshold modulation strength
 * @param {boolean} [options.grayscale=true] - Dither using luminance only
 * @param {number} [options.Size_=1] - Pixel size for downsample-upsample effect
 * @returns {ImageData} Processed image data
 */
export function bayerOrdered4x4(imageData, options = {}) {
  return orderedDither(imageData, {
    ...options,
    matrixSize: 4,
  });
}
