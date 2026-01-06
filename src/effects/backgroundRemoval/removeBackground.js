/**
 * Lightweight background removal (static image) using color distance.
 *
 * This is not ML-based segmentation. For higher quality background removal you
 * would typically integrate a model (e.g. MediaPipe Selfie Segmentation).
 */

import { assertImageDataLike, clampByte, createImageData, clamp } from '../utils/imageData.js';
import { dist2, toRgb } from '../utils/color.js';

function sampleCornerAverage(src, width, height) {
  const corners = [
    0,
    (width - 1) * 4,
    (height - 1) * width * 4,
    ((height - 1) * width + (width - 1)) * 4,
  ];

  let r = 0,
    g = 0,
    b = 0;
  for (const i of corners) {
    r += src[i];
    g += src[i + 1];
    b += src[i + 2];
  }
  return [Math.round(r / corners.length), Math.round(g / corners.length), Math.round(b / corners.length)];
}

/**
 * Remove a solid-ish background by setting alpha based on RGB distance.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {string|[number,number,number]|null} [options.backgroundColor=null] - Background RGB/hex. If null, samples corners.
 * @param {number} [options.threshold=60] - Distance threshold (range: 0-441)
 * @param {number} [options.softness=30] - Feather range beyond threshold (range: 0-441)
 * @returns {ImageData} Processed image data
 */
export function removeBackground(imageData, options = {}) {
  assertImageDataLike(imageData);

  const { width, height } = imageData;
  const src = imageData.data;

  const bg = options.backgroundColor == null ? sampleCornerAverage(src, width, height) : toRgb(options.backgroundColor);

  // Distances are in squared-space, but user thresholds are in linear-ish space.
  const threshold = clamp(options.threshold ?? 60, 0, 441);
  const softness = clamp(options.softness ?? 30, 0, 441);

  const thr2 = threshold * threshold;
  const soft2 = (threshold + softness) * (threshold + softness);

  const out = createImageData(width, height);
  const dst = out.data;

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];
    const a = src[i + 3];

    const d2 = dist2(r, g, b, bg[0], bg[1], bg[2]);

    let alphaScale = 1;
    if (d2 <= thr2) {
      alphaScale = 0;
    } else if (softness > 0 && d2 < soft2) {
      // Smoothly ramp alpha from 0..1 between threshold and threshold+softness.
      const t = (Math.sqrt(d2) - threshold) / softness;
      alphaScale = clamp(t, 0, 1);
    }

    dst[i] = r;
    dst[i + 1] = g;
    dst[i + 2] = b;
    dst[i + 3] = clampByte(Math.round(a * alphaScale));
  }

  return out;
}
