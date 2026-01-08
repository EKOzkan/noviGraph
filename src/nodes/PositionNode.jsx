import { Handle, Position } from 'reactflow';
import { useEffect, useRef, useState } from 'react';

const PositionNode = ({ data, id, selected }) => {
  const [parameters, setParameters] = useState(data.parameters || {});
  const [showPreview, setShowPreview] = useState(Boolean(data.showPreview));
  const debounceRef = useRef(null);

  useEffect(() => {
    setParameters(data.parameters || {});
  }, [data.parameters]);

  useEffect(() => {
    setShowPreview(Boolean(data.showPreview));
  }, [data.showPreview]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const emitParameterChange = (newParameters) => {
    if (!data.onParameterChange) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      data.onParameterChange(id, newParameters);
    }, 120);
  };

  const handleParameterChange = (paramName, value) => {
    const newParameters = { ...parameters, [paramName]: parseFloat(value) };
    setParameters(newParameters);
    emitParameterChange(newParameters);
  };

  const handleWrapModeChange = (value) => {
    const newParameters = { ...parameters, wrapMode: value };
    setParameters(newParameters);
    emitParameterChange(newParameters);
  };

  return (
    <div className={`custom-node position-node ${data.isPreviewed ? 'previewing' : ''} ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />

      <div className="node-header node-drag-handle">
        <div className="node-title">Position</div>
        <div className="node-header-right">
          <label className="preview-toggle" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={showPreview}
              onChange={(e) => {
                const next = e.target.checked;
                setShowPreview(next);
                data?.onTogglePreview?.(id, next);
              }}
            />
            <span>Preview</span>
          </label>
        </div>
      </div>

      <div className="node-body">
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

        <div className="param-panel">
          <div className="param-control">
            <label>Offset X</label>
            <input
              type="range"
              min="-1000"
              max="1000"
              value={parameters.offsetX ?? 0}
              onChange={(e) => handleParameterChange('offsetX', e.target.value)}
            />
            <span className="param-value">{parameters.offsetX ?? 0}</span>
          </div>

          <div className="param-control">
            <label>Offset Y</label>
            <input
              type="range"
              min="-1000"
              max="1000"
              value={parameters.offsetY ?? 0}
              onChange={(e) => handleParameterChange('offsetY', e.target.value)}
            />
            <span className="param-value">{parameters.offsetY ?? 0}</span>
          </div>

          <div className="param-control">
            <label>Wrap Mode</label>
            <select
              value={parameters.wrapMode ?? 'transparent'}
              onChange={(e) => handleWrapModeChange(e.target.value)}
            >
              <option value="transparent">Transparent</option>
              <option value="clamp">Clamp</option>
              <option value="wrap">Wrap</option>
            </select>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default PositionNode;
