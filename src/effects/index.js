/**
 * novigraph effects - framework-agnostic pixel processing functions.
 */

export { errorDiffusion } from './dithering/errorDiffusion.js';
export { floydSteinberg } from './dithering/floydSteinberg.js';
export { falseFloydSteinberg } from './dithering/falseFloydSteinberg.js';
export { floydSteinbergSerpentine } from './dithering/floydSteinbergSerpentine.js';
export { atkinson } from './dithering/atkinson.js';
export { jarvisJudiceNinke } from './dithering/jarvisJudiceNinke.js';
export { stucki } from './dithering/stucki.js';
export { burkes } from './dithering/burkes.js';
export { orderedDither } from './dithering/orderedDither.js';
export { bayerOrdered4x4 } from './dithering/bayerOrdered4x4.js';
export { bayerOrdered16x16 } from './dithering/bayerOrdered16x16.js';
export { randomOrdered } from './dithering/randomOrdered.js';
export { patternDither } from './dithering/patternDither.js';
export { tiling } from './dithering/tiling.js';
export { clustered } from './dithering/clustered.js';
export { riemersma } from './dithering/riemersma.js';
export { colorReducing } from './dithering/colorReducing.js';
export { threshold } from './dithering/threshold.js';

export { colorPalette } from './color/colorPalette.js';
export { posterize } from './color/posterize.js';
export { colorShift } from './color/colorShift.js';
export { grayscale, desaturate } from './color/grayscale.js';
export { sepia } from './color/sepia.js';
export { colorBalance } from './color/colorBalance.js';
export { hueSaturation } from './color/hueSaturation.js';
export { channelMixer } from './color/channelMixer.js';
export { curves } from './color/curves.js';
export { levels } from './color/levels.js';

export { pixelize } from './distortion/pixelize.js';
export { grain } from './distortion/grain.js';
export {
  glitch,
  chromaticAberration,
  pixelSort,
  digitalCorruption,
  dataMosh,
} from './distortion/glitch.js';
export { rotate } from './distortion/rotate.js';
export { flip } from './distortion/flip.js';
export { scale } from './distortion/scale.js';
export { skew } from './distortion/skew.js';
export { barrelDistortion } from './distortion/barrelDistortion.js';
export { lensDistortion } from './distortion/lensDistortion.js';
export { waveDistortion } from './distortion/waveDistortion.js';

export { gaussianBlur } from './blur/gaussianBlur.js';
export { motionBlur } from './blur/motionBlur.js';
export { radialBlur } from './blur/radialBlur.js';
export { medianBlur } from './blur/medianBlur.js';
export { bilateralFilter } from './blur/bilateralFilter.js';

export { sharpen } from './sharpen/sharpen.js';
export { unsharpMask } from './sharpen/unsharpMask.js';
export { highPassFilter } from './sharpen/highPassFilter.js';
export { clarity } from './sharpen/clarity.js';

export { sobelEdge } from './edge/sobelEdge.js';
export { laplacianEdge } from './edge/laplacianEdge.js';
export { cannyEdge } from './edge/cannyEdge.js';
export { edgeEnhance } from './edge/edgeEnhance.js';

export { dilate } from './morphological/dilate.js';
export { erode } from './morphological/erode.js';
export { morphOpen } from './morphological/morphOpen.js';
export { morphClose } from './morphological/morphClose.js';

export { blend, blendHsl } from './blending/blend.js';
export { opacity } from './blending/opacity.js';

export { emboss } from './special/emboss.js';
export { quantize } from './special/quantize.js';
export { chromaticAb } from './special/chromaticAb.js';
export { glowEnhance } from './special/glowEnhance.js';
export { vignette } from './special/vignette.js';
export { colorSplash } from './special/colorSplash.js';

export { negative } from './effects/negative.js';
export { midtones } from './effects/midtones.js';
export { highlights } from './effects/highlights.js';

export { bloom } from './effects/bloom.js';
export { ascii } from './effects/ascii.js';
export { tonal } from './effects/tonal.js';

export { removeBackground } from './backgroundRemoval/removeBackground.js';
export { featherMask } from './backgroundRemoval/featherMask.js';

export * as palettes from './palettes/index.js';

import { floydSteinberg } from './dithering/floydSteinberg.js';
import { falseFloydSteinberg } from './dithering/falseFloydSteinberg.js';
import { floydSteinbergSerpentine } from './dithering/floydSteinbergSerpentine.js';
import { atkinson } from './dithering/atkinson.js';
import { jarvisJudiceNinke } from './dithering/jarvisJudiceNinke.js';
import { stucki } from './dithering/stucki.js';
import { burkes } from './dithering/burkes.js';
import { orderedDither } from './dithering/orderedDither.js';
import { bayerOrdered4x4 } from './dithering/bayerOrdered4x4.js';
import { bayerOrdered16x16 } from './dithering/bayerOrdered16x16.js';
import { randomOrdered } from './dithering/randomOrdered.js';
import { patternDither } from './dithering/patternDither.js';
import { tiling } from './dithering/tiling.js';
import { clustered } from './dithering/clustered.js';
import { riemersma } from './dithering/riemersma.js';
import { colorReducing } from './dithering/colorReducing.js';
import { threshold as thresholdFn } from './dithering/threshold.js';

import { colorPalette } from './color/colorPalette.js';
import { posterize } from './color/posterize.js';
import { colorShift } from './color/colorShift.js';
import { grayscale, desaturate } from './color/grayscale.js';
import { sepia } from './color/sepia.js';
import { colorBalance } from './color/colorBalance.js';
import { hueSaturation } from './color/hueSaturation.js';
import { channelMixer } from './color/channelMixer.js';
import { curves } from './color/curves.js';
import { levels } from './color/levels.js';

import { pixelize } from './distortion/pixelize.js';
import { grain } from './distortion/grain.js';
import { chromaticAberration, pixelSort, digitalCorruption, dataMosh } from './distortion/glitch.js';
import { rotate } from './distortion/rotate.js';
import { flip } from './distortion/flip.js';
import { scale as scaleDist } from './distortion/scale.js';
import { skew } from './distortion/skew.js';
import { barrelDistortion } from './distortion/barrelDistortion.js';
import { lensDistortion } from './distortion/lensDistortion.js';
import { waveDistortion } from './distortion/waveDistortion.js';

import { gaussianBlur } from './blur/gaussianBlur.js';
import { motionBlur } from './blur/motionBlur.js';
import { radialBlur } from './blur/radialBlur.js';
import { medianBlur } from './blur/medianBlur.js';
import { bilateralFilter } from './blur/bilateralFilter.js';

import { sharpen } from './sharpen/sharpen.js';
import { unsharpMask } from './sharpen/unsharpMask.js';
import { highPassFilter } from './sharpen/highPassFilter.js';
import { clarity } from './sharpen/clarity.js';

import { sobelEdge } from './edge/sobelEdge.js';
import { laplacianEdge } from './edge/laplacianEdge.js';
import { cannyEdge } from './edge/cannyEdge.js';
import { edgeEnhance } from './edge/edgeEnhance.js';

import { dilate } from './morphological/dilate.js';
import { erode } from './morphological/erode.js';
import { morphOpen } from './morphological/morphOpen.js';
import { morphClose } from './morphological/morphClose.js';

import { blend, blendHsl } from './blending/blend.js';
import { opacity } from './blending/opacity.js';

import { emboss } from './special/emboss.js';
import { quantize } from './special/quantize.js';
import { chromaticAb } from './special/chromaticAb.js';
import { glowEnhance } from './special/glowEnhance.js';
import { vignette } from './special/vignette.js';
import { colorSplash } from './special/colorSplash.js';

import { negative } from './effects/negative.js';
import { midtones } from './effects/midtones.js';
import { highlights } from './effects/highlights.js';

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
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: floydSteinberg,
  },
  false_floyd_steinberg: {
    name: 'False Floyd–Steinberg',
    category: 'dithering',
    description: 'Faster approximation of Floyd–Steinberg error diffusion.',
    parameters: {
      intensity: { min: 0, max: 1, default: 1 },
      serpentine: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: falseFloydSteinberg,
  },
  floyd_steinberg_serpentine: {
    name: 'Floyd–Steinberg (Serpentine)',
    category: 'dithering',
    description: 'Standard Floyd–Steinberg with fixed serpentine scanning.',
    parameters: {
      intensity: { min: 0, max: 1, default: 1 },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: floydSteinbergSerpentine,
  },
  atkinson: {
    name: 'Atkinson Dithering',
    category: 'dithering',
    description: 'Apple-developed error diffusion with high contrast and reduced bleed.',
    parameters: {
      intensity: { min: 0, max: 1, default: 1 },
      serpentine: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: atkinson,
  },
  jarvis_judice_ninke: {
    name: 'Jarvis-Judice-Ninke',
    category: 'dithering',
    description: 'High-quality error diffusion using a large 12-neighbor kernel.',
    parameters: {
      intensity: { min: 0, max: 1, default: 1 },
      serpentine: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: jarvisJudiceNinke,
  },
  stucki: {
    name: 'Stucki Dithering',
    category: 'dithering',
    description: 'High-quality error diffusion similar to Jarvis-Judice-Ninke but faster.',
    parameters: {
      intensity: { min: 0, max: 1, default: 1 },
      serpentine: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: stucki,
  },
  burkes: {
    name: 'Burkes Dithering',
    category: 'dithering',
    description: 'Faster error diffusion using a 7-neighbor kernel.',
    parameters: {
      intensity: { min: 0, max: 1, default: 1 },
      serpentine: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: burkes,
  },
  ordered_dither: {
    name: 'Ordered Dither (Bayer)',
    category: 'dithering',
    description: 'Ordered dithering using Bayer matrices (2x2, 4x4, 8x8, 16x16).',
    parameters: {
      matrixSize: { options: [2, 4, 8, 16], default: 8 },
      levels: { min: 2, max: 32, default: 2 },
      strength: { min: 0, max: 1, default: 1 },
      grayscale: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: orderedDither,
  },
  bayer_4x4: {
    name: 'Bayer 4x4',
    category: 'dithering',
    description: 'Fixed 4x4 Bayer ordered dither.',
    parameters: {
      levels: { min: 2, max: 32, default: 2 },
      strength: { min: 0, max: 1, default: 1 },
      grayscale: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: bayerOrdered4x4,
  },
  bayer_16x16: {
    name: 'Bayer 16x16',
    category: 'dithering',
    description: 'Fixed 16x16 Bayer ordered dither.',
    parameters: {
      levels: { min: 2, max: 32, default: 2 },
      strength: { min: 0, max: 1, default: 1 },
      grayscale: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: bayerOrdered16x16,
  },
  random_ordered: {
    name: 'Random Ordered',
    category: 'dithering',
    description: 'Ordered dither using random noise thresholds.',
    parameters: {
      levels: { min: 2, max: 32, default: 2 },
      strength: { min: 0, max: 1, default: 1 },
      grayscale: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: randomOrdered,
  },
  pattern_dither: {
    name: 'Pattern Dither',
    category: 'dithering',
    description: 'Stylized dot-pattern dithering with configurable scale.',
    parameters: {
      scale: { min: 1, max: 16, default: 1 },
      levels: { min: 2, max: 5, default: 5 },
      invert: { options: [true, false], default: false },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: patternDither,
  },
  tiling: {
    name: 'Tiling',
    category: 'dithering',
    description: 'Checkerboard pattern ordered dither.',
    parameters: {
      levels: { min: 2, max: 32, default: 2 },
      strength: { min: 0, max: 1, default: 1 },
      grayscale: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: tiling,
  },
  clustered: {
    name: 'Clustered Dot',
    category: 'dithering',
    description: 'Clustered dot (halftone-style) ordered dither.',
    parameters: {
      levels: { min: 2, max: 32, default: 2 },
      strength: { min: 0, max: 1, default: 1 },
      grayscale: { options: [true, false], default: true },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: clustered,
  },
  riemersma: {
    name: 'Riemersma',
    category: 'dithering',
    description: 'Dithering along a space-filling curve with error history.',
    parameters: {
      history: { min: 1, max: 16, default: 16 },
      decay: { min: 0, max: 1, default: 0.9 },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: riemersma,
  },
  color_reducing: {
    name: 'Color Reducing',
    category: 'dithering',
    description: 'Reduce color palette without any dithering patterns.',
    parameters: {
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: colorReducing,
  },
  threshold: {
    name: 'Threshold',
    category: 'dithering',
    description: 'Binary thresholding (luminance or per-channel).',
    parameters: {
      threshold: { min: 0, max: 255, default: 128 },
      grayscale: { options: [true, false], default: true },
      invert: { options: [true, false], default: false },
      Size_: { min: 1, max: 32, default: 1 },
    },
    fn: thresholdFn,
  },

  color_palette: {
    name: 'Color Palette',
    category: 'color',
    description: 'Map colors to the nearest colors in a limited palette.',
    parameters: {
      palette: { 
        options: ['gameboy', 'bw', 'grayscale4', 'cga', 'commodore64', 'gameBoyOriginal', 'gameBoyColor', 'nes', 'amiga', 'atari2600', 'zxSpectrum', 'masterSystem', 'pcEngine'], 
        default: 'gameboy' 
      },
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
      Size_: { min: 1, max: 32, default: 1 },
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
  grayscale: {
    name: 'Grayscale',
    category: 'color',
    description: 'Convert to grayscale with various methods.',
    parameters: {
      method: { options: ['luminance', 'average', 'lightness'], default: 'luminance' },
      intensity: { min: 0, max: 1, default: 1 },
    },
    fn: grayscale,
  },
  sepia: {
    name: 'Sepia Tone',
    category: 'color',
    description: 'Apply sepia toning to image.',
    parameters: {
      intensity: { min: 0, max: 1, default: 1 },
      tone: { min: 0, max: 1, default: 0.5 },
    },
    fn: sepia,
  },
  color_balance: {
    name: 'Color Balance',
    category: 'color',
    description: 'Adjust color balance in shadows, midtones, and highlights.',
    parameters: {
      shadowsCyan: { min: -100, max: 100, default: 0 },
      shadowsMagenta: { min: -100, max: 100, default: 0 },
      shadowsYellow: { min: -100, max: 100, default: 0 },
      midtonesCyan: { min: -100, max: 100, default: 0 },
      midtonesMagenta: { min: -100, max: 100, default: 0 },
      midtonesYellow: { min: -100, max: 100, default: 0 },
      highlightsCyan: { min: -100, max: 100, default: 0 },
      highlightsMagenta: { min: -100, max: 100, default: 0 },
      highlightsYellow: { min: -100, max: 100, default: 0 },
      preserveLuminosity: { options: [true, false], default: true },
    },
    fn: colorBalance,
  },
  negative: {
    name: 'Negative/Invert',
    category: 'effects',
    description: 'Invert image colors.',
    parameters: {
      intensity: { min: 0, max: 1, default: 1 },
    },
    fn: negative,
  },
  midtones: {
    name: 'Midtones',
    category: 'effects',
    description: 'Adjust midtones.',
    parameters: {
      adjustment: { min: -1, max: 1, default: 0 },
      range: { min: 0, max: 1, default: 0.5 },
    },
    fn: midtones,
  },
  highlights: {
    name: 'Highlights',
    category: 'effects',
    description: 'Adjust highlights.',
    parameters: {
      adjustment: { min: -1, max: 1, default: 0 },
      threshold: { min: 0, max: 255, default: 128 },
      softness: { min: 0, max: 100, default: 20 },
    },
    fn: highlights,
  },
  sobel_edge: {
    name: 'Sobel Edge',
    category: 'edge',
    description: 'Sobel edge detection.',
    parameters: {
      horizontal: { options: [true, false], default: true },
      vertical: { options: [true, false], default: true },
      magnitude: { options: [true, false], default: true },
      threshold: { min: 0, max: 255, default: 0 },
    },
    fn: sobelEdge,
  },
  dilate: {
    name: 'Dilate',
    category: 'morphological',
    description: 'Dilate image.',
    parameters: {
      radius: { min: 1, max: 10, default: 1 },
      iterations: { min: 1, max: 4, default: 1 },
    },
    fn: dilate,
  },
  erode: {
    name: 'Erode',
    category: 'morphological',
    description: 'Erode image.',
    parameters: {
      radius: { min: 1, max: 10, default: 1 },
      iterations: { min: 1, max: 4, default: 1 },
    },
    fn: erode,
  },
  emboss: {
    name: 'Emboss',
    category: 'special',
    description: 'Apply emboss/relief effect.',
    parameters: {
      amount: { min: 0, max: 2, default: 1 },
      angle: { min: 0, max: 360, default: 45 },
      depth: { min: 0.5, max: 5, default: 1 },
    },
    fn: emboss,
  },
  vignette: {
    name: 'Vignette',
    category: 'special',
    description: 'Apply vignette.',
    parameters: {
      darkness: { min: 0, max: 1, default: 0.5 },
      radius: { min: 0, max: 1, default: 0.8 },
      roundness: { min: 0, max: 2, default: 1 },
    },
    fn: vignette,
  },
  blend: {
    name: 'Blend',
    category: 'blending',
    description: 'Blend two images with various modes.',
    parameters: {
      mode: { options: ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion'], default: 'normal' },
      opacity: { min: 0, max: 1, default: 1 },
    },
    fn: blend,
  },
  gaussian_blur: {
    name: 'Gaussian Blur',
    category: 'blur',
    description: 'Apply Gaussian blur.',
    parameters: {
      radius: { min: 0.5, max: 50, default: 5 },
      quality: { options: ['low', 'medium', 'high'], default: 'medium' },
    },
    fn: gaussianBlur,
  },
  sharpen: {
    name: 'Sharpen',
    category: 'sharpen',
    description: 'Sharpen image.',
    parameters: {
      amount: { min: 0, max: 2, default: 1 },
      radius: { min: 0.5, max: 10, default: 1 },
    },
    fn: sharpen,
  },
  rotate: {
    name: 'Rotate',
    category: 'distortion',
    description: 'Rotate image.',
    parameters: {
      angle: { min: 0, max: 360, default: 0 },
      fillMode: { options: ['transparent', 'extend', 'wrap'], default: 'transparent' },
      interpolation: { options: ['nearest', 'bilinear'], default: 'bilinear' },
    },
    fn: rotate,
  },
};

/**
 * Convenience list for UIs.
 */
export const effects = Object.entries(effectRegistry).map(([id, def]) => ({ id, ...def }));
