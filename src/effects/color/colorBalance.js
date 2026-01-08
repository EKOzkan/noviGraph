/**
 * Color balance effect with shadow/midtone/highlight adjustments.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { luminance } from '../utils/color.js';

/**
 * Apply color balance to image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.shadowsCyan=0] - Cyan/red in shadows (-100 to 100)
 * @param {number} [options.shadowsMagenta=0] - Magenta/green in shadows (-100 to 100)
 * @param {number} [options.shadowsYellow=0] - Yellow/blue in shadows (-100 to 100)
 * @param {number} [options.midtonesCyan=0] - Cyan/red in midtones (-100 to 100)
 * @param {number} [options.midtonesMagenta=0] - Magenta/green in midtones (-100 to 100)
 * @param {number} [options.midtonesYellow=0] - Yellow/blue in midtones (-100 to 100)
 * @param {number} [options.highlightsCyan=0] - Cyan/red in highlights (-100 to 100)
 * @param {number} [options.highlightsMagenta=0] - Magenta/green in highlights (-100 to 100)
 * @param {number} [options.highlightsYellow=0] - Yellow/blue in highlights (-100 to 100)
 * @param {boolean} [options.preserveLuminosity=true] - Preserve overall luminosity
 * @returns {ImageData} Processed image data
 */
export function colorBalance(imageData, options = {}) {
  assertImageDataLike(imageData);

  const {
    shadowsCyan = 0,
    shadowsMagenta = 0,
    shadowsYellow = 0,
    midtonesCyan = 0,
    midtonesMagenta = 0,
    midtonesYellow = 0,
    highlightsCyan = 0,
    highlightsMagenta = 0,
    highlightsYellow = 0,
    preserveLuminosity = true,
  } = options;

  const out = createImageData(imageData.width, imageData.height);
  const src = imageData.data;
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    let r = src[i];
    let g = src[i + 1];
    let b = src[i + 2];

    const lum = luminance(r, g, b) / 255;

    // Calculate weights for shadow, midtone, highlight
    let shadowWeight = 0, midtoneWeight = 0, highlightWeight = 0;

    if (lum < 0.5) {
      shadowWeight = 1 - (lum * 2);
      midtoneWeight = 1 - shadowWeight;
    } else {
      highlightWeight = (lum - 0.5) * 2;
      midtoneWeight = 1 - highlightWeight;
    }

    // Apply shadow adjustments (cyan/red, magenta/green, yellow/blue)
    r += shadowsCyan * shadowWeight;
    g += shadowsCyan * shadowWeight;
    b -= shadowsCyan * shadowWeight;

    r += shadowsMagenta * shadowWeight;
    g -= shadowsMagenta * shadowWeight;
    b += shadowsMagenta * shadowWeight;

    r -= shadowsYellow * shadowWeight;
    g += shadowsYellow * shadowWeight;
    b += shadowsYellow * shadowWeight;

    // Apply midtone adjustments
    r += midtonesCyan * midtoneWeight;
    g += midtonesCyan * midtoneWeight;
    b -= midtonesCyan * midtoneWeight;

    r += midtonesMagenta * midtoneWeight;
    g -= midtonesMagenta * midtoneWeight;
    b += midtonesMagenta * midtoneWeight;

    r -= midtonesYellow * midtoneWeight;
    g += midtonesYellow * midtoneWeight;
    b += midtonesYellow * midtoneWeight;

    // Apply highlight adjustments
    r += highlightsCyan * highlightWeight;
    g += highlightsCyan * highlightWeight;
    b -= highlightsCyan * highlightWeight;

    r += highlightsMagenta * highlightWeight;
    g -= highlightsMagenta * highlightWeight;
    b += highlightsMagenta * highlightWeight;

    r -= highlightsYellow * highlightWeight;
    g += highlightsYellow * highlightWeight;
    b += highlightsYellow * highlightWeight;

    // Preserve luminosity if requested
    if (preserveLuminosity) {
      const newLum = luminance(r, g, b);
      const oldLum = luminance(src[i], src[i + 1], src[i + 2]);
      if (newLum > 0) {
        const scale = oldLum / newLum;
        r *= scale;
        g *= scale;
        b *= scale;
      }
    }

    dst[i] = clamp(r, 0, 255);
    dst[i + 1] = clamp(g, 0, 255);
    dst[i + 2] = clamp(b, 0, 255);
    dst[i + 3] = src[i + 3];
  }

  return out;
}
