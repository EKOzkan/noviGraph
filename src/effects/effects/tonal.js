/**
 * Tonal/levels adjustments (brightness, contrast, gamma, saturation).
 */

import { assertImageDataLike, clampByte, createImageData, clamp } from '../utils/imageData.js';
import { rgbToHsl, hslToRgb } from '../utils/color.js';

/**
 * Tonal adjustments.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.brightness=0] - Brightness adjustment (range: -1 to 1)
 * @param {number} [options.contrast=0] - Contrast adjustment (range: -1 to 1)
 * @param {number} [options.gamma=1] - Gamma correction (range: 0.1 to 5)
 * @param {number} [options.blackPoint=0] - Input black point (range: 0-255)
 * @param {number} [options.whitePoint=255] - Input white point (range: 0-255)
 * @param {number} [options.saturation=0] - Saturation adjustment (range: -1 to 1)
 * @returns {ImageData} Processed image data
 */
export function tonal(imageData, options = {}) {
  assertImageDataLike(imageData);

  const brightness = clamp(options.brightness ?? 0, -1, 1) * 255;
  const contrast = clamp(options.contrast ?? 0, -1, 1);
  const gamma = clamp(options.gamma ?? 1, 0.1, 5);
  const blackPoint = clamp(options.blackPoint ?? 0, 0, 255);
  const whitePoint = clamp(options.whitePoint ?? 255, 0, 255);
  const saturation = clamp(options.saturation ?? 0, -1, 1);

  const levelDen = Math.max(1, whitePoint - blackPoint);
  const contrastFactor = 1 + contrast;

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    let r = src[i];
    let g = src[i + 1];
    let b = src[i + 2];

    // Levels
    r = ((r - blackPoint) / levelDen) * 255;
    g = ((g - blackPoint) / levelDen) * 255;
    b = ((b - blackPoint) / levelDen) * 255;

    // Brightness
    r += brightness;
    g += brightness;
    b += brightness;

    // Contrast
    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;

    // Gamma (use 1/gamma so gamma>1 darkens less)
    r = 255 * Math.pow(clamp(r / 255, 0, 1), 1 / gamma);
    g = 255 * Math.pow(clamp(g / 255, 0, 1), 1 / gamma);
    b = 255 * Math.pow(clamp(b / 255, 0, 1), 1 / gamma);

    if (saturation !== 0) {
      let [h, s, l] = rgbToHsl(r, g, b);
      s = clamp(s + saturation, 0, 1);
      [r, g, b] = hslToRgb(h, s, l);
    }

    dst[i] = clampByte(Math.round(r));
    dst[i + 1] = clampByte(Math.round(g));
    dst[i + 2] = clampByte(Math.round(b));
    dst[i + 3] = src[i + 3];
  }

  return out;
}
