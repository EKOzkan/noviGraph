/**
 * Map an image to a limited color palette.
 */

import { assertImageDataLike, createImageData } from '../utils/imageData.js';
import { nearestPaletteColor, toRgb } from '../utils/color.js';
import { gameboy as defaultPalette } from '../palettes/index.js';

/**
 * Color palette mapping.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {Array<string|[number,number,number]>} [options.palette] - Palette colors (default: Game Boy green palette)
 * @returns {ImageData} Processed image data
 */
export function colorPalette(imageData, options = {}) {
  assertImageDataLike(imageData);

  const paletteInput = options.palette ?? defaultPalette;
  const palette = paletteInput.map((c) => toRgb(c));

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
