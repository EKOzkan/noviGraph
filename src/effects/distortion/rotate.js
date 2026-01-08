/**
 * Rotate effect.
 */

import { assertImageDataLike } from '../utils/imageData.js';
import { applyAffineTransform, createRotationMatrix } from '../utils/transforms.js';

/**
 * Apply rotation to image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.angle=0] - Rotation angle in degrees (0-360)
 * @param {string} [options.fillMode='transparent'] - Fill mode: 'transparent', 'extend', 'wrap'
 * @param {string} [options.interpolation='bilinear'] - Interpolation: 'nearest', 'bilinear'
 * @returns {ImageData} Rotated image data
 */
export function rotate(imageData, options = {}) {
  assertImageDataLike(imageData);

  const angle = (options.angle ?? 0) % 360;
  const fillMode = options.fillMode ?? 'transparent';
  const interpolation = options.interpolation ?? 'bilinear';

  const matrix = createRotationMatrix(angle);
  return applyAffineTransform(imageData, { matrix, interpolation, fillMode });
}
