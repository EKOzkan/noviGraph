/**
 * Clustered dot dithering.
 */

import { assertImageDataLike, clampByte, createImageData } from '../utils/imageData.js';
import { luminance } from '../utils/color.js';
import { applyPixelSizeEffect } from '../utils/pixelSize.js';

const CLUSTERED_MATRIX = [
  [12, 5, 6, 13],
  [4, 0, 1, 7],
  [11, 3, 2, 8],
  [15, 10, 9, 14],
];

/**
 * Clustered dot dithering.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.levels=2] - Quantization levels per channel
 * @param {number} [options.strength=1] - Dither threshold modulation strength
 * @param {boolean} [options.grayscale=true] - Dither using luminance only
 * @param {number} [options.Size_=1] - Pixel size for downsample-upsample effect
 * @returns {ImageData} Processed image data
 */
export function clustered(imageData, options = {}) {
  const Size_ = options.Size_ ?? 1;

  const doDither = (img, opts) => {
    assertImageDataLike(img);

    const {
      levels = 2,
      strength = 1,
      grayscale = true,
    } = opts;

    const size = 4;
    const n2 = 16;
    const lv = Math.max(2, Math.min(32, levels | 0));
    const s = Math.max(0, Math.min(1, strength));

    const out = createImageData(img.width, img.height);
    const src = img.data;
    const dst = out.data;

    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const i = (y * img.width + x) * 4;
        const m = CLUSTERED_MATRIX[y % size][x % size];
        const thresholdShift = ((m + 0.5) / n2 - 0.5) * s;

        const r = src[i];
        const g = src[i + 1];
        const b = src[i + 2];

        if (grayscale) {
          let l = luminance(r, g, b) / 255;
          l = Math.max(0, Math.min(1, l + thresholdShift));
          const q = Math.round(l * (lv - 1)) / (lv - 1);
          const v = clampByte(Math.round(q * 255));
          dst[i] = v;
          dst[i + 1] = v;
          dst[i + 2] = v;
        } else {
          const channels = [r, g, b];
          for (let c = 0; c < 3; c++) {
            let v = channels[c] / 255;
            v = Math.max(0, Math.min(1, v + thresholdShift));
            const q = Math.round(v * (lv - 1)) / (lv - 1);
            dst[i + c] = clampByte(Math.round(q * 255));
          }
        }

        dst[i + 3] = src[i + 3];
      }
    }

    return out;
  };

  return applyPixelSizeEffect(imageData, Size_, doDither, options);
}
