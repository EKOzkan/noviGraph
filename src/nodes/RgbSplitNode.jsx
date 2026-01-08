import { Handle, Position } from 'reactflow';
import { useEffect, useRef, useState } from 'react';

const RgbSplitNode = ({ data, id, selected }) => {
  const [showPreview, setShowPreview] = useState(Boolean(data.showPreview));

  useEffect(() => {
    setShowPreview(Boolean(data.showPreview));
  }, [data.showPreview]);

  return (
    <div className={`custom-node rgb-split-node ${data.isPreviewed ? 'previewing' : ''} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />

      <div className="node-header node-drag-handle">
        <div className="node-title">RGB Split</div>
        <div className="node-header-right">
          <label className="preview-toggle" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={showPreview}
              onChange={(e) => {
                data?.onTogglePreview?.(id, e.target.checked);
              }}
            />
            <span>Preview</span>
          </label>
        </div>
      </div>

      <div className="node-body">
        <div className="node-description">Split image into R, G, B channels</div>

        {showPreview && data.previewUrls && (
          <div className="rgb-preview-grid">
            {data.previewUrls.map((url, index) => (
              <div key={index} className="rgb-channel-preview">
                <div className="channel-label">RGB[{index}]</div>
                <img
                  className="channel-thumb"
                  src={url}
                  alt={`Channel ${index}`}
                  onClick={() => data?.onOpenPreview?.(id, index)}
                />
              </div>
            ))}
          </div>
        )}

        {data.processingTimeMs !== undefined && (
          <div className="node-processing-time">{Math.round(data.processingTimeMs)} ms</div>
        )}
      </div>

      <Handle type="source" position={Position.Right} style={{ top: '30%' }} />
      <Handle type="source" position={Position.Right} style={{ top: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ top: '70%' }} />
    </div>
  );
};

export default RgbSplitNode;
