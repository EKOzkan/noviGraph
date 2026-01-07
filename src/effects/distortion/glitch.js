/**
 * Glitch-style distortion effects.
 */

import { assertImageDataLike, clampByte, createImageData, clamp } from '../utils/imageData.js';
import { luminance } from '../utils/color.js';
import { createRng } from '../utils/random.js';

/**
 * Chromatic aberration by offsetting color channels.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options
 * @param {number} [options.offsetX=5] - Horizontal offset in pixels (range: -50 to 50)
 * @param {number} [options.offsetY=0] - Vertical offset in pixels (range: -50 to 50)
 * @param {boolean} [options.wrap=false] - Wrap edges instead of clamping
 * @returns {ImageData}
 */
export function chromaticAberration(imageData, options = {}) {
  assertImageDataLike(imageData);

  const { width, height } = imageData;
  const src = imageData.data;
  const out = createImageData(width, height);
  const dst = out.data;

  const ox = clamp(options.offsetX ?? 5, -50, 50) | 0;
  const oy = clamp(options.offsetY ?? 0, -50, 50) | 0;
  const wrap = options.wrap ?? false;

  const sample = (x, y) => {
    let sx = x;
    let sy = y;

    if (wrap) {
      sx = ((sx % width) + width) % width;
      sy = ((sy % height) + height) % height;
    } else {
      sx = Math.min(width - 1, Math.max(0, sx));
      sy = Math.min(height - 1, Math.max(0, sy));
    }

    return (sy * width + sx) * 4;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const ir = sample(x + ox, y + oy);
      const ib = sample(x - ox, y - oy);

      dst[i] = src[ir];
      dst[i + 1] = src[i + 1];
      dst[i + 2] = src[ib + 2];
      dst[i + 3] = src[i + 3];
    }
  }

  return out;
}

/**
 * Pixel sorting glitch.
 *
 * Sorts contiguous pixel runs in each row based on luminance.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options
 * @param {number} [options.thresholdLow=40] - Minimum luminance to include in a sortable run (range: 0-255)
 * @param {number} [options.thresholdHigh=220] - Maximum luminance to include in a sortable run (range: 0-255)
 * @param {number} [options.intensity=1] - Amount of rows to sort (range: 0-1)
 * @param {number|null} [options.seed=null] - Seed for deterministic selection (optional)
 * @returns {ImageData}
 */
export function pixelSort(imageData, options = {}) {
  assertImageDataLike(imageData);

  const { width, height } = imageData;
  const src = imageData.data;
  const out = createImageData(width, height);
  const dst = out.data;

  const low = clamp(options.thresholdLow ?? 40, 0, 255);
  const high = clamp(options.thresholdHigh ?? 220, 0, 255);
  const intensity = clamp(options.intensity ?? 1, 0, 1);
  const rng = createRng(options.seed ?? null);

  // Copy first; we'll sort in-place per row in dst.
  dst.set(src);

  for (let y = 0; y < height; y++) {
    if (rng() > intensity) continue;

    let x = 0;
    while (x < width) {
      // Find start of a run.
      while (x < width) {
        const i = (y * width + x) * 4;
        const l = luminance(dst[i], dst[i + 1], dst[i + 2]);
        if (l >= low && l <= high) break;
        x++;
      }
      if (x >= width) break;

      const runStart = x;
      while (x < width) {
        const i = (y * width + x) * 4;
        const l = luminance(dst[i], dst[i + 1], dst[i + 2]);
        if (l < low || l > high) break;
        x++;
      }
      const runEnd = x; // exclusive

      const run = [];
      for (let xi = runStart; xi < runEnd; xi++) {
        const i = (y * width + xi) * 4;
        run.push([
          dst[i],
          dst[i + 1],
          dst[i + 2],
          dst[i + 3],
          luminance(dst[i], dst[i + 1], dst[i + 2]),
        ]);
      }

      run.sort((a, b) => a[4] - b[4]);

      for (let k = 0; k < run.length; k++) {
        const xi = runStart + k;
        const i = (y * width + xi) * 4;
        dst[i] = run[k][0];
        dst[i + 1] = run[k][1];
        dst[i + 2] = run[k][2];
        dst[i + 3] = run[k][3];
      }
    }
  }

  return out;
}

/**
 * Digital corruption glitch.
 *
 * Introduces random block displacements and occasional bit-level artifacts.
 *
 * @param {ImageData} imageData
 * @param {Object} options
 * @param {number} [options.intensity=0.35] - Corruption strength (range: 0-1)
 * @param {number} [options.blockSize=16] - Block size (range: 4-128)
 * @param {number|null} [options.seed=null] - Seed for deterministic corruption (optional)
 * @returns {ImageData}
 */
export function digitalCorruption(imageData, options = {}) {
  assertImageDataLike(imageData);

  const intensity = clamp(options.intensity ?? 0.35, 0, 1);
  const blockSize = Math.max(4, Math.min(128, (options.blockSize ?? 16) | 0));
  const rng = createRng(options.seed ?? null);

  const { width, height } = imageData;
  const src = imageData.data;
  const out = createImageData(width, height);
  const dst = out.data;

  dst.set(src);

  const blocksX = Math.ceil(width / blockSize);
  const blocksY = Math.ceil(height / blockSize);

  const swapProb = intensity * 0.35;
  const bitProb = intensity * 0.03;

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      if (rng() > swapProb) continue;

      const srcBx = (rng() * blocksX) | 0;
      const srcBy = (rng() * blocksY) | 0;

      const x0 = bx * blockSize;
      const y0 = by * blockSize;
      const sx0 = srcBx * blockSize;
      const sy0 = srcBy * blockSize;

      const bw = Math.min(blockSize, width - x0);
      const bh = Math.min(blockSize, height - y0);

      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          const dx = x0 + x;
          const dy = y0 + y;
          const sx = Math.min(width - 1, sx0 + x);
          const sy = Math.min(height - 1, sy0 + y);

          const di = (dy * width + dx) * 4;
          const si = (sy * width + sx) * 4;

          dst[di] = src[si];
          dst[di + 1] = src[si + 1];
          dst[di + 2] = src[si + 2];
          dst[di + 3] = src[si + 3];

          if (rng() < bitProb) {
            dst[di] = clampByte(dst[di] ^ ((rng() * 32) | 0));
            dst[di + 1] = clampByte(dst[di + 1] ^ ((rng() * 32) | 0));
            dst[di + 2] = clampByte(dst[di + 2] ^ ((rng() * 32) | 0));
          }
        }
      }
    }
  }

  return out;
}

/**
 * Data-mosh style smear using row/strip offsets.
 *
 * @param {ImageData} imageData
 * @param {Object} options
 * @param {number} [options.intensity=0.4] - Smear strength (range: 0-1)
 * @param {number} [options.maxOffset=40] - Max horizontal offset in pixels (range: 0-200)
 * @param {number} [options.bandHeight=6] - Height of smear bands (range: 1-64)
 * @param {number|null} [options.seed=null]
 * @returns {ImageData}
 */
export function dataMosh(imageData, options = {}) {
  assertImageDataLike(imageData);

  const intensity = clamp(options.intensity ?? 0.4, 0, 1);
  const maxOffset = Math.max(0, Math.min(200, (options.maxOffset ?? 40) | 0));
  const bandHeight = Math.max(1, Math.min(64, (options.bandHeight ?? 6) | 0));
  const rng = createRng(options.seed ?? null);

  const { width, height } = imageData;
  const src = imageData.data;
  const out = createImageData(width, height);
  const dst = out.data;

  const bandProb = intensity;
  let offset = 0;

  for (let y = 0; y < height; y++) {
    if (y % bandHeight === 0) {
      offset = rng() < bandProb ? (((rng() * 2 - 1) * maxOffset * intensity) | 0) : 0;
    }

    for (let x = 0; x < width; x++) {
      const sx = Math.min(width - 1, Math.max(0, x + offset));
      const si = (y * width + sx) * 4;
      const di = (y * width + x) * 4;

      // Slight channel mismatch for extra "mosh" feel.
      const sx2 = Math.min(width - 1, Math.max(0, x + ((offset * 0.5) | 0)));
      const si2 = (y * width + sx2) * 4;

      dst[di] = src[si];
      dst[di + 1] = src[si2 + 1];
      dst[di + 2] = src[si + 2];
      dst[di + 3] = src[si + 3];
    }
  }

  return out;
}

/**
 * Convenience wrapper for glitch effects.
 *
 * @param {ImageData} imageData
 * @param {Object} options
 * @param {'pixelSort'|'chromaticAberration'|'digitalCorruption'|'dataMosh'} [options.mode='digitalCorruption']
 * @returns {ImageData}
 */
export function glitch(imageData, options = {}) {
  const mode = options.mode ?? 'digitalCorruption';
  if (mode === 'pixelSort') return pixelSort(imageData, options);
  if (mode === 'chromaticAberration') return chromaticAberration(imageData, options);
  if (mode === 'dataMosh') return dataMosh(imageData, options);
  return digitalCorruption(imageData, options);
}
