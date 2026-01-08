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
 */
export function average(r, g, b) {
  return (r + g + b) / 3;
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

/**
 * RGB to HSV conversion.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {[number, number, number]} h,s,v where h in [0,360), s/v in [0,1]
 */
export function rgbToHsv(r, g, b) {
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

  const s = max === 0 ? 0 : d / max;
  const v = max;

  return [h, s, v];
}

/**
 * HSV to RGB conversion.
 * @param {number} h
 * @param {number} s
 * @param {number} v
 * @returns {[number, number, number]} r,g,b in [0,255]
 */
export function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 1);
  v = clamp(v, 0, 1);

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rp = 0, gp = 0, bp = 0;

  if (h < 60) {
    rp = c; gp = x;
  } else if (h < 120) {
    rp = x; gp = c;
  } else if (h < 180) {
    gp = c; bp = x;
  } else if (h < 240) {
    gp = x; bp = c;
  } else if (h < 300) {
    rp = x; bp = c;
  } else {
    rp = c; bp = x;
  }

  return [clampByte((rp + m) * 255), clampByte((gp + m) * 255), clampByte((bp + m) * 255)];
}

/**
 * RGB to LAB conversion.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {[number, number, number]} L,a,b where L in [0,100], a,b in [-128,127]
 */
export function rgbToLab(r, g, b) {
  // First convert to XYZ
  let rn = r / 255;
  let gn = g / 255;
  let bn = b / 255;

  rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
  gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
  bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;

  const x = rn * 0.4124564 + gn * 0.3575761 + bn * 0.1804375;
  const y = rn * 0.2126729 + gn * 0.7151522 + bn * 0.0721750;
  const z = rn * 0.0193339 + gn * 0.1191920 + bn * 0.9503041;

  // Reference white D65
  const xn = x / 0.95047;
  const yn = y / 1.00000;
  const zn = z / 1.08883;

  const fx = xn > 0.008856 ? Math.pow(xn, 1/3) : (7.787 * xn) + (16/116);
  const fy = yn > 0.008856 ? Math.pow(yn, 1/3) : (7.787 * yn) + (16/116);
  const fz = zn > 0.008856 ? Math.pow(zn, 1/3) : (7.787 * zn) + (16/116);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b_ = 200 * (fy - fz);

  return [L, a, b_];
}

/**
 * LAB to RGB conversion.
 * @param {number} L
 * @param {number} a
 * @param {number} b_
 * @returns {[number, number, number]} r,g,b in [0,255]
 */
export function labToRgb(L, a, b_) {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b_ / 200;

  const xn = fx > 0.206897 ? fx * fx * fx : (fx - 16/116) / 7.787;
  const yn = fy > 0.206897 ? fy * fy * fy : (fy - 16/116) / 7.787;
  const zn = fz > 0.206897 ? fz * fz * fz : (fz - 16/116) / 7.787;

  const x = xn * 0.95047;
  const y = yn * 1.00000;
  const z = zn * 1.08883;

  let r = x * 3.2404542 - y * 1.5371385 - z * 0.4985314;
  let g = -x * 0.9692660 + y * 1.8760108 + z * 0.0415560;
  let b = x * 0.0556434 - y * 0.2040259 + z * 1.0572252;

  // Apply gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1/2.4) - 0.055 : 12.92 * b;

  return [clampByte(r * 255), clampByte(g * 255), clampByte(b * 255)];
}

/**
 * RGB to LCH conversion.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {[number, number, number]} L,C,H where L in [0,100], C in [0,100+], H in [0,360)
 */
export function rgbToLch(r, g, b) {
  const [L, a, b_] = rgbToLab(r, g, b);
  const C = Math.sqrt(a * a + b_ * b_);
  let H = Math.atan2(b_, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return [L, C, H];
}

/**
 * LCH to RGB conversion.
 * @param {number} L
 * @param {number} C
 * @param {number} H
 * @returns {[number, number, number]} r,g,b in [0,255]
 */
export function lchToRgb(L, C, H) {
  const Hrad = H * (Math.PI / 180);
  const a = C * Math.cos(Hrad);
  const b_ = C * Math.sin(Hrad);
  return labToRgb(L, a, b_);
}
