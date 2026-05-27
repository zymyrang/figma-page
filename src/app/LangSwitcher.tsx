"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "./LanguageProvider";
import { playProjectClick } from "./lib/sounds";

// Минимальный лэнг-свитчер: одна пилюля с текущим языком. Клик —
// переключает, текст плавно «улетает» вверх и приезжает с противоположной
// меткой (короткая 180ms анимация). Первое автоматическое определение
// языка (RU→EN через useEffect в LanguageProvider) проскакивает без
// анимации, чтобы юзер не видел RU-кадра при загрузке.
export default function LangSwitcher() {
  const { lang, toggle } = useLang();
  const [displayLang, setDisplayLang] = useState<typeof lang>(lang);
  const [animating, setAnimating] = useState(false);
  const isAutoChange = useRef(true);

  useEffect(() => {
    if (lang === displayLang) return;
    if (isAutoChange.current) {
      // Первое изменение — авто-определение по localStorage/гео.
      // Без анимации: просто синхронизируем, иначе пользователь видит
      // прошлый язык на 180мс при reload.
      isAutoChange.current = false;
      setDisplayLang(lang);
      return;
    }
    setAnimating(true);
    const t = setTimeout(() => {
      setDisplayLang(lang);
      setAnimating(false);
    }, 180);
    return () => clearTimeout(t);
  }, [lang, displayLang]);

  const handleClick = () => {
    // Любой клик — это намеренное переключение, должно анимироваться.
    isAutoChange.current = false;
    playProjectClick();
    toggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Toggle language"
      className="inline-flex items-center justify-center h-[33px] min-w-[46px] px-3 rounded-full bg-[var(--card)] border border-[var(--border)] text-[13px] leading-none text-[var(--fg)] hover:bg-[var(--card-hover)] transition-colors uppercase font-medium tracking-wide select-none overflow-hidden"
    >
      <span
        className={`inline-block transition-all duration-180 ease-out ${
          animating
            ? "opacity-0 -translate-y-2"
            : "opacity-100 translate-y-0"
        }`}
      >
        {displayLang === "ru" ? "RU" : "EN"}
      </span>
    </button>
  );
}
