/**
 * Canny edge detection effect.
 */

import { assertImageDataLike, createImageData, clampByte, clamp } from '../utils/imageData.js';
import { gaussianBlur as gaussianBlurUtil, sobelKernelX, sobelKernelY } from '../utils/convolution.js';

/**
 * Apply Canny edge detection.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.lowThreshold=50] - Low threshold for hysteresis (0-255)
 * @param {number} [options.highThreshold=150] - High threshold for hysteresis (0-255)
 * @param {number} [options.sigma=1.4] - Gaussian blur sigma (0.5-2)
 * @returns {ImageData} Edge-detected image data
 */
export function cannyEdge(imageData, options = {}) {
  assertImageDataLike(imageData);

  const lowThreshold = clamp(options.lowThreshold ?? 50, 0, 255);
  const highThreshold = clamp(options.highThreshold ?? 150, 0, 255);
  const sigma = clamp(options.sigma ?? 1.4, 0.5, 2);

  const width = imageData.width;
  const height = imageData.height;

  // Step 1: Gaussian blur
  const kernelSize = Math.ceil(sigma * 6) % 2 === 0 ? Math.ceil(sigma * 6) + 1 : Math.ceil(sigma * 6);
  const blurred = gaussianBlurUtil(imageData, sigma, kernelSize);

  // Step 2: Gradient calculation (Sobel)
  const gradientData = calculateGradients(blurred);

  // Step 3: Non-maximum suppression
  const suppressed = nonMaximumSuppression(gradientData, width, height);

  // Step 4: Double thresholding and hysteresis
  return hysteresis(suppressed, lowThreshold, highThreshold, width, height);
}

/**
 * Calculate gradients using Sobel operators.
 */
function calculateGradients(imageData) {
  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;

  const gradients = {
    magnitude: new Float32Array(width * height),
    direction: new Float32Array(width * height),
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const py = Math.min(height - 1, Math.max(0, y + ky));
          const px = Math.min(width - 1, Math.max(0, x + kx));
          const pi = (py * width + px) * 4;

          const value = src[pi] * 0.299 + src[pi + 1] * 0.587 + src[pi + 2] * 0.114;
          gx += value * sobelKernelX[ky + 1][kx + 1];
          gy += value * sobelKernelY[ky + 1][kx + 1];
        }
      }

      const idx = y * width + x;
      gradients.magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
      gradients.direction[idx] = Math.atan2(gy, gx);
    }
  }

  return gradients;
}

/**
 * Non-maximum suppression.
 */
function nonMaximumSuppression(gradients, width, height) {
  const suppressed = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const angle = gradients.direction[idx] * (180 / Math.PI);

      // Quantize angle to 4 directions (0, 45, 90, 135)
      let direction;
      if ((angle >= -22.5 && angle < 22.5) || (angle >= 157.5 || angle < -157.5)) {
        direction = 0; // Horizontal
      } else if ((angle >= 22.5 && angle < 67.5) || (angle >= -157.5 && angle < -112.5)) {
        direction = 1; // 45 degrees
      } else if ((angle >= 67.5 && angle < 112.5) || (angle >= -112.5 && angle < -67.5)) {
        direction = 2; // Vertical
      } else {
        direction = 3; // 135 degrees
      }

      // Compare with neighbors in gradient direction
      const magnitude = gradients.magnitude[idx];
      let isMax = false;

      if (direction === 0) {
        isMax = magnitude >= gradients.magnitude[idx - 1] && magnitude >= gradients.magnitude[idx + 1];
      } else if (direction === 1) {
        isMax = magnitude >= gradients.magnitude[idx - width - 1] && magnitude >= gradients.magnitude[idx + width + 1];
      } else if (direction === 2) {
        isMax = magnitude >= gradients.magnitude[idx - width] && magnitude >= gradients.magnitude[idx + width];
      } else {
        isMax = magnitude >= gradients.magnitude[idx - width + 1] && magnitude >= gradients.magnitude[idx + width - 1];
      }

      suppressed[idx] = isMax ? magnitude : 0;
    }
  }

  return suppressed;
}

/**
 * Double thresholding and hysteresis.
 */
function hysteresis(suppressed, lowThreshold, highThreshold, width, height) {
  const out = new Uint8ClampedArray(width * height * 4);

  // Strong edges
  const strong = new Uint8Array(width * height);
  const weak = new Uint8Array(width * height);

  for (let i = 0; i < suppressed.length; i++) {
    if (suppressed[i] >= highThreshold) {
      strong[i] = 1;
    } else if (suppressed[i] >= lowThreshold) {
      weak[i] = 1;
    }
  }

  // Hysteresis - track weak edges connected to strong edges
  const visited = new Uint8Array(width * height);

  function trackWeakEdge(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;

    if (weak[idx] || strong[idx]) {
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          trackWeakEdge(x + kx, y + ky);
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (strong[idx] && !visited[idx]) {
        trackWeakEdge(x, y);
      }
    }
  }

  // Create output
  for (let i = 0; i < suppressed.length; i++) {
    const value = strong[i] || (weak[i] && visited[i]) ? 255 : 0;
    const idx = i * 4;
    out[idx] = value;
    out[idx + 1] = value;
    out[idx + 2] = value;
    out[idx + 3] = 255;
  }

  return new ImageData(out, width, height);
}
