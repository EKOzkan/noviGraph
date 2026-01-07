import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';

import InputNode from '../nodes/InputNode.jsx';
import EffectNode from '../nodes/EffectNode.jsx';
import OutputNode from '../nodes/OutputNode.jsx';
import NodePalette from './NodePalette.jsx';
import PreviewPanel from './PreviewPanel.jsx';
import PreviewModal from './PreviewModal.jsx';

import './NodeEditor.css';
import './NodePalette.css';

import { effectRegistry } from '../effects/index.js';
import { executeGraph } from '../utils/graphExecutor.js';
import { downloadBlob, fileToImageData, imageDataToBlob, imageDataToDataUrl } from '../utils/imageUtils.js';
import {
  serializeGraph,
  deserializeGraph,
  downloadGraph,
  loadGraphFromFile,
  generateGraphFilename,
} from '../utils/graphSerialization.js';

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
    position: { x: 420, y: 150 },
    data: {
      label: effectRegistry.tonal.name,
      effectId: 'tonal',
      effectData: effectRegistry.tonal,
      parameters: Object.fromEntries(
        Object.entries(effectRegistry.tonal.parameters || {}).map(([key, param]) => [key, param.default])
      ),
      showPreview: true,
    },
  },
  {
    id: 'node-3',
    type: 'outputNode',
    position: { x: 740, y: 150 },
    data: { label: 'Final Output' },
  },
];

const initialEdges = [
  { id: 'edge-1', source: 'node-1', target: 'node-2' },
  { id: 'edge-2', source: 'node-2', target: 'node-3' },
];

function buildGraphSignature(nodes, edges) {
  const nodeSig = nodes
    .map((n) => ({
      id: n.id,
      type: n.type,
      effectId: n.data?.effectId ?? null,
      parameters: n.data?.parameters ?? null,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const edgeSig = edges
    .map((e) => ({ source: e.source, target: e.target }))
    .sort((a, b) => (a.source + a.target).localeCompare(b.source + b.target));

  return JSON.stringify({ nodes: nodeSig, edges: edgeSig });
}

function NodeEditor() {
  const navigate = useNavigate();
  const cacheRef = useRef(new Map());

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const [inputImage, setInputImage] = useState(null);
  const [graphRun, setGraphRun] = useState({
    finalImageData: null,
    resultsByNodeId: {},
    nodeTimingsMs: {},
    totalTimeMs: 0,
    errors: [],
    warnings: [],
    inputNodeId: null,
    outputNodeId: null,
  });

  const [thumbUrls, setThumbUrls] = useState({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState('final');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [modalNodeId, setModalNodeId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fileInputRef = useRef(null);

  const graphSignature = useMemo(() => {
    const sig = buildGraphSignature(nodes, edges);
    return `${sig}|input:${inputImage?.key ?? 'none'}`;
  }, [nodes, edges, inputImage?.key]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const handleParameterChange = useCallback((nodeId, newParameters) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, parameters: newParameters } } : node))
    );
  }, []);

  const handleTogglePreview = useCallback((nodeId, showPreview) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, showPreview } } : node))
    );
  }, []);

  const handleOpenPreview = useCallback((nodeId) => {
    setModalNodeId(nodeId);
  }, []);

  const handleAddNode = useCallback(
    (newNode) => {
      const maxX = Math.max(...nodes.map((n) => n.position.x), 200);
      const newPosition = {
        x: maxX + 250,
        y: 150 + ((nodes.length * 60) % 320),
      };

      setNodes((prevNodes) => [
        ...prevNodes,
        {
          ...newNode,
          position: newPosition,
          data: {
            ...newNode.data,
            showPreview: Boolean(newNode.data?.showPreview),
          },
        },
      ]);
    },
    [nodes]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      try {
        const effectId = event.dataTransfer.getData('effectId');
        if (effectId && effectRegistry[effectId]) {
          handleAddNode({
            id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            type: 'effectNode',
            data: {
              label: effectRegistry[effectId].name,
              effectId,
              effectData: effectRegistry[effectId],
              parameters: Object.fromEntries(
                Object.entries(effectRegistry[effectId].parameters || {}).map(([key, param]) => [key, param.default])
              ),
              showPreview: false,
            },
          });
        }
      } catch (error) {
        console.error('Error handling drop:', error);
      }
    },
    [handleAddNode]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleImageUpload = useCallback(async (file) => {
    const imageData = await fileToImageData(file);
    const objectUrl = URL.createObjectURL(file);

    setInputImage((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return {
        file,
        imageData,
        previewUrl: objectUrl,
        width: imageData.width,
        height: imageData.height,
        size: file.size,
        name: file.name,
        type: file.type,
        key: `${file.name}:${file.size}:${file.lastModified}:${imageData.width}x${imageData.height}`,
      };
    });

    setNodes((prev) =>
      prev.map((n) => (n.type === 'inputNode' ? { ...n, data: { ...n.data, imageData } } : n))
    );

    cacheRef.current = new Map();
  }, []);

  const handleClearImage = useCallback(() => {
    setInputImage((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setNodes((prev) => prev.map((n) => (n.type === 'inputNode' ? { ...n, data: { ...n.data, imageData: null } } : n)));
    setGraphRun({
      finalImageData: null,
      resultsByNodeId: {},
      nodeTimingsMs: {},
      totalTimeMs: 0,
      errors: [],
      warnings: [],
      inputNodeId: null,
      outputNodeId: null,
    });
    setThumbUrls({});
    cacheRef.current = new Map();
  }, []);

  useEffect(() => {
    return () => {
      if (inputImage?.previewUrl) URL.revokeObjectURL(inputImage.previewUrl);
    };
  }, [inputImage?.previewUrl]);

  // Debounced execution.
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (!inputImage?.imageData) {
        setGraphRun((prev) => ({
          ...prev,
          finalImageData: null,
          resultsByNodeId: {},
          nodeTimingsMs: {},
          totalTimeMs: 0,
          errors: [],
          warnings: [],
        }));
        return;
      }

      setIsProcessing(true);

      // Execute in next tick to let the UI paint the loading state.
      setTimeout(() => {
        if (cancelled) return;
        const result = executeGraph({
          nodes,
          edges,
          inputImageData: inputImage.imageData,
          inputKey: inputImage.key,
          effectRegistry,
          cache: cacheRef.current,
        });
        setGraphRun(result);
        setIsProcessing(false);
      }, 0);
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [graphSignature]);

  // Generate thumbnail previews for nodes that request it.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!graphRun.resultsByNodeId || Object.keys(graphRun.resultsByNodeId).length === 0) {
        setThumbUrls({});
        return;
      }

      const needed = new Set();

      for (const n of nodes) {
        if (n.type === 'effectNode' && n.data?.showPreview) needed.add(n.id);
        if (n.type === 'outputNode') needed.add(n.id);
      }

      if (selectedNodeId) needed.add(selectedNodeId);

      const pairs = Array.from(needed).map(async (nodeId) => {
        const img = graphRun.resultsByNodeId[nodeId];
        if (!img) return [nodeId, null];
        const url = await imageDataToDataUrl(img, { maxSize: 180 });
        return [nodeId, url];
      });

      const next = {};
      for (const [nodeId, url] of await Promise.all(pairs)) {
        if (url) next[nodeId] = url;
      }

      if (!cancelled) setThumbUrls((prev) => ({ ...prev, ...next }));
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [graphRun.resultsByNodeId, nodes, selectedNodeId]);

  const selectedNodeLabel = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = nodes.find((n) => n.id === selectedNodeId);
    return node?.data?.label ?? selectedNodeId;
  }, [nodes, selectedNodeId]);

  const previewImageData = useMemo(() => {
    if (previewMode === 'node' && selectedNodeId) {
      return graphRun.resultsByNodeId?.[selectedNodeId] ?? null;
    }
    return graphRun.finalImageData;
  }, [previewMode, selectedNodeId, graphRun]);

  const previewTitle = useMemo(() => {
    if (previewMode === 'node') {
      return selectedNodeLabel ? `Node: ${selectedNodeLabel}` : 'Node Preview';
    }
    return 'Final Output';
  }, [previewMode, selectedNodeLabel]);

  const previewError = useMemo(() => {
    if (!graphRun.errors?.length) return null;
    return graphRun.errors[0];
  }, [graphRun.errors]);

  const handleExport = useCallback(
    async (format, options = {}) => {
      if (!graphRun.finalImageData) return;

      const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
      const ext = format === 'jpg' ? 'jpg' : format;

      setExporting(true);
      try {
        const blob = await imageDataToBlob(graphRun.finalImageData, {
          mimeType,
          quality: options.quality,
        });
        if (!blob) return;
        downloadBlob(blob, `novigraph-${Date.now()}.${ext}`);
      } finally {
        setExporting(false);
      }
    },
    [graphRun.finalImageData]
  );

  const handleSaveGraph = useCallback(() => {
    try {
      const graphData = serializeGraph(nodes, edges, inputImage);
      const filename = generateGraphFilename();
      downloadGraph(graphData, filename);
    } catch (error) {
      console.error('Failed to save graph:', error);
      // Could add user-facing error notification here
    }
  }, [nodes, edges, inputImage]);

  const handleLoadGraphClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleLoadGraph = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const graphData = await loadGraphFromFile(file);
        const { nodes: loadedNodes, edges: loadedEdges, inputImage: loadedInputImage } = deserializeGraph(graphData, effectRegistry);

        // Reset the cache since we're loading a new graph
        cacheRef.current = new Map();

        // If there's an input image in the saved graph, we need to reconstruct it
        if (loadedInputImage) {
          // For now, we'll handle the case where the image data might not be saved
          // In a future enhancement, we could embed the actual image data
          console.warn('Input image metadata loaded, but image data itself is not persisted');
        }

        // Apply the loaded graph state
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setInputImage(null); // Reset input image for now
        setSelectedNodeId(null); // Clear selection

        // Clear the file input so the same file can be loaded again
        event.target.value = '';
      } catch (error) {
        console.error('Failed to load graph:', error);
        alert(`Failed to load graph: ${error.message}`); // Simple user feedback
        event.target.value = '';
      }
    },
    []
  );

  const handleClearGraph = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the current graph? This will remove all nodes and edges.')) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setInputImage(null);
      setGraphRun({
        finalImageData: null,
        resultsByNodeId: {},
        nodeTimingsMs: {},
        totalTimeMs: 0,
        errors: [],
        warnings: [],
        inputNodeId: null,
        outputNodeId: null,
      });
      setThumbUrls({});
      cacheRef.current = new Map();
    }
  }, []);

  const nodesForRender = useMemo(() => {
    return nodes.map((node) => {
      if (node.type === 'inputNode') {
        return {
          ...node,
          dragHandle: '.node-drag-handle',
          data: {
            ...node.data,
            onImageUpload: handleImageUpload,
            onClearImage: handleClearImage,
            imagePreviewUrl: inputImage?.previewUrl ?? null,
            imageInfo: inputImage
              ? { width: inputImage.width, height: inputImage.height, size: inputImage.size, name: inputImage.name }
              : null,
          },
        };
      }

      if (node.type === 'effectNode') {
        return {
          ...node,
          dragHandle: '.node-drag-handle',
          data: {
            ...node.data,
            onParameterChange: handleParameterChange,
            onTogglePreview: handleTogglePreview,
            onOpenPreview: handleOpenPreview,
            previewUrl: thumbUrls[node.id] ?? null,
            processingTimeMs: graphRun.nodeTimingsMs?.[node.id],
            isPreviewed: previewMode === 'node' && selectedNodeId === node.id,
          },
        };
      }

      if (node.type === 'outputNode') {
        return {
          ...node,
          dragHandle: '.node-drag-handle',
          data: {
            ...node.data,
            nodeId: node.id,
            previewUrl: thumbUrls[node.id] ?? null,
            canExport: Boolean(graphRun.finalImageData),
            exporting,
            onExport: handleExport,
            onOpenPreview: handleOpenPreview,
            totalTimeMs: graphRun.totalTimeMs,
            inputInfo: inputImage ? { size: inputImage.size } : null,
            outputInfo: graphRun.finalImageData
              ? { width: graphRun.finalImageData.width, height: graphRun.finalImageData.height }
              : null,
          },
        };
      }

      return node;
    });
  }, [
    nodes,
    handleImageUpload,
    handleClearImage,
    inputImage,
    handleParameterChange,
    handleTogglePreview,
    handleOpenPreview,
    thumbUrls,
    graphRun.nodeTimingsMs,
    graphRun.finalImageData,
    graphRun.totalTimeMs,
    previewMode,
    selectedNodeId,
    exporting,
    handleExport,
  ]);

  const modalAfter = modalNodeId ? graphRun.resultsByNodeId?.[modalNodeId] ?? null : null;
  const modalBefore = useMemo(() => {
    if (!modalNodeId) return null;
    const inEdge = edges.find((e) => e.target === modalNodeId);
    if (!inEdge) return null;
    return graphRun.resultsByNodeId?.[inEdge.source] ?? null;
  }, [modalNodeId, edges, graphRun.resultsByNodeId]);

  return (
    <div className="editor-container">
      <header className="editor-header">
        <div className="logo" onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
        >
          Novigraph
        </div>
        <div className="editor-controls">
          <button className="control-button" onClick={handleLoadGraphClick}>Load Graph</button>
          <button className="control-button" onClick={handleSaveGraph}>Save Graph</button>
          <button className="control-button" onClick={handleClearGraph}>Clear Graph</button>
          <button className="back-button" onClick={() => navigate('/')}>Back to Home</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleLoadGraph}
            style={{ display: 'none' }}
          />
        </div>
      </header>

      <div className="editor-main">
        <NodePalette onAddNode={handleAddNode} />

        <div
          className="react-flow-wrapper"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <ReactFlow
            nodes={nodesForRender}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#333" gap={20} />
            <Controls />
          </ReactFlow>
        </div>

        <PreviewPanel
          imageData={previewImageData}
          isProcessing={isProcessing}
          mode={previewMode}
          onChangeMode={setPreviewMode}
          title={previewTitle}
          processingTimeMs={
            previewMode === 'node' && selectedNodeId ? graphRun.nodeTimingsMs?.[selectedNodeId] : graphRun.totalTimeMs
          }
          error={previewError}
          warnings={graphRun.warnings}
        />
      </div>

      <PreviewModal
        isOpen={Boolean(modalNodeId)}
        onClose={() => setModalNodeId(null)}
        title={modalNodeId ? nodes.find((n) => n.id === modalNodeId)?.data?.label : 'Preview'}
        beforeImageData={modalBefore}
        afterImageData={modalAfter}
      />
    </div>
  );
}

export default NodeEditor;
