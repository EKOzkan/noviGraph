/**
 * Skew/Perspective effect.
 */

import { assertImageDataLike } from '../utils/imageData.js';
import { applyAffineTransform, createSkewMatrix, createScaleMatrix } from '../utils/transforms.js';

/**
 * Apply skew/perspective transformation to image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.skewX=0] - Horizontal skew in degrees (-45 to 45)
 * @param {number} [options.skewY=0] - Vertical skew in degrees (-45 to 45)
 * @param {number} [options.perspective=1] - Perspective strength (0-2)
 * @returns {ImageData} Transformed image data
 */
export function skew(imageData, options = {}) {
  assertImageDataLike(imageData);

  const skewX = Math.max(-45, Math.min(45, options.skewX ?? 0));
  const skewY = Math.max(-45, Math.min(45, options.skewY ?? 0));
  const perspective = Math.max(0, Math.min(2, options.perspective ?? 1));

  // Create skew matrix
  const skewMatrix = createSkewMatrix(skewX, skewY);

  // Apply perspective scaling
  const perspectiveMatrix = createScaleMatrix(perspective, perspective, 0.5, 0.5);

  // Combine matrices (multiply perspective * skew)
  const matrix = [
    perspectiveMatrix[0] * skewMatrix[0] + perspectiveMatrix[1] * skewMatrix[3],
    perspectiveMatrix[0] * skewMatrix[1] + perspectiveMatrix[1] * skewMatrix[4],
    perspectiveMatrix[0] * skewMatrix[2] + perspectiveMatrix[1] * skewMatrix[5],
    perspectiveMatrix[3] * skewMatrix[0] + perspectiveMatrix[4] * skewMatrix[3],
    perspectiveMatrix[3] * skewMatrix[1] + perspectiveMatrix[4] * skewMatrix[4],
    perspectiveMatrix[3] * skewMatrix[2] + perspectiveMatrix[4] * skewMatrix[5],
    perspectiveMatrix[6] * skewMatrix[0] + perspectiveMatrix[7] * skewMatrix[3],
    perspectiveMatrix[6] * skewMatrix[1] + perspectiveMatrix[7] * skewMatrix[4],
    perspectiveMatrix[6] * skewMatrix[2] + perspectiveMatrix[7] * skewMatrix[5],
  ];

  return applyAffineTransform(imageData, { matrix, interpolation: 'bilinear', fillMode: 'transparent' });
}
