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
    return () => observer.disconnect();
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
