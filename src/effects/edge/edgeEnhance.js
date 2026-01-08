/**
 * Edge enhancement effect.
 */

import { assertImageDataLike, createImageData, clampByte } from '../utils/imageData.js';
import { applyConvolution, laplacianKernel } from '../utils/convolution.js';

/**
 * Apply edge enhancement.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=1] - Enhancement amount (0-2)
 * @param {number} [options.radius=1] - Edge detection radius (1-10)
 * @returns {ImageData} Enhanced image data
 */
export function edgeEnhance(imageData, options = {}) {
  assertImageDataLike(imageData);

  const amount = clamp(options.amount ?? 1, 0, 2);
  const radius = Math.round(clamp(options.radius ?? 1, 1, 10));

  // Create Laplacian kernel
  const kernelSize = radius * 2 + 1;
  const kernel = [];
  for (let i = 0; i < kernelSize; i++) {
    const row = [];
    for (let j = 0; j < kernelSize; j++) {
      if (i === radius && j === radius) {
        row.push(kernelSize * kernelSize - 1);
      } else {
        row.push(-1);
      }
    }
    kernel.push(row);
  }

  const edgeData = applyConvolution(imageData, kernel, { preserveAlpha: false });

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const edge = edgeData.data;
  const out = new Uint8ClampedArray(src.length);

  for (let i = 0; i < src.length; i += 4) {
    // Blend edges with original
    const r = src[i] + edge[i] * amount;
    const g = src[i + 1] + edge[i + 1] * amount;
    const b = src[i + 2] + edge[i + 2] * amount;

    out[i] = clampByte(r);
    out[i + 1] = clampByte(g);
    out[i + 2] = clampByte(b);
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}
