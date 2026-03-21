import React, { useState, useRef, useEffect } from 'react';
import { useI18n, useTheme, useDesigner } from '../context/DesignerContext';
import {
  Info, Server, Route, Box, Shield, Tag, Code, Eye,
  Sun, Moon, Languages, BookOpen, PanelLeftClose, PanelLeft, Search, Webhook
} from 'lucide-react';
import { HTTP_METHODS } from '../types/openapi';
import type { OperationObject } from '../types/openapi';

type PanelKey = 'info' | 'servers' | 'paths' | 'webhooks' | 'schemas' | 'security' | 'tags' | 'code' | 'preview';

const navItems: { key: PanelKey; icon: React.ReactNode; color: string }[] = [
  { key: 'info', icon: <Info size={18} />, color: 'text-blue-500' },
  { key: 'servers', icon: <Server size={18} />, color: 'text-green-500' },
  { key: 'paths', icon: <Route size={18} />, color: 'text-purple-500' },
  { key: 'webhooks', icon: <Webhook size={18} />, color: 'text-rose-500' },
  { key: 'schemas', icon: <Box size={18} />, color: 'text-pink-500' },
  { key: 'security', icon: <Shield size={18} />, color: 'text-orange-500' },
  { key: 'tags', icon: <Tag size={18} />, color: 'text-teal-500' },
  { key: 'code', icon: <Code size={18} />, color: 'text-indigo-500' },
  { key: 'preview', icon: <Eye size={18} />, color: 'text-cyan-500' },
];

const navLabelKey: Record<PanelKey, string> = {
  info: 'info',
  servers: 'servers',
  paths: 'paths',
  webhooks: 'webhooks',
  schemas: 'schemas',
  security: 'security',
  tags: 'tags',
  code: 'codeEditor',
  preview: 'preview',
};

export function Sidebar() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { state, dispatch } = useDesigner();
  const [collapsed, setCollapsed] = useState(false);
  // P0-2: Auto-collapse when the parent container is narrower than 1024 px.
  // We observe the Sidebar's parent element (the full designer container) via ResizeObserver.
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  useEffect(() => {
    const parent = sidebarRef.current?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(([entry]) => {
      setAutoCollapsed(entry.contentRect.width < 1024);
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);
  const isCollapsed = collapsed || autoCollapsed;

  const doc = state.document;
  const pathCount = Object.keys(doc.paths || {}).length;
  const opCount = Object.values(doc.paths || {}).reduce((acc, item) => {
    return acc + HTTP_METHODS.filter(m => (item as any)[m]).length;
  }, 0);
  const schemaCount = Object.keys(doc.components?.schemas || {}).length;
  const securityCount = Object.keys(doc.components?.securitySchemes || {}).length;
  const serverCount = (doc.servers || []).length;
  const tagCount = (doc.tags || []).length;

  const webhookCount = Object.keys(doc.webhooks || {}).length;

  const getBadge = (key: PanelKey): string | number | null => {
    switch (key) {
      case 'paths': return opCount > 0 ? opCount : null;
      case 'webhooks': return webhookCount > 0 ? webhookCount : null;
      case 'schemas': return schemaCount > 0 ? schemaCount : null;
      case 'security': return securityCount > 0 ? securityCount : null;
      case 'servers': return serverCount > 0 ? serverCount : null;
      case 'tags': return tagCount > 0 ? tagCount : null;
      default: return null;
    }
  };

  if (isCollapsed) {
    return (
      <div ref={sidebarRef} className="w-[56px] h-full flex flex-col bg-card border-r border-border shrink-0">
        {/* Logo */}
        <div className="p-2 border-b border-border flex items-center justify-center h-[57px]">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center cursor-pointer" onClick={() => setCollapsed(false)}>
            <BookOpen size={16} className="text-primary-foreground" />
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2 flex flex-col items-center">
          {navItems.map(({ key, icon, color }) => {
            const isActive = state.activePanel === key;
            const badge = getBadge(key);
            return (
              <button
                key={key}
                onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: key })}
                className={`relative w-10 h-10 flex items-center justify-center rounded-lg my-0.5 transition-all duration-150 ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                title={(t.nav as Record<string, string>)[navLabelKey[key]]}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                )}
                {icon}
                {badge !== null && (
                  <span className="absolute -top-0.5 -right-0.5 text-[8px] min-w-[14px] h-[14px] flex items-center justify-center rounded-full px-0.5 bg-muted text-muted-foreground">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-border p-2 flex flex-col items-center gap-1">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={theme === 'light' ? t.common.darkTheme : t.common.lightTheme}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <button
            onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={locale === 'en' ? '中文' : 'English'}
          >
            <Languages size={14} />
          </button>
          <button
            onClick={() => setCollapsed(false)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={t.common.expand}
          >
            <PanelLeft size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={sidebarRef} className="w-[220px] h-full flex flex-col bg-card border-r border-border shrink-0">
      {/* Logo */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 h-[57px]">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <BookOpen size={16} className="text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>OpenAPI</div>
          <div className="text-[10px] text-muted-foreground">Designer 3.1</div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title={t.common.collapse}
        >
          <PanelLeftClose size={14} />
        </button>
      </div>

      {/* Quick search hint */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-command-palette'));
          }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border text-[11px] text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Search size={12} />
          <span className="flex-1 text-left">{t.common.search}</span>
          <kbd className="text-[9px] px-1 py-0.5 rounded bg-muted border border-border">⌘K</kbd>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(({ key, icon, color }) => {
          const isActive = state.activePanel === key;
          const label = (t.nav as Record<string, string>)[navLabelKey[key]];
          const badge = getBadge(key);
          return (
            <button
              key={key}
              onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: key })}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-all duration-150 relative ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
              )}
              {icon}
              <span className="flex-1 text-left">{label}</span>
              {badge !== null && (
                <span className="text-[10px] min-w-[18px] text-center px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-border p-3 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          <span>{theme === 'light' ? t.common.darkTheme : t.common.lightTheme}</span>
        </button>
        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Languages size={14} />
          <span>{locale === 'en' ? '中文' : 'English'}</span>
        </button>
      </div>
    </div>
  );
}