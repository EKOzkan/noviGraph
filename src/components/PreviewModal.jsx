import { useEffect, useState } from 'react';

import { imageDataToDataUrl } from '../utils/imageUtils.js';

function PreviewModal({ isOpen, onClose, title, beforeImageData, afterImageData }) {
  const [beforeUrl, setBeforeUrl] = useState(null);
  const [afterUrl, setAfterUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isOpen) return;
      const [b, a] = await Promise.all([
        beforeImageData ? imageDataToDataUrl(beforeImageData, { maxSize: 1024 }) : null,
        afterImageData ? imageDataToDataUrl(afterImageData, { maxSize: 1024 }) : null,
      ]);
      if (cancelled) return;
      setBeforeUrl(b);
      setAfterUrl(a);
    };

    run();

    return () => {
      cancelled = true;
      setBeforeUrl(null);
      setAfterUrl(null);
    };
  }, [isOpen, beforeImageData, afterImageData]);

  if (!isOpen) return null;

  return (
    <div
      className="preview-modal-backdrop"
      onClick={() => onClose?.()}
      role="presentation"
    >
      <div
        className="preview-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="preview-modal-header">
          <div className="preview-modal-title">{title || 'Preview'}</div>
          <button type="button" className="tool-button" onClick={() => onClose?.()}>
            Close
          </button>
        </div>

        <div className="preview-modal-content">
          {beforeUrl && afterUrl ? (
            <div className="before-after">
              <div className="before-after-col">
                <div className="before-after-label">Before</div>
                <img src={beforeUrl} alt="Before" />
              </div>
              <div className="before-after-col">
                <div className="before-after-label">After</div>
                <img src={afterUrl} alt="After" />
              </div>
            </div>
          ) : (
            <div className="before-after-single">
              {afterUrl ? <img src={afterUrl} alt="Preview" /> : <div>No preview available</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;
