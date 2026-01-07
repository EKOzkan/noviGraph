/**
 * Riemersma dithering.
 * Uses a space-filling curve (like Hilbert curve) and a small error buffer
 * to diffuse errors locally.
 */

import { assertImageDataLike, clampByte, createImageData } from '../utils/imageData.js';
import { nearestPaletteColor } from '../utils/color.js';
import { bw as defaultBwPalette } from '../palettes/index.js';
import { applyPixelSizeEffect } from '../utils/pixelSize.js';

/**
 * Riemersma dithering.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {Array<[number,number,number]>} [options.palette] - Output palette (default: black/white)
 * @param {number} [options.history=16] - Error history length (range: 1-16)
 * @param {number} [options.decay=0.9] - Error decay factor (range: 0-1)
 * @param {number} [options.Size_=1] - Pixel size for downsample-upsample effect
 * @returns {ImageData} Processed image data
 */
export function riemersma(imageData, options = {}) {
  const Size_ = options.Size_ ?? 1;

  const doDither = (img, opts) => {
    assertImageDataLike(img);

    const {
      palette = defaultBwPalette,
      history = 16,
      decay = 0.9,
    } = opts;

    const width = img.width;
    const height = img.height;
    const src = img.data;
    const out = createImageData(width, height);
    const dst = out.data;

    // Error history buffers
    const errorR = new Float32Array(history);
    const errorG = new Float32Array(history);
    const errorB = new Float32Array(history);
    let errorIdx = 0;

    // Hilbert curve traversal would be ideal, but for now we'll use a simple
    // serpentine scan which is often used as a fallback or simplified version.
    for (let y = 0; y < height; y++) {
      const leftToRight = y % 2 === 0;
      for (let x = 0; x < width; x++) {
        const tx = leftToRight ? x : width - 1 - x;
        const i = (y * width + tx) * 4;

        let r = src[i];
        let g = src[i + 1];
        let b = src[i + 2];

        // Add weighted history of errors
        for (let j = 0; j < history; j++) {
          const weight = Math.pow(decay, j);
          const idx = (errorIdx - 1 - j + history) % history;
          r += errorR[idx] * weight;
          g += errorG[idx] * weight;
          b += errorB[idx] * weight;
        }

        const [nr, ng, nb] = nearestPaletteColor(r, g, b, palette);

        dst[i] = nr;
        dst[i + 1] = ng;
        dst[i + 2] = nb;
        dst[i + 3] = src[i + 3];

        // Store new error in history
        errorR[errorIdx] = r - nr;
        errorG[errorIdx] = g - ng;
        errorB[errorIdx] = b - nb;
        errorIdx = (errorIdx + 1) % history;
      }
    }

    return out;
  };

  return applyPixelSizeEffect(imageData, Size_, doDither, options);
}
