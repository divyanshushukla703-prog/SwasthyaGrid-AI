import { useState, useEffect, createContext, useContext } from 'react';
import { en } from './en';
import { hi } from './hi';

export type Language = 'en' | 'hi';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof en;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('swasthyagrid_lang');
    return saved === 'hi' ? 'hi' : 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('swasthyagrid_lang', newLang);
  };

  const t = lang === 'hi' ? hi : en;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    return { lang: 'en' as Language, setLang: () => {}, t: en };
  }
  return context;
}
