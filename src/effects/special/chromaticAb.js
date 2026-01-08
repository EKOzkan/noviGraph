/**
 * Chromatic aberration effect (channel splitting).
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { samplePixel } from '../utils/transforms.js';

/**
 * Apply chromatic aberration.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.redShiftX=0] - Red channel X offset (-50 to 50)
 * @param {number} [options.redShiftY=0] - Red channel Y offset (-50 to 50)
 * @param {number} [options.blueShiftX=0] - Blue channel X offset (-50 to 50)
 * @param {number} [options.blueShiftY=0] - Blue channel Y offset (-50 to 50)
 * @param {boolean} [options.wrap=false] - Wrap pixels instead of extending
 * @returns {ImageData} Chromatic aberration image data
 */
export function chromaticAb(imageData, options = {}) {
  assertImageDataLike(imageData);

  const redShiftX = clamp(options.redShiftX ?? 0, -50, 50) / imageData.width;
  const redShiftY = clamp(options.redShiftY ?? 0, -50, 50) / imageData.height;
  const blueShiftX = clamp(options.blueShiftX ?? 0, -50, 50) / imageData.width;
  const blueShiftY = clamp(options.blueShiftY ?? 0, -50, 50) / imageData.height;
  const wrap = options.wrap ?? false;

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const ny = y / height;

      // Sample red channel with offset
      let redX = nx - redShiftX;
      let redY = ny - redShiftY;
      if (wrap) {
        redX = ((redX % 1) + 1) % 1;
        redY = ((redY % 1) + 1) % 1;
      }
      const [r] = samplePixel(src, width, height, redX, redY, 'bilinear');

      // Sample green channel (no offset)
      const [g] = samplePixel(src, width, height, nx, ny, 'bilinear');

      // Sample blue channel with offset
      let blueX = nx + blueShiftX;
      let blueY = ny + blueShiftY;
      if (wrap) {
        blueX = ((blueX % 1) + 1) % 1;
        blueY = ((blueY % 1) + 1) % 1;
      }
      const [b, a] = samplePixel(src, width, height, blueX, blueY, 'bilinear');

      const idx = (y * width + x) * 4;
      out[idx] = r;
      out[idx + 1] = g;
      out[idx + 2] = b;
      out[idx + 3] = a;
    }
  }

  return new ImageData(out, width, height);
}
