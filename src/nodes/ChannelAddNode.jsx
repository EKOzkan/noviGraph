import { Handle, Position } from 'reactflow';
import { useEffect, useRef, useState } from 'react';

const ChannelAddNode = ({ data, id, selected }) => {
  const [showPreview, setShowPreview] = useState(Boolean(data.showPreview));

  useEffect(() => {
    setShowPreview(Boolean(data.showPreview));
  }, [data.showPreview]);

  return (
    <div className={`custom-node channel-add-node ${data.isPreviewed ? 'previewing' : ''} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} style={{ top: '30%' }} />
      <Handle type="target" position={Position.Left} style={{ top: '50%' }} />
      <Handle type="target" position={Position.Left} style={{ top: '70%' }} />

      <div className="node-header node-drag-handle">
        <div className="node-title">Channel Add</div>
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
        <div className="node-description">Combine R, G, B channels</div>

        {showPreview && data.previewUrl && (
          <button
            type="button"
            className="node-preview-button"
            onClick={(e) => {
              e.stopPropagation();
              data?.onOpenPreview?.(id);
            }}
          >
            <img className="node-thumb" src={data.previewUrl} alt="Node preview" />
            <div className="node-preview-caption">
              {data.processingTimeMs !== undefined ? `${Math.round(data.processingTimeMs)} ms` : ''}
            </div>
          </button>
        )}

        <div className="channel-inputs">
          <div className="channel-input">R</div>
          <div className="channel-input">G</div>
          <div className="channel-input">B</div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default ChannelAddNode;
