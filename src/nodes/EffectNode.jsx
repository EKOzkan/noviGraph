import { Handle, Position } from 'reactflow';
import { useState, useEffect } from 'react';

const EffectNode = ({ data, id }) => {
  const [parameters, setParameters] = useState(data.parameters || {});

  useEffect(() => {
    // Update parameters when data changes
    setParameters(data.parameters || {});
  }, [data.parameters]);

  const handleParameterChange = (paramName, value) => {
    const newParameters = { ...parameters, [paramName]: value };
    setParameters(newParameters);
    
    // Update the node data
    if (data.onParameterChange) {
      data.onParameterChange(id, newParameters);
    }
  };

  const renderParameterControl = (paramName, paramDef) => {
    const value = parameters[paramName];
    
    if (paramDef.min !== undefined && paramDef.max !== undefined) {
      // Slider/Range control
      return (
        <div className="param-control" key={paramName}>
          <label>{paramName}</label>
          <input 
            type="range"
            min={paramDef.min}
            max={paramDef.max}
            step={(paramDef.step !== undefined) ? paramDef.step : (paramDef.max - paramDef.min) / 100}
            value={value !== undefined ? value : paramDef.default}
            onChange={(e) => handleParameterChange(paramName, parseFloat(e.target.value))}
          />
          <span className="param-value">{value !== undefined ? value.toFixed(2) : paramDef.default}</span>
        </div>
      );
    } else if (paramDef.options) {
      // Dropdown/Select control
      return (
        <div className="param-control" key={paramName}>
          <label>{paramName}</label>
          <select
            value={value !== undefined ? value : paramDef.default}
            onChange={(e) => {
              const selectedValue = paramDef.options[0] === true || paramDef.options[0] === false 
                ? e.target.value === 'true'
                : e.target.value;
              handleParameterChange(paramName, selectedValue);
            }}
          >
            {paramDef.options.map((option, index) => (
              <option key={index} value={option}>{String(option)}</option>
            ))}
          </select>
        </div>
      );
    } else {
      // Text input for default parameters
      return (
        <div className="param-control" key={paramName}>
          <label>{paramName}</label>
          <input
            type="text"
            value={value !== undefined ? value : paramDef.default}
            onChange={(e) => handleParameterChange(paramName, e.target.value)}
          />
        </div>
      );
    }
  };

  return (
    <div className="custom-node effect-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">{data.label || 'Effect'}</div>
      <div className="node-body">
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

