import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import {
  Search, Info, Server, Route, Box, Shield, Tag, Code, Eye,
  ArrowRight, Hash, Key, FileText
} from 'lucide-react';
import type { HttpMethod, OperationObject } from '../types/openapi';
import { HTTP_METHODS, METHOD_COLORS } from '../types/openapi';

interface CommandItem {
  id: string;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords?: string[];
}

export function CommandPalette() {
  const { t } = useI18n();
  const { state, dispatch } = useDesigner();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build command items
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];
    const doc = state.document;

    // Navigation commands
    const panels = [
      { key: 'info', icon: <Info size={14} />, label: t.nav.info },
      { key: 'servers', icon: <Server size={14} />, label: t.nav.servers },
      { key: 'paths', icon: <Route size={14} />, label: t.nav.paths },
      { key: 'schemas', icon: <Box size={14} />, label: t.nav.schemas },
      { key: 'security', icon: <Shield size={14} />, label: t.nav.security },
      { key: 'tags', icon: <Tag size={14} />, label: t.nav.tags },
      { key: 'code', icon: <Code size={14} />, label: t.nav.codeEditor },
      { key: 'preview', icon: <Eye size={14} />, label: t.nav.preview },
    ];

    panels.forEach(p => {
      items.push({
        id: `nav-${p.key}`,
        label: p.label,
        icon: p.icon,
        category: 'Navigation',
        action: () => dispatch({ type: 'SET_ACTIVE_PANEL', payload: p.key as any }),
        keywords: [p.key],
      });
    });

    // Path endpoints
    if (doc.paths) {
      Object.entries(doc.paths).forEach(([path, pathItem]) => {
        HTTP_METHODS.forEach(method => {
          const op = pathItem[method] as OperationObject | undefined;
          if (op) {
            items.push({
              id: `path-${path}-${method}`,
              label: `${method.toUpperCase()} ${path}`,
              subtitle: op.summary || op.operationId || '',
              icon: (
                <span
                  className="inline-flex items-center justify-center rounded text-white px-1.5 py-0.5 text-[9px] uppercase min-w-[36px]"
                  style={{ backgroundColor: METHOD_COLORS[method], fontWeight: 700 }}
                >
                  {method}
                </span>
              ),
              category: 'Endpoints',
              action: () => {
                dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'paths' });
              },
              keywords: [path, method, op.operationId || '', op.summary || '', ...(op.tags || [])],
            });
          }
        });
      });
    }

    // Schemas
    if (doc.components?.schemas) {
      Object.entries(doc.components.schemas).forEach(([name, schema]) => {
        const type = typeof schema.type === 'string' ? schema.type : 'object';
        items.push({
          id: `schema-${name}`,
          label: name,
          subtitle: `${type}${schema.description ? ' — ' + schema.description : ''}`,
          icon: <Box size={14} className="text-pink-500" />,
          category: 'Schemas',
          action: () => {
            dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'schemas' });
          },
          keywords: [name, type, schema.description || ''],
        });
      });
    }

    // Security schemes
    if (doc.components?.securitySchemes) {
      Object.entries(doc.components.securitySchemes).forEach(([name, scheme]) => {
        items.push({
          id: `security-${name}`,
          label: name,
          subtitle: scheme.type,
          icon: <Key size={14} className="text-orange-500" />,
          category: 'Security',
          action: () => {
            dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'security' });
          },
          keywords: [name, scheme.type],
        });
      });
    }

    // Tags
    if (doc.tags) {
      doc.tags.forEach(tag => {
        items.push({
          id: `tag-${tag.name}`,
          label: tag.name,
          subtitle: tag.description,
          icon: <Hash size={14} className="text-teal-500" />,
          category: 'Tags',
          action: () => {
            dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'tags' });
          },
          keywords: [tag.name, tag.description || ''],
        });
      });
    }

    return items;
  }, [state.document, t, dispatch]);

  // Filter commands
  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd => {
      const searchable = [cmd.label, cmd.subtitle || '', ...(cmd.keywords || [])].join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }, [commands, query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filtered]);

  // Keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    // Also listen for custom open events
    const openHandler = () => {
      setOpen(true);
      setQuery('');
      setSelectedIndex(0);
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('open-command-palette', openHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('open-command-palette', openHandler);
    };
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // P1-7: Pre-flatten grouped items into a stable indexed array so keyboard
  // selection doesn't depend on a mutable closure counter (which was fragile
  // if Object.entries ordering changed between renders).
  const flatItems = useMemo(() => {
    const result: Array<{ item: CommandItem; globalIndex: number }> = [];
    Object.values(grouped).forEach(items => {
      items.forEach(item => result.push({ item, globalIndex: result.length }));
    });
    return result;
  }, [grouped]);

  // Navigate with arrow keys
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const entry = flatItems[selectedIndex];
      if (entry) {
        entry.item.action();
        setOpen(false);
      }
    }
  }, [flatItems, selectedIndex]);

  // Scroll selected into view
  useEffect(() => {
    const item = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* Dialog */}
      <div className="relative w-full max-w-[520px] bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.common.search}
            className="flex-1 bg-transparent text-foreground text-[14px] outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground border border-border">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto p-1.5">
          {flatItems.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-muted-foreground">
              {t.common.noData}
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                  {category}
                </div>
                {items.map(item => {
                  // P1-7: look up pre-computed stable index from flatItems
                  const flatEntry = flatItems.find(e => e.item.id === item.id);
                  const idx = flatEntry?.globalIndex ?? -1;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      onClick={() => {
                        item.action();
                        setOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] truncate">{item.label}</div>
                        {item.subtitle && (
                          <div className="text-[11px] text-muted-foreground truncate">{item.subtitle}</div>
                        )}
                      </div>
                      {isSelected && <ArrowRight size={12} className="text-muted-foreground shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border">↵</kbd> select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}