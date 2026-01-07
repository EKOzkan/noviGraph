import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { effects } from '../effects/index.js';

import './NodeAddMenu.css';

const CATEGORY_LABELS = {
  dithering: 'Dithering',
  color: 'Color',
  distortion: 'Distortion',
  effects: 'Effects',
  backgroundRemoval: 'Background Removal',
};

const ALL_CATEGORIES = (() => {
  const unique = new Set(effects.map((e) => e.category));
  const preferredOrder = ['dithering', 'color', 'distortion', 'effects', 'backgroundRemoval'];

  const ordered = [];
  for (const c of preferredOrder) if (unique.has(c)) ordered.push(c);
  for (const c of Array.from(unique).sort()) if (!ordered.includes(c)) ordered.push(c);

  return ordered;
})();

function titleForCategory(category) {
  return CATEGORY_LABELS[category] ?? category;
}

function buildInitialExpandedState(categories) {
  return Object.fromEntries(categories.map((c) => [c, true]));
}

function normalizeQuery(q) {
  return q.trim().toLowerCase();
}

function NodeAddMenu({ x, y, onClose, onSelectEffect }) {
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const [search, setSearch] = useState('');

  const categories = ALL_CATEGORIES;

  const [expandedCategories, setExpandedCategories] = useState(() => buildInitialExpandedState(ALL_CATEGORIES));

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const effectsByCategory = useMemo(() => {
    const q = normalizeQuery(search);

    const grouped = new Map(categories.map((c) => [c, []]));

    for (const effect of effects) {
      if (!effect.category) continue;

      if (q) {
        const haystack = `${effect.id} ${effect.name ?? ''} ${effect.description ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) continue;
      }

      if (!grouped.has(effect.category)) grouped.set(effect.category, []);
      grouped.get(effect.category).push(effect);
    }

    for (const [category, list] of grouped.entries()) {
      list.sort((a, b) => String(a.name ?? a.id).localeCompare(String(b.name ?? b.id)));
      if (list.length === 0) grouped.delete(category);
    }

    return grouped;
  }, [categories, search]);

  const [pinnedPos, setPinnedPos] = useState({ x, y });

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margin = 10;

    let nextX = x + 8;
    let nextY = y + 8;

    if (nextX + rect.width + margin > window.innerWidth) nextX = window.innerWidth - rect.width - margin;
    if (nextY + rect.height + margin > window.innerHeight) nextY = window.innerHeight - rect.height - margin;

    nextX = Math.max(margin, nextX);
    nextY = Math.max(margin, nextY);

    setPinnedPos({ x: nextX, y: nextY });
  }, [x, y, search, expandedCategories]);

  const isSearching = normalizeQuery(search).length > 0;

  const hasAnyResults = effectsByCategory.size > 0;

  return (
    <div
      ref={menuRef}
      className="node-add-menu"
      style={{ left: pinnedPos.x, top: pinnedPos.y }}
      role="dialog"
      aria-label="Add node"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="node-add-menu-top">
        <input
          ref={inputRef}
          className="node-add-menu-search"
          type="text"
          value={search}
          placeholder="Search nodes…"
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="node-add-menu-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="node-add-menu-content">
        {!hasAnyResults && <div className="node-add-menu-empty">No matching nodes.</div>}

        {Array.from(effectsByCategory.entries()).map(([category, categoryEffects]) => {
          const isExpanded = isSearching ? true : Boolean(expandedCategories[category]);

          return (
            <div key={category} className="node-add-menu-category">
              <button
                type="button"
                className="node-add-menu-category-header"
                onClick={() =>
                  setExpandedCategories((prev) => ({
                    ...prev,
                    [category]: !prev[category],
                  }))
                }
              >
                <span>{titleForCategory(category)}</span>
                <span className="node-add-menu-expand-icon">{isExpanded ? '▼' : '▶'}</span>
              </button>

              {isExpanded && (
                <div className="node-add-menu-list">
                  {categoryEffects.map((effect) => (
                    <button
                      key={effect.id}
                      type="button"
                      className="node-add-menu-item"
                      onClick={() => onSelectEffect?.(effect.id)}
                    >
                      <div className="node-add-menu-item-title">{effect.name}</div>
                      <div className="node-add-menu-item-desc">{effect.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NodeAddMenu;
