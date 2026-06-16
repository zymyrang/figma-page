"use client";

import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  delay = 0,
  className = "",
  x = 0,
  y = 40,
  duration = 700,
}: {
  children: React.ReactNode;
  /** Задержка в мс — для каскадного появления группы блоков */
  delay?: number;
  /** Классы — кладутся на обёртку (например grid-classes col-span-N) */
  className?: string;
  /** Старт по горизонтали (translateX), напр. -32 для слайда слева */
  x?: number;
  /** На сколько px поднимается блок при появлении (translateY) */
  y?: number;
  /** Длительность перехода в мс */
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  // Видимость контента НЕ зависит от этого эффекта: в CSS блок виден по
  // умолчанию и скрывается только при наличии класса .js (см. globals.css),
  // а если JS не раскроет блок — есть CSS-бэкап. Здесь мы лишь запускаем
  // красивое появление, когда блок попал во вьюпорт (или как можно скорее).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = () => setShown(true);

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(el);

    // Страховка: фоновая вкладка не шлёт колбэки IntersectionObserver —
    // покажем по таймауту и при возврате вкладки на передний план.
    const fallback = window.setTimeout(reveal, 1200);
    const onVisible = () => {
      if (document.visibilityState === "visible") reveal();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-pending${shown ? " reveal-in" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={
        {
          "--reveal-x": `${x}px`,
          "--reveal-y": `${y}px`,
          "--reveal-dur": `${duration}ms`,
          "--reveal-delay": `${delay}ms`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
