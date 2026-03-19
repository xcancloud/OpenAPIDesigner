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
type ActivePanel = 'info' | 'servers' | 'paths' | 'schemas' | 'security' | 'tags' | 'code' | 'preview' | 'validation';

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
  // I18n
  const storedLocale = (() => { try { return localStorage.getItem(STORAGE_LOCALE_KEY) as Locale | null; } catch { return null; } })();
  const [locale, setLocaleState] = useState<Locale>(storedLocale || defaultLocale);
  const t = locales[locale];
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_LOCALE_KEY, l); } catch {}
  }, []);

  // Theme
  const storedTheme = (() => { try { return localStorage.getItem(STORAGE_THEME_KEY) as Theme | null; } catch { return null; } })();
  const [theme, setThemeState] = useState<Theme>(storedTheme || defaultTheme);
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
    const effectiveTheme = storedTheme || defaultTheme;
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Document state with undo/redo
  const storedDoc = loadFromStorage();
  const initDoc = storedDoc || initialDocument || createPetStoreDocument();
  const [state, dispatch] = useReducer(designerReducer, {
    document: initDoc,
    activePanel: 'info',
    validationErrors: [],
    isDirty: false,
  });

  const historyRef = useRef<OpenAPIDocument[]>([initDoc]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);

  const updateDocument = useCallback((partial: Partial<OpenAPIDocument>) => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: partial });
  }, []);

  const setDocument = useCallback((doc: OpenAPIDocument) => {
    dispatch({ type: 'SET_DOCUMENT', payload: doc });
  }, []);

  // Push to history whenever document changes (except during undo/redo)
  const prevDocRef = useRef<string>(JSON.stringify(initDoc));
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
    }
  }, [state.document]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      const doc = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      dispatch({ type: 'SET_DOCUMENT', payload: doc });
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      const doc = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]));
      dispatch({ type: 'SET_DOCUMENT', payload: doc });
    }
  }, []);

  // Auto-save to localStorage
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.isDirty) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveToStorage(state.document);
      }, 500);
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.document, state.isDirty]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
        <DesignerContext.Provider
          value={{ state, dispatch, updateDocument, setDocument, undo, redo, canUndo, canRedo }}
        >
          {children}
        </DesignerContext.Provider>
      </ThemeContext.Provider>
    </I18nContext.Provider>
  );
}