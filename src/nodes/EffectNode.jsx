import { Handle, Position } from 'reactflow';
import { useEffect, useRef, useState } from 'react';

const EffectNode = ({ data, id, selected }) => {
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
    const newParameters = { ...parameters, [paramName]: value };
    setParameters(newParameters);
    emitParameterChange(newParameters);
  };

  const renderParameterControl = (paramName, paramDef) => {
    const value = parameters[paramName];

    if (paramDef.min !== undefined && paramDef.max !== undefined) {
      const v = value !== undefined ? value : paramDef.default;
      const step =
        paramDef.step !== undefined
          ? paramDef.step
          : Math.max(0.001, (paramDef.max - paramDef.min) / 100);

      return (
        <div className="param-control" key={paramName}>
          <label>{paramName}</label>
          <input
            type="range"
            min={paramDef.min}
            max={paramDef.max}
            step={step}
            value={v}
            onChange={(e) => handleParameterChange(paramName, parseFloat(e.target.value))}
          />
          <span className="param-value">{Number.isFinite(v) ? Number(v).toFixed(2) : String(v)}</span>
        </div>
      );
    }

    if (paramDef.options) {
      const v = value !== undefined ? value : paramDef.default;
      return (
        <div className="param-control" key={paramName}>
          <label>{paramName}</label>
          <select
            value={String(v)}
            onChange={(e) => {
              const selectedValue =
                paramDef.options[0] === true || paramDef.options[0] === false
                  ? e.target.value === 'true'
                  : e.target.value;
              handleParameterChange(paramName, selectedValue);
            }}
          >
            {paramDef.options.map((option, index) => (
              <option key={index} value={String(option)}>
                {String(option)}
              </option>
            ))}
          </select>
        </div>
      );
    }

    const v = value !== undefined ? value : paramDef.default;
    return (
      <div className="param-control" key={paramName}>
        <label>{paramName}</label>
        <input type="text" value={v ?? ''} onChange={(e) => handleParameterChange(paramName, e.target.value)} />
      </div>
    );
  };

  return (
    <div
      className={`custom-node effect-node ${data.isPreviewed ? 'previewing' : ''} ${selected ? 'selected' : ''}`}
    >
      <Handle type="target" position={Position.Left} />

      <div className="node-header node-drag-handle">
        <div className="node-title">{data.label || 'Effect'}</div>
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

        {data.effectData && data.effectData.parameters && (
          <div className="param-panel">
            {Object.entries(data.effectData.parameters).map(([paramName, paramDef]) =>
              renderParameterControl(paramName, paramDef)
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default EffectNode;
