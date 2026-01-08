/**
 * Flip effect.
 */

import { assertImageDataLike } from '../utils/imageData.js';
import { flip as flipUtil } from '../utils/transforms.js';

/**
 * Flip image horizontally and/or vertically.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {boolean} [options.horizontal=false] - Flip horizontally
 * @param {boolean} [options.vertical=false] - Flip vertically
 * @returns {ImageData} Flipped image data
 */
export function flip(imageData, options = {}) {
  assertImageDataLike(imageData);
  return flipUtil(imageData, options);
}
