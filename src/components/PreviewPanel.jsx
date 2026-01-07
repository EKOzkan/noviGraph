import { useEffect, useMemo, useRef, useState } from 'react';

import { drawImageDataToCanvas } from '../utils/imageUtils.js';

const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

function PreviewPanel({
  imageData,
  isProcessing,
  mode,
  onChangeMode,
  title,
  processingTimeMs,
  error,
  warnings,
  canExport,
  exporting,
  onExport,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [jpgQuality, setJpgQuality] = useState(0.92);
  const dragRef = useRef(null);

  useEffect(() => {
    drawImageDataToCanvas(canvasRef.current, imageData);
  }, [imageData]);

  useEffect(() => {
    // Reset view when dimensions change.
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [imageData?.width, imageData?.height]);

  const dimsLabel = useMemo(() => {
    if (!imageData) return '—';
    return `${imageData.width}×${imageData.height}`;
  }, [imageData]);

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <div className="preview-title">{title || 'Preview'}</div>
        <div className="preview-mode-toggle">
          <button
            type="button"
            className={`toggle-button ${mode === 'final' ? 'active' : ''}`}
            onClick={() => onChangeMode('final')}
          >
            Final
          </button>
          <button
            type="button"
            className={`toggle-button ${mode === 'node' ? 'active' : ''}`}
            onClick={() => onChangeMode('node')}
          >
            Node
          </button>
        </div>
      </div>

      <div className="preview-toolbar">
        <div className="zoom-control">
          <button type="button" className="tool-button" onClick={() => setZoom((z) => clamp(z - 0.1, 0.1, 8))}>
            −
          </button>
          <input
            type="range"
            min={0.1}
            max={8}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
          <button type="button" className="tool-button" onClick={() => setZoom((z) => clamp(z + 0.1, 0.1, 8))}>
            +
          </button>
          <button
            type="button"
            className="tool-button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            Reset
          </button>
        </div>

        <div className="preview-meta">
          <span>{dimsLabel}</span>
          {processingTimeMs !== undefined && <span>{Math.round(processingTimeMs)} ms</span>}
        </div>

        {canExport && (
          <div className="export-panel preview-export">
            <div className="export-row">
              <button
                className="node-button"
                type="button"
                disabled={!canExport || exporting}
                onClick={() => onExport?.('png')}
              >
                PNG
              </button>

              <button
                className="node-button"
                type="button"
                disabled={!canExport || exporting}
                onClick={() => onExport?.('webp')}
              >
                WebP
              </button>
            </div>

            <div className="export-row">
              <button
                className="node-button"
                type="button"
                disabled={!canExport || exporting}
                onClick={() => onExport?.('jpg', { quality: jpgQuality })}
              >
                JPG
              </button>

              <div className="quality-control">
                <label>Q</label>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.01}
                  value={jpgQuality}
                  onChange={(e) => setJpgQuality(parseFloat(e.target.value))}
                />
                <span>{Math.round(jpgQuality * 100)}</span>
              </div>
            </div>

            {exporting && <div className="export-status">Exporting…</div>}
          </div>
        )}
      </div>

      <div
        className="preview-canvas-container"
        ref={containerRef}
        onPointerDown={(e) => {
          if (!imageData) return;
          dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return;
          const dx = e.clientX - dragRef.current.startX;
          const dy = e.clientY - dragRef.current.startY;
          setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
        }}
        onPointerUp={(e) => {
          if (!dragRef.current) return;
          dragRef.current = null;
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {
            // ignore
          }
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        {imageData ? (
          <canvas
            ref={canvasRef}
            className="preview-canvas"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'top left' }}
          />
        ) : (
          <div className="preview-empty">Upload an image to begin</div>
        )}

        {isProcessing && <div className="preview-overlay">Processing…</div>}
      </div>

      {error && <div className="preview-error">{error}</div>}
      {!error && warnings?.length > 0 && <div className="preview-warn">{warnings[0]}</div>}
    </div>
  );
}

export default PreviewPanel;
