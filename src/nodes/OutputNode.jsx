import { Handle, Position } from 'reactflow';

const OutputNode = ({ data }) => {
  return (
    <div className="custom-node output-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">{data.label || 'Output'}</div>
      <div className="node-body">
        <span>Preview</span>
      </div>
    </div>
  );
};

export default OutputNode;
