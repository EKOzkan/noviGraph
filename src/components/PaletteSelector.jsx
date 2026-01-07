import { useState } from 'react';
import { effectRegistry, effects } from '../effects/index.js';

const PaletteSelector = ({ onAddNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('');

  const handleEffectSelect = (effectId) => {
    const effectData = effectRegistry[effectId];
    onAddNode({
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'effectNode',
      data: {
        label: effectData.name,
        effectId: effectId,
        effectData: effectData,
        parameters: Object.fromEntries(
          Object.entries(effectData.parameters || {}).map(([key, param]) => [key, param.default])
        )
      }
    });
    setSelectedEffect(effectData.name);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="palette-selector">
      <label className="selector-label">Add Effect:</label>
      <div className="dropdown-container">
        <button 
          className="dropdown-button"
          onClick={toggleDropdown}
        >
          <span>{selectedEffect || 'Select an effect...'}</span>
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </button>
        
        {isOpen && (
          <div className="dropdown-menu">
            {effects.map(effect => (
              <div 
                key={effect.id}
                className="dropdown-item"
                onClick={() => handleEffectSelect(effect.id)}
              >
                <div className="effect-name">{effect.name}</div>
                <div className="effect-description">{effect.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="dropdown-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default PaletteSelector;