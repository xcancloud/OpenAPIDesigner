import React, { useState } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import { Tag, Plus, Trash2, Hash } from 'lucide-react';
import type { TagObject } from '../types/openapi';
import { MarkdownEditor } from './MarkdownEditor';

export function TagsPanel() {
  const { t } = useI18n();
  const { state, setDocument } = useDesigner();
  const doc = state.document;
  const tags = doc.tags || [];
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const addTag = () => {
    if (!newName) return;
    const newDoc = JSON.parse(JSON.stringify(doc));
    if (!newDoc.tags) newDoc.tags = [];
    newDoc.tags.push({ name: newName, description: '' });
    setDocument(newDoc);
    setNewName('');
    setShowAdd(false);
  };

  const deleteTag = (index: number) => {
    const removedName = doc.tags?.[index]?.name;
    const newDoc = JSON.parse(JSON.stringify(doc));
    newDoc.tags.splice(index, 1);
    // BUG-8: cascade-remove the deleted tag name from all operations
    if (removedName && newDoc.paths) {
      const httpMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
      Object.values(newDoc.paths).forEach((pathItem: any) => {
        httpMethods.forEach(method => {
          const op = pathItem?.[method];
          if (op?.tags) {
            op.tags = op.tags.filter((t: string) => t !== removedName);
          }
        });
      });
    }
    setDocument(newDoc);
  };

  const updateTag = (index: number, tag: TagObject) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    newDoc.tags[index] = tag;
    setDocument(newDoc);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <Tag size={16} className="text-teal-500" />
          </div>
          {t.tags.title}
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          {t.tags.addTag}
        </button>
      </div>

      {showAdd && (
        <div className="flex items-center gap-2 p-3 bg-card rounded-lg border border-primary/30">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t.tags.tagName}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
          />
          <button onClick={addTag} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[12px]">{t.common.add}</button>
          <button onClick={() => { setShowAdd(false); setNewName(''); }} className="px-3 py-2 rounded-lg border border-border text-[12px] text-muted-foreground">{t.common.cancel}</button>
        </div>
      )}

      {tags.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Hash size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-[13px]">{t.tags.noTags}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tags.map((tag, index) => (
            <div key={tag.name + index} className="bg-card rounded-xl border border-border p-4 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                  <Hash size={14} className="text-teal-500" />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    value={tag.name}
                    onChange={(e) => updateTag(index, { ...tag, name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                    placeholder={t.tags.tagName}
                  />
                  <MarkdownEditor
                    value={tag.description || ''}
                    onChange={(v) => updateTag(index, { ...tag, description: v })}
                    placeholder={t.hints.tagDescription}
                    rows={2}
                  />
                </div>
                <button
                  onClick={() => deleteTag(index)}
                  className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
