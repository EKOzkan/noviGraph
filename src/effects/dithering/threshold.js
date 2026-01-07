/**
 * Threshold dithering (binary or multi-level quantization).
 */

import { assertImageDataLike, clampByte, createImageData } from '../utils/imageData.js';
import { luminance } from '../utils/color.js';
import { applyPixelSizeEffect } from '../utils/pixelSize.js';

/**
 * Threshold effect.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.threshold=128] - Threshold value (range: 0-255)
 * @param {boolean} [options.grayscale=true] - If true, thresholds luminance; otherwise thresholds each RGB channel
 * @param {boolean} [options.invert=false] - Invert threshold output
 * @param {number} [options.pixelSize=1] - Pixel size for downsample-upsample effect (range: 1-32)
 * @returns {ImageData} Processed image data
 */
export function threshold(imageData, options = {}) {
  const pixelSize = options.pixelSize ?? 1;

  const doThreshold = (img, opts) => {
    assertImageDataLike(img);

    const {
      threshold: t = 128,
      grayscale = true,
      invert = false,
    } = opts;

    const thr = Math.max(0, Math.min(255, t));

    const out = createImageData(img.width, img.height);
    const src = img.data;
    const dst = out.data;

    for (let i = 0; i < src.length; i += 4) {
      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];

      if (grayscale) {
        const l = luminance(r, g, b);
        const v = (l >= thr) ^ invert ? 255 : 0;
        dst[i] = v;
        dst[i + 1] = v;
        dst[i + 2] = v;
      } else {
        const vr = ((r >= thr) ^ invert) ? 255 : 0;
        const vg = ((g >= thr) ^ invert) ? 255 : 0;
        const vb = ((b >= thr) ^ invert) ? 255 : 0;
        dst[i] = clampByte(vr);
        dst[i + 1] = clampByte(vg);
        dst[i + 2] = clampByte(vb);
      }

      dst[i + 3] = src[i + 3];
    }

    return out;
  };

  return applyPixelSizeEffect(imageData, pixelSize, doThreshold, options);
}
