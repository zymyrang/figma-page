"use client";

import { useCallback, useEffect, useState } from "react";
import { playZoom } from "../../lib/sounds";

function isVideo(src: string) {
  return /\.(mp4|mov|webm)$/i.test(src);
}

function Media({
  src,
  className = "",
  controls = false,
}: {
  src: string;
  className?: string;
  controls?: boolean;
}) {
  if (isVideo(src)) {
    return (
      <video
        key={src}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        controls={controls}
        className={className}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={src} src={src} alt="" className={className} />
  );
}

export default function MediaWithLightbox({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // запрет скролла фона
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          playZoom();
          setOpen(true);
        }}
        aria-label="Открыть в полный размер"
        className="block cursor-zoom-in group"
      >
        <Media
          src={src}
          className={`block transition-opacity group-hover:opacity-90 ${className}`}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть"
            className="absolute top-6 right-6 size-[40px] rounded-full bg-[var(--card)]/80 border border-[var(--border)] text-[var(--fg)] hover:bg-[#2a2a2a] transition-colors flex items-center justify-center"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M1 1 L13 13 M13 1 L1 13" />
            </svg>
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          >
            <Media
              src={src}
              controls
              className="max-w-[90vw] max-h-[90vh] rounded-[12px] block"
            />
          </div>
        </div>
      )}
    </>
  );
}
