import { useState, useCallback } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  applyEdgeChanges, 
  applyNodeChanges 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';

import InputNode from '../nodes/InputNode';
import EffectNode from '../nodes/EffectNode';
import OutputNode from '../nodes/OutputNode';

import './NodeEditor.css';

const nodeTypes = {
  inputNode: InputNode,
  effectNode: EffectNode,
  outputNode: OutputNode,
};

const initialNodes = [
  {
    id: 'node-1',
    type: 'inputNode',
    position: { x: 100, y: 150 },
    data: { label: 'Input Image' },
  },
  {
    id: 'node-2',
    type: 'effectNode',
    position: { x: 400, y: 150 },
    data: { label: 'Gaussian Blur' },
  },
  {
    id: 'node-3',
    type: 'outputNode',
    position: { x: 700, y: 150 },
    data: { label: 'Final Output' },
  },
];

const initialEdges = [
  { id: 'edge-1', source: 'node-1', target: 'node-2' },
  { id: 'edge-2', source: 'node-2', target: 'node-3' },
];

function NodeEditor() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div className="editor-container">
      <header className="editor-header">
        <div className="logo" onClick={() => navigate('/')}>Novigraph</div>
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </header>
      
      <div className="react-flow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#333" gap={20} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default NodeEditor;
