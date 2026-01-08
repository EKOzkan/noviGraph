/**
 * Blend modes for combining two images.
 */

import { clampByte } from '../utils/imageData.js';

/**
 * Apply blend mode between base and overlay images.
 *
 * @param {ImageData} base - Base image data
 * @param {ImageData} overlay - Overlay image data
 * @param {Object} options - Effect parameters
 * @param {string} [options.mode='normal'] - Blend mode
 * @param {number} [options.opacity=1] - Opacity (0-1)
 * @returns {ImageData} Blended image data
 */
export function blend(base, overlay, options = {}) {
  const mode = options.mode ?? 'normal';
  const opacity = Math.max(0, Math.min(1, options.opacity ?? 1));

  const width = Math.min(base.width, overlay.width);
  const height = Math.min(base.height, overlay.height);
  const baseData = base.data;
  const overlayData = overlay.data;
  const out = new Uint8ClampedArray(width * height * 4);

  const blendFn = getBlendFunction(mode);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;

    const ba = baseData[idx + 3];
    const oa = overlayData[idx + 3] * opacity;

    const combinedAlpha = ba + oa * (1 - ba / 255);
    const alphaFactor = combinedAlpha > 0 ? 255 / combinedAlpha : 0;

    if (mode === 'normal') {
      out[idx] = blendNormal(baseData[idx], overlayData[idx], ba, oa, alphaFactor);
      out[idx + 1] = blendNormal(baseData[idx + 1], overlayData[idx + 1], ba, oa, alphaFactor);
      out[idx + 2] = blendNormal(baseData[idx + 2], overlayData[idx + 2], ba, oa, alphaFactor);
    } else {
      out[idx] = clampByte(blendFn(baseData[idx], overlayData[idx]) * alphaFactor);
      out[idx + 1] = clampByte(blendFn(baseData[idx + 1], overlayData[idx + 1]) * alphaFactor);
      out[idx + 2] = clampByte(blendFn(baseData[idx + 2], overlayData[idx + 2]) * alphaFactor);
    }

    out[idx + 3] = clampByte(combinedAlpha);
  }

  return new ImageData(out, width, height);
}

function blendNormal(b, o, ba, oa, alphaFactor) {
  return (b * ba + o * oa * (1 - ba / 255)) * alphaFactor / 255;
}

function getBlendFunction(mode) {
  const blendFunctions = {
    normal: (b, o) => o,
    multiply: (b, o) => (b * o) / 255,
    screen: (b, o) => 255 - ((255 - b) * (255 - o)) / 255,
    overlay: (b, o) => b < 128 ? (2 * b * o) / 255 : 255 - (2 * (255 - b) * (255 - o)) / 255,
    'soft-light': (b, o) => o < 128 ? b - ((255 - 2 * o) * b * (255 - b)) / (255 * 255) : b + ((2 * o - 255) * ((b < 128 ? b : 255 - b) * (b < 128 ? b : 255 - b))) / (255 * 255),
    'hard-light': (b, o) => o < 128 ? (2 * b * o) / 255 : 255 - (2 * (255 - b) * (255 - o)) / 255,
    'color-dodge': (b, o) => o === 255 ? 255 : Math.min(255, (b * 255) / (255 - o)),
    'color-burn': (b, o) => o === 0 ? 0 : Math.max(0, 255 - ((255 - b) * 255) / o),
    darken: (b, o) => Math.min(b, o),
    lighten: (b, o) => Math.max(b, o),
    difference: (b, o) => Math.abs(b - o),
    exclusion: (b, o) => b + o - (2 * b * o) / 255,
  };

  return blendFunctions[mode] || blendFunctions.normal;
}

/**
 * HSL-based blend modes.
 */

export function blendHsl(base, overlay, mode, opacity = 1) {
  const width = Math.min(base.width, overlay.width);
  const height = Math.min(base.height, overlay.height);
  const baseData = base.data;
  const overlayData = overlay.data;
  const out = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;

    // Convert base and overlay to HSL
    const [bh, bs, bl] = rgbToHsl(baseData[idx], baseData[idx + 1], baseData[idx + 2]);
    const [oh, os, ol] = rgbToHsl(overlayData[idx], overlayData[idx + 1], overlayData[idx + 2]);

    // Apply blend mode in HSL space
    let [h, s, l] = [bh, bs, bl];

    switch (mode) {
      case 'hue':
        h = oh;
        break;
      case 'saturation':
        s = os;
        break;
      case 'color':
        h = oh;
        s = os;
        break;
      case 'luminosity':
        l = ol;
        break;
    }

    // Convert back to RGB
    const [r, g, b] = hslToRgb(h, s, l);

    // Apply opacity
    const oa = overlayData[idx + 3] * opacity;
    const ba = baseData[idx + 3];

    const combinedAlpha = ba + oa * (1 - ba / 255);
    const alphaFactor = combinedAlpha > 0 ? 255 / combinedAlpha : 0;

    out[idx] = Math.round((r * oa + baseData[idx] * ba * (1 - oa / 255)) * alphaFactor / 255);
    out[idx + 1] = Math.round((g * oa + baseData[idx + 1] * ba * (1 - oa / 255)) * alphaFactor / 255);
    out[idx + 2] = Math.round((b * oa + baseData[idx + 2] * ba * (1 - oa / 255)) * alphaFactor / 255);
    out[idx + 3] = Math.round(combinedAlpha);
  }

  return new ImageData(out, width, height);
}

// Helper functions
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [r * 255, g * 255, b * 255];
}
