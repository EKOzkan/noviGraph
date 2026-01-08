/**
 * Curves effect for color adjustment.
 */

import { assertImageDataLike, createImageData, clampByte } from '../utils/imageData.js';
import { luminance } from '../utils/color.js';

/**
 * Create curve lookup table from control points.
 *
 * @param {Array<{x:number, y:number}>} points - Control points (x,y in 0-1 range)
 * @param {number} [size=256] - Table size
 * @returns {Uint8Array} Lookup table
 */
export function createCurveTable(points, size = 256) {
  const table = new Uint8Array(size);

  // Sort points by x
  const sorted = [...points].sort((a, b) => a.x - b.x);

  // For each output value, find the corresponding input value
  for (let i = 0; i < size; i++) {
    const y = i / (size - 1);

    // Find the segment
    let idx = 0;
    while (idx < sorted.length - 1 && sorted[idx + 1].x < y) {
      idx++;
    }

    if (idx === sorted.length - 1) {
      table[i] = clampByte(sorted[sorted.length - 1].y * 255);
    } else {
      const p1 = sorted[idx];
      const p2 = sorted[idx + 1];

      // Linear interpolation
      const t = (y - p1.x) / (p2.x - p1.x || 1);
      const value = p1.y + t * (p2.y - p1.y);
      table[i] = clampByte(value * 255);
    }
  }

  return table;
}

/**
 * Apply curves adjustment.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {Array<{x:number, y:number}>} [options.curve] - Control points (default: linear)
 * @param {string} [options.channel='luminance'] - Channel: 'luminance', 'red', 'green', 'blue'
 * @returns {ImageData} Processed image data
 */
export function curves(imageData, options = {}) {
  assertImageDataLike(imageData);

  const { curve = [{ x: 0, y: 0 }, { x: 1, y: 1 }], channel = 'luminance' } = options;

  const lut = createCurveTable(curve);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  if (channel === 'luminance') {
    for (let i = 0; i < src.length; i += 4) {
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];

      const lum = Math.round(luminance(r, g, b));
      const adjustedLum = lut[lum];
      const scale = lum > 0 ? adjustedLum / lum : 1;

      dst[i] = clampByte(r * scale);
      dst[i + 1] = clampByte(g * scale);
      dst[i + 2] = clampByte(b * scale);
      dst[i + 3] = src[i + 3];
    }
  } else {
    const channelIdx = channel === 'red' ? 0 : channel === 'green' ? 1 : 2;

    for (let i = 0; i < src.length; i += 4) {
      const value = src[i + channelIdx];
      const adjusted = lut[value];

      dst[i] = channel === 'red' ? adjusted : src[i];
      dst[i + 1] = channel === 'green' ? adjusted : src[i + 1];
      dst[i + 2] = channel === 'blue' ? adjusted : src[i + 2];
      dst[i + 3] = src[i + 3];
    }
  }

  return out;
}
