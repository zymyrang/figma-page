"use client";

import { useEffect, useRef, useState } from "react";

// Минимальные типы для Spotify iFrame API (https://developer.spotify.com/documentation/embeds/references/iframe-api)
interface SpotifyController {
  togglePlay: () => void;
  destroy: () => void;
  addListener: (
    event: "playback_update" | "ready" | "error",
    cb: (e: { data: { isPaused?: boolean } }) => void,
  ) => void;
}

interface SpotifyApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    cb: (controller: SpotifyController) => void,
  ) => void;
}

type SpotifyWindow = Window & {
  onSpotifyIframeApiReady?: (api: SpotifyApi) => void;
  __SpotifyIframeApi?: SpotifyApi;
};

export default function SpotifyNowPlaying({
  data,
}: {
  data: {
    track: string;
    artist: string;
    cover: string;
    url: string;
    bg: string;
  };
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);

  useEffect(() => {
    const match = data.url.match(/track\/([^?]+)/);
    if (!match) return;
    const trackId = match[1];
    const w = window as SpotifyWindow;

    const init = (api: SpotifyApi) => {
      if (!containerRef.current || controllerRef.current) return;
      api.createController(
        containerRef.current,
        { uri: `spotify:track:${trackId}`, width: "100%", height: "100" },
        (controller) => {
          controllerRef.current = controller;
          controller.addListener("playback_update", (e) => {
            setIsPlaying(!e.data.isPaused);
          });
          setReady(true);
        },
      );
    };

    if (w.__SpotifyIframeApi) {
      init(w.__SpotifyIframeApi);
    } else {
      const prev = w.onSpotifyIframeApiReady;
      w.onSpotifyIframeApiReady = (api) => {
        w.__SpotifyIframeApi = api;
        prev?.(api);
        init(api);
      };
      // Подгружаем SDK один раз
      if (!document.getElementById("spotify-iframe-api")) {
        const s = document.createElement("script");
        s.id = "spotify-iframe-api";
        s.src = "https://open.spotify.com/embed/iframe-api/v1";
        s.async = true;
        document.body.appendChild(s);
      }
    }

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [data.url]);

  const togglePlay = () => {
    controllerRef.current?.togglePlay();
  };

  return (
    <div
      className="w-full h-full relative rounded-[16px] overflow-hidden p-3 border border-[var(--border)]"
      style={{ background: data.bg }}
    >
      {/* Внешний скрытый контейнер — Spotify заменит внутренний div на iframe,
          мои inline-стили внутреннему теряются, поэтому скрываем родителя */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1px",
          height: "1px",
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          clipPath: "inset(50%)",
        }}
      >
        <div ref={containerRef} />
      </div>

      {/* Верх: обложка + Spotify-лого */}
      <div className="flex items-start justify-between">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.cover}
          alt=""
          className="size-[64px] rounded-[8px] object-cover"
        />
        <svg
          viewBox="0 0 168 168"
          fill="currentColor"
          className="size-[22px] text-white"
          aria-hidden
        >
          <path d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l.001-.004zm38.404 120.78a5.217 5.217 0 0 1-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 0 1-6.249-3.93 5.213 5.213 0 0 1 3.926-6.25c31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.075-5.91 4.045-8.98 2.155-22.51-13.839-56.823-17.846-83.448-9.764-3.453 1.043-7.1-.903-8.148-4.35a6.538 6.538 0 0 1 4.354-8.143c30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v-.001zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219a7.835 7.835 0 0 1 5.221-9.771c29.581-8.98 78.756-7.245 109.83 11.202a7.823 7.823 0 0 1 2.74 10.733c-2.2 3.722-7.02 4.949-10.73 2.739z" />
        </svg>
      </div>

      <div className="mt-3 pr-2">
        <p className="font-medium text-[14px] leading-[18px] text-white uppercase tracking-tight">
          {data.track}
        </p>
        <p className="text-[12px] leading-[16px] text-white/60 mt-0.5">
          {data.artist}
        </p>
      </div>

      <button
        type="button"
        onClick={togglePlay}
        disabled={!ready}
        aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
        className="absolute bottom-3 right-3 size-[44px] rounded-full bg-white flex items-center justify-center shadow-lg disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform"
      >
        {isPlaying ? (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-[16px] text-black"
            aria-hidden
          >
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-[16px] text-black ml-[2px]"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
