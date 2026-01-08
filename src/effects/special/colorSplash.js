/**
 * Color splash effect (keep one color, desaturate rest).
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { rgbToHsl } from '../utils/color.js';

/**
 * Apply color splash.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {string} [options.keepColor='red'] - Color to keep: 'red', 'green', 'blue', 'hue'
 * @param {number} [options.hueRange=30] - Hue range if keepColor='hue' (0-180)
 * @param {number} [options.saturation=1] - Saturation of kept color (0-1)
 * @returns {ImageData} Color splash image data
 */
export function colorSplash(imageData, options = {}) {
  assertImageDataLike(imageData);

  const keepColor = options.keepColor ?? 'red';
  const hueRange = clamp(options.hueRange ?? 30, 0, 180);
  const saturation = clamp(options.saturation ?? 1, 0, 1);

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    let keep = false;
    let [h, s, l] = rgbToHsl(r, g, b);

    if (keepColor === 'red') {
      // Red hue range
      keep = (h >= 0 && h <= 30) || (h >= 330);
    } else if (keepColor === 'green') {
      // Green hue range
      keep = h >= 80 && h <= 160;
    } else if (keepColor === 'blue') {
      // Blue hue range
      keep = h >= 200 && h <= 270;
    } else if (keepColor === 'hue') {
      // Check if pixel is close to specific hue (default red)
      const targetHue = 0;
      let hueDiff = Math.abs(h - targetHue);
      if (hueDiff > 180) hueDiff = 360 - hueDiff;
      keep = hueDiff <= hueRange;
    }

    if (keep) {
      // Keep color but adjust saturation
      s = s * saturation;
      const [nr, ng, nb] = hslToRgb(h, s, l);
      dst[i] = nr;
      dst[i + 1] = ng;
      dst[i + 2] = nb;
    } else {
      // Desaturate
      const gray = (r + g + b) / 3;
      dst[i] = gray;
      dst[i + 1] = gray;
      dst[i + 2] = gray;
    }

    dst[i + 3] = src[i + 3];
  }

  return out;
}

// Helper function
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rp = 0, gp = 0, bp = 0;
  if (h < 60) { rp = c; gp = x; }
  else if (h < 120) { rp = x; gp = c; }
  else if (h < 180) { gp = c; bp = x; }
  else if (h < 240) { gp = x; bp = c; }
  else if (h < 300) { rp = x; bp = c; }
  else { rp = c; bp = x; }

  return [
    Math.round((rp + m) * 255),
    Math.round((gp + m) * 255),
    Math.round((bp + m) * 255)
  ];
}
