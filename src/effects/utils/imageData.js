/**
 * Utilities for working with ImageData-like objects.
 *
 * This library is intended to be framework-agnostic. Most effects prefer real
 * `ImageData` instances, but these helpers also support "ImageData-like" objects
 * ({ data: Uint8ClampedArray, width: number, height: number }).
 */

/**
 * @typedef {Object} ImageDataLike
 * @property {Uint8ClampedArray} data
 * @property {number} width
 * @property {number} height
 */

/**
 * @param {any} imageData
 * @returns {asserts imageData is ImageDataLike}
 */
export function assertImageDataLike(imageData) {
  if (!imageData || typeof imageData.width !== 'number' || typeof imageData.height !== 'number' || !imageData.data) {
    throw new TypeError('Expected ImageData-like object with { data, width, height }.');
  }
  if (!(imageData.data instanceof Uint8ClampedArray)) {
    throw new TypeError('Expected imageData.data to be a Uint8ClampedArray.');
  }
}

/**
 * @param {number} v
 * @returns {number}
 */
export function clampByte(v) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

/**
 * @param {number} v
 * @param {number} min
 * @param {number} max
 */
export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

/**
 * @param {ImageDataLike} imageData
 * @returns {ImageDataLike}
 */
export function cloneImageData(imageData) {
  assertImageDataLike(imageData);
  return createImageData(imageData.width, imageData.height, new Uint8ClampedArray(imageData.data));
}

/**
 * Create an ImageData (when available) or an ImageData-like object.
 *
 * @param {number} width
 * @param {number} height
 * @param {Uint8ClampedArray} [data]
 * @returns {ImageDataLike}
 */
export function createImageData(width, height, data = new Uint8ClampedArray(width * height * 4)) {
  // In browsers, ImageData is typically available.
  if (typeof ImageData !== 'undefined') {
    return new ImageData(data, width, height);
  }
  // Fallback for non-DOM environments.
  return { data, width, height };
}

/**
 * @param {ImageDataLike} imageData
 * @param {number} x
 * @param {number} y
 */
export function idx(imageData, x, y) {
  return (y * imageData.width + x) * 4;
}

/**
 * @param {ImageDataLike} imageData
 * @param {number} x
 * @param {number} y
 */
export function inBounds(imageData, x, y) {
  return x >= 0 && y >= 0 && x < imageData.width && y < imageData.height;
}
