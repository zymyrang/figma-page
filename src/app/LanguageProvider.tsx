"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { content, type Lang, type SiteContent } from "@/content";

const LanguageContext = createContext<{
  lang: Lang;
  content: SiteContent;
  toggle: () => void;
}>({ lang: "en", content: content.en, toggle: () => {} });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Стартуем с "en" — совпадает с SSR-разметкой. Если пользователь
  // ранее переключил на русский, антифликер-скрипт в <head> поставит
  // lang-pending и спрячет body до перерисовки в RU.
  const [lang, setLang] = useState<Lang>("en");
  const [determined, setDetermined] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "ru") {
        setLang(saved);
      }
    } catch {
      // localStorage недоступен — остаёмся на EN
    }
    setDetermined(true);
  }, []);

  // Снимаем lang-pending в useLayoutEffect — он срабатывает синхронно
  // ПОСЛЕ commit-а, но ДО первого пайнта. Это гарантирует, что body
  // открывается уже с корректным языком, без RU-вспышки.
  const useIsoLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;
  useIsoLayoutEffect(() => {
    if (!determined) return;
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    if (html.classList.contains("lang-pending")) {
      html.classList.remove("lang-pending");
    }
  }, [determined, lang]);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "ru" ? "en" : "ru";
      try {
        localStorage.setItem("lang", next);
      } catch {
        // не запоминаем выбор
      }
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, content: content[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
export const useContent = () => useContext(LanguageContext).content;
