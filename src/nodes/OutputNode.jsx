import { useMemo, useState } from 'react';
import { Handle, Position } from 'reactflow';

import { formatBytes } from '../utils/imageUtils.js';

const OutputNode = ({ data, selected }) => {
  const [jpgQuality, setJpgQuality] = useState(0.92);

  const processedRawSize = useMemo(() => {
    if (!data.outputInfo?.width || !data.outputInfo?.height) return 0;
    return data.outputInfo.width * data.outputInfo.height * 4;
  }, [data.outputInfo?.width, data.outputInfo?.height]);

  return (
    <div className={`custom-node output-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node-header">{data.label || 'Output'}</div>

      <div className="node-body">
        {data.previewUrl ? (
          <button
            type="button"
            className="node-preview-button"
            onClick={(e) => {
              e.stopPropagation();
              data?.onOpenPreview?.(data.nodeId);
            }}
          >
            <img className="node-thumb" src={data.previewUrl} alt="Final output preview" />
            <div className="node-preview-caption">{data.totalTimeMs ? `${Math.round(data.totalTimeMs)} ms` : ''}</div>
          </button>
        ) : (
          <div className="output-placeholder">No output</div>
        )}

        <div className="output-stats">
          <div>
            <strong>Dims:</strong> {data.outputInfo?.width ? `${data.outputInfo.width}×${data.outputInfo.height}` : '—'}
          </div>
          <div>
            <strong>Original:</strong> {data.inputInfo?.size ? formatBytes(data.inputInfo.size) : '—'}
          </div>
          <div>
            <strong>Processed (raw):</strong> {processedRawSize ? formatBytes(processedRawSize) : '—'}
          </div>
        </div>

        <div className="export-panel">
          <div className="export-row">
            <button
              className="node-button"
              type="button"
              disabled={!data.canExport || data.exporting}
              onClick={(e) => {
                e.stopPropagation();
                data?.onExport?.('png');
              }}
            >
              PNG
            </button>

            <button
              className="node-button"
              type="button"
              disabled={!data.canExport || data.exporting}
              onClick={(e) => {
                e.stopPropagation();
                data?.onExport?.('webp');
              }}
            >
              WebP
            </button>
          </div>

          <div className="export-row">
            <button
              className="node-button"
              type="button"
              disabled={!data.canExport || data.exporting}
              onClick={(e) => {
                e.stopPropagation();
                data?.onExport?.('jpg', { quality: jpgQuality });
              }}
            >
              JPG
            </button>
            <div className="quality-control" onClick={(e) => e.stopPropagation()}>
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

          {data.exporting && <div className="export-status">Exporting…</div>}
        </div>
      </div>
    </div>
  );
};

export default OutputNode;
