import React, { useState } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import { Server, Plus, Trash2, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import type { ServerObject, ServerVariableObject } from '../types/openapi';
import { MarkdownEditor } from './MarkdownEditor';

export function ServersPanel() {
  const { t } = useI18n();
  const { state, setDocument } = useDesigner();
  const doc = state.document;
  const p = t.placeholders;
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

  const addVariable = (serverIndex: number) => {
    const updated = JSON.parse(JSON.stringify(servers)) as ServerObject[];
    if (!updated[serverIndex].variables) updated[serverIndex].variables = {};
    const varName = `var${Object.keys(updated[serverIndex].variables!).length + 1}`;
    updated[serverIndex].variables![varName] = { default: '' };
    updateServers(updated);
  };

  const removeVariable = (serverIndex: number, varName: string) => {
    const updated = JSON.parse(JSON.stringify(servers)) as ServerObject[];
    delete updated[serverIndex].variables![varName];
    if (Object.keys(updated[serverIndex].variables!).length === 0) {
      updated[serverIndex].variables = undefined;
    }
    updateServers(updated);
  };

  const updateVariable = (serverIndex: number, varName: string, variable: ServerVariableObject) => {
    const updated = JSON.parse(JSON.stringify(servers)) as ServerObject[];
    updated[serverIndex].variables![varName] = variable;
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
            <ServerCard
              key={server.url || String(index)}
              server={server}
              index={index}
              t={t}
              onRemove={() => removeServer(index)}
              onUpdateField={(field, value) => updateServer(index, field, value)}
              onAddVariable={() => addVariable(index)}
              onRemoveVariable={(varName) => removeVariable(index, varName)}
              onUpdateVariable={(varName, variable) => updateVariable(index, varName, variable)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ServerCard({
  server,
  index,
  t,
  onRemove,
  onUpdateField,
  onAddVariable,
  onRemoveVariable,
  onUpdateVariable,
}: {
  server: ServerObject;
  index: number;
  t: ReturnType<typeof useI18n>['t'];
  onRemove: () => void;
  onUpdateField: (field: keyof ServerObject, value: string) => void;
  onAddVariable: () => void;
  onRemoveVariable: (varName: string) => void;
  onUpdateVariable: (varName: string, variable: ServerVariableObject) => void;
}) {
  const [varsExpanded, setVarsExpanded] = useState(false);
  const p = t.placeholders;
  const variables = server.variables || {};
  const varCount = Object.keys(variables).length;

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-3 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center text-[12px] text-green-600" style={{ fontWeight: 600 }}>
            {index + 1}
          </div>
          <span className="text-[13px] text-foreground" style={{ fontWeight: 500 }}>{server.url || 'Untitled'}</span>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="space-y-2">
        <div>
          <label className="text-[12px] text-muted-foreground uppercase tracking-wide">{t.servers.serverUrl}</label>
          <input
            value={server.url}
            onChange={(e) => onUpdateField('url', e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
            placeholder={p.serverUrl}
          />
        </div>
        <div>
          <label className="text-[12px] text-muted-foreground uppercase tracking-wide">{t.servers.serverDescription}</label>
          <div className="mt-1">
            <MarkdownEditor
              value={server.description || ''}
              onChange={(v) => onUpdateField('description', v)}
              placeholder={t.hints.serverDescription}
              rows={2}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setVarsExpanded(!varsExpanded)}
            className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {varsExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            {t.servers.variables}
            {varCount > 0 && <span className="text-[12px] text-muted-foreground">({varCount})</span>}
          </button>
          <button
            onClick={onAddVariable}
            className="text-[12px] text-primary hover:underline flex items-center gap-1"
          >
            <Plus size={11} /> {t.servers.addVariable}
          </button>
        </div>
        {varsExpanded && (
          <div className="mt-2 space-y-2">
            {Object.entries(variables).map(([varName, variable]) => (
              <div key={varName} className="p-2 rounded-lg bg-muted/30 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-mono text-foreground" style={{ fontWeight: 500 }}>{varName}</span>
                  <button onClick={() => onRemoveVariable(varName)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 size={11} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[12px] text-muted-foreground">{t.servers.variableDefault}</label>
                    <input
                      value={variable.default}
                      onChange={(e) => onUpdateVariable(varName, { ...variable, default: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                      placeholder={p.variableDefault}
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-muted-foreground">{t.servers.variableEnum}</label>
                    <input
                      value={(variable.enum || []).join(', ')}
                      onChange={(e) => {
                        const vals = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                        onUpdateVariable(varName, { ...variable, enum: vals.length > 0 ? vals : undefined });
                      }}
                      className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                      placeholder={p.variableEnum}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] text-muted-foreground">{t.common.description}</label>
                  <input
                    value={variable.description || ''}
                    onChange={(e) => onUpdateVariable(varName, { ...variable, description: e.target.value || undefined })}
                    className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={p.variableDescription}
                  />
                </div>
              </div>
            ))}
            {varCount === 0 && (
              <p className="text-[12px] text-muted-foreground py-2 text-center">{t.common.noData}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
