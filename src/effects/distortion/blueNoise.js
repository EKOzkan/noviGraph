/**
 * Blue noise - high-quality, perceptually uniform noise distribution.
 * 
 * Blue noise has minimal low-frequency content, appearing more evenly distributed
 * than white noise while avoiding clumping patterns. This implementation uses
 * a void-and-cluster algorithm for efficient generation.
 */

import { assertImageDataLike, clampByte, createImageData, clamp } from '../utils/imageData.js';
import { createRng } from '../utils/random.js';
import { applyPixelSizeEffect } from '../utils/pixelSize.js';

/**
 * Generate a blue noise threshold map using void-and-cluster algorithm.
 * This creates a perceptually uniform noise distribution.
 * 
 * @param {number} width - Width of the noise map
 * @param {number} height - Height of the noise map
 * @param {Function} rng - Random number generator
 * @returns {Float32Array} Blue noise map with values 0-1
 */
function generateBlueNoiseMap(width, height, rng) {
  const size = width * height;
  const map = new Float32Array(size);
  const ranked = new Uint16Array(size);
  
  // Initialize with white noise
  for (let i = 0; i < size; i++) {
    map[i] = rng();
  }
  
  // Gaussian kernel for spatial filtering (5x5)
  const kernelSize = 5;
  const kernelRadius = Math.floor(kernelSize / 2);
  const kernel = new Float32Array(kernelSize * kernelSize);
  const sigma = 1.5;
  let kernelSum = 0;
  
  for (let ky = 0; ky < kernelSize; ky++) {
    for (let kx = 0; kx < kernelSize; kx++) {
      const dx = kx - kernelRadius;
      const dy = ky - kernelRadius;
      const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      kernel[ky * kernelSize + kx] = value;
      kernelSum += value;
    }
  }
  
  // Normalize kernel
  for (let i = 0; i < kernel.length; i++) {
    kernel[i] /= kernelSum;
  }
  
  // Void-and-cluster: iteratively find voids and clusters
  const iterations = Math.min(size, 2048);
  
  for (let iter = 0; iter < iterations; iter++) {
    // Find largest cluster (highest filtered value)
    let maxIdx = 0;
    let maxVal = -Infinity;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (ranked[idx] > 0) continue;
        
        // Compute filtered value
        let filtered = 0;
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const sx = (x + kx - kernelRadius + width) % width;
            const sy = (y + ky - kernelRadius + height) % height;
            const sidx = sy * width + sx;
            filtered += map[sidx] * kernel[ky * kernelSize + kx];
          }
        }
        
        if (filtered > maxVal) {
          maxVal = filtered;
          maxIdx = idx;
        }
      }
    }
    
    // Mark this as ranked
    ranked[maxIdx] = iter + 1;
  }
  
  // Convert rankings to normalized values
  const maxRank = Math.max(...ranked);
  for (let i = 0; i < size; i++) {
    map[i] = ranked[i] / maxRank;
  }
  
  return map;
}

/**
 * Apply blue noise to an image (core implementation without Size_).
 * 
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=0.2] - Noise amount (range: 0-1)
 * @param {boolean} [options.monochrome=true] - If true, add the same noise to RGB
 * @param {number|null} [options.seed=null] - Seed for deterministic noise (optional)
 * @param {number} [options.scale=1] - Scale of noise pattern (1-8, larger = coarser)
 * @returns {ImageData} Processed image data
 */
function blueNoiseCore(imageData, options = {}) {
  assertImageDataLike(imageData);

  const amount = clamp(options.amount ?? 0.2, 0, 1);
  const monochrome = options.monochrome ?? true;
  const scale = clamp(options.scale ?? 1, 1, 8);
  const rng = createRng(options.seed ?? null);

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = createImageData(width, height);
  const dst = out.data;

  // Generate blue noise map at scaled resolution
  const noiseWidth = Math.max(32, Math.ceil(width / scale));
  const noiseHeight = Math.max(32, Math.ceil(height / scale));
  const noiseMap = generateBlueNoiseMap(noiseWidth, noiseHeight, rng);

  const amp = amount * 255;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Sample from noise map with wrapping
      const nx = Math.floor(x / scale) % noiseWidth;
      const ny = Math.floor(y / scale) % noiseHeight;
      const noiseIdx = ny * noiseWidth + nx;
      const noiseValue = (noiseMap[noiseIdx] * 2 - 1) * amp;

      if (monochrome) {
        dst[idx] = clampByte(src[idx] + noiseValue);
        dst[idx + 1] = clampByte(src[idx + 1] + noiseValue);
        dst[idx + 2] = clampByte(src[idx + 2] + noiseValue);
      } else {
        // For color noise, offset noise map sampling per channel
        const nxR = (nx + 1) % noiseWidth;
        const nxG = (nx + 2) % noiseWidth;
        const noiseR = (noiseMap[ny * noiseWidth + nxR] * 2 - 1) * amp;
        const noiseG = (noiseMap[ny * noiseWidth + nxG] * 2 - 1) * amp;
        
        dst[idx] = clampByte(src[idx] + noiseR);
        dst[idx + 1] = clampByte(src[idx + 1] + noiseG);
        dst[idx + 2] = clampByte(src[idx + 2] + noiseValue);
      }
      
      dst[idx + 3] = src[idx + 3];
    }
  }

  return out;
}

/**
 * Apply blue noise to an image.
 * 
 * Blue noise provides higher quality, more perceptually uniform noise
 * compared to standard white noise. It avoids clumping and has a more
 * even spatial distribution.
 * 
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.amount=0.2] - Noise amount (range: 0-1)
 * @param {boolean} [options.monochrome=true] - If true, add the same noise to RGB
 * @param {number|null} [options.seed=null] - Seed for deterministic noise (optional)
 * @param {number} [options.scale=1] - Scale of noise pattern (1-8, larger = coarser)
 * @param {number} [options.Size_=1] - Pixel size scaling (1-32, default 1)
 * @returns {ImageData} Processed image data
 */
export function blueNoise(imageData, options = {}) {
  const Size_ = clamp(options.Size_ ?? 1, 1, 32);
  return applyPixelSizeEffect(imageData, Size_, blueNoiseCore, options);
}
