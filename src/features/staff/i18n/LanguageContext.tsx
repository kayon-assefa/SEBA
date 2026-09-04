import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DICTS, LANGUAGES, en, type Dict } from "./translations";

export type LanguageCode = "en" | "am" | "ti" | "om";

type LangCtx = {
  lang: LanguageCode;
  setLang: (l: LanguageCode) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
};

const Ctx = createContext<LangCtx | null>(null);
const STORAGE_KEY = "seba_staff_lang";

function getFromPath(dict: Dict, path: string): string | undefined {
  return path.split(".").reduce<any>((acc, key) => (acc == null ? acc : acc[key]), dict);
}

export function LanguageProvider({
  children, initialLang,
}: { children: React.ReactNode; initialLang?: string | null }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some(l => l.code === saved)) return saved as LanguageCode;
    return "en";
  });

  // If the staff account has a saved language preference (from the DB) and the
  // browser has no local override yet, adopt it once on load.
  useEffect(() => {
    if (initialLang && LANGUAGES.some(l => l.code === initialLang) && !window.localStorage.getItem(STORAGE_KEY)) {
      setLangState(initialLang as LanguageCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLang]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = (l: LanguageCode) => setLangState(l);

  const t = useMemo(() => {
    const dict = DICTS[lang] || en;
    return (path: string, vars?: Record<string, string | number>) => {
      let str = getFromPath(dict, path) ?? getFromPath(en, path) ?? path;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, String(v)); });
      }
      return str;
    };
  }, [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
