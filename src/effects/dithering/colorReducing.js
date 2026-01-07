/**
 * Simple color reduction without dithering.
 * Maps each pixel to the nearest color in the given palette.
 */

import { assertImageDataLike, createImageData } from '../utils/imageData.js';
import { nearestPaletteColor } from '../utils/color.js';
import { bw as defaultBwPalette } from '../palettes/index.js';
import { applyPixelSizeEffect } from '../utils/pixelSize.js';

/**
 * Color reducing (no dither).
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {Array<[number,number,number]>} [options.palette] - Output palette (default: black/white)
 * @param {number} [options.Size_=1] - Pixel size for downsample-upsample effect
 * @returns {ImageData} Processed image data
 */
export function colorReducing(imageData, options = {}) {
  const Size_ = options.Size_ ?? 1;

  const doReduce = (img, opts) => {
    assertImageDataLike(img);

    const { palette = defaultBwPalette } = opts;

    const out = createImageData(img.width, img.height);
    const src = img.data;
    const dst = out.data;

    for (let i = 0; i < src.length; i += 4) {
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];

      const [nr, ng, nb] = nearestPaletteColor(r, g, b, palette);

      dst[i] = nr;
      dst[i + 1] = ng;
      dst[i + 2] = nb;
      dst[i + 3] = src[i + 3];
    }

    return out;
  };

  return applyPixelSizeEffect(imageData, Size_, doReduce, options);
}
