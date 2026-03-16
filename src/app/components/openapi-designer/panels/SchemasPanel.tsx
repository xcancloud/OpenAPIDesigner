import React, { useState } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import {
  Plus, Trash2, Box, ChevronDown, ChevronRight, Search, X, Copy
} from 'lucide-react';
import type { SchemaObject } from '../types/openapi';

const SCHEMA_TYPES = ['string', 'number', 'integer', 'boolean', 'array', 'object', 'null'];
const STRING_FORMATS = ['', 'date', 'date-time', 'email', 'uri', 'uuid', 'hostname', 'ipv4', 'ipv6', 'byte', 'binary', 'password'];
const NUMBER_FORMATS = ['', 'float', 'double', 'int32', 'int64'];

function PropertyEditor({
  name,
  schema,
  isRequired,
  onUpdate,
  onDelete,
  onToggleRequired,
  schemaNames,
  depth = 0,
}: {
  name: string;
  schema: SchemaObject;
  isRequired: boolean;
  onUpdate: (s: SchemaObject) => void;
  onDelete: () => void;
  onToggleRequired: () => void;
  schemaNames: string[];
  depth?: number;
}) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(depth < 1);
  const type = (schema.$ref ? '$ref' : (typeof schema.type === 'string' ? schema.type : 'object')) || 'string';
  const hasChildren = type === 'object' || type === 'array';

  return (
    <div className={`${depth > 0 ? 'ml-4 pl-3 border-l-2 border-border' : ''}`}>
      <div className="flex items-center gap-2 py-1.5 group">
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-3" />
        )}
        <span className="text-[12px] font-mono text-foreground" style={{ fontWeight: 500 }}>{name}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
          type === 'string' ? 'bg-green-500/10 text-green-600' :
          type === 'number' || type === 'integer' ? 'bg-blue-500/10 text-blue-600' :
          type === 'boolean' ? 'bg-orange-500/10 text-orange-600' :
          type === 'array' ? 'bg-purple-500/10 text-purple-600' :
          type === 'object' ? 'bg-pink-500/10 text-pink-600' :
          type === '$ref' ? 'bg-cyan-500/10 text-cyan-600' :
          'bg-muted text-muted-foreground'
        }`}>
          {schema.$ref ? schema.$ref.split('/').pop() : type}
        </span>
        {isRequired && <span className="text-[9px] text-destructive">*</span>}
        {schema.format && <span className="text-[10px] text-muted-foreground">({schema.format})</span>}
        {schema.description && (
          <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">{schema.description}</span>
        )}
        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onToggleRequired} className="text-[10px] px-1.5 py-0.5 rounded border border-border hover:bg-muted">
            {isRequired ? t.common.optional : t.common.required}
          </button>
          <button onClick={onDelete} className="p-1 text-muted-foreground hover:text-destructive"><X size={11} /></button>
        </div>
      </div>

      {expanded && (
        <div className="ml-3 space-y-2 py-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">{t.common.type}</label>
              <select
                value={schema.$ref ? '$ref' : type}
                onChange={(e) => {
                  if (e.target.value === '$ref') {
                    onUpdate({ $ref: `#/components/schemas/${schemaNames[0] || 'Schema'}` });
                  } else {
                    const newSchema: SchemaObject = { type: e.target.value };
                    if (e.target.value === 'object') newSchema.properties = {};
                    if (e.target.value === 'array') newSchema.items = { type: 'string' };
                    onUpdate({ ...newSchema, description: schema.description });
                  }
                }}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {SCHEMA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="$ref">$ref</option>
              </select>
            </div>
            {(type === 'string' || type === 'number' || type === 'integer') && (
              <div>
                <label className="text-[10px] text-muted-foreground">{t.common.format}</label>
                <select
                  value={schema.format || ''}
                  onChange={(e) => onUpdate({ ...schema, format: e.target.value || undefined })}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {(type === 'string' ? STRING_FORMATS : NUMBER_FORMATS).map(f => (
                    <option key={f} value={f}>{f || '—'}</option>
                  ))}
                </select>
              </div>
            )}
            {schema.$ref && (
              <div>
                <label className="text-[10px] text-muted-foreground">$ref</label>
                <select
                  value={schema.$ref.replace('#/components/schemas/', '')}
                  onChange={(e) => onUpdate({ $ref: `#/components/schemas/${e.target.value}` })}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {schemaNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-[10px] text-muted-foreground">{t.common.description}</label>
              <input
                value={schema.description || ''}
                onChange={(e) => onUpdate({ ...schema, description: e.target.value })}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Enum values for string */}
          {type === 'string' && (
            <div>
              <label className="text-[10px] text-muted-foreground">{t.schemas.enumValues} (comma-separated)</label>
              <input
                value={(schema.enum || []).join(', ')}
                onChange={(e) => {
                  const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  onUpdate({ ...schema, enum: vals.length > 0 ? vals : undefined });
                }}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                placeholder="val1, val2, val3"
              />
            </div>
          )}

          {/* Numeric constraints */}
          {(type === 'number' || type === 'integer') && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">{t.schemas.minimum}</label>
                <input
                  type="number"
                  value={schema.minimum ?? ''}
                  onChange={(e) => onUpdate({ ...schema, minimum: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">{t.schemas.maximum}</label>
                <input
                  type="number"
                  value={schema.maximum ?? ''}
                  onChange={(e) => onUpdate({ ...schema, maximum: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {/* Object properties */}
          {type === 'object' && schema.properties && (
            <ObjectPropertiesEditor
              schema={schema}
              onUpdate={onUpdate}
              schemaNames={schemaNames}
              depth={depth + 1}
            />
          )}

          {/* Array items */}
          {type === 'array' && schema.items && (
            <div>
              <label className="text-[10px] text-muted-foreground">{t.schemas.arrayItems}</label>
              <PropertyEditor
                name="items"
                schema={schema.items}
                isRequired={false}
                onUpdate={(s) => onUpdate({ ...schema, items: s })}
                onDelete={() => onUpdate({ ...schema, items: undefined })}
                onToggleRequired={() => {}}
                schemaNames={schemaNames}
                depth={depth + 1}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ObjectPropertiesEditor({
  schema,
  onUpdate,
  schemaNames,
  depth = 0,
}: {
  schema: SchemaObject;
  onUpdate: (s: SchemaObject) => void;
  schemaNames: string[];
  depth?: number;
}) {
  const { t } = useI18n();
  const [newPropName, setNewPropName] = useState('');
  const properties = schema.properties || {};
  const required = schema.required || [];

  const addProperty = () => {
    if (!newPropName) return;
    const newSchema = { ...schema };
    newSchema.properties = { ...properties, [newPropName]: { type: 'string' } };
    onUpdate(newSchema);
    setNewPropName('');
  };

  return (
    <div className="space-y-1">
      {Object.entries(properties).map(([propName, propSchema]) => (
        <PropertyEditor
          key={propName}
          name={propName}
          schema={propSchema}
          isRequired={required.includes(propName)}
          onUpdate={(s) => {
            const newSchema = { ...schema, properties: { ...properties, [propName]: s } };
            onUpdate(newSchema);
          }}
          onDelete={() => {
            const newProps = { ...properties };
            delete newProps[propName];
            const newReq = required.filter(r => r !== propName);
            onUpdate({ ...schema, properties: newProps, required: newReq.length ? newReq : undefined });
          }}
          onToggleRequired={() => {
            const isReq = required.includes(propName);
            const newReq = isReq ? required.filter(r => r !== propName) : [...required, propName];
            onUpdate({ ...schema, required: newReq.length ? newReq : undefined });
          }}
          schemaNames={schemaNames}
          depth={depth}
        />
      ))}
      <div className="flex items-center gap-2 mt-2">
        <input
          value={newPropName}
          onChange={(e) => setNewPropName(e.target.value)}
          placeholder={t.schemas.propertyName}
          className="px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
          onKeyDown={(e) => e.key === 'Enter' && addProperty()}
        />
        <button
          onClick={addProperty}
          className="text-[11px] text-primary hover:underline flex items-center gap-1"
        >
          <Plus size={11} /> {t.schemas.addProperty}
        </button>
      </div>
    </div>
  );
}

export function SchemasPanel() {
  const { t } = useI18n();
  const { state, setDocument } = useDesigner();
  const doc = state.document;
  const schemas = doc.components?.schemas || {};
  const schemaNames = Object.keys(schemas);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());

  const toggleSchema = (name: string) => {
    const next = new Set(expandedSchemas);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setExpandedSchemas(next);
  };

  const addSchema = () => {
    if (!newName) return;
    const newDoc = JSON.parse(JSON.stringify(doc));
    if (!newDoc.components) newDoc.components = {};
    if (!newDoc.components.schemas) newDoc.components.schemas = {};
    newDoc.components.schemas[newName] = { type: 'object', properties: {} };
    setDocument(newDoc);
    setNewName('');
    setShowAdd(false);
    setExpandedSchemas(new Set([...expandedSchemas, newName]));
  };

  const deleteSchema = (name: string) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    delete newDoc.components.schemas[name];
    setDocument(newDoc);
  };

  const updateSchema = (name: string, schema: SchemaObject) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    newDoc.components.schemas[name] = schema;
    setDocument(newDoc);
  };

  const duplicateSchema = (name: string) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    const newName = `${name}Copy`;
    newDoc.components.schemas[newName] = JSON.parse(JSON.stringify(schemas[name]));
    setDocument(newDoc);
  };

  const filteredSchemas = Object.entries(schemas).filter(
    ([name]) => !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Box size={16} className="text-pink-500" />
            </div>
            {t.schemas.title}
          </h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">{schemaNames.length} schemas</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          {t.schemas.addSchema}
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.common.search}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {showAdd && (
        <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-primary/30">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t.schemas.schemaName}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && addSchema()}
          />
          <button onClick={addSchema} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[12px]">{t.common.add}</button>
          <button onClick={() => { setShowAdd(false); setNewName(''); }} className="px-3 py-2 rounded-lg border border-border text-[12px] text-muted-foreground hover:bg-muted">{t.common.cancel}</button>
        </div>
      )}

      {filteredSchemas.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Box size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-[13px]">{t.schemas.noSchemas}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchemas.map(([name, schema]) => {
            const isExpanded = expandedSchemas.has(name);
            const type = typeof schema.type === 'string' ? schema.type : 'object';
            const propCount = schema.properties ? Object.keys(schema.properties).length : 0;

            return (
              <div key={name} className="bg-card rounded-xl border border-border overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleSchema(name)}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span className="text-[13px] font-mono text-foreground" style={{ fontWeight: 500 }}>{name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    type === 'object' ? 'bg-pink-500/10 text-pink-600' :
                    type === 'array' ? 'bg-purple-500/10 text-purple-600' :
                    'bg-muted text-muted-foreground'
                  }`}>{type}</span>
                  {propCount > 0 && <span className="text-[11px] text-muted-foreground">{propCount} props</span>}
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateSchema(name); }}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSchema(name); }}
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4">
                    <div className="space-y-3 mb-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground">{t.common.type}</label>
                          <select
                            value={type}
                            onChange={(e) => {
                              const newSchema: SchemaObject = { type: e.target.value, description: schema.description };
                              if (e.target.value === 'object') newSchema.properties = {};
                              if (e.target.value === 'array') newSchema.items = { type: 'string' };
                              updateSchema(name, newSchema);
                            }}
                            className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            {SCHEMA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] text-muted-foreground">{t.common.description}</label>
                          <input
                            value={schema.description || ''}
                            onChange={(e) => updateSchema(name, { ...schema, description: e.target.value })}
                            className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </div>
                    </div>

                    {type === 'object' && (
                      <ObjectPropertiesEditor
                        schema={schema}
                        onUpdate={(s) => updateSchema(name, s)}
                        schemaNames={schemaNames.filter(n => n !== name)}
                      />
                    )}

                    {type === 'array' && schema.items && (
                      <div>
                        <label className="text-[10px] text-muted-foreground">{t.schemas.arrayItems}</label>
                        <PropertyEditor
                          name="items"
                          schema={schema.items}
                          isRequired={false}
                          onUpdate={(s) => updateSchema(name, { ...schema, items: s })}
                          onDelete={() => {}}
                          onToggleRequired={() => {}}
                          schemaNames={schemaNames.filter(n => n !== name)}
                        />
                      </div>
                    )}

                    {type === 'string' && (
                      <div>
                        <label className="text-[10px] text-muted-foreground">{t.schemas.enumValues}</label>
                        <input
                          value={(schema.enum || []).join(', ')}
                          onChange={(e) => {
                            const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            updateSchema(name, { ...schema, enum: vals.length > 0 ? vals : undefined });
                          }}
                          className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                          placeholder="val1, val2, val3"
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
    </div>
  );
}
