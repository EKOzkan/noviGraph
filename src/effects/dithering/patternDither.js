/**
 * Pattern dithering using small repeating dot patterns.
 */

import { assertImageDataLike, createImageData } from '../utils/imageData.js';
import { luminance, toRgb } from '../utils/color.js';
import { applyPixelSizeEffect } from '../utils/pixelSize.js';

// Order pixels are turned on as luminance increases.
const ORDER_2x2 = [
  [0, 0],
  [1, 1],
  [1, 0],
  [0, 1],
];

/**
 * Pattern dithering.
 *
 * Produces a stylized black/white (or foreground/background) dot pattern.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.scale=1] - Pattern scale multiplier (range: 1-16)
 * @param {number} [options.levels=5] - Number of luminance levels (range: 2-5)
 * @param {string|[number,number,number]} [options.foreground='#000000'] - Foreground color
 * @param {string|[number,number,number]} [options.background='#ffffff'] - Background color
 * @param {boolean} [options.invert=false] - Invert luminance mapping
 * @param {number} [options.pixelSize=1] - Pixel size for downsample-upsample effect (range: 1-32)
 * @returns {ImageData} Processed image data
 */
export function patternDither(imageData, options = {}) {
  const pixelSize = options.pixelSize ?? 1;

  const doDither = (img, opts) => {
    assertImageDataLike(img);

    const {
      scale = 1,
      levels = 5,
      foreground = '#000000',
      background = '#ffffff',
      invert = false,
    } = opts;

    const s = Math.max(1, Math.min(16, scale | 0));
    const lv = Math.max(2, Math.min(5, levels | 0));

    const fg = toRgb(foreground);
    const bg = toRgb(background);

    const out = createImageData(img.width, img.height);
    const src = img.data;
    const dst = out.data;

    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const i = (y * img.width + x) * 4;
        const r = src[i];
        const g = src[i + 1];
        const b = src[i + 2];

        let l = luminance(r, g, b) / 255;
        if (invert) l = 1 - l;

        // Map to 0..(lv-1) then to number of filled pixels in 2x2.
        const level = Math.round(l * (lv - 1));
        const fillCount = Math.round((level / (lv - 1)) * 4);

        const px = Math.floor(x / s) % 2;
        const py = Math.floor(y / s) % 2;

        let on = false;
        for (let k = 0; k < fillCount; k++) {
          const [ox, oy] = ORDER_2x2[k];
          if (ox === px && oy === py) {
            on = true;
            break;
          }
        }

        const c = on ? fg : bg;
        dst[i] = c[0];
        dst[i + 1] = c[1];
        dst[i + 2] = c[2];
        dst[i + 3] = src[i + 3];
      }
    }

    return out;
  };

  return applyPixelSizeEffect(imageData, pixelSize, doDither, options);
}
