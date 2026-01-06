/**
 * Generic error-diffusion dithering.
 */

import { assertImageDataLike, clampByte, createImageData } from '../utils/imageData.js';
import { nearestPaletteColor } from '../utils/color.js';
import { bw as defaultBwPalette } from '../palettes/index.js';

/**
 * @typedef {Object} DiffusionEntry
 * @property {number} dx
 * @property {number} dy
 * @property {number} weight
 */

/**
 * Error diffusion dithering with a configurable diffusion matrix.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {Array<[number,number,number]>} [options.palette] - Output palette as RGB triplets (default: black/white)
 * @param {Array<DiffusionEntry>} options.matrix - Diffusion entries (dx, dy, weight); weights should sum to 1
 * @param {boolean} [options.serpentine=true] - Alternate scan direction per row
 * @param {number} [options.intensity=1] - Error diffusion strength (range: 0-1)
 * @returns {ImageData} Processed image data
 */
export function errorDiffusion(imageData, options = {}) {
  assertImageDataLike(imageData);

  const {
    palette = defaultBwPalette,
    matrix,
    serpentine = true,
    intensity = 1,
  } = options;

  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error('errorDiffusion: options.matrix is required and must be a non-empty array.');
  }

  const width = imageData.width;
  const height = imageData.height;

  // Work buffer as floats for diffusion.
  const work = new Float32Array(width * height * 3);
  for (let i = 0, p = 0; i < imageData.data.length; i += 4, p += 3) {
    work[p] = imageData.data[i];
    work[p + 1] = imageData.data[i + 1];
    work[p + 2] = imageData.data[i + 2];
  }

  const out = createImageData(width, height);
  const outData = out.data;

  const strength = Math.max(0, Math.min(1, intensity));

  for (let y = 0; y < height; y++) {
    const leftToRight = !serpentine || y % 2 === 0;
    const xStart = leftToRight ? 0 : width - 1;
    const xEnd = leftToRight ? width : -1;
    const xStep = leftToRight ? 1 : -1;

    for (let x = xStart; x !== xEnd; x += xStep) {
      const pixIndex = y * width + x;
      const wIdx = pixIndex * 3;

      const r = work[wIdx];
      const g = work[wIdx + 1];
      const b = work[wIdx + 2];

      const [nr, ng, nb] = nearestPaletteColor(r, g, b, palette);

      const outIdx = pixIndex * 4;
      outData[outIdx] = nr;
      outData[outIdx + 1] = ng;
      outData[outIdx + 2] = nb;
      outData[outIdx + 3] = imageData.data[outIdx + 3];

      const er = (r - nr) * strength;
      const eg = (g - ng) * strength;
      const eb = (b - nb) * strength;

      for (let m = 0; m < matrix.length; m++) {
        const entry = matrix[m];
        const dx = leftToRight ? entry.dx : -entry.dx;
        const nx = x + dx;
        const ny = y + entry.dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

        const nPix = ny * width + nx;
        const nIdx = nPix * 3;
        const w = entry.weight;

        work[nIdx] += er * w;
        work[nIdx + 1] += eg * w;
        work[nIdx + 2] += eb * w;
      }
    }
  }

  // Clamp output (work buffer can go out of range). Output is already palette
  // colors, but alpha was copied from input.
  for (let i = 0; i < outData.length; i += 4) {
    outData[i] = clampByte(outData[i]);
    outData[i + 1] = clampByte(outData[i + 1]);
    outData[i + 2] = clampByte(outData[i + 2]);
  }

  return out;
}
