/**
 * Film grain / noise.
 */

import { assertImageDataLike, clampByte, createImageData, clamp } from '../utils/imageData.js';
import { createRng } from '../utils/random.js';

/**
 * Add grain/noise to an image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=0.2] - Noise amount (range: 0-1)
 * @param {boolean} [options.monochrome=true] - If true, add the same noise to RGB
 * @param {number|null} [options.seed=null] - Seed for deterministic noise (optional)
 * @param {number} [options.Size_=1] - Pixel size scaling (1-32, default 1)
 * @returns {ImageData} Processed image data
 */
export function grain(imageData, options = {}) {
  assertImageDataLike(imageData);

  const amount = clamp(options.amount ?? 0.2, 0, 1);
  const monochrome = options.monochrome ?? true;
  const rng = createRng(options.seed ?? null);
  const Size_ = clamp(options.Size_ ?? 1, 1, 32);

  const width = imageData.width;
  const height = imageData.height;
  const out = createImageData(width, height);
  const src = imageData.data;
  const dst = out.data;

  const amp = amount * 255;

  if (Size_ <= 1) {
    // No pixelation - direct noise
    for (let i = 0; i < src.length; i += 4) {
      if (monochrome) {
        const n = (rng() * 2 - 1) * amp;
        dst[i] = clampByte(src[i] + n);
        dst[i + 1] = clampByte(src[i + 1] + n);
        dst[i + 2] = clampByte(src[i + 2] + n);
      } else {
        dst[i] = clampByte(src[i] + (rng() * 2 - 1) * amp);
        dst[i + 1] = clampByte(src[i + 1] + (rng() * 2 - 1) * amp);
        dst[i + 2] = clampByte(src[i + 2] + (rng() * 2 - 1) * amp);
      }
      dst[i + 3] = src[i + 3];
    }
  } else {
    // Apply pixelation first, then noise
    const blockWidth = Math.ceil(width / Size_);
    const blockHeight = Math.ceil(height / Size_);

    // Downsample
    for (let by = 0; by < blockHeight; by++) {
      for (let bx = 0; bx < blockWidth; bx++) {
        // Sample center pixel
        const sx = Math.floor(bx * Size_ + Size_ / 2);
        const sy = Math.floor(by * Size_ + Size_ / 2);

        const si = (Math.min(sy, height - 1) * width + Math.min(sx, width - 1)) * 4;

        // Generate noise for this block
        let nr, ng, nb;
        if (monochrome) {
          const n = (rng() * 2 - 1) * amp;
          nr = clampByte(src[si] + n);
          ng = clampByte(src[si + 1] + n);
          nb = clampByte(src[si + 2] + n);
        } else {
          nr = clampByte(src[si] + (rng() * 2 - 1) * amp);
          ng = clampByte(src[si + 1] + (rng() * 2 - 1) * amp);
          nb = clampByte(src[si + 2] + (rng() * 2 - 1) * amp);
        }

        // Upsample to block
        for (let py = 0; py < Size_; py++) {
          for (let px = 0; px < Size_; px++) {
            const dy = by * Size_ + py;
            const dx = bx * Size_ + px;
            if (dy < height && dx < width) {
              const di = (dy * width + dx) * 4;
              dst[di] = nr;
              dst[di + 1] = ng;
              dst[di + 2] = nb;
              dst[di + 3] = src[di + 3];
            }
          }
        }
      }
    }
  }

  return out;
}
