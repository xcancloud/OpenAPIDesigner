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
                <option value="$ref" disabled={schemaNames.length === 0}>{schemaNames.length === 0 ? '$ref (no schemas)' : '$ref'}</option>
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
              <textarea
                value={schema.description || ''}
                onChange={(e) => onUpdate({ ...schema, description: e.target.value })}
                className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                rows={3}
                placeholder="Markdown supported..."
              />
            </div>
          </div>

          {/* Enum values for string — tag-style editor */}
          {type === 'string' && (
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">{t.schemas.enumValues}</label>
              <div className="flex flex-wrap gap-1 p-2 rounded border border-border bg-background min-h-[36px] focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                {(schema.enum || []).map((val, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[11px] font-mono text-foreground">
                    {String(val)}
                    <button
                      onClick={() => {
                        const next = (schema.enum || []).filter((_, i) => i !== idx);
                        onUpdate({ ...schema, enum: next.length > 0 ? next : undefined });
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  className="text-[11px] bg-transparent outline-none min-w-[80px] flex-1 font-mono placeholder:text-muted-foreground/50"
                  placeholder={schema.enum?.length ? '' : t.schemas.addEnumValue + ' (Enter)'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val) {
                        onUpdate({ ...schema, enum: [...(schema.enum || []), val] });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                    if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && schema.enum?.length) {
                      const next = schema.enum.slice(0, -1);
                      onUpdate({ ...schema, enum: next.length > 0 ? next : undefined });
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* String constraints */}
          {type === 'string' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">{t.schemas.minLength}</label>
                <input
                  type="number"
                  value={schema.minLength ?? ''}
                  onChange={(e) => onUpdate({ ...schema, minLength: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  min={0}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">{t.schemas.maxLength}</label>
                <input
                  type="number"
                  value={schema.maxLength ?? ''}
                  onChange={(e) => onUpdate({ ...schema, maxLength: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  min={0}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">{t.schemas.pattern}</label>
                <input
                  value={schema.pattern || ''}
                  onChange={(e) => onUpdate({ ...schema, pattern: e.target.value || undefined })}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                  placeholder="^[a-z]+$"
                />
              </div>
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

          {/* Array constraints */}
          {type === 'array' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">{t.schemas.minItems}</label>
                <input
                  type="number"
                  value={schema.minItems ?? ''}
                  onChange={(e) => onUpdate({ ...schema, minItems: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  min={0}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">{t.schemas.maxItems}</label>
                <input
                  type="number"
                  value={schema.maxItems ?? ''}
                  onChange={(e) => onUpdate({ ...schema, maxItems: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                  min={0}
                />
              </div>
              <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={schema.uniqueItems || false}
                  onChange={(e) => onUpdate({ ...schema, uniqueItems: e.target.checked || undefined })}
                  className="rounded"
                />
                {t.schemas.uniqueItems}
              </label>
            </div>
          )}

          {/* Common: default value, readOnly, writeOnly, nullable */}
          {!schema.$ref && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground">{t.common.default}</label>
                <input
                  value={schema.default !== undefined ? JSON.stringify(schema.default) : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) { onUpdate({ ...schema, default: undefined }); return; }
                    if (type === 'number' || type === 'integer') {
                      const num = Number(val);
                      onUpdate({ ...schema, default: isNaN(num) ? undefined : num });
                    } else if (type === 'boolean') {
                      onUpdate({ ...schema, default: val === 'true' ? true : val === 'false' ? false : undefined });
                    } else {
                      onUpdate({ ...schema, default: val });
                    }
                  }}
                  className="w-full mt-0.5 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                  placeholder={t.common.default}
                />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={schema.nullable || false} onChange={(e) => onUpdate({ ...schema, nullable: e.target.checked || undefined })} className="rounded" />
                  {t.schemas.nullable}
                </label>
                <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={schema.readOnly || false} onChange={(e) => onUpdate({ ...schema, readOnly: e.target.checked || undefined })} className="rounded" />
                  {t.schemas.readOnly}
                </label>
                <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
                  <input type="checkbox" checked={schema.writeOnly || false} onChange={(e) => onUpdate({ ...schema, writeOnly: e.target.checked || undefined })} className="rounded" />
                  {t.schemas.writeOnly}
                </label>
              </div>
            </div>
          )}

          {/* Object: additionalProperties toggle */}
          {type === 'object' && (
            <label className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={schema.additionalProperties !== false}
                onChange={(e) => onUpdate({ ...schema, additionalProperties: e.target.checked ? undefined : false })}
                className="rounded"
              />
              {t.schemas.additionalProperties}
            </label>
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
  const [propError, setPropError] = useState('');
  const properties = schema.properties || {};
  const required = schema.required || [];

  const addProperty = () => {
    const trimmed = newPropName.trim();
    if (!trimmed) return;
    if (properties[trimmed]) {
      setPropError(`Property "${trimmed}" already exists`);
      return;
    }
    setPropError('');
    const newSchema = { ...schema };
    newSchema.properties = { ...properties, [trimmed]: { type: 'string' } };
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              value={newPropName}
              onChange={(e) => { setNewPropName(e.target.value); if (propError) setPropError(''); }}
              placeholder={t.schemas.propertyName}
              className={`px-2 py-1 rounded border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono ${propError ? 'border-destructive' : 'border-border'}`}
              onKeyDown={(e) => e.key === 'Enter' && addProperty()}
            />
            <button
              onClick={addProperty}
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              <Plus size={11} /> {t.schemas.addProperty}
            </button>
          </div>
          {propError && <p className="text-[10px] text-destructive">{propError}</p>}
        </div>
      </div>
    </div>
  );
}

const COMPOSITION_KEYWORDS = ['allOf', 'oneOf', 'anyOf'] as const;

function CompositionEditor({
  schema,
  onUpdate,
  schemaNames,
}: {
  schema: SchemaObject;
  onUpdate: (s: SchemaObject) => void;
  schemaNames: string[];
}) {
  const { t } = useI18n();
  const hasComposition = schema.allOf || schema.oneOf || schema.anyOf;

  const addComposition = (keyword: typeof COMPOSITION_KEYWORDS[number]) => {
    onUpdate({ ...schema, [keyword]: [...(schema[keyword] || []), { type: 'object' }] });
  };

  const removeCompositionItem = (keyword: typeof COMPOSITION_KEYWORDS[number], index: number) => {
    const arr = [...(schema[keyword] || [])];
    arr.splice(index, 1);
    onUpdate({ ...schema, [keyword]: arr.length > 0 ? arr : undefined });
  };

  const updateCompositionItem = (keyword: typeof COMPOSITION_KEYWORDS[number], index: number, item: SchemaObject) => {
    const arr = [...(schema[keyword] || [])];
    arr[index] = item;
    onUpdate({ ...schema, [keyword]: arr });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{t.schemas.composition}</span>
        <div className="flex gap-1 ml-auto">
          {COMPOSITION_KEYWORDS.map((kw) => (
            <button
              key={kw}
              onClick={() => addComposition(kw)}
              className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              + {kw}
            </button>
          ))}
        </div>
      </div>
      {COMPOSITION_KEYWORDS.map((keyword) => {
        const items = schema[keyword];
        if (!items || items.length === 0) return null;
        return (
          <div key={keyword} className="p-2 rounded-lg bg-muted/30 border border-border space-y-2">
            <div className="text-[11px] text-foreground" style={{ fontWeight: 600 }}>{keyword}</div>
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 pl-2 border-l-2 border-primary/30">
                <select
                  value={item.$ref ? '$ref' : 'inline'}
                  onChange={(e) => {
                    if (e.target.value === '$ref') {
                      updateCompositionItem(keyword, idx, { $ref: `#/components/schemas/${schemaNames[0] || 'Schema'}` });
                    } else {
                      updateCompositionItem(keyword, idx, { type: 'object' });
                    }
                  }}
                  className="px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="inline">Inline</option>
                  <option value="$ref">$ref</option>
                </select>
                {item.$ref ? (
                  <select
                    value={item.$ref.replace('#/components/schemas/', '')}
                    onChange={(e) => updateCompositionItem(keyword, idx, { $ref: `#/components/schemas/${e.target.value}` })}
                    className="flex-1 px-2 py-1 rounded border border-border bg-background text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                  >
                    {schemaNames.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                ) : (
                  <span className="text-[11px] text-muted-foreground flex-1">{item.type || 'object'}</span>
                )}
                <button
                  onClick={() => removeCompositionItem(keyword, idx)}
                  className="p-1 text-muted-foreground hover:text-destructive"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        );
      })}
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
    let copyName = `${name}Copy`;
    let counter = 2;
    while (newDoc.components.schemas[copyName]) {
      copyName = `${name}Copy${counter++}`;
    }
    newDoc.components.schemas[copyName] = JSON.parse(JSON.stringify(schemas[name]));
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
                          <textarea
                            value={schema.description || ''}
                            onChange={(e) => updateSchema(name, { ...schema, description: e.target.value })}
                            className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                            rows={3}
                            placeholder="Markdown supported..."
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
                      <div className="space-y-2">
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
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-muted-foreground">{t.schemas.minLength}</label>
                            <input type="number" value={schema.minLength ?? ''} min={0}
                              onChange={(e) => updateSchema(name, { ...schema, minLength: e.target.value ? Number(e.target.value) : undefined })}
                              className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">{t.schemas.maxLength}</label>
                            <input type="number" value={schema.maxLength ?? ''} min={0}
                              onChange={(e) => updateSchema(name, { ...schema, maxLength: e.target.value ? Number(e.target.value) : undefined })}
                              className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground">{t.schemas.pattern}</label>
                            <input value={schema.pattern || ''} placeholder="^[a-z]+$"
                              onChange={(e) => updateSchema(name, { ...schema, pattern: e.target.value || undefined })}
                              className="w-full mt-0.5 px-2 py-1.5 rounded border border-border bg-background text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Composition: allOf / oneOf / anyOf */}
                    <CompositionEditor
                      schema={schema}
                      onUpdate={(s) => updateSchema(name, s)}
                      schemaNames={schemaNames.filter(n => n !== name)}
                    />
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
