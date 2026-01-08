/**
 * Morphological opening (erode then dilate).
 */

import { assertImageDataLike } from '../utils/imageData.js';
import { erode } from './erode.js';
import { dilate } from './dilate.js';

/**
 * Apply morphological opening.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.radius=1] - Operation radius (1-10)
 * @param {number} [options.iterations=1] - Number of iterations (1-4)
 * @returns {ImageData} Opened image data
 */
export function morphOpen(imageData, options = {}) {
  assertImageDataLike(imageData);

  const radius = options.radius ?? 1;
  const iterations = options.iterations ?? 1;

  // Erode first, then dilate
  const eroded = erode(imageData, { radius, iterations });
  return dilate(eroded, { radius, iterations });
}
