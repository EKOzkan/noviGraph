/**
 * Ordered dithering (Bayer matrices and random).
 */

import { assertImageDataLike, clampByte, createImageData } from '../utils/imageData.js';
import { luminance } from '../utils/color.js';
import { applyPixelSizeEffect } from '../utils/pixelSize.js';

const BAYER_2 = [
  [0, 2],
  [3, 1],
];

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const BAYER_8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

/**
 * Get Bayer matrix value for 16x16 matrix.
 */
function getBayer16(x, y) {
  const size = 16;
  let val = 0;
  let tx = x % size;
  let ty = y % size;
  for (let i = size >> 1; i > 0; i >>= 1) {
    val = (val << 2) | ((tx & i) ? ((ty & i) ? 1 : 2) : ((ty & i) ? 3 : 0));
  }
  return val;
}

function getBayer(size, x, y) {
  if (size === 2) return BAYER_2[y % 2][x % 2];
  if (size === 4) return BAYER_4[y % 4][x % 4];
  if (size === 8) return BAYER_8[y % 8][x % 8];
  if (size === 16) return getBayer16(x, y);
  return BAYER_8[y % 8][x % 8];
}

/**
 * Ordered dithering.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number|string} [options.matrixSize=8] - Bayer matrix size (2, 4, 8, 16) or 'random'
 * @param {number} [options.levels=2] - Quantization levels per channel (range: 2-32)
 * @param {number} [options.strength=1] - Dither threshold modulation strength (range: 0-1)
 * @param {boolean} [options.grayscale=true] - Dither using luminance only
 * @param {number} [options.Size_=1] - Pixel size for downsample-upsample effect (range: 1-32)
 * @returns {ImageData} Processed image data
 */
export function orderedDither(imageData, options = {}) {
  const Size_ = options.Size_ ?? 1;

  const doDither = (img, opts) => {
    assertImageDataLike(img);

    const {
      matrixSize = 8,
      levels = 2,
      strength = 1,
      grayscale = true,
    } = opts;

    const isRandom = matrixSize === 'random';
    const size = isRandom ? 1 : (Number(matrixSize) || 8);
    const n2 = size * size;

    const lv = Math.max(2, Math.min(32, levels | 0));
    const s = Math.max(0, Math.min(1, strength));

    const out = createImageData(img.width, img.height);
    const src = img.data;
    const dst = out.data;

    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const i = (y * img.width + x) * 4;
        
        let thresholdShift;
        if (isRandom) {
          thresholdShift = (Math.random() - 0.5) * s;
        } else {
          const m = getBayer(size, x, y);
          // Shift in [-0.5, +0.5]
          thresholdShift = ((m + 0.5) / n2 - 0.5) * s;
        }

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
