/**
 * Bilateral filter (edge-preserving smoothing).
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';

/**
 * Apply bilateral filter.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.spatialSigma=2] - Spatial distance weighting (0.5-10)
 * @param {number} [options.rangeSigma=30] - Color similarity weighting (1-100)
 * @param {number} [options.radius=2] - Filter radius (1-8)
 * @returns {ImageData} Filtered image data
 */
export function bilateralFilter(imageData, options = {}) {
  assertImageDataLike(imageData);

  const spatialSigma = clamp(options.spatialSigma ?? 2, 0.5, 10);
  const rangeSigma = clamp(options.rangeSigma ?? 30, 1, 100);
  const radius = Math.round(clamp(options.radius ?? 2, 1, 8));

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const twoSigmaSpatial2 = 2 * spatialSigma * spatialSigma;
  const twoSigmaRange2 = 2 * rangeSigma * rangeSigma;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const centerR = src[i];
      const centerG = src[i + 1];
      const centerB = src[i + 2];

      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
      let sumWeight = 0;

      for (let ky = -radius; ky <= radius; ky++) {
        for (let kx = -radius; kx <= radius; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const pi = (py * width + px) * 4;

          const r = src[pi];
          const g = src[pi + 1];
          const b = src[pi + 2];

          // Spatial weight (distance)
          const spatialDist2 = kx * kx + ky * ky;
          const spatialWeight = Math.exp(-spatialDist2 / twoSigmaSpatial2);

          // Range weight (color similarity)
          const colorDist2 = (r - centerR) ** 2 + (g - centerG) ** 2 + (b - centerB) ** 2;
          const rangeWeight = Math.exp(-colorDist2 / twoSigmaRange2);

          const weight = spatialWeight * rangeWeight;

          sumR += r * weight;
          sumG += g * weight;
          sumB += b * weight;
          sumA += src[pi + 3] * weight;
          sumWeight += weight;
        }
      }

      out[i] = sumR / sumWeight;
      out[i + 1] = sumG / sumWeight;
      out[i + 2] = sumB / sumWeight;
      out[i + 3] = sumA / sumWeight;
    }
  }

  return new ImageData(out, width, height);
}
