import React, { createContext, useContext, useReducer, useCallback, useState, useRef, useEffect } from 'react';
import type { OpenAPIDocument, ValidationError } from '../types/openapi';
import { createPetStoreDocument } from '../types/openapi';
import type { Locale, I18nMessages } from '../i18n/locales';
import { locales } from '../i18n/locales';

// ==================== I18n Context ====================
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: I18nMessages;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

// ==================== Theme Context ====================
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// ==================== Document State ====================
type ActivePanel = 'info' | 'servers' | 'paths' | 'webhooks' | 'schemas' | 'security' | 'tags' | 'code' | 'preview' | 'validation';

interface DesignerState {
  document: OpenAPIDocument;
  activePanel: ActivePanel;
  validationErrors: ValidationError[];
  isDirty: boolean;
  selectedPath?: string;
  selectedMethod?: string;
  selectedSchema?: string;
}

type DesignerAction =
  | { type: 'SET_DOCUMENT'; payload: OpenAPIDocument }
  | { type: 'UPDATE_DOCUMENT'; payload: Partial<OpenAPIDocument> }
  | { type: 'SET_ACTIVE_PANEL'; payload: ActivePanel }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationError[] }
  | { type: 'SET_SELECTED_PATH'; payload: string | undefined }
  | { type: 'SET_SELECTED_METHOD'; payload: string | undefined }
  | { type: 'SET_SELECTED_SCHEMA'; payload: string | undefined }
  | { type: 'MARK_CLEAN' };

function designerReducer(state: DesignerState, action: DesignerAction): DesignerState {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return { ...state, document: action.payload, isDirty: true };
    case 'UPDATE_DOCUMENT':
      return { ...state, document: { ...state.document, ...action.payload }, isDirty: true };
    case 'SET_ACTIVE_PANEL':
      return { ...state, activePanel: action.payload };
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload };
    case 'SET_SELECTED_PATH':
      return { ...state, selectedPath: action.payload };
    case 'SET_SELECTED_METHOD':
      return { ...state, selectedMethod: action.payload };
    case 'SET_SELECTED_SCHEMA':
      return { ...state, selectedSchema: action.payload };
    case 'MARK_CLEAN':
      return { ...state, isDirty: false };
    default:
      return state;
  }
}

interface DesignerContextType {
  state: DesignerState;
  dispatch: React.Dispatch<DesignerAction>;
  updateDocument: (doc: Partial<OpenAPIDocument>) => void;
  setDocument: (doc: OpenAPIDocument) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveNow: () => void;
}

const DesignerContext = createContext<DesignerContextType | null>(null);

export function useDesigner(): DesignerContextType {
  const ctx = useContext(DesignerContext);
  if (!ctx) throw new Error('useDesigner must be used within DesignerProvider');
  return ctx;
}

// ==================== Provider ====================
interface DesignerProviderProps {
  children: React.ReactNode;
  initialDocument?: OpenAPIDocument;
  defaultLocale?: Locale;
  defaultTheme?: Theme;
}

const MAX_HISTORY = 50;
const STORAGE_KEY = 'openapi-designer-doc';
const STORAGE_LOCALE_KEY = 'openapi-designer-locale';
const STORAGE_THEME_KEY = 'openapi-designer-theme';

function loadFromStorage(): OpenAPIDocument | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const doc = JSON.parse(stored);
      if (doc && doc.openapi && doc.info) return doc;
    }
  } catch {}
  return null;
}

function saveToStorage(doc: OpenAPIDocument) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {}
}

export function DesignerProvider({
  children,
  initialDocument,
  defaultLocale = 'zh',
  defaultTheme = 'light',
}: DesignerProviderProps) {
  // I18n — lazy init reads localStorage only once, not on every render (OPT-1)
  const [locale, setLocaleState] = useState<Locale>(() => {
    try { return (localStorage.getItem(STORAGE_LOCALE_KEY) as Locale) || defaultLocale; }
    catch { return defaultLocale; }
  });
  const t = locales[locale];
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_LOCALE_KEY, l); } catch {}
  }, []);

  // Theme — lazy init reads localStorage only once (OPT-1)
  const [theme, setThemeState] = useState<Theme>(() => {
    try { return (localStorage.getItem(STORAGE_THEME_KEY) as Theme) || defaultTheme; }
    catch { return defaultTheme; }
  });
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_THEME_KEY, t); } catch {}
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  // Initialize theme on mount
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Document state with undo/redo — lazy init so loadFromStorage() only runs once (OPT-1)
  const [state, dispatch] = useReducer(designerReducer, undefined, (): DesignerState => {
    const doc = loadFromStorage() || initialDocument || createPetStoreDocument();
    return { document: doc, activePanel: 'info', validationErrors: [], isDirty: false };
  });

  const historyRef = useRef<OpenAPIDocument[]>([state.document]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);
  /** Tracks which history index was last persisted; used to detect return-to-clean on undo/redo (BUG-1). */
  const savedHistoryIndexRef = useRef(0);
  // Mirrors historyIndexRef as React state so canUndo/canRedo cause re-renders.
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateDocument = useCallback((partial: Partial<OpenAPIDocument>) => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: partial });
  }, []);

  const setDocument = useCallback((doc: OpenAPIDocument) => {
    dispatch({ type: 'SET_DOCUMENT', payload: doc });
  }, []);

  // Push to history whenever document changes (except during undo/redo)
  const prevDocRef = useRef<string>(JSON.stringify(state.document));
  React.useEffect(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      prevDocRef.current = JSON.stringify(state.document);
      return;
    }
    const docStr = JSON.stringify(state.document);
    if (docStr !== prevDocRef.current) {
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(JSON.parse(docStr));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
      prevDocRef.current = docStr;
      setHistoryIndex(historyIndexRef.current);
    }
  }, [state.document]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      setHistoryIndex(historyIndexRef.current);
      const doc = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      dispatch({ type: 'SET_DOCUMENT', payload: doc });
      // BUG-1: If we've undone back to the last-saved version, mark document as clean.
      if (historyIndexRef.current === savedHistoryIndexRef.current) {
        dispatch({ type: 'MARK_CLEAN' });
      }
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      setHistoryIndex(historyIndexRef.current);
      const doc = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      dispatch({ type: 'SET_DOCUMENT', payload: doc });
      // BUG-1: If we've redone forward to the last-saved version, mark document as clean.
      if (historyIndexRef.current === savedHistoryIndexRef.current) {
        dispatch({ type: 'MARK_CLEAN' });
      }
    }
  }, []);

  // Auto-save to localStorage, and mark document clean after save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.isDirty) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveToStorage(state.document);
        savedHistoryIndexRef.current = historyIndexRef.current;
        dispatch({ type: 'MARK_CLEAN' });
        saveTimerRef.current = null;
      }, 500);
    }
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        // BUG-2: Flush any pending save synchronously on unmount so the last edit is never lost.
        if (state.isDirty) saveToStorage(state.document);
        saveTimerRef.current = null;
      }
    };
  }, [state.document, state.isDirty]);

  /** Save immediately (e.g. Ctrl+S) and mark document clean. */
  const saveNow = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveToStorage(state.document);
    savedHistoryIndexRef.current = historyIndexRef.current;
    dispatch({ type: 'MARK_CLEAN' });
    saveTimerRef.current = null;
  }, [state.document]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyRef.current.length - 1;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
        <DesignerContext.Provider
          value={{ state, dispatch, updateDocument, setDocument, undo, redo, canUndo, canRedo, saveNow }}
        >
          {children}
        </DesignerContext.Provider>
      </ThemeContext.Provider>
    </I18nContext.Provider>
  );
}