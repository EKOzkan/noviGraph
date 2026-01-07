import { useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';

import { formatBytes } from '../utils/imageUtils.js';

const InputNode = ({ data, selected }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) return;
    data?.onImageUpload?.(file);
  };

  const onPickFile = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const onFileChange = (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className={`custom-node input-node ${isDragOver ? 'drag-over' : ''} ${selected ? 'selected' : ''}`}>
      <div className="node-header node-drag-handle">{data.label || 'Input'}</div>

      <div
        className="node-body"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
        }}
        onDrop={onDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />

        {!data.imagePreviewUrl ? (
          <div className="input-upload-area" onClick={onPickFile} role="button" tabIndex={0}>
            <div className="upload-title">Upload Image</div>
            <div className="upload-subtitle">Click or drag & drop</div>
          </div>
        ) : (
          <div className="input-preview">
            <div className="input-preview-row">
              <img className="node-thumb" src={data.imagePreviewUrl} alt="Input preview" />
              <div className="input-meta">
                <div className="input-meta-name">{data.imageInfo?.name}</div>
                <div className="input-meta-detail">
                  {data.imageInfo?.width}×{data.imageInfo?.height}
                </div>
                <div className="input-meta-detail">{formatBytes(data.imageInfo?.size)}</div>
              </div>
            </div>

            <div className="node-actions">
              <button className="node-button" type="button" onClick={onPickFile}>
                Replace
              </button>
              <button
                className="node-button danger"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  data?.onClearImage?.();
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default InputNode;
