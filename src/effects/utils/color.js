/**
 * Color utilities used across effects.
 */

import { clamp, clampByte } from './imageData.js';

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
export function luminance(r, g, b) {
  // Rec. 709
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {[number, number, number]} h,s,l where h in [0,360), s/l in [0,1]
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  return [h, s, l];
}

/**
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {[number, number, number]} r,g,b in [0,255]
 */
export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 1);
  l = clamp(l, 0, 1);

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rp = 0,
    gp = 0,
    bp = 0;

  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return [clampByte((rp + m) * 255), clampByte((gp + m) * 255), clampByte((bp + m) * 255)];
}

/**
 * @param {string|[number,number,number]} color
 * @returns {[number,number,number]}
 */
export function toRgb(color) {
  if (Array.isArray(color) && color.length >= 3) return [color[0], color[1], color[2]];
  if (typeof color !== 'string') throw new TypeError('Expected color as hex string or [r,g,b].');

  const hex = color.startsWith('#') ? color.slice(1) : color;
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return [r, g, b];
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }
  throw new Error(`Unsupported color format: ${color}`);
}

/**
 * Squared RGB distance (avoid sqrt in hot paths).
 * @param {number} r1
 * @param {number} g1
 * @param {number} b1
 * @param {number} r2
 * @param {number} g2
 * @param {number} b2
 */
export function dist2(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {Array<[number,number,number]>} palette
 * @returns {[number,number,number]}
 */
export function nearestPaletteColor(r, g, b, palette) {
  let best = palette[0];
  let bestD = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const c = palette[i];
    const d = dist2(r, g, b, c[0], c[1], c[2]);
    if (d < bestD) {
      bestD = d;
      best = c;
      if (d === 0) break;
    }
  }
  return best;
}
