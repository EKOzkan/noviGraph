import { downloadBlob } from './imageUtils.js';

export function serializeGraph(nodes, edges, inputImage) {
  const serializedNodes = nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      label: node.data?.label,
      effectId: node.data?.effectId,
      parameters: node.data?.parameters,
      showPreview: node.data?.showPreview,
    },
  }));

  const serializedEdges = edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type,
  }));

  const serializedInputImage = inputImage ? {
    name: inputImage.name,
    size: inputImage.size,
    type: inputImage.type,
    width: inputImage.width,
    height: inputImage.height,
    key: inputImage.key,
    // Store the actual image data as base64
    imageDataUrl: null, // Will be set if we have the blob
  } : null;

  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    nodes: serializedNodes,
    edges: serializedEdges,
    inputImage: serializedInputImage,
  };
}

export function deserializeGraph(serializedGraph, effectRegistry = {}) {
  if (!serializedGraph || !serializedGraph.nodes || !serializedGraph.edges) {
    throw new Error('Invalid graph data');
  }

  // Version check for future compatibility
  if (serializedGraph.version && serializedGraph.version !== '1.0') {
    console.warn(`Graph version ${serializedGraph.version} may not be fully compatible`);
  }

  const nodes = serializedGraph.nodes.map(node => {
    // Restore effect data from registry if this is an effect node
    let effectData = null;
    if (node.type === 'effectNode' && node.data?.effectId && effectRegistry[node.data.effectId]) {
      effectData = effectRegistry[node.data.effectId];
      // Ensure the node label matches the effect name
      node.data.label = effectData.name;
    }

    return {
      ...node,
      data: {
        ...node.data,
        effectData,
        // These will be set by the NodeEditor when the graph is loaded
        onParameterChange: null,
        onTogglePreview: null,
        onOpenPreview: null,
        previewUrl: null,
        processingTimeMs: null,
        isPreviewed: false,
      },
    };
  });

  const edges = serializedGraph.edges.map(edge => ({
    ...edge,
  }));

  const inputImage = serializedGraph.inputImage || null;

  return {
    nodes,
    edges,
    inputImage,
  };
}

export function downloadGraph(graphData, filename) {
  const json = JSON.stringify(graphData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}

export function loadGraphFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const graphData = JSON.parse(event.target.result);
        resolve(graphData);
      } catch (error) {
        reject(new Error('Failed to parse graph file: ' + error.message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read graph file'));
    };
    
    reader.readAsText(file);
  });
}

export function generateGraphFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `novigraph-${timestamp}.json`;
}