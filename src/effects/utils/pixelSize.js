/**
 * Pixel size utilities for dithering effects.
 *
 * These functions allow downsampling an image before applying an effect,
 * then upsampling back to full resolution using nearest-neighbor interpolation
 * to create a blocky/pixelated aesthetic.
 */

import { assertImageDataLike, createImageData, clampByte } from './imageData.js';

/**
 * Downsample an image by sampling the center pixel of each block.
 * This matches DitherPal's implementation for performance and crispness.
 *
 * @param {ImageData} imageData - Input image data
 * @param {number} pixelSize - Size of blocks to sample (must be >= 1)
 * @returns {ImageData} Downsampled image data
 */
export function downsample(imageData, pixelSize) {
  assertImageDataLike(imageData);

  if (pixelSize <= 1) return imageData;

  const { width, height } = imageData;
  const src = imageData.data;

  const newWidth = Math.max(1, Math.floor(width / pixelSize));
  const newHeight = Math.max(1, Math.floor(height / pixelSize));
  const out = createImageData(newWidth, newHeight);
  const dst = out.data;

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const outIdx = (y * newWidth + x) * 4;

      // Sample the center pixel of the block for performance and crispness
      const srcX = Math.floor(x * pixelSize + pixelSize / 2);
      const srcY = Math.floor(y * pixelSize + pixelSize / 2);
      const srcIdx = (Math.min(height - 1, srcY) * width + Math.min(width - 1, srcX)) * 4;

      dst[outIdx] = src[srcIdx];
      dst[outIdx + 1] = src[srcIdx + 1];
      dst[outIdx + 2] = src[srcIdx + 2];
      dst[outIdx + 3] = src[srcIdx + 3];
    }
  }

  return out;
}

/**
 * Upsample an image using nearest-neighbor interpolation.
 * This matches DitherPal's implementation exactly.
 *
 * @param {ImageData} imageData - Input image data (the downsampled version)
 * @param {number} targetWidth - Target width for upsampling
 * @param {number} targetHeight - Target height for upsampling
 * @param {number} pixelSize - The pixel size used for downsampling (unused, kept for compatibility)
 * @returns {ImageData} Upsampled image data
 */
export function upsample(imageData, targetWidth, targetHeight, pixelSize) {
  assertImageDataLike(imageData);

  const { width, height } = imageData;

  if (width === targetWidth && height === targetHeight) return imageData;

  const src = imageData.data;
  const out = createImageData(targetWidth, targetHeight);
  const dst = out.data;

  const scaleX = width / targetWidth;
  const scaleY = height / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const outIdx = (y * targetWidth + x) * 4;
      const srcX = Math.floor(x * scaleX);
      const srcY = Math.floor(y * scaleY);
      const srcIdx = (Math.min(height - 1, srcY) * width + Math.min(width - 1, srcX)) * 4;

      dst[outIdx] = src[srcIdx];
      dst[outIdx + 1] = src[srcIdx + 1];
      dst[outIdx + 2] = src[srcIdx + 2];
      dst[outIdx + 3] = src[srcIdx + 3];
    }
  }

  return out;
}

/**
 * Apply a pixel size effect to any image processing function.
 *
 * This wrapper downsampled the image, applies the effect, then upsamples back
 * to the original resolution. If pixelSize is 1, the effect is applied directly.
 *
 * @param {ImageData} imageData - Input image data
 * @param {number} pixelSize - Pixel size (1-32, where 1 = no effect)
 * @param {Function} effectFn - The effect function to apply
 * @param {Object} options - Options to pass to the effect function
 * @returns {ImageData} Processed image data
 */
export function applyPixelSizeEffect(imageData, pixelSize, effectFn, options = {}) {
  assertImageDataLike(imageData);

  if (pixelSize <= 1) {
    // No pixel size effect, apply directly
    return effectFn(imageData, options);
  }

  // Downsample
  const downsampled = downsample(imageData, pixelSize);

  // Apply effect to downsampled image
  const processed = effectFn(downsampled, options);

  // Upsample back to original resolution
  return upsample(processed, imageData.width, imageData.height, pixelSize);
}
