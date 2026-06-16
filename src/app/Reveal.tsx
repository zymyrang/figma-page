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
  const [visible, setVisible] = useState(false);
  // После завершения анимации убираем inline-стили (включая transform)
  // полностью — иначе оставшийся `translateY(0)` создаёт новый containing
  // block для `position: fixed` потомков (PixelPlayground physics canvas).
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Анимация — это прогрессивное улучшение. Контент НИКОГДА не должен
    // оставаться невидимым, если что-то пошло не так (вкладка открыта в
    // фоне и IntersectionObserver не шлёт колбэки, reduced-motion, нет
    // поддержки IO, медленная гидрация). Поэтому несколько страховок.

    // 1) Уважаем prefers-reduced-motion и отсутствие IO — показываем сразу.
    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(el);

    // 2) Страховочный таймаут: если за 1.2с ревил не сработал (например,
    //    вкладка была в фоне при загрузке — IO не доставляет колбэки для
    //    скрытого документа), показываем контент принудительно.
    const fallback = window.setTimeout(() => setVisible(true), 1200);

    // 3) Когда вкладка снова становится видимой — гарантированно показываем
    //    (на случай, если IO «проспал» загрузку в фоне).
    const onVisible = () => {
      if (document.visibilityState === "visible") setVisible(true);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setDone(true), duration + delay + 100);
    return () => clearTimeout(t);
  }, [visible, duration, delay]);

  const style: React.CSSProperties = done
    ? {}
    : {
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translate(0, 0)"
          : `translate(${x}px, ${y}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "opacity, transform",
      };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
