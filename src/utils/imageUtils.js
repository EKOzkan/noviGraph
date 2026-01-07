import { createImageData } from '../effects/utils/imageData.js';

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export async function fileToImageData(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  bitmap.close?.();
  return imageData;
}

export function cloneToPlainImageData(imageData) {
  return createImageData(imageData.width, imageData.height, new Uint8ClampedArray(imageData.data));
}

export function drawImageDataToCanvas(canvas, imageData) {
  if (!canvas || !imageData) return;
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.putImageData(imageData, 0, 0);
}

export async function imageDataToDataUrl(imageData, { maxSize = 256, mimeType = 'image/png', quality } = {}) {
  if (!imageData) return null;

  const { width, height } = imageData;
  const scale = Math.min(1, maxSize / Math.max(width, height));
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const tmp = document.createElement('canvas');
  tmp.width = width;
  tmp.height = height;
  const tmpCtx = tmp.getContext('2d', { willReadFrequently: true });
  tmpCtx.putImageData(imageData, 0, 0);

  ctx.drawImage(tmp, 0, 0, outW, outH);

  if (mimeType === 'image/jpeg' || mimeType === 'image/webp') {
    return canvas.toDataURL(mimeType, quality ?? 0.92);
  }
  return canvas.toDataURL(mimeType);
}

export async function imageDataToBlob(imageData, { mimeType = 'image/png', quality } = {}) {
  if (!imageData) return null;
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      mimeType === 'image/jpeg' || mimeType === 'image/webp' ? (quality ?? 0.92) : undefined
    );
  });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Some browsers can fail the download if we revoke synchronously.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
