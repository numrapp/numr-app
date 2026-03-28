import { createContext, useContext, useState, createElement } from 'react';
import type { ReactNode } from 'react';

const translations: Record<string, Record<string, string>> = {};

export function registerLocale(code: string, data: Record<string, string>) {
  translations[code] = data;
}

interface I18nCtx { lang: string; setLang: (c: string) => void; t: (k: string) => string; }
const Ctx = createContext<I18nCtx>({ lang: 'nl', setLang: () => {}, t: (k) => k });
export function useI18n() { return useContext(Ctx); }

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('sendLang') || 'nl');
  const setLang = (c: string) => { localStorage.setItem('sendLang', c); setLangState(c); };
  const t = (key: string): string => {
    const d = translations[lang] || translations['nl'] || {};
    const nl = translations['nl'] || {};
    return d[key] || nl[key] || key;
  };
  return createElement(Ctx.Provider, { value: { lang, setLang, t } }, children);
}
