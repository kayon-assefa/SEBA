import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { translations, type Language } from "../../../lib/translations";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Single string translation, with optional {placeholder} interpolation. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Translation entries that are string arrays (e.g. strengthLabels). */
  tList: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "seba_lang";

function getInitialLang(): Language {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "am" ? "am" : "en"; // default is always English
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, String(value)),
    template
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  // persist choice + reflect it on <html lang="..."> for accessibility/SEO
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = "ltr"; // Amharic (Ge'ez script) is LTR too
  }, [lang]);

  const setLang = (next: Language) => setLangState(next);

  const t = (key: string, vars?: Record<string, string | number>) => {
    const dictionary = translations[lang] as Record<string, string | readonly string[]>;
    const fallbackDictionary = translations.en as Record<string, string | readonly string[]>;
    const raw = dictionary[key] ?? fallbackDictionary[key] ?? key;
    const value = typeof raw === "string" ? raw : raw.join(", ");
    return interpolate(value, vars);
  };

  const tList = (key: string): string[] => {
    const dictionary = translations[lang] as Record<string, string | readonly string[]>;
    const fallbackDictionary = translations.en as Record<string, string | readonly string[]>;
    const raw = dictionary[key] ?? fallbackDictionary[key] ?? [key];
    return typeof raw === "string" ? [raw] : [...raw];
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tList }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a <LanguageProvider>");
  }
  return ctx;
}
