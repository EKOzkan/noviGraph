/**
 * Hue/Saturation/Lightness adjustment effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { rgbToHsl, hslToRgb } from '../utils/color.js';

/**
 * Adjust hue, saturation, and lightness.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.hue=0] - Hue rotation in degrees (-180 to 180)
 * @param {number} [options.saturation=0] - Saturation adjustment (-1 to 1)
 * @param {number} [options.lightness=0] - Lightness adjustment (-1 to 1)
 * @param {boolean} [options.colorize=false] - Apply single hue tint
 * @param {number} [options.hueTarget=0] - Target hue when colorizing (0-360)
 * @returns {ImageData} Processed image data
 */
export function hueSaturation(imageData, options = {}) {
  assertImageDataLike(imageData);

  const {
    hue = 0,
    saturation = 0,
    lightness = 0,
    colorize = false,
    hueTarget = 0,
  } = options;

  const hShift = clamp(hue, -180, 180);
  const sShift = clamp(saturation, -1, 1);
  const lShift = clamp(lightness, -1, 1);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    let [h, s, l] = rgbToHsl(r, g, b);

    if (colorize) {
      // Replace hue with target
      h = hueTarget;
      // Increase saturation
      s = clamp(s + 0.3, 0, 1);
    } else {
      // Rotate hue
      h = (h + hShift + 360) % 360;
      // Adjust saturation
      s = clamp(s + sShift, 0, 1);
    }

    // Adjust lightness
    l = clamp(l + lShift, 0, 1);

    const [nr, ng, nb] = hslToRgb(h, s, l);

    dst[i] = nr;
    dst[i + 1] = ng;
    dst[i + 2] = nb;
    dst[i + 3] = src[i + 3];
  }

  return out;
}
