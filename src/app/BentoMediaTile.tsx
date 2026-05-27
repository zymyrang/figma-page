"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { playZoom } from "./lib/sounds";

function isVideo(src: string) {
  return /\.(mp4|mov|webm)$/i.test(src);
}

export default function BentoMediaTile({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const video = isVideo(src);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
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
        className={`relative block cursor-zoom-in group rounded-[16px] overflow-hidden bg-[var(--card)] border border-[var(--border)] ${className}`}
      >
        {video ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-90"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="220px"
            className="object-cover transition-opacity group-hover:opacity-90"
          />
        )}
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
            className="absolute top-6 right-6 size-[40px] rounded-full bg-[var(--card)]/80 border border-[var(--border)] text-[var(--fg)] hover:bg-[#2a2a2a] transition-colors flex items-center justify-center text-[20px] leading-none"
          >
            ×
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          >
            {video ? (
              <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="max-w-[90vw] max-h-[90vh] rounded-[12px] block"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt}
                className="max-w-[90vw] max-h-[90vh] rounded-[12px] block"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
