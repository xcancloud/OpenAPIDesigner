import React from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import { User, Mail, Globe, FileText, Scale } from 'lucide-react';

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] text-muted-foreground uppercase tracking-wide">{label}</label>
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

  const update = (path: string, value: string) => {
    const newDoc = JSON.parse(JSON.stringify(doc));
    const keys = path.split('.');
    let obj: Record<string, unknown> = newDoc;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]] = value;
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
          <div className="text-[11px] text-muted-foreground">{t.paths.endpoints}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <div className="text-[20px] text-foreground" style={{ fontWeight: 700 }}>{schemaCount}</div>
          <div className="text-[11px] text-muted-foreground">{t.schemas.title}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <div className="text-[20px] text-foreground" style={{ fontWeight: 700 }}>{securityCount}</div>
          <div className="text-[11px] text-muted-foreground">{t.security.title}</div>
        </div>
      </div>

      {/* Basic Info */}
      <SectionCard title={t.info.title} icon={<FileText size={15} />}>
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label={t.info.apiTitle}>
            <InputField value={doc.info.title} onChange={(v) => update('info.title', v)} placeholder="My API" />
          </FieldGroup>
          <FieldGroup label={t.info.apiVersion}>
            <InputField value={doc.info.version} onChange={(v) => update('info.version', v)} placeholder="1.0.0" />
          </FieldGroup>
        </div>
        <FieldGroup label={t.info.apiSummary}>
          <InputField value={doc.info.summary || ''} onChange={(v) => update('info.summary', v)} placeholder={t.common.inputPlaceholder} />
        </FieldGroup>
        <FieldGroup label={t.info.apiDescription}>
          <TextAreaField value={doc.info.description || ''} onChange={(v) => update('info.description', v)} placeholder="Markdown supported..." rows={4} />
        </FieldGroup>
        <FieldGroup label={t.info.termsOfService}>
          <InputField value={doc.info.termsOfService || ''} onChange={(v) => update('info.termsOfService', v)} placeholder="https://example.com/tos" />
        </FieldGroup>
        <FieldGroup label={t.info.openApiVersion}>
          <InputField value={doc.openapi} onChange={(v) => update('openapi', v)} placeholder="3.1.0" />
        </FieldGroup>
      </SectionCard>

      {/* Contact */}
      <SectionCard title={t.info.contact} icon={<User size={15} />}>
        <FieldGroup label={t.info.contactName}>
          <InputField value={doc.info.contact?.name || ''} onChange={(v) => update('info.contact.name', v)} placeholder="API Support" />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label={t.info.contactEmail}>
            <InputField value={doc.info.contact?.email || ''} onChange={(v) => update('info.contact.email', v)} placeholder="support@example.com" type="email" />
          </FieldGroup>
          <FieldGroup label={t.info.contactUrl}>
            <InputField value={doc.info.contact?.url || ''} onChange={(v) => update('info.contact.url', v)} placeholder="https://example.com" />
          </FieldGroup>
        </div>
      </SectionCard>

      {/* License */}
      <SectionCard title={t.info.license} icon={<Scale size={15} />}>
        <FieldGroup label={t.info.licenseName}>
          <InputField value={doc.info.license?.name || ''} onChange={(v) => update('info.license.name', v)} placeholder="Apache 2.0" />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <FieldGroup label={t.info.licenseIdentifier}>
            <InputField value={doc.info.license?.identifier || ''} onChange={(v) => update('info.license.identifier', v)} placeholder="Apache-2.0" />
          </FieldGroup>
          <FieldGroup label={t.info.licenseUrl}>
            <InputField value={doc.info.license?.url || ''} onChange={(v) => update('info.license.url', v)} placeholder="https://..." />
          </FieldGroup>
        </div>
      </SectionCard>
    </div>
  );
}