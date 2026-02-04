/**
 * Animated noise - time-based noise that changes frame-to-frame.
 * 
 * This effect generates noise with a time-varying seed, creating
 * temporal animation suitable for live previews or video effects.
 */

import { assertImageDataLike, clampByte, createImageData, clamp } from '../utils/imageData.js';
import { createRng } from '../utils/random.js';
import { applyPixelSizeEffect } from '../utils/pixelSize.js';

/**
 * Apply animated noise to an image (core implementation without Size_).
 * 
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=0.2] - Noise amount (range: 0-1)
 * @param {boolean} [options.monochrome=true] - If true, add the same noise to RGB
 * @param {number} [options.speed=1] - Animation speed multiplier (0.1-10)
 * @param {number|null} [options.baseSeed=null] - Base seed for deterministic animation
 * @returns {ImageData} Processed image data
 */
function animatedNoiseCore(imageData, options = {}) {
  assertImageDataLike(imageData);

  const amount = clamp(options.amount ?? 0.2, 0, 1);
  const monochrome = options.monochrome ?? true;
  const speed = clamp(options.speed ?? 1, 0.1, 10);
  const baseSeed = options.baseSeed ?? 0;

  // Generate time-based seed
  // Use a combination of Date.now() and sin wave for smooth variation
  const time = Date.now() * 0.001 * speed;
  const timeSeed = Math.floor(Math.sin(time) * 1000000 + baseSeed);
  const rng = createRng(timeSeed);

  const width = imageData.width;
  const height = imageData.height;
  const out = createImageData(width, height);
  const src = imageData.data;
  const dst = out.data;

  const amp = amount * 255;

  for (let i = 0; i < src.length; i += 4) {
    if (monochrome) {
      const n = (rng() * 2 - 1) * amp;
      dst[i] = clampByte(src[i] + n);
      dst[i + 1] = clampByte(src[i + 1] + n);
      dst[i + 2] = clampByte(src[i + 2] + n);
    } else {
      dst[i] = clampByte(src[i] + (rng() * 2 - 1) * amp);
      dst[i + 1] = clampByte(src[i + 1] + (rng() * 2 - 1) * amp);
      dst[i + 2] = clampByte(src[i + 2] + (rng() * 2 - 1) * amp);
    }
    dst[i + 3] = src[i + 3];
  }

  return out;
}

/**
 * Apply animated noise to an image.
 * 
 * This effect generates noise that changes over time, creating a
 * live animation effect. The seed is derived from the current timestamp,
 * so each frame will have different noise. Useful for TV static effects,
 * live noise overlays, and temporal grain.
 * 
 * Note: This effect requires continuous rendering (e.g., requestAnimationFrame)
 * to see the animation. In single-frame contexts, it behaves like regular noise.
 * 
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=0.2] - Noise amount (range: 0-1)
 * @param {boolean} [options.monochrome=true] - If true, add the same noise to RGB
 * @param {number} [options.speed=1] - Animation speed multiplier (0.1-10)
 * @param {number|null} [options.baseSeed=null] - Base seed for deterministic animation
 * @param {number} [options.Size_=1] - Pixel size scaling (1-32, default 1)
 * @returns {ImageData} Processed image data
 */
export function animatedNoise(imageData, options = {}) {
  const Size_ = clamp(options.Size_ ?? 1, 1, 32);
  return applyPixelSizeEffect(imageData, Size_, animatedNoiseCore, options);
}
