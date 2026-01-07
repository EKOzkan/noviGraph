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
import NodePalette from './NodePalette';

import './NodeEditor.css';
import './NodePalette.css';

import { effectRegistry } from '../effects/index.js';

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
    data: { 
      label: 'Gaussian Blur',
      effectId: 'tonal',
      effectData: effectRegistry.tonal,
      parameters: {
        brightness: 0,
        contrast: 0,
        gamma: 1,
        blackPoint: 0,
        whitePoint: 255,
        saturation: 0,
      }
    },
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

  const handleAddNode = useCallback((newNode) => {
    // Position the new node intelligently
    const maxX = Math.max(...nodes.map(n => n.position.x), 200);
    const newPosition = {
      x: maxX + 250,
      y: 150 + (nodes.length * 50) % 300
    };

    setNodes(prevNodes => [
      ...prevNodes,
      {
        ...newNode,
        position: newPosition,
        data: {
          ...newNode.data,
          onParameterChange: (nodeId, newParameters) => {
            setNodes(prev =>
              prev.map(node =>
                node.id === nodeId
                  ? { ...node, data: { ...node.data, parameters: newParameters } }
                  : node
              )
            );
          }
        }
      }
    ]);
  }, [nodes]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    try {
      const effectId = event.dataTransfer.getData('effectId');
      if (effectId && effectRegistry[effectId]) {
        handleAddNode({
          id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'effectNode',
          data: {
            label: effectRegistry[effectId].name,
            effectId: effectId,
            effectData: effectRegistry[effectId],
            parameters: Object.fromEntries(
              Object.entries(effectRegistry[effectId].parameters || {}).map(([key, param]) => [key, param.default])
            )
          }
        });
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [handleAddNode]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <div className="editor-container">
      <header className="editor-header">
        <div className="logo" onClick={() => navigate('/')}>Novigraph</div>
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </header>

      <div className="editor-main">
        <NodePalette onAddNode={handleAddNode} />

        <div
          className="react-flow-wrapper"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
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
    </div>
  );
}

export default NodeEditor;
