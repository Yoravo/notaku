"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { id } from "./dictionaries/id";
import { en } from "./dictionaries/en";

export type Locale = "id" | "en";
export type Dictionary = typeof id;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const dictionaries: Record<Locale, Dictionary> = { id, en };

const LanguageContext = createContext<LanguageContextType>({
  locale: "id",
  setLocale: () => {},
  t: id,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");

  useEffect(() => {
    const saved = localStorage.getItem("notaku_locale") as Locale;
    if (saved && (saved === "id" || saved === "en")) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("notaku_locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t: dictionaries[locale] || id,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
