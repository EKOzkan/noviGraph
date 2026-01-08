/**
 * Morphological closing (dilate then erode).
 */

import { assertImageDataLike } from '../utils/imageData.js';
import { dilate } from './dilate.js';
import { erode } from './erode.js';

/**
 * Apply morphological closing.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.radius=1] - Operation radius (1-10)
 * @param {number} [options.iterations=1] - Number of iterations (1-4)
 * @returns {ImageData} Closed image data
 */
export function morphClose(imageData, options = {}) {
  assertImageDataLike(imageData);

  const radius = options.radius ?? 1;
  const iterations = options.iterations ?? 1;

  // Dilate first, then erode
  const dilated = dilate(imageData, { radius, iterations });
  return erode(dilated, { radius, iterations });
}
