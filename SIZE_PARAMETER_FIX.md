# Size_ Parameter Fix - Matching DitherPal Implementation

## Problem
The Size_ parameter implementation in noviGraph was producing buggy results because it differed from DitherPal's implementation in two critical ways:

1. **Dimension calculation**: noviGraph used `Math.ceil()` while DitherPal uses `Math.floor()`
2. **Sampling method**: noviGraph averaged all pixels in each block while DitherPal samples the center pixel

## Solution
Updated `src/effects/utils/pixelSize.js` to exactly match DitherPal's implementation:

### Changes to `downsample()`:

**Before (noviGraph - buggy):**
```javascript
const newWidth = Math.ceil(width / pixelSize);
const newHeight = Math.ceil(height / pixelSize);

// Averaged all pixels in each block
for (let py = startY; py < endY; py++) {
  for (let px = startX; px < endX; px++) {
    r += src[i];
    g += src[i + 1];
    // ... averaging logic
  }
}
```

**After (matching DitherPal):**
```javascript
const newWidth = Math.max(1, Math.floor(width / pixelSize));
const newHeight = Math.max(1, Math.floor(height / pixelSize));

// Sample the center pixel of the block for performance and crispness
const srcX = Math.floor(x * pixelSize + pixelSize / 2);
const srcY = Math.floor(y * pixelSize + pixelSize / 2);
const srcIdx = (Math.min(height - 1, srcY) * width + Math.min(width - 1, srcX)) * 4;
```

### Changes to `upsample()`:

**Before (noviGraph):**
```javascript
const srcX = Math.floor(x / pixelSize);
const srcY = Math.floor(y / pixelSize);
```

**After (matching DitherPal):**
```javascript
const scaleX = width / targetWidth;
const scaleY = height / targetHeight;

const srcX = Math.floor(x * scaleX);
const srcY = Math.floor(y * scaleY);
```

## Benefits of DitherPal's Approach

1. **Performance**: Sampling center pixel is much faster than averaging all pixels
2. **Crispness**: No blending/smoothing artifacts from averaging
3. **Consistency**: Visual output now matches DitherPal exactly
4. **Correctness**: Uses proper scaling calculations

## Affected Files

- `src/effects/utils/pixelSize.js` - Updated downsample() and upsample() functions

## Dithering Algorithms Using Size_

All dithering algorithms correctly use the updated implementation via `applyPixelSizeEffect()`:
- Floyd-Steinberg (`src/effects/dithering/floydSteinberg.js`)
- Ordered Dither (`src/effects/dithering/orderedDither.js`)
- Threshold (`src/effects/dithering/threshold.js`)
- Pattern Dither (`src/effects/dithering/patternDither.js`)

## Testing

All tests pass with the new implementation:
- Basic effects tests continue to pass
- Size_ parameter correctly maintains output dimensions
- Implementation verified to match DitherPal's behavior
