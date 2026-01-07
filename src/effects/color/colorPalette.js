/**
 * Map an image to a limited color palette.
 */

import { assertImageDataLike, createImageData } from '../utils/imageData.js';
import { nearestPaletteColor, toRgb } from '../utils/color.js';
import { palettes } from '../palettes/index.js';

/**
 * Color palette mapping.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {string} [options.palette] - Palette name (default: 'gameboy')
 * @returns {ImageData} Processed image data
 */
export function colorPalette(imageData, options = {}) {
  assertImageDataLike(imageData);

  const palette = Array.isArray(options.palette)
    ? options.palette.map((c) => toRgb(c))
    : (palettes[options.palette] || palettes.gameboy).map((c) => toRgb(c));

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const [r, g, b] = nearestPaletteColor(src[i], src[i + 1], src[i + 2], palette);
    dst[i] = r;
    dst[i + 1] = g;
    dst[i + 2] = b;
    dst[i + 3] = src[i + 3];
  }

  return out;
}
