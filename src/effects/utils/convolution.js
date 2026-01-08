/**
 * Convolution utilities for kernel-based operations.
 */

import { clampByte } from './imageData.js';

/**
 * Apply a convolution kernel to an image.
 *
 * @param {ImageData} imageData - Input image data
 * @param {number[][]} kernel - Convolution kernel (3x3, 5x5, etc.)
 * @param {Object} options - Processing options
 * @param {boolean} [options.preserveAlpha=true] - Preserve alpha channel
 * @returns {ImageData} Processed image data
 */
export function applyConvolution(imageData, kernel, options = {}) {
  const { preserveAlpha = true } = options;
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const kSize = kernel.length;
  const kHalf = Math.floor(kSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky - kHalf));
          const px = Math.min(width - 1, Math.max(0, x + kx - kHalf));
          const pi = (py * width + px) * 4;
          const k = kernel[ky][kx];

          r += src[pi] * k;
          g += src[pi + 1] * k;
          b += src[pi + 2] * k;
        }
      }

      const i = (y * width + x) * 4;
      out[i] = clampByte(r);
      out[i + 1] = clampByte(g);
      out[i + 2] = clampByte(b);
      out[i + 3] = preserveAlpha ? src[i + 3] : src[i + 3];
    }
  }

  return new ImageData(out, width, height);
}

/**
 * Sobel kernels for edge detection.
 */
export const sobelKernelX = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

export const sobelKernelY = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
];

/**
 * Laplacian kernel for edge detection.
 */
export const laplacianKernel = [
  [0, 1, 0],
  [1, -4, 1],
  [0, 1, 0],
];

/**
 * Sharpen kernel.
 */
export const sharpenKernel = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0],
];

/**
 * Emboss kernel.
 */
export const embossKernel = [
  [-2, -1, 0],
  [-1, 1, 1],
  [0, 1, 2],
];

/**
 * Generate Gaussian kernel.
 *
 * @param {number} sigma - Standard deviation
 * @param {number} size - Kernel size (must be odd)
 * @returns {number[]} 1D Gaussian kernel
 */
export function generateGaussianKernel1D(sigma, size) {
  const kernel = new Array(size);
  const center = Math.floor(size / 2);
  let sum = 0;

  for (let i = 0; i < size; i++) {
    const x = i - center;
    const value = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel[i] = value;
    sum += value;
  }

  // Normalize
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }

  return kernel;
}

/**
 * Apply 1D separable kernel to image (horizontal pass).
 *
 * @param {ImageData} imageData - Input image data
 * @param {number[]} kernel - 1D kernel
 * @returns {Float32Array} Interleaved RGBA data
 */
export function applyKernel1DHorizontal(imageData, kernel) {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Float32Array(src.length);

  const kHalf = Math.floor(kernel.length / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;

      for (let k = 0; k < kernel.length; k++) {
        const px = Math.min(width - 1, Math.max(0, x + k - kHalf));
        const pi = (y * width + px) * 4;
        const kv = kernel[k];

        r += src[pi] * kv;
        g += src[pi + 1] * kv;
        b += src[pi + 2] * kv;
        a += src[pi + 3] * kv;
      }

      const i = (y * width + x) * 4;
      out[i] = r;
      out[i + 1] = g;
      out[i + 2] = b;
      out[i + 3] = a;
    }
  }

  return out;
}

/**
 * Apply 1D separable kernel to image (vertical pass).
 *
 * @param {Float32Array} data - Input data (from horizontal pass)
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number[]} kernel - 1D kernel
 * @returns {ImageData} Final processed image data
 */
export function applyKernel1DVertical(data, width, height, kernel) {
  const out = new Uint8ClampedArray(data.length);
  const kHalf = Math.floor(kernel.length / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;

      for (let k = 0; k < kernel.length; k++) {
        const py = Math.min(height - 1, Math.max(0, y + k - kHalf));
        const pi = (py * width + x) * 4;
        const kv = kernel[k];

        r += data[pi] * kv;
        g += data[pi + 1] * kv;
        b += data[pi + 2] * kv;
        a += data[pi + 3] * kv;
      }

      const i = (y * width + x) * 4;
      out[i] = clampByte(r);
      out[i + 1] = clampByte(g);
      out[i + 2] = clampByte(b);
      out[i + 3] = clampByte(a);
    }
  }

  return new ImageData(out, width, height);
}

/**
 * Apply separable Gaussian blur.
 *
 * @param {ImageData} imageData - Input image data
 * @param {number} sigma - Standard deviation
 * @param {number} kernelSize - Kernel size (must be odd)
 * @returns {ImageData} Blurred image data
 */
export function gaussianBlur(imageData, sigma, kernelSize) {
  const kernel = generateGaussianKernel1D(sigma, kernelSize);
  const temp = applyKernel1DHorizontal(imageData, kernel);
  return applyKernel1DVertical(temp, imageData.width, imageData.height, kernel);
}
