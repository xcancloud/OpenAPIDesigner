import React, { useState } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import { Shield, Plus, Trash2, ChevronDown, ChevronRight, Lock, Key } from 'lucide-react';
import type { SecuritySchemeObject, OAuthFlowObject } from '../types/openapi';
import { toast } from 'sonner';

const SECURITY_TYPES: SecuritySchemeObject['type'][] = ['apiKey', 'http', 'oauth2', 'openIdConnect', 'mutualTLS'];

export function SecurityPanel() {
  const { t } = useI18n();
  const { state, setDocument } = useDesigner();
  const doc = state.document;
  const schemes = doc.components?.securitySchemes || {};
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [expandedSchemes, setExpandedSchemes] = useState<Set<string>>(new Set());

  const toggleScheme = (name: string) => {
    const next = new Set(expandedSchemes);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setExpandedSchemes(next);
  };

  const addScheme = () => {
    const name = newName.trim();
    if (!name) return;
    // BUG-8: Prevent silently overwriting an existing scheme.
    if (schemes[name]) {
      toast.error(`Security scheme "${name}" already exists`);
      return;
    }
    const newDoc = JSON.parse(JSON.stringify(doc));
    if (!newDoc.components) newDoc.components = {};
    if (!newDoc.components.securitySchemes) newDoc.components.securitySchemes = {};
    newDoc.components.securitySchemes[name] = {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key',
    };
    setDocument(newDoc);
    setNewName('');
    setShowAdd(false);
    setExpandedSchemes(new Set([...expandedSchemes, name]));
  };

  const deleteScheme = (name: string) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    delete newDoc.components.securitySchemes[name];
    // DATA-1: Cascade-remove dangling security references from all operations and global security.
    const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
    if (newDoc.paths) {
      Object.values(newDoc.paths).forEach((pathItem: any) => {
        httpMethods.forEach(method => {
          const op = pathItem?.[method];
          if (op?.security) {
            op.security = op.security.filter(
              (req: Record<string, unknown>) => !Object.prototype.hasOwnProperty.call(req, name)
            );
          }
        });
      });
    }
    if (newDoc.security) {
      newDoc.security = newDoc.security.filter(
        (req: Record<string, unknown>) => !Object.prototype.hasOwnProperty.call(req, name)
      );
    }
    setDocument(newDoc);
  };

  const updateScheme = (name: string, scheme: SecuritySchemeObject) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    newDoc.components.securitySchemes[name] = scheme;
    setDocument(newDoc);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Shield size={16} className="text-orange-500" />
          </div>
          {t.security.title}
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          {t.security.addScheme}
        </button>
      </div>

      {showAdd && (
        <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-primary/30">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t.security.schemeName}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && addScheme()}
          />
          <button onClick={addScheme} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[12px]">{t.common.add}</button>
          <button onClick={() => { setShowAdd(false); setNewName(''); }} className="px-3 py-2 rounded-lg border border-border text-[12px] text-muted-foreground">{t.common.cancel}</button>
        </div>
      )}

      {Object.keys(schemes).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Lock size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-[13px]">{t.security.noSchemes}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(schemes).map(([name, scheme]) => {
            const isExpanded = expandedSchemes.has(name);
            const typeLabel = (t.security.types as Record<string, string>)[scheme.type] || scheme.type;

            return (
              <div key={name} className="bg-card rounded-xl border border-border overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleScheme(name)}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Key size={14} className="text-orange-500" />
                  <span className="text-[13px] font-mono text-foreground" style={{ fontWeight: 500 }}>{name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600">{typeLabel}</span>
                  <div className="ml-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteScheme(name); }}
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.security.schemeType}</label>
                      <select
                        value={scheme.type}
                        onChange={(e) => {
                          const newType = e.target.value as SecuritySchemeObject['type'];
                          const base: SecuritySchemeObject = { type: newType, description: scheme.description };
                          if (newType === 'apiKey') { base.in = 'header'; base.name = 'X-API-Key'; }
                          if (newType === 'http') { base.scheme = 'bearer'; base.bearerFormat = 'JWT'; }
                          if (newType === 'oauth2') { base.flows = { authorizationCode: { authorizationUrl: '', tokenUrl: '', scopes: {} } }; }
                          if (newType === 'openIdConnect') { base.openIdConnectUrl = ''; }
                          updateScheme(name, base);
                        }}
                        className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {SECURITY_TYPES.map(type => (
                          <option key={type} value={type}>{(t.security.types as Record<string, string>)[type]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.common.description}</label>
                      <textarea
                        value={scheme.description || ''}
                        onChange={(e) => updateScheme(name, { ...scheme, description: e.target.value })}
                        className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        rows={2}
                        placeholder="Brief description of this security scheme"
                      />
                    </div>

                    {/* API Key fields */}
                    {scheme.type === 'apiKey' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.security.apiKeyName}</label>
                          <input
                            value={scheme.name || ''}
                            onChange={(e) => updateScheme(name, { ...scheme, name: e.target.value })}
                            className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.security.apiKeyIn}</label>
                          <select
                            value={scheme.in || 'header'}
                            onChange={(e) => updateScheme(name, { ...scheme, in: e.target.value as 'query' | 'header' | 'cookie' })}
                            className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="header">Header</option>
                            <option value="query">Query</option>
                            <option value="cookie">Cookie</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* HTTP fields */}
                    {scheme.type === 'http' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.security.httpScheme}</label>
                          <select
                            value={scheme.scheme || 'bearer'}
                            onChange={(e) => updateScheme(name, { ...scheme, scheme: e.target.value })}
                            className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="bearer">Bearer</option>
                            <option value="basic">Basic</option>
                            <option value="digest">Digest</option>
                          </select>
                        </div>
                        {scheme.scheme === 'bearer' && (
                          <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.security.bearerFormat}</label>
                            <input
                              value={scheme.bearerFormat || ''}
                              onChange={(e) => updateScheme(name, { ...scheme, bearerFormat: e.target.value })}
                              className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                              placeholder="JWT"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* OAuth2 flows */}
                    {scheme.type === 'oauth2' && scheme.flows && (
                      <div className="space-y-3">
                        <h4 className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>{t.security.oauthFlows}</h4>
                        {(Object.entries(scheme.flows) as [string, OAuthFlowObject | undefined][])
                          .filter(([, flow]) => flow)
                          .map(([flowType, flow]) => (
                            <div key={flowType} className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                              <div className="text-[11px] text-foreground" style={{ fontWeight: 600 }}>
                                {(t.security.flows as Record<string, string>)[flowType] || flowType}
                              </div>
                              {(flowType === 'implicit' || flowType === 'authorizationCode') && (
                                <div>
                                  <label className="text-[10px] text-muted-foreground">{t.security.authorizationUrl}</label>
                                  <input
                                    value={flow!.authorizationUrl || ''}
                                    onChange={(e) => {
                                      const newFlows = { ...scheme.flows };
                                      (newFlows as Record<string, OAuthFlowObject>)[flowType] = { ...flow!, authorizationUrl: e.target.value };
                                      updateScheme(name, { ...scheme, flows: newFlows });
                                    }}
                                    className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                                  />
                                </div>
                              )}
                              {(flowType !== 'implicit') && (
                                <div>
                                  <label className="text-[10px] text-muted-foreground">{t.security.tokenUrl}</label>
                                  <input
                                    value={flow!.tokenUrl || ''}
                                    onChange={(e) => {
                                      const newFlows = { ...scheme.flows };
                                      (newFlows as Record<string, OAuthFlowObject>)[flowType] = { ...flow!, tokenUrl: e.target.value };
                                      updateScheme(name, { ...scheme, flows: newFlows });
                                    }}
                                    className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                                  />
                                </div>
                              )}
                              <div>
                                <label className="text-[10px] text-muted-foreground">{t.security.refreshUrl}</label>
                                <input
                                  value={flow!.refreshUrl || ''}
                                  onChange={(e) => {
                                    const newFlows = { ...scheme.flows };
                                    (newFlows as Record<string, OAuthFlowObject>)[flowType] = { ...flow!, refreshUrl: e.target.value || undefined };
                                    updateScheme(name, { ...scheme, flows: newFlows });
                                  }}
                                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                                  placeholder="https://..."
                                />
                              </div>
                              {/* Scopes editor */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] text-muted-foreground">{t.security.scopes}</label>
                                  <button
                                    onClick={() => {
                                      const newFlows = JSON.parse(JSON.stringify(scheme.flows));
                                      const scopeName = `scope${Object.keys(flow!.scopes).length + 1}`;
                                      (newFlows as Record<string, OAuthFlowObject>)[flowType].scopes[scopeName] = '';
                                      updateScheme(name, { ...scheme, flows: newFlows });
                                    }}
                                    className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                                  >
                                    <Plus size={10} /> {t.security.addScope}
                                  </button>
                                </div>
                                {Object.entries(flow!.scopes).map(([scopeName, scopeDesc]) => (
                                  <div key={scopeName} className="flex items-center gap-1.5">
                                    <input
                                      value={scopeName}
                                      onChange={(e) => {
                                        const newName = e.target.value.trim();
                                        if (!newName) return;
                                        const newFlows = JSON.parse(JSON.stringify(scheme.flows));
                                        const scopes = (newFlows as Record<string, OAuthFlowObject>)[flowType].scopes;
                                        if (newName !== scopeName && newName in scopes) return;
                                        const desc = scopes[scopeName];
                                        delete scopes[scopeName];
                                        scopes[newName] = desc;
                                        updateScheme(name, { ...scheme, flows: newFlows });
                                      }}
                                      className="flex-1 px-2 py-1 rounded border border-border bg-background text-[10px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                                      placeholder={t.security.scopeName}
                                    />
                                    <input
                                      value={scopeDesc}
                                      onChange={(e) => {
                                        const newFlows = JSON.parse(JSON.stringify(scheme.flows));
                                        (newFlows as Record<string, OAuthFlowObject>)[flowType].scopes[scopeName] = e.target.value;
                                        updateScheme(name, { ...scheme, flows: newFlows });
                                      }}
                                      className="flex-1 px-2 py-1 rounded border border-border bg-background text-[10px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                                      placeholder={t.security.scopeDescription}
                                    />
                                    <button
                                      onClick={() => {
                                        const newFlows = JSON.parse(JSON.stringify(scheme.flows));
                                        delete (newFlows as Record<string, OAuthFlowObject>)[flowType].scopes[scopeName];
                                        updateScheme(name, { ...scheme, flows: newFlows });
                                      }}
                                      className="p-0.5 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                ))}
                                {Object.keys(flow!.scopes).length === 0 && (
                                  <p className="text-[10px] text-muted-foreground">{t.common.noData}</p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* OpenID Connect */}
                    {scheme.type === 'openIdConnect' && (
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.security.openIdConnectUrl}</label>
                        <input
                          value={scheme.openIdConnectUrl || ''}
                          onChange={(e) => updateScheme(name, { ...scheme, openIdConnectUrl: e.target.value })}
                          className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Global security */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-[13px] text-foreground mb-3" style={{ fontWeight: 600 }}>{t.security.globalSecurity}</h3>
        <div className="space-y-2">
          {Object.keys(schemes).map(schemeName => {
            const isGlobal = doc.security?.some(s => schemeName in s) || false;
            return (
              <label key={schemeName} className="flex items-center gap-2 text-[12px] text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => {
                    const newDoc = JSON.parse(JSON.stringify(doc));
                    if (!newDoc.security) newDoc.security = [];
                    if (e.target.checked) {
                      newDoc.security.push({ [schemeName]: [] });
                    } else {
                      newDoc.security = newDoc.security.filter((s: Record<string, unknown>) => !(schemeName in s));
                    }
                    setDocument(newDoc);
                  }}
                  className="rounded"
                />
                <span className="font-mono">{schemeName}</span>
              </label>
            );
          })}
          {Object.keys(schemes).length === 0 && (
            <p className="text-[12px] text-muted-foreground">{t.security.noSchemes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
