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
}>({ lang: "ru", content: content.ru, toggle: () => {} });

// СНГ без Украины — для этих стран по умолчанию ставим русский.
// ISO-3166 alpha-2 коды.
const RU_DEFAULT_COUNTRIES = new Set([
  "RU", // Россия
  "BY", // Беларусь
  "KZ", // Казахстан
  "KG", // Киргизия
  "TJ", // Таджикистан
  "UZ", // Узбекистан
  "TM", // Туркмения
  "AM", // Армения
  "MD", // Молдова
]);

function langFromCountry(code: string | null | undefined): Lang {
  if (!code) return "en";
  return RU_DEFAULT_COUNTRIES.has(code.toUpperCase()) ? "ru" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Стартуем с "ru" — совпадает с SSR-разметкой, чтобы не было
  // hydration mismatch. После маунта определяем настоящий язык (localStorage
  // / navigator / IP-гео); пока определяем — body спрятан классом
  // lang-pending (его ставит антифликер-скрипт в <head>, см. layout.tsx).
  const [lang, setLang] = useState<Lang>("ru");
  // determined переключается в true, как только мы знаем итоговый язык.
  // Только после этого снимаем lang-pending — иначе body откроется на
  // первом RU-рендере и пользователь увидит вспышку.
  const [determined, setDetermined] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // 1) Сохранённый выбор пользователя — приоритетней всего.
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "ru") {
        setLang(saved);
        setDetermined(true);
        return;
      }
    } catch {
      // localStorage недоступен — идём дальше к гео-детекту
    }

    // 2) Быстрый эвристический ответ по navigator.language —
    //    чтобы не сидеть на русском, пока летит IP-запрос.
    let navHinted: Lang | null = null;
    try {
      const navLang = navigator.language || "";
      if (!navLang.toLowerCase().startsWith("ru")) {
        navHinted = "en";
        setLang("en");
      }
    } catch {
      // navigator недоступен — игнорим
    }

    // 3) Точный детект по IP (ipapi.co — бесплатный лимит достаточно велик).
    //    Запрос фоновый: если ответил раньше unmount-а — корректируем язык.
    const controller = new AbortController();
    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data) {
          const code = data.country_code || data.country;
          const next = langFromCountry(code);
          setLang(next);
          // Запоминаем определённый язык, чтобы на следующих загрузках
          // антифликер успел отработать ДО первого пайнта.
          try {
            localStorage.setItem("lang", next);
          } catch {}
        }
      })
      .catch(() => {
        // сеть/CORS легли — оставляем то, что подсказал navigator.language
      })
      .finally(() => {
        if (!cancelled) setDetermined(true);
      });

    // Если есть подсказка navigator — уже можем показывать. Также сохраняем
    // в localStorage, чтобы при следующей загрузке антифликер сработал.
    if (navHinted) {
      try {
        localStorage.setItem("lang", navHinted);
      } catch {}
      setDetermined(true);
    }
    // Иначе ничего не меняем — body останется спрятанным, пока IP не ответит.

    return () => {
      cancelled = true;
      controller.abort();
    };
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
