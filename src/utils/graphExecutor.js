import { palettes as builtInPalettes } from '../effects/palettes/index.js';

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

function hashString(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return (h >>> 0).toString(16);
}

function sanitizeParameters(effectId, rawParameters, parameterDefs) {
  const out = {};

  for (const [key, def] of Object.entries(parameterDefs ?? {})) {
    let value = rawParameters?.[key];
    if (value === undefined) value = def.default;

    if (effectId === 'color_palette' && key === 'palette') {
      // Keep palette as a string name - the colorPalette function will resolve it
      if (typeof value === 'string') {
        out[key] = value;
        continue;
      }

      // Use default from parameter definition
      const paletteDef = parameterDefs?.palette;
      const defaultPaletteName = paletteDef?.default || 'gameboy';
      out[key] = defaultPaletteName;
      continue;
    }

    if (key === 'seed') {
      if (value === '' || value === undefined) {
        out[key] = null;
        continue;
      }
      if (typeof value === 'string') {
        const n = Number(value);
        out[key] = Number.isFinite(n) ? n : null;
        continue;
      }
    }

    if (def?.options) {
      const opts = def.options;
      if (opts[0] === true || opts[0] === false) {
        if (typeof value === 'string') out[key] = value === 'true';
        else out[key] = Boolean(value);
        continue;
      }
      out[key] = value;
      continue;
    }

    if (def?.min !== undefined && def?.max !== undefined) {
      const n = typeof value === 'number' ? value : Number(value);
      out[key] = Number.isFinite(n) ? n : def.default;
      continue;
    }

    out[key] = value;
  }

  // Preserve any additional parameters not present in registry.
  for (const [key, value] of Object.entries(rawParameters ?? {})) {
    if (!(key in out)) out[key] = value;
  }

  return out;
}

function buildGraph(nodes, edges) {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const incoming = new Map();
  const outgoing = new Map();

  for (const node of nodes) {
    incoming.set(node.id, []);
    outgoing.set(node.id, []);
  }

  for (const e of edges) {
    if (!nodeById.has(e.source) || !nodeById.has(e.target)) continue;
    incoming.get(e.target).push(e);
    outgoing.get(e.source).push(e);
  }

  return { nodeById, incoming, outgoing };
}

function bfs(startId, nextIds) {
  const visited = new Set();
  const q = [startId];
  visited.add(startId);
  while (q.length) {
    const cur = q.shift();
    for (const n of nextIds(cur)) {
      if (!visited.has(n)) {
        visited.add(n);
        q.push(n);
      }
    }
  }
  return visited;
}

function topoSort(nodeIds, edges) {
  const ids = new Set(nodeIds);
  const indeg = new Map();
  const out = new Map();
  for (const id of ids) {
    indeg.set(id, 0);
    out.set(id, []);
  }

  for (const e of edges) {
    if (!ids.has(e.source) || !ids.has(e.target)) continue;
    out.get(e.source).push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }

  const q = [];
  for (const [id, d] of indeg.entries()) if (d === 0) q.push(id);

  const order = [];
  while (q.length) {
    const id = q.shift();
    order.push(id);
    for (const nxt of out.get(id)) {
      indeg.set(nxt, indeg.get(nxt) - 1);
      if (indeg.get(nxt) === 0) q.push(nxt);
    }
  }

  if (order.length !== ids.size) {
    return { order: [], hasCycle: true };
  }

  return { order, hasCycle: false };
}

/**
 * Execute a ReactFlow graph as a sequential image-processing pipeline.
 *
 * @param {Object} args
 * @param {Array} args.nodes
 * @param {Array} args.edges
 * @param {ImageData} args.inputImageData
 * @param {string} args.inputKey - stable identifier for the current input image
 * @param {Object} args.effectRegistry
 * @param {Map<string, { imageData: ImageData, timeMs: number }>} [args.cache]
 */
export function executeGraph({ nodes, edges, inputImageData, inputKey, effectRegistry, cache = new Map() }) {
  const warnings = [];
  const errors = [];

  const inputNodes = nodes.filter((n) => n.type === 'inputNode');
  const outputNodes = nodes.filter((n) => n.type === 'outputNode');

  if (inputNodes.length !== 1) {
    errors.push(`Graph must contain exactly 1 InputNode (found ${inputNodes.length}).`);
  }
  if (outputNodes.length !== 1) {
    errors.push(`Graph must contain exactly 1 OutputNode (found ${outputNodes.length}).`);
  }
  if (!inputImageData) {
    errors.push('No input image provided.');
  }

  if (errors.length) {
    return {
      finalImageData: null,
      resultsByNodeId: {},
      nodeTimingsMs: {},
      totalTimeMs: 0,
      errors,
      warnings,
      executedNodeIds: [],
      inputNodeId: inputNodes[0]?.id ?? null,
      outputNodeId: outputNodes[0]?.id ?? null,
    };
  }

  const inputNodeId = inputNodes[0].id;
  const outputNodeId = outputNodes[0].id;

  const { nodeById, incoming, outgoing } = buildGraph(nodes, edges);

  const reachableFromInput = bfs(inputNodeId, (id) => outgoing.get(id).map((e) => e.target));
  const reachesOutput = bfs(outputNodeId, (id) => incoming.get(id).map((e) => e.source));

  const inMainPath = new Set();
  for (const id of reachableFromInput) {
    if (reachesOutput.has(id)) inMainPath.add(id);
  }

  for (const n of nodes) {
    if (!inMainPath.has(n.id)) warnings.push(`Orphaned node: ${n.data?.label ?? n.id}`);
  }

  if (!inMainPath.has(outputNodeId)) {
    errors.push('OutputNode is not reachable from InputNode.');
    return {
      finalImageData: null,
      resultsByNodeId: {},
      nodeTimingsMs: {},
      totalTimeMs: 0,
      errors,
      warnings,
      executedNodeIds: [],
      inputNodeId,
      outputNodeId,
    };
  }

  // Single-input constraint (image pipeline)
  for (const id of inMainPath) {
    const n = nodeById.get(id);
    if (!n || id === inputNodeId) continue;
    const inc = incoming.get(id).filter((e) => inMainPath.has(e.source));
    if (inc.length !== 1) {
      errors.push(`Node ${n.data?.label ?? id} must have exactly 1 input connection.`);
    }
  }
  if (errors.length) {
    return {
      finalImageData: null,
      resultsByNodeId: {},
      nodeTimingsMs: {},
      totalTimeMs: 0,
      errors,
      warnings,
      executedNodeIds: [],
      inputNodeId,
      outputNodeId,
    };
  }

  const { order, hasCycle } = topoSort(inMainPath, edges);
  if (hasCycle) {
    errors.push('Graph contains a cycle; only DAGs are supported.');
    return {
      finalImageData: null,
      resultsByNodeId: {},
      nodeTimingsMs: {},
      totalTimeMs: 0,
      errors,
      warnings,
      executedNodeIds: [],
      inputNodeId,
      outputNodeId,
    };
  }

  const resultsByNodeId = {};
  const nodeKeys = {};
  const nodeTimingsMs = {};

  resultsByNodeId[inputNodeId] = inputImageData;
  nodeKeys[inputNodeId] = inputKey;
  nodeTimingsMs[inputNodeId] = 0;

  const totalStart = performance.now();

  for (const nodeId of order) {
    if (nodeId === inputNodeId) continue;

    const node = nodeById.get(nodeId);
    if (!node) continue;

    const inEdge = incoming.get(nodeId).find((e) => inMainPath.has(e.source));
    const sourceId = inEdge?.source;
    const sourceImage = sourceId ? resultsByNodeId[sourceId] : null;
    const sourceKey = sourceId ? nodeKeys[sourceId] : null;

    if (!sourceImage || !sourceKey) {
      errors.push(`Missing input for node ${node.data?.label ?? nodeId}.`);
      break;
    }

    if (node.type === 'outputNode') {
      resultsByNodeId[nodeId] = sourceImage;
      nodeKeys[nodeId] = sourceKey;
      nodeTimingsMs[nodeId] = 0;
      continue;
    }

    if (node.type !== 'effectNode') {
      // Unknown node type in main chain; pass-through.
      resultsByNodeId[nodeId] = sourceImage;
      nodeKeys[nodeId] = sourceKey;
      nodeTimingsMs[nodeId] = 0;
      continue;
    }

    const effectId = node.data?.effectId;
    const effectDef = effectRegistry?.[effectId];

    if (!effectId || !effectDef?.fn) {
      errors.push(`Missing effect definition for node ${node.data?.label ?? nodeId}.`);
      break;
    }

    const params = sanitizeParameters(effectId, node.data?.parameters ?? {}, effectDef.parameters ?? {});

    const nodeKey = hashString(`${effectId}|${sourceKey}|${stableStringify(params)}`);
    nodeKeys[nodeId] = nodeKey;

    const cacheKey = `${nodeId}:${nodeKey}`;
    const cached = cache.get(cacheKey);
    if (cached?.imageData) {
      resultsByNodeId[nodeId] = cached.imageData;
      nodeTimingsMs[nodeId] = cached.timeMs ?? 0;
      continue;
    }

    const start = performance.now();
    try {
      const out = effectDef.fn(sourceImage, params);
      const timeMs = performance.now() - start;
      resultsByNodeId[nodeId] = out;
      nodeTimingsMs[nodeId] = timeMs;
      cache.set(cacheKey, { imageData: out, timeMs });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`Effect failed on node ${node.data?.label ?? nodeId}: ${message}`);
      break;
    }
  }

  const totalTimeMs = performance.now() - totalStart;

  return {
    finalImageData: resultsByNodeId[outputNodeId] ?? null,
    resultsByNodeId,
    nodeTimingsMs,
    totalTimeMs,
    errors,
    warnings,
    executedNodeIds: order,
    inputNodeId,
    outputNodeId,
    nodeKeys,
  };
}
