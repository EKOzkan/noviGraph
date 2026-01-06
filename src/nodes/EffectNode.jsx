import { Handle, Position } from 'reactflow';

const EffectNode = ({ data }) => {
  return (
    <div className="custom-node effect-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">{data.label || 'Effect'}</div>
      <div className="node-body">
        <div className="param-panel">
          <label>Intensity</label>
          <input type="range" min="0" max="100" defaultValue="50" />
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default EffectNode;
