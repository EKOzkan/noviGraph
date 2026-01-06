/**
 * novigraph effects - framework-agnostic pixel processing functions.
 */

export { errorDiffusion } from './dithering/errorDiffusion.js';
export { floydSteinberg } from './dithering/floydSteinberg.js';
export { orderedDither } from './dithering/orderedDither.js';
export { patternDither } from './dithering/patternDither.js';
export { threshold } from './dithering/threshold.js';

export { colorPalette } from './color/colorPalette.js';
export { posterize } from './color/posterize.js';
export { colorShift } from './color/colorShift.js';

export { pixelize } from './distortion/pixelize.js';
export { grain } from './distortion/grain.js';
export {
  glitch,
  chromaticAberration,
  pixelSort,
  digitalCorruption,
  dataMosh,
} from './distortion/glitch.js';

export { bloom } from './effects/bloom.js';
export { ascii } from './effects/ascii.js';
export { tonal } from './effects/tonal.js';

export { removeBackground } from './backgroundRemoval/removeBackground.js';
export { featherMask } from './backgroundRemoval/featherMask.js';

export * as palettes from './palettes/index.js';

import { floydSteinberg } from './dithering/floydSteinberg.js';
import { orderedDither } from './dithering/orderedDither.js';
import { patternDither } from './dithering/patternDither.js';
import { threshold as thresholdFn } from './dithering/threshold.js';

import { colorPalette } from './color/colorPalette.js';
import { posterize } from './color/posterize.js';
import { colorShift } from './color/colorShift.js';

import { pixelize } from './distortion/pixelize.js';
import { grain } from './distortion/grain.js';
import { chromaticAberration, pixelSort, digitalCorruption, dataMosh } from './distortion/glitch.js';

import { bloom } from './effects/bloom.js';
import { ascii } from './effects/ascii.js';
import { tonal } from './effects/tonal.js';

import { removeBackground } from './backgroundRemoval/removeBackground.js';
import { featherMask } from './backgroundRemoval/featherMask.js';

/**
 * Metadata registry for node editors / UIs.
 */
export const effectRegistry = {
  floyd_steinberg: {
    name: 'Floyd–Steinberg Dithering',
    category: 'dithering',
    description: 'Error diffusion dithering using the Floyd–Steinberg diffusion matrix.',
    parameters: {
      intensity: { min: 0, max: 1, default: 1 },
      serpentine: { options: [true, false], default: true },
    },
    fn: floydSteinberg,
  },
  ordered_dither: {
    name: 'Ordered Dither (Bayer)',
    category: 'dithering',
    description: 'Ordered dithering using Bayer matrices (2x2, 4x4, 8x8).',
    parameters: {
      matrixSize: { options: [2, 4, 8], default: 8 },
      levels: { min: 2, max: 32, default: 2 },
      strength: { min: 0, max: 1, default: 1 },
      grayscale: { options: [true, false], default: true },
    },
    fn: orderedDither,
  },
  pattern_dither: {
    name: 'Pattern Dither',
    category: 'dithering',
    description: 'Stylized dot-pattern dithering with configurable scale.',
    parameters: {
      scale: { min: 1, max: 16, default: 1 },
      levels: { min: 2, max: 5, default: 5 },
      invert: { options: [true, false], default: false },
    },
    fn: patternDither,
  },
  threshold: {
    name: 'Threshold',
    category: 'dithering',
    description: 'Binary thresholding (luminance or per-channel).',
    parameters: {
      threshold: { min: 0, max: 255, default: 128 },
      grayscale: { options: [true, false], default: true },
      invert: { options: [true, false], default: false },
    },
    fn: thresholdFn,
  },

  color_palette: {
    name: 'Color Palette',
    category: 'color',
    description: 'Map colors to the nearest colors in a limited palette.',
    parameters: {
      palette: { default: 'gameboy (built-in)', type: 'Array<color>' },
    },
    fn: colorPalette,
  },
  posterize: {
    name: 'Posterize',
    category: 'color',
    description: 'Reduce color levels per channel.',
    parameters: {
      levels: { min: 2, max: 64, default: 6 },
    },
    fn: posterize,
  },
  color_shift: {
    name: 'Color Shift',
    category: 'color',
    description: 'Hue rotation + saturation/lightness adjustment + RGB offsets.',
    parameters: {
      hue: { min: -180, max: 180, default: 0 },
      saturation: { min: -1, max: 1, default: 0 },
      lightness: { min: -1, max: 1, default: 0 },
      redShift: { min: -255, max: 255, default: 0 },
      greenShift: { min: -255, max: 255, default: 0 },
      blueShift: { min: -255, max: 255, default: 0 },
    },
    fn: colorShift,
  },

  pixelize: {
    name: 'Pixelize',
    category: 'distortion',
    description: 'Pixelate an image by replacing blocks with average/nearest colors.',
    parameters: {
      size: { min: 1, max: 128, default: 8 },
      method: { options: ['average', 'nearest'], default: 'average' },
    },
    fn: pixelize,
  },
  grain: {
    name: 'Grain / Noise',
    category: 'distortion',
    description: 'Add film grain / noise.',
    parameters: {
      amount: { min: 0, max: 1, default: 0.2 },
      monochrome: { options: [true, false], default: true },
      seed: { default: null },
    },
    fn: grain,
  },
  chromatic_aberration: {
    name: 'Chromatic Aberration',
    category: 'distortion',
    description: 'Offset red/blue channels to create a lens aberration effect.',
    parameters: {
      offsetX: { min: -50, max: 50, default: 5 },
      offsetY: { min: -50, max: 50, default: 0 },
      wrap: { options: [true, false], default: false },
    },
    fn: chromaticAberration,
  },
  pixel_sort: {
    name: 'Pixel Sort',
    category: 'distortion',
    description: 'Sort pixel runs by luminance for glitch aesthetics.',
    parameters: {
      thresholdLow: { min: 0, max: 255, default: 40 },
      thresholdHigh: { min: 0, max: 255, default: 220 },
      intensity: { min: 0, max: 1, default: 1 },
      seed: { default: null },
    },
    fn: pixelSort,
  },
  digital_corruption: {
    name: 'Digital Corruption',
    category: 'distortion',
    description: 'Random block swaps and bit artifacts.',
    parameters: {
      intensity: { min: 0, max: 1, default: 0.35 },
      blockSize: { min: 4, max: 128, default: 16 },
      seed: { default: null },
    },
    fn: digitalCorruption,
  },
  data_mosh: {
    name: 'Data Mosh',
    category: 'distortion',
    description: 'Row/strip smearing reminiscent of video compression artifacts.',
    parameters: {
      intensity: { min: 0, max: 1, default: 0.4 },
      maxOffset: { min: 0, max: 200, default: 40 },
      bandHeight: { min: 1, max: 64, default: 6 },
      seed: { default: null },
    },
    fn: dataMosh,
  },

  bloom: {
    name: 'Bloom',
    category: 'effects',
    description: 'Glow effect by blurring bright regions and adding them back.',
    parameters: {
      threshold: { min: 0, max: 255, default: 200 },
      radius: { min: 0, max: 64, default: 8 },
      intensity: { min: 0, max: 3, default: 0.8 },
    },
    fn: bloom,
  },
  ascii: {
    name: 'ASCII',
    category: 'effects',
    description: 'Rasterized ASCII-art approximation (no Canvas text dependency).',
    parameters: {
      cellWidth: { min: 2, max: 64, default: 8 },
      cellHeight: { min: 2, max: 64, default: 12 },
      invert: { options: [true, false], default: false },
      colorize: { options: [true, false], default: false },
    },
    fn: ascii,
  },
  tonal: {
    name: 'Tonal / Levels',
    category: 'effects',
    description: 'Brightness, contrast, gamma, black/white points, and saturation.',
    parameters: {
      brightness: { min: -1, max: 1, default: 0 },
      contrast: { min: -1, max: 1, default: 0 },
      gamma: { min: 0.1, max: 5, default: 1 },
      blackPoint: { min: 0, max: 255, default: 0 },
      whitePoint: { min: 0, max: 255, default: 255 },
      saturation: { min: -1, max: 1, default: 0 },
    },
    fn: tonal,
  },

  remove_background: {
    name: 'Remove Background (Color Key)',
    category: 'backgroundRemoval',
    description: 'Simple background removal using color distance (not ML-based).',
    parameters: {
      backgroundColor: { default: null },
      threshold: { min: 0, max: 441, default: 60 },
      softness: { min: 0, max: 441, default: 30 },
    },
    fn: removeBackground,
  },
  feather_mask: {
    name: 'Feather Mask',
    category: 'backgroundRemoval',
    description: 'Blur the alpha channel to soften edges.',
    parameters: {
      radius: { min: 0, max: 64, default: 8 },
      iterations: { min: 1, max: 4, default: 1 },
    },
    fn: featherMask,
  },
};

/**
 * Convenience list for UIs.
 */
export const effects = Object.entries(effectRegistry).map(([id, def]) => ({ id, ...def }));
