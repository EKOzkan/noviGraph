/**
 * Simple, dependency-free blurs used for bloom/feathering.
 */

import { clampByte } from './imageData.js';

/**
 * Edge-clamped separable box blur.
 *
 * @param {Uint8ClampedArray} src RGBA buffer
 * @param {number} width
 * @param {number} height
 * @param {number} radius radius in pixels (integer >= 0)
 * @returns {Uint8ClampedArray}
 */
export function boxBlurRGBA(src, width, height, radius) {
  const r = Math.max(0, radius | 0);
  if (r === 0) return new Uint8ClampedArray(src);

  const tmp = new Float32Array(src.length);
  const out = new Uint8ClampedArray(src.length);
  const windowSize = r * 2 + 1;

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    let sumR = 0,
      sumG = 0,
      sumB = 0,
      sumA = 0;

    const rowStart = y * width;

    for (let k = -r; k <= r; k++) {
      const x = Math.min(width - 1, Math.max(0, k));
      const i = (rowStart + x) * 4;
      sumR += src[i];
      sumG += src[i + 1];
      sumB += src[i + 2];
      sumA += src[i + 3];
    }

    for (let x = 0; x < width; x++) {
      const idx = (rowStart + x) * 4;
      tmp[idx] = sumR / windowSize;
      tmp[idx + 1] = sumG / windowSize;
      tmp[idx + 2] = sumB / windowSize;
      tmp[idx + 3] = sumA / windowSize;

      const xRemove = Math.max(0, x - r);
      const xAdd = Math.min(width - 1, x + r + 1);

      const iRemove = (rowStart + xRemove) * 4;
      const iAdd = (rowStart + xAdd) * 4;

      sumR += src[iAdd] - src[iRemove];
      sumG += src[iAdd + 1] - src[iRemove + 1];
      sumB += src[iAdd + 2] - src[iRemove + 2];
      sumA += src[iAdd + 3] - src[iRemove + 3];
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    let sumR = 0,
      sumG = 0,
      sumB = 0,
      sumA = 0;

    for (let k = -r; k <= r; k++) {
      const y = Math.min(height - 1, Math.max(0, k));
      const i = (y * width + x) * 4;
      sumR += tmp[i];
      sumG += tmp[i + 1];
      sumB += tmp[i + 2];
      sumA += tmp[i + 3];
    }

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      out[idx] = clampByte(Math.round(sumR / windowSize));
      out[idx + 1] = clampByte(Math.round(sumG / windowSize));
      out[idx + 2] = clampByte(Math.round(sumB / windowSize));
      out[idx + 3] = clampByte(Math.round(sumA / windowSize));

      const yRemove = Math.max(0, y - r);
      const yAdd = Math.min(height - 1, y + r + 1);

      const iRemove = (yRemove * width + x) * 4;
      const iAdd = (yAdd * width + x) * 4;

      sumR += tmp[iAdd] - tmp[iRemove];
      sumG += tmp[iAdd + 1] - tmp[iRemove + 1];
      sumB += tmp[iAdd + 2] - tmp[iRemove + 2];
      sumA += tmp[iAdd + 3] - tmp[iRemove + 3];
    }
  }

  return out;
}

/**
 * Blur a single-channel alpha mask.
 *
 * @param {Uint8ClampedArray} alpha length = width*height
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 * @returns {Uint8ClampedArray}
 */
export function boxBlurAlpha(alpha, width, height, radius) {
  const r = Math.max(0, radius | 0);
  if (r === 0) return new Uint8ClampedArray(alpha);

  const tmp = new Float32Array(alpha.length);
  const out = new Uint8ClampedArray(alpha.length);
  const windowSize = r * 2 + 1;

  for (let y = 0; y < height; y++) {
    let sum = 0;
    const rowStart = y * width;

    for (let k = -r; k <= r; k++) {
      const x = Math.min(width - 1, Math.max(0, k));
      sum += alpha[rowStart + x];
    }

    for (let x = 0; x < width; x++) {
      tmp[rowStart + x] = sum / windowSize;

      const xRemove = Math.max(0, x - r);
      const xAdd = Math.min(width - 1, x + r + 1);
      sum += alpha[rowStart + xAdd] - alpha[rowStart + xRemove];
    }
  }

  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) {
      const y = Math.min(height - 1, Math.max(0, k));
      sum += tmp[y * width + x];
    }

    for (let y = 0; y < height; y++) {
      out[y * width + x] = clampByte(Math.round(sum / windowSize));
      const yRemove = Math.max(0, y - r);
      const yAdd = Math.min(height - 1, y + r + 1);
      sum += tmp[yAdd * width + x] - tmp[yRemove * width + x];
    }
  }

  return out;
}
