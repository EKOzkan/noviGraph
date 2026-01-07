/**
 * Pixel size utilities for dithering effects.
 *
 * These functions allow downsampling an image before applying an effect,
 * then upsampling back to full resolution using nearest-neighbor interpolation
 * to create a blocky/pixelated aesthetic.
 */

import { assertImageDataLike, createImageData, clampByte } from './imageData.js';

/**
 * Downsample an image by averaging blocks of pixels.
 *
 * @param {ImageData} imageData - Input image data
 * @param {number} pixelSize - Size of blocks to average (must be >= 1)
 * @returns {ImageData} Downsampled image data
 */
export function downsample(imageData, pixelSize) {
  assertImageDataLike(imageData);

  if (pixelSize < 1) pixelSize = 1;

  const { width, height } = imageData;
  const src = imageData.data;

  const newWidth = Math.ceil(width / pixelSize);
  const newHeight = Math.ceil(height / pixelSize);
  const out = createImageData(newWidth, newHeight);
  const dst = out.data;

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      // Calculate the block boundaries in the original image
      const startX = x * pixelSize;
      const startY = y * pixelSize;
      const endX = Math.min(startX + pixelSize, width);
      const endY = Math.min(startY + pixelSize, height);

      // Average the pixels in the block
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;

      for (let py = startY; py < endY; py++) {
        for (let px = startX; px < endX; px++) {
          const i = (py * width + px) * 4;
          r += src[i];
          g += src[i + 1];
          b += src[i + 2];
          a += src[i + 3];
          count++;
        }
      }

      const outIdx = (y * newWidth + x) * 4;
      dst[outIdx] = clampByte(Math.round(r / count));
      dst[outIdx + 1] = clampByte(Math.round(g / count));
      dst[outIdx + 2] = clampByte(Math.round(b / count));
      dst[outIdx + 3] = clampByte(Math.round(a / count));
    }
  }

  return out;
}

/**
 * Upsample an image using nearest-neighbor interpolation.
 *
 * @param {ImageData} imageData - Input image data (the downsampled version)
 * @param {number} originalWidth - Target width for upsampling
 * @param {number} originalHeight - Target height for upsampling
 * @param {number} pixelSize - The pixel size used for downsampling
 * @returns {ImageData} Upsampled image data
 */
export function upsample(imageData, originalWidth, originalHeight, pixelSize) {
  assertImageDataLike(imageData);

  if (pixelSize < 1) pixelSize = 1;

  const { width: srcWidth, height: srcHeight } = imageData;
  const src = imageData.data;
  const out = createImageData(originalWidth, originalHeight);
  const dst = out.data;

  for (let y = 0; y < originalHeight; y++) {
    for (let x = 0; x < originalWidth; x++) {
      // Map to nearest pixel in the downsampled image
      const srcX = Math.floor(x / pixelSize);
      const srcY = Math.floor(y / pixelSize);

      // Clamp to source dimensions
      const clampedSrcX = Math.min(srcX, srcWidth - 1);
      const clampedSrcY = Math.min(srcY, srcHeight - 1);

      const srcIdx = (clampedSrcY * srcWidth + clampedSrcX) * 4;
      const dstIdx = (y * originalWidth + x) * 4;

      dst[dstIdx] = src[srcIdx];
      dst[dstIdx + 1] = src[srcIdx + 1];
      dst[dstIdx + 2] = src[srcIdx + 2];
      dst[dstIdx + 3] = src[srcIdx + 3];
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
