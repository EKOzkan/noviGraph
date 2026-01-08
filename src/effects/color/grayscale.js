/**
 * Grayscale / Desaturation effects.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { luminance, average, rgbToHsl, hslToRgb } from '../utils/color.js';

/**
 * Convert image to grayscale.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {string} [options.method='luminance'] - Method: 'luminance', 'average', 'lightness'
 * @param {number} [options.intensity=1] - Desaturation intensity (0-1)
 * @returns {ImageData} Processed image data
 */
export function grayscale(imageData, options = {}) {
  assertImageDataLike(imageData);

  const { method = 'luminance', intensity = 1 } = options;
  const sat = clamp(intensity, 0, 1);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    let gray;
    if (method === 'average') {
      gray = average(r, g, b);
    } else if (method === 'lightness') {
      gray = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    } else {
      // luminance (default)
      gray = luminance(r, g, b);
    }

    dst[i] = r + (gray - r) * sat;
    dst[i + 1] = g + (gray - g) * sat;
    dst[i + 2] = b + (gray - b) * sat;
    dst[i + 3] = src[i + 3];
  }

  return out;
}

/**
 * Alternative desaturation methods.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {string} [options.method='luminance'] - Method: 'luminance', 'average', 'lightness', 'decompose'
 * @param {number} [options.intensity=1] - Desaturation intensity (0-1)
 * @returns {ImageData} Processed image data
 */
export function desaturate(imageData, options = {}) {
  assertImageDataLike(imageData);

  const { method = 'luminance', intensity = 1 } = options;
  const sat = clamp(intensity, 0, 1);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    let gray;
    if (method === 'average') {
      gray = average(r, g, b);
    } else if (method === 'lightness') {
      gray = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    } else if (method === 'decompose') {
      // Minimum channel decomposition
      gray = Math.min(r, g, b);
    } else {
      // luminance (default)
      gray = luminance(r, g, b);
    }

    dst[i] = r + (gray - r) * sat;
    dst[i + 1] = g + (gray - g) * sat;
    dst[i + 2] = b + (gray - b) * sat;
    dst[i + 3] = src[i + 3];
  }

  return out;
}
