/**
 * CMYK halftone dot matrix effect.
 */

import { assertImageDataLike, clamp, clampByte, createImageData } from '../utils/imageData.js';

const DEFAULT_ANGLES = {
  c: 15,
  m: 75,
  y: 0,
  k: 45,
};

const DEG_TO_RAD = Math.PI / 180;

function smoothstep(edge0, edge1, x) {
  if (edge0 === edge1) {
    return x < edge0 ? 0 : 1;
  }
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function computeDotCoverage(x, y, cosAngle, sinAngle, dotSize, inkAmount) {
  if (inkAmount <= 0) {
    return 0;
  }

  const xRot = x * cosAngle - y * sinAngle;
  const yRot = x * sinAngle + y * cosAngle;
  const cellX = Math.floor(xRot / dotSize);
  const cellY = Math.floor(yRot / dotSize);
  const centerX = (cellX + 0.5) * dotSize;
  const centerY = (cellY + 0.5) * dotSize;
  const dist = Math.hypot(xRot - centerX, yRot - centerY);

  const maxRadius = dotSize * 0.5;
  const radius = maxRadius * Math.sqrt(inkAmount);
  if (radius <= 0) {
    return 0;
  }

  const softEdge = Math.min(dotSize * 0.15, radius);
  if (softEdge <= 0) {
    return dist <= radius ? 1 : 0;
  }

  return 1 - smoothstep(radius - softEdge, radius + softEdge, dist);
}

function rgbToCmyk(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const k = 1 - Math.max(rNorm, gNorm, bNorm);

  if (k >= 1) {
    return { c: 0, m: 0, y: 0, k: 1 };
  }

  const invK = 1 - k;
  const c = (1 - rNorm - k) / invK;
  const m = (1 - gNorm - k) / invK;
  const y = (1 - bNorm - k) / invK;

  return { c, m, y, k };
}

/**
 * Apply CMYK halftone dot matrix effect.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.dotSize=6] - Dot size in pixels (2-20)
 * @param {number} [options.intensity=1] - Ink intensity (0-2)
 * @param {number} [options.angleOffset=0] - Rotation offset for CMYK screens (-45 to 45)
 * @param {boolean} [options.grayscale=false] - Use monochrome K channel only
 * @returns {ImageData} Halftoned image data
 */
export function dotMatrix(imageData, options = {}) {
  assertImageDataLike(imageData);

  const dotSize = clamp(options.dotSize ?? 6, 2, 20);
  const intensity = clamp(options.intensity ?? 1, 0, 2);
  const angleOffset = clamp(options.angleOffset ?? 0, -45, 45);
  const grayscale = options.grayscale ?? false;

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const centerX = width * 0.5;
  const centerY = height * 0.5;

  const angles = {
    c: (DEFAULT_ANGLES.c + angleOffset) * DEG_TO_RAD,
    m: (DEFAULT_ANGLES.m + angleOffset) * DEG_TO_RAD,
    y: (DEFAULT_ANGLES.y + angleOffset) * DEG_TO_RAD,
    k: (DEFAULT_ANGLES.k + angleOffset) * DEG_TO_RAD,
  };

  const cosAngles = {
    c: Math.cos(angles.c),
    m: Math.cos(angles.m),
    y: Math.cos(angles.y),
    k: Math.cos(angles.k),
  };

  const sinAngles = {
    c: Math.sin(angles.c),
    m: Math.sin(angles.m),
    y: Math.sin(angles.y),
    k: Math.sin(angles.k),
  };

  for (let y = 0; y < height; y += 1) {
    const yOffset = y * width * 4;
    const dy = y - centerY;
    for (let x = 0; x < width; x += 1) {
      const idx = yOffset + x * 4;
      const r = src[idx];
      const g = src[idx + 1];
      const b = src[idx + 2];
      const alpha = src[idx + 3];

      const dx = x - centerX;
      let cInk = 0;
      let mInk = 0;
      let yInk = 0;
      let kInk = 0;

      if (grayscale) {
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const inkAmount = clamp((1 - lum) * intensity, 0, 1);
        kInk = computeDotCoverage(dx, dy, cosAngles.k, sinAngles.k, dotSize, inkAmount);
      } else {
        const { c, m, y: yChannel, k } = rgbToCmyk(r, g, b);
        const cAmt = clamp(c * intensity, 0, 1);
        const mAmt = clamp(m * intensity, 0, 1);
        const yAmt = clamp(yChannel * intensity, 0, 1);
        const kAmt = clamp(k * intensity, 0, 1);

        cInk = computeDotCoverage(dx, dy, cosAngles.c, sinAngles.c, dotSize, cAmt);
        mInk = computeDotCoverage(dx, dy, cosAngles.m, sinAngles.m, dotSize, mAmt);
        yInk = computeDotCoverage(dx, dy, cosAngles.y, sinAngles.y, dotSize, yAmt);
        kInk = computeDotCoverage(dx, dy, cosAngles.k, sinAngles.k, dotSize, kAmt);
      }

      const rOut = 255 * (1 - cInk) * (1 - kInk);
      const gOut = 255 * (1 - mInk) * (1 - kInk);
      const bOut = 255 * (1 - yInk) * (1 - kInk);

      out[idx] = clampByte(rOut);
      out[idx + 1] = clampByte(gOut);
      out[idx + 2] = clampByte(bOut);
      out[idx + 3] = alpha;
    }
  }

  return createImageData(width, height, out);
}
