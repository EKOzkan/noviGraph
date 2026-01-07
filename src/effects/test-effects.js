/**
 * Minimal sanity checks for a subset of effects.
 *
 * Manual usage (browser):
 * - Import this module somewhere in your app (temporarily) and check the console.
 *
 * Manual usage (Node):
 * - `node src/effects/test-effects.js`
 */

import {
  floydSteinberg,
  orderedDither,
  pixelize,
  bloom,
  ascii,
  tonal,
  chromaticAberration,
  removeBackground,
  featherMask,
} from './index.js';

// Polyfill for Node / non-DOM environments.
if (typeof ImageData === 'undefined') {
  globalThis.ImageData = class ImageDataPolyfill {
    constructor(data, width, height) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  };
}

/**
 * @param {number} width
 * @param {number} height
 */
function createTestImageData(width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const v = Math.round((x / Math.max(1, width - 1)) * 255);
      data[i] = v;
      data[i + 1] = Math.round((y / Math.max(1, height - 1)) * 255);
      data[i + 2] = 255 - v;
      data[i + 3] = 255;
    }
  }
  return new ImageData(data, width, height);
}

function assertImageDataLike(result, label) {
  if (!result || typeof result.width !== 'number' || typeof result.height !== 'number' || !(result.data instanceof Uint8ClampedArray)) {
    throw new Error(`Effect did not return ImageData-like output for: ${label}`);
  }
  if (result.data.length !== result.width * result.height * 4) {
    throw new Error(`Invalid buffer length for: ${label}`);
  }
}

const input = createTestImageData(32, 24);

const outputs = {
  floyd: floydSteinberg(input, { intensity: 1 }),
  ordered: orderedDither(input, { matrixSize: 4, levels: 4 }),
  pixelize: pixelize(input, { size: 4 }),
  bloom: bloom(input, { threshold: 180, radius: 3, intensity: 1.2 }),
  ascii: ascii(input, { cellWidth: 6, cellHeight: 10, colorize: true }),
  tonal: tonal(input, { contrast: 0.2, saturation: 0.2 }),
  chroma: chromaticAberration(input, { offsetX: 2 }),
  removeBg: removeBackground(input, { threshold: 30, softness: 20 }),
  feather: featherMask(input, { radius: 2, iterations: 1 }),
};

for (const [label, result] of Object.entries(outputs)) {
  assertImageDataLike(result, label);
}

export const testEffectsResult = outputs;
