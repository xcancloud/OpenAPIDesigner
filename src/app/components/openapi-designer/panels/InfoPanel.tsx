import React, { useState } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import { User, Mail, Globe, FileText, Scale, HelpCircle } from 'lucide-react';
import { MarkdownEditor } from './MarkdownEditor';

function FieldHint({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1 align-middle">
      <HelpCircle
        size={11}
        className="text-muted-foreground/50 cursor-help hover:text-muted-foreground transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <span className="absolute bottom-full left-0 mb-1.5 w-64 p-2.5 rounded-lg bg-popover border border-border shadow-xl text-[12px] text-muted-foreground leading-relaxed z-50 whitespace-normal pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] text-muted-foreground uppercase tracking-wide">
        {label}
        {hint && <FieldHint text={hint} />}
      </label>
      {children}
    </div>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
    />
  );
}

function TextAreaField({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
    />
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2 bg-muted/30">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

export function InfoPanel() {
  const { t } = useI18n();
  const { state, setDocument } = useDesigner();
  const doc = state.document;
  const p = t.placeholders;

  const update = (path: string, value: string) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    const keys = path.split('.');
    let obj: Record<string, unknown> = newDoc;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    const lastKey = keys[keys.length - 1];
    if (value === '') {
      delete obj[lastKey];
    } else {
      obj[lastKey] = value;
    }
    setDocument(newDoc);
  };

  // Stats
  const pathCount = Object.keys(doc.paths || {}).length;
  const schemaCount = Object.keys(doc.components?.schemas || {}).length;
  const securityCount = Object.keys(doc.components?.securitySchemes || {}).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FileText size={16} className="text-blue-500" />
          </div>
          {t.info.title}
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">OpenAPI {doc.openapi}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <div className="text-[20px] text-foreground" style={{ fontWeight: 700 }}>{pathCount}</div>
          <div className="text-[12px] text-muted-foreground">{t.paths.endpoints}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <div className="text-[20px] text-foreground" style={{ fontWeight: 700 }}>{schemaCount}</div>
          <div className="text-[12px] text-muted-foreground">{t.schemas.title}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <div className="text-[20px] text-foreground" style={{ fontWeight: 700 }}>{securityCount}</div>
          <div className="text-[12px] text-muted-foreground">{t.security.title}</div>
        </div>
      </div>

      {/* Basic Info */}
      <SectionCard title={t.info.title} icon={<FileText size={15} />}>
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label={t.info.apiTitle} hint={t.hints.apiTitle}>
            <InputField value={doc.info.title} onChange={(v) => update('info.title', v)} placeholder={p.apiTitle} />
          </FieldGroup>
          <FieldGroup label={t.info.apiVersion} hint={t.hints.apiVersion}>
            <InputField value={doc.info.version} onChange={(v) => update('info.version', v)} placeholder={p.apiVersion} />
          </FieldGroup>
        </div>
        <FieldGroup label={t.info.apiSummary} hint={t.hints.apiSummary}>
          <InputField value={doc.info.summary || ''} onChange={(v) => update('info.summary', v)} placeholder={p.apiSummary} />
        </FieldGroup>
        <FieldGroup label={t.info.apiDescription} hint={t.hints.apiDescription}>
          <MarkdownEditor
            value={doc.info.description || ''}
            onChange={(v) => update('info.description', v)}
            placeholder={p.apiDescription}
            rows={5}
          />
        </FieldGroup>
        <FieldGroup label={t.info.termsOfService} hint={t.hints.termsOfService}>
          <InputField value={doc.info.termsOfService || ''} onChange={(v) => update('info.termsOfService', v)} placeholder={p.termsOfService} />
        </FieldGroup>
        <FieldGroup label={t.info.openApiVersion} hint={t.hints.openApiVersion}>
          <InputField value={doc.openapi} onChange={(v) => update('openapi', v)} placeholder={p.openApiVersion} />
        </FieldGroup>
      </SectionCard>

      {/* Contact */}
      <SectionCard title={t.info.contact} icon={<User size={15} />}>
        <FieldGroup label={t.info.contactName} hint={t.hints.contactName}>
          <InputField value={doc.info.contact?.name || ''} onChange={(v) => update('info.contact.name', v)} placeholder={p.contactName} />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label={t.info.contactEmail} hint={t.hints.contactEmail}>
            <InputField value={doc.info.contact?.email || ''} onChange={(v) => update('info.contact.email', v)} placeholder={p.contactEmail} type="email" />
          </FieldGroup>
          <FieldGroup label={t.info.contactUrl} hint={t.hints.contactUrl}>
            <InputField value={doc.info.contact?.url || ''} onChange={(v) => update('info.contact.url', v)} placeholder={p.contactUrl} />
          </FieldGroup>
        </div>
      </SectionCard>

      {/* License */}
      <SectionCard title={t.info.license} icon={<Scale size={15} />}>
        <FieldGroup label={t.info.licenseName} hint={t.hints.licenseName}>
          <InputField value={doc.info.license?.name || ''} onChange={(v) => update('info.license.name', v)} placeholder={p.licenseName} />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label={t.info.licenseIdentifier} hint={t.hints.licenseIdentifier}>
            <InputField value={doc.info.license?.identifier || ''} onChange={(v) => update('info.license.identifier', v)} placeholder={p.licenseIdentifier} />
          </FieldGroup>
          <FieldGroup label={t.info.licenseUrl} hint={t.hints.licenseUrl}>
            <InputField value={doc.info.license?.url || ''} onChange={(v) => update('info.license.url', v)} placeholder={p.licenseUrl} />
          </FieldGroup>
        </div>
      </SectionCard>
    </div>
  );
}