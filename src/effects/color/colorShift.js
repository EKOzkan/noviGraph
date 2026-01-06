/**
 * Color shifting utilities (hue rotation + channel offsets).
 */

import { assertImageDataLike, clampByte, createImageData, clamp } from '../utils/imageData.js';
import { rgbToHsl, hslToRgb } from '../utils/color.js';

/**
 * Color shift.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.hue=0] - Hue rotation in degrees (range: -180 to 180)
 * @param {number} [options.saturation=0] - Saturation adjustment (range: -1 to 1)
 * @param {number} [options.lightness=0] - Lightness adjustment (range: -1 to 1)
 * @param {number} [options.redShift=0] - Red channel offset (range: -255 to 255)
 * @param {number} [options.greenShift=0] - Green channel offset (range: -255 to 255)
 * @param {number} [options.blueShift=0] - Blue channel offset (range: -255 to 255)
 * @returns {ImageData} Processed image data
 */
export function colorShift(imageData, options = {}) {
  assertImageDataLike(imageData);

  const {
    hue = 0,
    saturation = 0,
    lightness = 0,
    redShift = 0,
    greenShift = 0,
    blueShift = 0,
  } = options;

  const hShift = clamp(hue, -180, 180);
  const sat = clamp(saturation, -1, 1);
  const lig = clamp(lightness, -1, 1);

  const rs = clamp(redShift, -255, 255);
  const gs = clamp(greenShift, -255, 255);
  const bs = clamp(blueShift, -255, 255);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    let [h, s, l] = rgbToHsl(r, g, b);
    h += hShift;
    s = clamp(s + sat, 0, 1);
    l = clamp(l + lig, 0, 1);

    let [nr, ng, nb] = hslToRgb(h, s, l);

    nr = clampByte(nr + rs);
    ng = clampByte(ng + gs);
    nb = clampByte(nb + bs);

    dst[i] = nr;
    dst[i + 1] = ng;
    dst[i + 2] = nb;
    dst[i + 3] = src[i + 3];
  }

  return out;
}
