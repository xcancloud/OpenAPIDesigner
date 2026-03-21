import React, { useEffect, useCallback, useRef } from 'react';
import { useI18n, useDesigner } from '../context/DesignerContext';
import { AlertTriangle, CheckCircle2, XCircle, Info, RefreshCw, Shield, ArrowRight } from 'lucide-react';
import { validateDocument } from '../utils/validation';

export function ValidationPanel() {
  const { t } = useI18n();
  const { state, dispatch } = useDesigner();
  const errors = state.validationErrors;

  // OPT-5: Debounce automatic re-validation so it doesn't run synchronously on every
  // keystroke. Validation walks the entire document tree and can be expensive.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const results = validateDocument(state.document);
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: results });
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state.document, dispatch]);

  // Manual run — fires immediately, cancels any pending debounce.
  const runValidation = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const results = validateDocument(state.document);
    dispatch({ type: 'SET_VALIDATION_ERRORS', payload: results });
  }, [state.document, dispatch]);

  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;
  const infoCount = errors.filter(e => e.severity === 'info').length;

  const severityIcon = {
    error: <XCircle size={14} className="text-destructive shrink-0" />,
    warning: <AlertTriangle size={14} className="text-yellow-500 shrink-0" />,
    info: <Info size={14} className="text-blue-500 shrink-0" />,
  };

  const severityBg = {
    error: 'bg-destructive/5 border-destructive/20',
    warning: 'bg-yellow-500/5 border-yellow-500/20',
    info: 'bg-blue-500/5 border-blue-500/20',
  };

  // Navigate to relevant panel based on error path
  const navigateToError = (path: string) => {
    if (path.startsWith('paths')) {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'paths' });
    } else if (path.startsWith('info') || path === 'openapi') {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'info' });
    } else if (path.startsWith('servers')) {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'servers' });
    } else if (path.startsWith('components.schemas')) {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'schemas' });
    } else if (path.startsWith('security') || path.startsWith('components.securitySchemes')) {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'security' });
    } else if (path.startsWith('tags')) {
      dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'tags' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
            <Shield size={16} className="text-yellow-500" />
          </div>
          {t.validation.title}
        </h2>
        <button
          onClick={runValidation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[12px] text-muted-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw size={14} />
          {t.validation.runValidation}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`rounded-xl border p-4 text-center ${errorCount > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'}`}>
          <div className={`text-[24px] ${errorCount > 0 ? 'text-destructive' : 'text-green-500'}`} style={{ fontWeight: 700 }}>{errorCount}</div>
          <div className="text-[12px] text-muted-foreground">{t.validation.errors}</div>
        </div>
        <div className={`rounded-xl border p-4 text-center ${warningCount > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-border bg-card'}`}>
          <div className={`text-[24px] ${warningCount > 0 ? 'text-yellow-500' : 'text-green-500'}`} style={{ fontWeight: 700 }}>{warningCount}</div>
          <div className="text-[12px] text-muted-foreground">{t.validation.warnings}</div>
        </div>
        <div className={`rounded-xl border p-4 text-center border-border bg-card`}>
          <div className="text-[24px] text-blue-500" style={{ fontWeight: 700 }}>{infoCount}</div>
          <div className="text-[12px] text-muted-foreground">{t.validation.infos}</div>
        </div>
      </div>

      {/* Overall status */}
      <div className={`rounded-xl border p-4 flex items-center gap-3 ${errorCount === 0 ? 'bg-green-500/5 border-green-500/30' : 'bg-destructive/5 border-destructive/30'}`}>
        {errorCount === 0 ? (
          <CheckCircle2 size={20} className="text-green-500" />
        ) : (
          <XCircle size={20} className="text-destructive" />
        )}
        <div>
          <div className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>
            {errorCount === 0 ? t.validation.valid : t.validation.invalid}
          </div>
          <div className="text-[12px] text-muted-foreground">
            {errorCount === 0
              ? t.validation.noErrors
              : `${errorCount} ${t.validation.errorCount}, ${warningCount} ${t.validation.warningCount}`
            }
          </div>
        </div>
      </div>

      {/* Issues list */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, i) => (
            <div
              key={i}
              className={`rounded-lg border p-3 flex items-start gap-3 cursor-pointer hover:shadow-sm transition-shadow ${severityBg[error.severity]}`}
              onClick={() => navigateToError(error.path)}
            >
              {severityIcon[error.severity]}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-foreground">{error.message}</div>
                <div className="text-[12px] text-muted-foreground font-mono mt-0.5">{error.path}</div>
              </div>
              <ArrowRight size={12} className="text-muted-foreground shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}