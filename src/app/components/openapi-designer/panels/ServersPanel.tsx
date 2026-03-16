import React from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import { Server, Plus, Trash2, Globe } from 'lucide-react';
import type { ServerObject } from '../types/openapi';

export function ServersPanel() {
  const { t } = useI18n();
  const { state, setDocument } = useDesigner();
  const doc = state.document;
  const servers = doc.servers || [];

  const updateServers = (newServers: ServerObject[]) => {
    const newDoc = { ...doc, servers: newServers };
    setDocument(newDoc);
  };

  const addServer = () => {
    updateServers([...servers, { url: 'https://api.example.com', description: '' }]);
  };

  const removeServer = (index: number) => {
    updateServers(servers.filter((_, i) => i !== index));
  };

  const updateServer = (index: number, field: keyof ServerObject, value: string) => {
    const updated = [...servers];
    updated[index] = { ...updated[index], [field]: value };
    updateServers(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Server size={16} className="text-green-500" />
          </div>
          {t.servers.title}
        </h2>
        <button
          onClick={addServer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          {t.servers.addServer}
        </button>
      </div>

      {servers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Globe size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-[13px]">{t.servers.noServers}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {servers.map((server, index) => (
            <div key={index} className="bg-card rounded-xl border border-border p-4 space-y-3 group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center text-[11px] text-green-600" style={{ fontWeight: 600 }}>
                    {index + 1}
                  </div>
                  <span className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>{server.url || 'Untitled'}</span>
                </div>
                <button
                  onClick={() => removeServer(index)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wide">{t.servers.serverUrl}</label>
                  <input
                    value={server.url}
                    onChange={(e) => updateServer(index, 'url', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
                    placeholder="https://api.example.com/v1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wide">{t.servers.serverDescription}</label>
                  <input
                    value={server.description || ''}
                    onChange={(e) => updateServer(index, 'description', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Production server"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
