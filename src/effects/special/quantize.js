/**
 * Color quantization effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { dist2, nearestPaletteColor } from '../utils/color.js';
import { threshold } from '../dithering/threshold.js';

/**
 * Quantize image to limited color palette.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.colorCount=16] - Target number of colors (2-256)
 * @param {boolean} [options.dithering=true] - Apply dithering
 * @returns {ImageData} Quantized image data
 */
export function quantize(imageData, options = {}) {
  assertImageDataLike(imageData);

  const colorCount = Math.round(clamp(options.colorCount ?? 16, 2, 256));
  const dithering = options.dithering !== false;

  // Generate palette using simple quantization
  const palette = generatePalette(imageData, colorCount);

  if (dithering) {
    // Apply simple error diffusion
    return quantizeWithDither(imageData, palette);
  } else {
    // Apply simple quantization
    return quantizeSimple(imageData, palette);
  }
}

/**
 * Generate color palette using median cut algorithm.
 */
function generatePalette(imageData, colorCount) {
  const src = imageData.data;
  const colors = [];

  // Collect all unique colors
  for (let i = 0; i < src.length; i += 4) {
    if (src[i + 3] > 128) { // Only opaque pixels
      colors.push([src[i], src[i + 1], src[i + 2]]);
    }
  }

  if (colors.length === 0) {
    return [[0, 0, 0]];
  }

  // Simple uniform quantization fallback
  if (colorCount >= colors.length) {
    return colors.map(c => [c[0], c[1], c[2]]);
  }

  // Simple approach: uniform distribution across color space
  const step = Math.ceil(256 / Math.pow(colorCount, 1/3));
  const palette = [];

  for (let r = 0; r < 256; r += step) {
    for (let g = 0; g < 256; g += step) {
      for (let b = 0; b < 256; b += step) {
        if (palette.length >= colorCount) break;
        palette.push([r, g, b]);
      }
      if (palette.length >= colorCount) break;
    }
    if (palette.length >= colorCount) break;
  }

  return palette;
}

/**
 * Simple quantization without dithering.
 */
function quantizeSimple(imageData, palette) {
  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const [r, g, b] = nearestPaletteColor(src[i], src[i + 1], src[i + 2], palette);
    dst[i] = r;
    dst[i + 1] = g;
    dst[i + 2] = b;
    dst[i + 3] = src[i + 3];
  }

  return out;
}

/**
 * Quantize with simple error diffusion.
 */
function quantizeWithDither(imageData, palette) {
  const width = imageData.width;
  const height = imageData.height;
  const src = new Float32Array(imageData.data);
  const out = new Uint8ClampedArray(src.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Quantize each channel
      const [qr, qg, qb] = nearestPaletteColor(
        Math.min(255, Math.max(0, src[idx])),
        Math.min(255, Math.max(0, src[idx + 1])),
        Math.min(255, Math.max(0, src[idx + 2])),
        palette
      );

      // Calculate error
      const er = src[idx] - qr;
      const eg = src[idx + 1] - qg;
      const eb = src[idx + 2] - qb;

      // Set output
      out[idx] = qr;
      out[idx + 1] = qg;
      out[idx + 2] = qb;
      out[idx + 3] = Math.min(255, Math.max(0, src[idx + 3]));

      // Distribute error (Floyd-Steinberg)
      const distribute = (dx, dy, factor) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = (ny * width + nx) * 4;
          src[nidx] += er * factor;
          src[nidx + 1] += eg * factor;
          src[nidx + 2] += eb * factor;
        }
      };

      distribute(1, 0, 7/16);
      distribute(-1, 1, 3/16);
      distribute(0, 1, 5/16);
      distribute(1, 1, 1/16);
    }
  }

  return new ImageData(out, width, height);
}
