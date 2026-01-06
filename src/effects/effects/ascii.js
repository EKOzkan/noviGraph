/**
 * ASCII-style conversion.
 *
 * This effect renders a rasterized "ASCII art" approximation into a new
 * ImageData buffer. It does not depend on Canvas text rendering.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { luminance, toRgb } from '../utils/color.js';

// 5x7 bitmap font for a small charset.
// Each entry is 7 rows, each row is a 5-bit mask (MSB on the left).
const FONT_5x7 = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 0b00100, 0b00100],
  ':': [0, 0b00100, 0b00100, 0, 0b00100, 0b00100, 0],
  '-': [0, 0, 0, 0b11111, 0, 0, 0],
  '=': [0, 0, 0b11111, 0, 0b11111, 0, 0],
  '+': [0, 0b00100, 0b00100, 0b11111, 0b00100, 0b00100, 0],
  '*': [0, 0b10101, 0b01110, 0b11111, 0b01110, 0b10101, 0],
  '#': [0b01010, 0b11111, 0b01010, 0b01010, 0b11111, 0b01010, 0],
  '%': [0b11001, 0b11010, 0b00100, 0b01000, 0b10110, 0b00110, 0],
  '@': [0b01110, 0b10001, 0b10111, 0b10101, 0b10111, 0b10000, 0b01110],
};

const DEFAULT_CHARSET = ' .:-=+*#%@';

/**
 * ASCII conversion effect.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.cellWidth=8] - Character cell width in pixels (range: 2-64)
 * @param {number} [options.cellHeight=12] - Character cell height in pixels (range: 2-64)
 * @param {string} [options.charset=' .:-=+*#%@'] - Characters ordered from dark to bright (must be subset of supported font)
 * @param {string|[number,number,number]} [options.foreground='#000000'] - Foreground color for characters
 * @param {string|[number,number,number]} [options.background='#ffffff'] - Background color
 * @param {boolean} [options.invert=false] - Invert luminance mapping
 * @param {boolean} [options.colorize=false] - Use the block's average color as the foreground
 * @returns {ImageData} Processed image data
 */
export function ascii(imageData, options = {}) {
  assertImageDataLike(imageData);

  const cellWidth = Math.max(2, Math.min(64, (options.cellWidth ?? 8) | 0));
  const cellHeight = Math.max(2, Math.min(64, (options.cellHeight ?? 12) | 0));
  const invert = options.invert ?? false;
  const colorize = options.colorize ?? false;

  const charset = (options.charset ?? DEFAULT_CHARSET)
    .split('')
    .filter((c) => Object.prototype.hasOwnProperty.call(FONT_5x7, c))
    .join('');

  if (!charset.length) {
    throw new Error('ascii: options.charset must contain at least one supported character.');
  }

  const fgDefault = toRgb(options.foreground ?? '#000000');
  const bg = toRgb(options.background ?? '#ffffff');

  const { width, height } = imageData;
  const src = imageData.data;
  const out = createImageData(width, height);
  const dst = out.data;

  // Fill background.
  for (let i = 0; i < dst.length; i += 4) {
    dst[i] = bg[0];
    dst[i + 1] = bg[1];
    dst[i + 2] = bg[2];
    dst[i + 3] = 255;
  }

  const cellsX = Math.ceil(width / cellWidth);
  const cellsY = Math.ceil(height / cellHeight);

  for (let cy = 0; cy < cellsY; cy++) {
    for (let cx = 0; cx < cellsX; cx++) {
      const x0 = cx * cellWidth;
      const y0 = cy * cellHeight;
      const bw = Math.min(cellWidth, width - x0);
      const bh = Math.min(cellHeight, height - y0);

      // Average luminance and color for the cell.
      let sumL = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let count = 0;

      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          const i = ((y0 + y) * width + (x0 + x)) * 4;
          const r = src[i];
          const g = src[i + 1];
          const b = src[i + 2];
          sumL += luminance(r, g, b);
          sumR += r;
          sumG += g;
          sumB += b;
          count++;
        }
      }

      let l = (sumL / count) / 255;
      if (invert) l = 1 - l;

      const idx = clamp(Math.round(l * (charset.length - 1)), 0, charset.length - 1);
      const ch = charset[idx];
      const bitmap = FONT_5x7[ch];

      const fg = colorize
        ? [Math.round(sumR / count), Math.round(sumG / count), Math.round(sumB / count)]
        : fgDefault;

      // Render 5x7 bitmap scaled to the cell size.
      for (let py = 0; py < bh; py++) {
        const gy = Math.min(6, Math.floor((py / bh) * 7));
        const row = bitmap[gy];
        for (let px = 0; px < bw; px++) {
          const gx = Math.min(4, Math.floor((px / bw) * 5));
          const on = (row & (1 << (4 - gx))) !== 0;
          if (!on) continue;
          const i = ((y0 + py) * width + (x0 + px)) * 4;
          dst[i] = fg[0];
          dst[i + 1] = fg[1];
          dst[i + 2] = fg[2];
          // keep alpha 255
        }
      }
    }
  }

  return out;
}
