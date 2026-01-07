/**
 * Pixelization effect.
 */

import { assertImageDataLike, clampByte, createImageData, clamp } from '../utils/imageData.js';

/**
 * Pixelize an image by replacing each block with a representative color.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.size=8] - Block size in pixels (range: 1-128)
 * @param {'average'|'nearest'} [options.method='average'] - Representative color method
 * @returns {ImageData} Processed image data
 */
export function pixelize(imageData, options = {}) {
  assertImageDataLike(imageData);

  const size = Math.max(1, Math.min(128, (options.size ?? 8) | 0));
  const method = options.method === 'nearest' ? 'nearest' : 'average';

  const { width, height } = imageData;
  const src = imageData.data;
  const out = createImageData(width, height);
  const dst = out.data;

  for (let by = 0; by < height; by += size) {
    for (let bx = 0; bx < width; bx += size) {
      const bw = Math.min(size, width - bx);
      const bh = Math.min(size, height - by);

      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      if (method === 'nearest') {
        const cx = clamp(bx + (bw >> 1), 0, width - 1);
        const cy = clamp(by + (bh >> 1), 0, height - 1);
        const ci = (cy * width + cx) * 4;
        r = src[ci];
        g = src[ci + 1];
        b = src[ci + 2];
        a = src[ci + 3];
      } else {
        for (let y = 0; y < bh; y++) {
          for (let x = 0; x < bw; x++) {
            const i = ((by + y) * width + (bx + x)) * 4;
            r += src[i];
            g += src[i + 1];
            b += src[i + 2];
            a += src[i + 3];
          }
        }
        const count = bw * bh;
        r = r / count;
        g = g / count;
        b = b / count;
        a = a / count;
      }

      const rr = clampByte(Math.round(r));
      const gg = clampByte(Math.round(g));
      const bb = clampByte(Math.round(b));
      const aa = clampByte(Math.round(a));

      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          const i = ((by + y) * width + (bx + x)) * 4;
          dst[i] = rr;
          dst[i + 1] = gg;
          dst[i + 2] = bb;
          dst[i + 3] = aa;
        }
      }
    }
  }

  return out;
}
