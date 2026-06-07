"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function isVideo(src: string) {
  return /\.(mp4|mov|webm)$/i.test(src);
}

/** Базовый слой — рендерится в потоке и задаёт высоту контейнера. */
function BaseMedia({ src, className = "" }: { src: string; className?: string }) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        draggable={false}
        className={`block w-full h-auto select-none pointer-events-none ${className}`}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      className={`block w-full h-auto select-none pointer-events-none ${className}`}
    />
  );
}

/** Накладываемый слой — растягивается на весь контейнер поверх базового. */
function OverlayMedia({ src }: { src: string }) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      draggable={false}
      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
    />
  );
}

/**
 * Интерактивное сравнение «Вариант А / Вариант Б»: один макет поверх другого,
 * раздвигаемый перетаскиванием хэндла. Левая часть от линии — `before`
 * (Вариант А), правая — `after` (Вариант Б). Высоту задаёт базовый слой
 * (`after`), верхний слой накладывается через object-cover — поэтому пара
 * медиа может быть и разного размера.
 */
export default function BeforeAfterSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
  dragLabel = "drag me",
  className = "",
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  dragLabel?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  // Подсказка-пульсация висит, пока пользователь не начал перетаскивать.
  const [hinted, setHinted] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => updateFromClientX(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, updateFromClientX]);

  const start = (clientX: number) => {
    setHinted(true);
    setDragging(true);
    updateFromClientX(clientX);
  };

  const ACCENT = "#007AFF";

  // Какой вариант сейчас занимает большую часть кадра — его подпись и в кнопке.
  // Линия слева (pos мал) → раскрыт Вариант Б (after), справа → Вариант А (before).
  const activeLabel = pos >= 50 ? beforeLabel : afterLabel;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-[24px] bg-[var(--bg)] touch-none select-none ${
        dragging ? "cursor-ew-resize" : "cursor-grab"
      } ${className}`}
      onPointerDown={(e) => start(e.clientX)}
    >
      {/* Базовый слой — Вариант Б (after), задаёт высоту */}
      <BaseMedia src={after} />

      {/* Верхний слой — Вариант А (before), обрезан до линии слева */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <OverlayMedia src={before} />
      </div>

      {/* Разделительная линия */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 z-20 w-[2px] -translate-x-1/2"
        style={{ left: `${pos}%`, background: ACCENT }}
      />

      {/* Хэндл с динамической подписью варианта */}
      <button
        type="button"
        aria-label={dragLabel}
        onPointerDown={(e) => {
          e.stopPropagation();
          start(e.clientX);
        }}
        className={`absolute top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 touch-none ${
          dragging ? "cursor-ew-resize" : "cursor-grab"
        } ${hinted ? "" : "animate-pulse"}`}
        style={{ left: `${pos}%` }}
      >
        <span
          className="flex items-center gap-1.5 rounded-full py-2 pl-2.5 pr-3 text-white shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-transform active:scale-95"
          style={{ background: ACCENT }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="shrink-0"
          >
            <path d="M9 6 L4 12 L9 18" />
            <path d="M15 6 L20 12 L15 18" />
          </svg>
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase leading-none tracking-[0.4px]">
            {hinted ? activeLabel ?? dragLabel : dragLabel}
          </span>
        </span>
      </button>
    </div>
  );
}
