import { useState } from 'react';
import { effectRegistry, effects } from '../effects/index.js';
import './NodePalette.css';

const NodePalette = ({ onAddNode }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    dithering: true,
    color: true,
    distortion: true,
    effects: true,
    backgroundRemoval: true,
    special: true,
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAddNode = (effectId) => {
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
  };

  // Group effects by category
  const effectsByCategory = effects.reduce((acc, effect) => {
    if (!acc[effect.category]) {
      acc[effect.category] = [];
    }
    acc[effect.category].push(effect);
    return acc;
  }, {});

  return (
    <div className="node-palette">
      <div className="palette-header">
        <h3>Node Palette</h3>
      </div>
      
      <div className="palette-content">
        {Object.entries(effectsByCategory).map(([category, categoryEffects]) => (
          <div key={category} className="category-section">
            <div 
              className="category-header"
              onClick={() => toggleCategory(category)}
            >
              <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              <span className="expand-icon">
                {expandedCategories[category] ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedCategories[category] && (
              <div className="effects-list">
                {categoryEffects.map(effect => (
                  <div 
                    key={effect.id}
                    className="effect-item"
                    onClick={() => handleAddNode(effect.id)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('effectId', effect.id);
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                  >
                    <div className="effect-name">{effect.name}</div>
                    <div className="effect-description">{effect.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodePalette;
