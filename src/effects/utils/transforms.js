/**
 * Geometric transformation utilities.
 */

import { clampByte } from './imageData.js';

/**
 * Sample pixel at normalized coordinates with interpolation.
 *
 * @param {Uint8ClampedArray} src - Source image data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} x - Normalized x coordinate (0-1)
 * @param {number} y - Normalized y coordinate (0-1)
 * @param {string} interpolation - 'nearest' or 'bilinear'
 * @returns {[number, number, number, number]} RGBA values
 */
export function samplePixel(src, width, height, x, y, interpolation = 'bilinear') {
  // Wrap or clamp based on mode
  const px = Math.max(0, Math.min(width - 1, x * width));
  const py = Math.max(0, Math.min(height - 1, y * height));

  if (interpolation === 'nearest') {
    const ix = Math.round(px);
    const iy = Math.round(py);
    const i = (iy * width + ix) * 4;
    return [src[i], src[i + 1], src[i + 2], src[i + 3]];
  }

  // Bilinear interpolation
  const x1 = Math.floor(px);
  const y1 = Math.floor(py);
  const x2 = Math.min(width - 1, x1 + 1);
  const y2 = Math.min(height - 1, y1 + 1);

  const fx = px - x1;
  const fy = py - y1;

  const i11 = (y1 * width + x1) * 4;
  const i12 = (y1 * width + x2) * 4;
  const i21 = (y2 * width + x1) * 4;
  const i22 = (y2 * width + x2) * 4;

  const r = lerp(lerp(src[i11], src[i12], fx), lerp(src[i21], src[i22], fx), fy);
  const g = lerp(lerp(src[i11 + 1], src[i12 + 1], fx), lerp(src[i21 + 1], src[i22 + 1], fx), fy);
  const b = lerp(lerp(src[i11 + 2], src[i12 + 2], fx), lerp(src[i21 + 2], src[i22 + 2], fx), fy);
  const a = lerp(lerp(src[i11 + 3], src[i12 + 3], fx), lerp(src[i21 + 3], src[i22 + 3], fx), fy);

  return [r, g, b, a];
}

/**
 * Linear interpolation.
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Apply affine transformation to image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Transformation options
 * @param {number[]} [options.matrix] - 3x3 transformation matrix
 * @param {string} [options.interpolation='bilinear'] - Interpolation method
 * @param {string} [options.fillMode='transparent'] - Fill mode for out-of-bounds
 * @returns {ImageData} Transformed image data
 */
export function applyAffineTransform(imageData, options = {}) {
  const { matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1], interpolation = 'bilinear', fillMode = 'transparent' } = options;
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  // Inverse transform for sampling
  const [a, b, c, d, e, f, g, h, i] = matrix;
  const det = a * e * i + b * f * g + c * d * h - c * e * g - b * d * i - a * f * h;

  if (Math.abs(det) < 0.0001) {
    // Degenerate transform, return original
    return new ImageData(src, width, height);
  }

  const invDet = 1 / det;
  const inv = [
    (e * i - f * h) * invDet,
    (c * h - b * i) * invDet,
    (b * f - c * e) * invDet,
    (f * g - d * i) * invDet,
    (a * i - c * g) * invDet,
    (c * d - a * f) * invDet,
    (d * h - e * g) * invDet,
    (b * g - a * h) * invDet,
    (a * e - b * d) * invDet,
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Inverse transform to find source coordinates
      const nx = (x / width) * 2 - 1;
      const ny = (y / height) * 2 - 1;

      const sx = inv[0] * nx + inv[1] * ny + inv[2];
      const sy = inv[3] * nx + inv[4] * ny + inv[5];

      // Convert back to normalized coordinates
      const srcX = (sx + 1) / 2;
      const srcY = (sy + 1) / 2;

      const idx = (y * width + x) * 4;

      if (srcX < 0 || srcX > 1 || srcY < 0 || srcY > 1) {
        if (fillMode === 'transparent') {
          out[idx] = 0;
          out[idx + 1] = 0;
          out[idx + 2] = 0;
          out[idx + 3] = 0;
        } else if (fillMode === 'clamp') {
          const [r, g, b, a] = samplePixel(src, width, height, srcX, srcY, interpolation);
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = a;
        } else {
          // Wrap
          const wx = ((srcX % 1) + 1) % 1;
          const wy = ((srcY % 1) + 1) % 1;
          const [r, g, b, a] = samplePixel(src, width, height, wx, wy, interpolation);
          out[idx] = r;
          out[idx + 1] = g;
          out[idx + 2] = b;
          out[idx + 3] = a;
        }
      } else {
        const [r, g, b, a] = samplePixel(src, width, height, srcX, srcY, interpolation);
        out[idx] = r;
        out[idx + 1] = g;
        out[idx + 2] = b;
        out[idx + 3] = a;
      }
    }
  }

  return new ImageData(out, width, height);
}

/**
 * Create rotation matrix.
 *
 * @param {number} angle - Rotation angle in degrees
 * @returns {number[]} 3x3 rotation matrix
 */
export function createRotationMatrix(angle) {
  const rad = angle * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [cos, -sin, 0, sin, cos, 0, 0, 0, 1];
}

/**
 * Create scale matrix.
 *
 * @param {number} sx - X scale
 * @param {number} sy - Y scale
 * @param {number} anchorX - X anchor (0-1)
 * @param {number} anchorY - Y anchor (0-1)
 * @returns {number[]} 3x3 scale matrix
 */
export function createScaleMatrix(sx, sy, anchorX = 0.5, anchorY = 0.5) {
  const tx = (1 - sx) * anchorX;
  const ty = (1 - sy) * anchorY;
  return [sx, 0, tx, 0, sy, ty, 0, 0, 1];
}

/**
 * Create translation matrix.
 *
 * @param {number} tx - X translation
 * @param {number} ty - Y translation
 * @returns {number[]} 3x3 translation matrix
 */
export function createTranslationMatrix(tx, ty) {
  return [1, 0, tx, 0, 1, ty, 0, 0, 1];
}

/**
 * Create skew matrix.
 *
 * @param {number} skewX - X skew in degrees
 * @param {number} skewY - Y skew in degrees
 * @returns {number[]} 3x3 skew matrix
 */
export function createSkewMatrix(skewX, skewY) {
  const tx = Math.tan(skewX * Math.PI / 180);
  const ty = Math.tan(skewY * Math.PI / 180);
  return [1, tx, 0, ty, 1, 0, 0, 0, 1];
}

/**
 * Multiply two 3x3 matrices.
 */
export function multiplyMatrices(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
    a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
    a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
    a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
    a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
    a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
    a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}

/**
 * Flip image horizontally and/or vertically.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Flip options
 * @param {boolean} [options.horizontal=false] - Flip horizontally
 * @param {boolean} [options.vertical=false] - Flip vertically
 * @returns {ImageData} Flipped image data
 */
export function flip(imageData, options = {}) {
  const { horizontal = false, vertical = false } = options;
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sx = horizontal ? width - 1 - x : x;
      const sy = vertical ? height - 1 - y : y;

      const srcIdx = (sy * width + sx) * 4;
      const dstIdx = (y * width + x) * 4;

      out[dstIdx] = src[srcIdx];
      out[dstIdx + 1] = src[srcIdx + 1];
      out[dstIdx + 2] = src[srcIdx + 2];
      out[dstIdx + 3] = src[srcIdx + 3];
    }
  }

  return new ImageData(out, width, height);
}

/**
 * Shift image with wrap/clamp modes.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Shift options
 * @param {number} [options.offsetX=0] - X offset in pixels
 * @param {number} [options.offsetY=0] - Y offset in pixels
 * @param {string} [options.wrapMode='transparent'] - 'clamp', 'wrap', or 'transparent'
 * @returns {ImageData} Shifted image data
 */
export function shift(imageData, options = {}) {
  const { offsetX = 0, offsetY = 0, wrapMode = 'transparent' } = options;
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sx = x - offsetX;
      let sy = y - offsetY;

      const dstIdx = (y * width + x) * 4;

      if (wrapMode === 'wrap') {
        sx = ((sx % width) + width) % width;
        sy = ((sy % height) + height) % height;
        const srcIdx = (sy * width + sx) * 4;
        out[dstIdx] = src[srcIdx];
        out[dstIdx + 1] = src[srcIdx + 1];
        out[dstIdx + 2] = src[srcIdx + 2];
        out[dstIdx + 3] = src[srcIdx + 3];
      } else if (wrapMode === 'clamp') {
        sx = Math.max(0, Math.min(width - 1, sx));
        sy = Math.max(0, Math.min(height - 1, sy));
        const srcIdx = (sy * width + sx) * 4;
        out[dstIdx] = src[srcIdx];
        out[dstIdx + 1] = src[srcIdx + 1];
        out[dstIdx + 2] = src[srcIdx + 2];
        out[dstIdx + 3] = src[srcIdx + 3];
      } else {
        // Transparent
        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          const srcIdx = (sy * width + sx) * 4;
          out[dstIdx] = src[srcIdx];
          out[dstIdx + 1] = src[srcIdx + 1];
          out[dstIdx + 2] = src[srcIdx + 2];
          out[dstIdx + 3] = src[srcIdx + 3];
        } else {
          out[dstIdx] = 0;
          out[dstIdx + 1] = 0;
          out[dstIdx + 2] = 0;
          out[dstIdx + 3] = 0;
        }
      }
    }
  }

  return new ImageData(out, width, height);
}
