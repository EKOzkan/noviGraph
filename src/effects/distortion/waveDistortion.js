/**
 * Wave/Ripple distortion effect.
 */

import { assertImageDataLike, createImageData, clamp } from '../utils/imageData.js';
import { samplePixel } from '../utils/transforms.js';

/**
 * Apply wave/ripple distortion.
 *
 * @param {ImageData} imageData - Input image data
 * @param {Object} options - Effect parameters
 * @param {number} [options.frequency=0.1] - Wave frequency (0.01-1)
 * @param {number} [options.amplitude=5] - Wave height (0-50)
 * @param {string} [options.direction='horizontal'] - Direction: 'horizontal', 'vertical', 'radial'
 * @param {number} [options.phase=0] - Wave phase offset (0-360)
 * @returns {ImageData} Distorted image data
 */
export function waveDistortion(imageData, options = {}) {
  assertImageDataLike(imageData);

  const frequency = clamp(options.frequency ?? 0.1, 0.01, 1);
  const amplitude = clamp(options.amplitude ?? 5, 0, 50);
  const direction = options.direction ?? 'horizontal';
  const phase = (options.phase ?? 0) % 360;

  const width = imageData.width;
  const height = imageData.height;
  const src = imageData.data;
  const out = new Uint8ClampedArray(src.length);

  const phaseRad = phase * (Math.PI / 180);
  const centerX = 0.5;
  const centerY = 0.5;
  const maxDist = Math.sqrt(0.5 * 0.5 + 0.5 * 0.5);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const ny = y / height;

      let srcX = nx;
      let srcY = ny;

      if (direction === 'horizontal') {
        // Horizontal wave
        const offset = Math.sin(ny * frequency * Math.PI * 2 + phaseRad) * amplitude / width;
        srcX = nx + offset;
      } else if (direction === 'vertical') {
        // Vertical wave
        const offset = Math.sin(nx * frequency * Math.PI * 2 + phaseRad) * amplitude / height;
        srcY = ny + offset;
      } else {
        // Radial wave
        const dx = nx - centerX;
        const dy = ny - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normalizedDist = dist / maxDist;

        const waveOffset = Math.sin(normalizedDist * frequency * Math.PI * 2 + phaseRad) * amplitude / maxDist;

        const newDist = dist + waveOffset;
        const scale = newDist / (dist || 1);
        srcX = centerX + dx * scale;
        srcY = centerY + dy * scale;
      }

      const [r, g, b, a] = samplePixel(src, width, height, srcX, srcY, 'bilinear');

      const idx = (y * width + x) * 4;
      out[idx] = r;
      out[idx + 1] = g;
      out[idx + 2] = b;
      out[idx + 3] = a;
    }
  }

  return new ImageData(out, width, height);
}
