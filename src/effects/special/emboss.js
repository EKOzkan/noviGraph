/**
 * Emboss/Relief effect.
 */

import { assertImageDataLike, createImageData, clampByte } from '../utils/imageData.js';
import { applyConvolution, embossKernel } from '../utils/convolution.js';

/**
 * Apply emboss effect.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=1] - Emboss strength (0-2)
 * @param {number} [options.angle=45] - Light direction in degrees (0-360)
 * @param {number} [options.depth=1] - Emboss depth (0.5-5)
 * @returns {ImageData} Embossed image data
 */
export function emboss(imageData, options = {}) {
  assertImageDataLike(imageData);

  const amount = clamp(options.amount ?? 1, 0, 2);
  const angle = (options.angle ?? 45) % 360;
  const depth = clamp(options.depth ?? 1, 0.5, 5);

  // Create directional emboss kernel
  const rad = angle * (Math.PI / 180);
  const dx = Math.cos(rad) * depth;
  const dy = Math.sin(rad) * depth;

  // Create 3x3 kernel based on direction
  const kernel = [
    [-dx, -dy, 0],
    [-dx * depth, 1 + dx * depth + dy * depth, dy * depth],
    [0, dx, dy],
  ];

  const edgeData = applyConvolution(imageData, kernel, { preserveAlpha: false });

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const edge = edgeData.data;
  const out = new Uint8ClampedArray(src.length);

  for (let i = 0; i < src.length; i += 4) {
    // Normalize edge data to 0-255 range and add gray offset
    const normalizedEdge = (edge[i] + 128) * amount;

    // Blend with original
    const r = src[i] + normalizedEdge - 128;
    const g = src[i + 1] + normalizedEdge - 128;
    const b = src[i + 2] + normalizedEdge - 128;

    out[i] = clampByte(r);
    out[i + 1] = clampByte(g);
    out[i + 2] = clampByte(b);
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}
