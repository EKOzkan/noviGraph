import { Handle, Position } from 'reactflow';

const InputNode = ({ data }) => {
  return (
    <div className="custom-node input-node">
      <div className="node-header">{data.label || 'Input'}</div>
      <div className="node-body">
        <span>Image Upload</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default InputNode;
