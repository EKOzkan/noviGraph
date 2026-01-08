/**
 * Scale/Zoom effect.
 */

import { assertImageDataLike } from '../utils/imageData.js';
import { applyAffineTransform, createScaleMatrix } from '../utils/transforms.js';

/**
 * Apply scaling to image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.scaleX=1] - Horizontal scale (0.1-5)
 * @param {number} [options.scaleY=1] - Vertical scale (0.1-5)
 * @param {string} [options.interpolation='bilinear'] - Interpolation: 'nearest', 'bilinear'
 * @param {number} [options.anchorX=0.5] - Scale center X (0-1)
 * @param {number} [options.anchorY=0.5] - Scale center Y (0-1)
 * @returns {ImageData} Scaled image data
 */
export function scale(imageData, options = {}) {
  assertImageDataLike(imageData);

  const scaleX = Math.max(0.1, Math.min(5, options.scaleX ?? 1));
  const scaleY = Math.max(0.1, Math.min(5, options.scaleY ?? 1));
  const interpolation = options.interpolation ?? 'bilinear';
  const anchorX = Math.max(0, Math.min(1, options.anchorX ?? 0.5));
  const anchorY = Math.max(0, Math.min(1, options.anchorY ?? 0.5));

  const matrix = createScaleMatrix(scaleX, scaleY, anchorX, anchorY);
  return applyAffineTransform(imageData, { matrix, interpolation, fillMode: 'transparent' });
}
