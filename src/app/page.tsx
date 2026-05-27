"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PixelPlayground from "./PixelPlayground";
import BentoMediaTile from "./BentoMediaTile";
import SpotifyNowPlaying from "./SpotifyNowPlaying";
import Marquee from "./Marquee";
import Reveal from "./Reveal";
import SiteHeader from "./SiteHeader";
import { useTheme } from "./ThemeProvider";
import { useContent, useLang } from "./LanguageProvider";
import { playProjectClick } from "./lib/sounds";
import { home } from "@/content";

// Таймлайн «Опыт»: 4 точки на пунктирной линии, под каждой подпись
// компании + годы. Слева сверху над первой точкой — самолётик, который
// едет до Альфы и плавно тормозит (ease-out-quint).
type ExperienceTrack = {
  company: string;
  duration: string;
  current?: boolean;
};

// Самолёт линейно летит 9s, fade-out начинается в 85% времени —
// плэйн виден почти до самой Альфы, не «стукаясь» об неё. Задержки
// дашей считаются простой формулой p × 9.
const TIMELINE_FLIGHT_DURATION = 9;
const DASH_FLASH_PEAK_OFFSET = 0.09; // peak вспышки = 15% от 0.6s = 0.09s
const DASH_COUNT = 26;
const DASH_DELAYS: readonly number[] = Array.from(
  { length: DASH_COUNT },
  (_, i) => {
    const p = i / (DASH_COUNT - 1);
    const planeTime = p * TIMELINE_FLIGHT_DURATION;
    return Math.max(0, planeTime - DASH_FLASH_PEAK_OFFSET);
  },
);

function ExperienceTimeline({
  items,
}: {
  items: readonly ExperienceTrack[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative px-4">
      <div className="relative">
        {/* Линия из отдельных «дашей»: каждый — span с задержкой анимации,
            подобранной так, чтобы белая вспышка совпадала с пролётом
            самолёта. Большие дашики 10×2px. */}
        <div
          aria-hidden
          className="absolute top-[4px] flex justify-between items-center pointer-events-none"
          style={{
            left: "5px",
            right: "calc(25% - 5px)",
            height: "2px",
          }}
        >
          {DASH_DELAYS.map((delay, i) => (
            <span
              key={i}
              className="block rounded-full"
              style={
                visible
                  ? {
                      width: "10px",
                      height: "2px",
                      backgroundColor: "#3a3a3a",
                      animation: `expDashFlash 0.6s ease-out ${delay}s both`,
                    }
                  : {
                      width: "10px",
                      height: "2px",
                      backgroundColor: "#3a3a3a",
                    }
              }
            />
          ))}
        </div>

        {/* Самолётик: позиционируется по той же сетке, что и точки.
            Стартует невидимым (fade in), летит ровно (без bob), и
            растворяется на подлёте к Альфе (fade out в keyframe). */}
        <div
          aria-hidden
          className="absolute top-[-4px] text-[var(--fg)]"
          style={
            visible
              ? {
                  left: "5px",
                  transform: "translateX(-50%)",
                  animation: "expTimelineFly 9s linear forwards",
                  filter:
                    "drop-shadow(0 0 4px rgba(255, 255, 255, 0.55)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.25))",
                  opacity: 0,
                }
              : {
                  left: "5px",
                  transform: "translateX(-50%)",
                  opacity: 0,
                }
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
            className="size-[18px] rotate-90"
          >
            <path d="M22 16v-2l-8.5-5V3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V9L2 14v2l8.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-5.5L22 16z" />
          </svg>
        </div>

        {/* Точки + подписи: 4 равных колонки, текст слева-выровнен с
            точкой над ним. Точка пульсирует в момент пролёта самолёта;
            последняя (Alfa) остаётся гореть. Задержки синхронизированы
            с 12-секундным полётом по easing cubic-bezier(0.45, 0, 0.55, 1). */}
        <div className="grid grid-cols-4 gap-2">
          {items.map((t, i) => {
            // Моменты, когда самолёт визуально на i-й точке. Линейный полёт
            // за 9s: точки на progress 0, 1/3, 2/3, 1 → planeTime
            // [0, 3, 6, 9]. expDotPulse peak в 45% (= 0.9s от старта),
            // expDotStay «загорается» в конце (= 0.6s от старта).
            const dotDelays = [0, 2.1, 5.1, 8.4];
            // Не-Альфа: белая вспышка. Альфа в конце загорается зелёным
            // и остаётся гореть.
            const dotEndColor = t.current ? "#0CC44D" : "#f7f7f7";
            const glowStrong = t.current
              ? "rgba(12, 196, 77, 0.7)"
              : "rgba(247, 247, 247, 0.7)";
            const glowSoft = t.current
              ? "rgba(12, 196, 77, 0.3)"
              : "rgba(247, 247, 247, 0.3)";
            const animation = t.current
              ? `expDotStay 0.6s ease-out ${dotDelays[i]}s forwards, expDotPulseSlow 3.6s ease-in-out ${dotDelays[i] + 0.7}s infinite`
              : `expDotPulse 2s ease-out ${dotDelays[i]}s both`;
            const textAnimation = t.current
              ? `expTextStay 0.6s ease-out ${dotDelays[i]}s forwards`
              : `expTextPulse 2s ease-out ${dotDelays[i]}s both`;
            return (
              <div
                key={t.company}
                className="flex flex-col items-start gap-3"
              >
                <div
                  className="size-2.5 rounded-full"
                  style={
                    visible
                      ? ({
                          backgroundColor: "#444",
                          "--dot-on": dotEndColor,
                          "--dot-glow": glowStrong,
                          "--dot-glow-soft": glowSoft,
                          animation,
                        } as React.CSSProperties)
                      : { backgroundColor: "#444" }
                  }
                />
                <div
                  className="flex flex-col"
                  style={
                    visible
                      ? { color: "#8a8a8a", animation: textAnimation }
                      : { color: "#8a8a8a" }
                  }
                >
                  <span className="text-[14px] leading-[20px]">
                    {t.company}
                  </span>
                  <span className="text-[12px] leading-[16px]">
                    {t.duration}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// CareerVinyl: винил слева + треклист справа. Текущая компания —
// «now playing». Сама пластинка нарисована стопкой div-ов: чёрный круг,
// концентрические бороздки border-ом, цветной лейбл и дырка под шпиндель.
type CareerTrack = {
  company: string;
  duration: string;
  current?: boolean;
};

function CareerVinyl({
  tracks,
  albumTitle = "Career",
  albumYears = "2020–∞",
  accent = "#D85A30",
  spin = true,
}: {
  tracks: readonly CareerTrack[];
  albumTitle?: string;
  albumYears?: string;
  accent?: string;
  spin?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-[600px] sm:flex-row sm:items-center sm:gap-6">
      {/* Пластинка */}
      <div
        className="relative shrink-0 size-[200px] rounded-full"
        style={{
          backgroundColor: "#1A1A1A",
          ...(spin
            ? { animation: "vinylSpin 20s linear infinite" }
            : {}),
        }}
      >
        {/* Концентрические бороздки */}
        {[12, 24, 36, 48, 60, 72].map((inset) => (
          <div
            key={inset}
            aria-hidden
            className="absolute rounded-full pointer-events-none"
            style={{
              top: inset,
              left: inset,
              right: inset,
              bottom: inset,
              border: "0.5px solid #333",
            }}
          />
        ))}

        {/* Цветной центральный лейбл — без текста, просто акцентный круг */}
        <div
          className="absolute left-1/2 top-1/2 size-[80px] rounded-full"
          style={{
            backgroundColor: accent,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Отверстие под шпиндель */}
        <div
          className="absolute left-1/2 top-1/2 size-[8px] rounded-full"
          style={{
            backgroundColor: "#000",
            boxShadow: "0 0 0 2px #444",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Треклист */}
      <div
        className="flex-1 w-full"
        style={{
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, 'JetBrains Mono', monospace",
        }}
      >
        <div>
          {tracks.map((t, i) => {
            const num = String(i + 1).padStart(2, "0");
            return (
              <div
                key={t.company}
                className="flex items-center justify-between py-2.5"
                style={{
                  borderBottom: t.current
                    ? "none"
                    : "0.5px solid color-mix(in srgb, var(--border) 70%, transparent)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {t.current ? (
                    <span
                      aria-hidden
                      style={{
                        color: accent,
                        fontSize: 12,
                        width: 18,
                        display: "inline-flex",
                        justifyContent: "center",
                      }}
                    >
                      ▶
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 13,
                        color: "#8a8a8a",
                        width: 18,
                        display: "inline-flex",
                        justifyContent: "center",
                      }}
                    >
                      {num}
                    </span>
                  )}
                  <span
                    className="truncate"
                    style={{
                      fontSize: 14,
                      color: t.current ? "var(--fg)" : "#8a8a8a",
                      fontWeight: t.current ? 500 : 400,
                    }}
                  >
                    {t.company}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--fg)",
                    opacity: t.current ? 1 : 0.5,
                    fontWeight: t.current ? 500 : 400,
                    flexShrink: 0,
                    marginLeft: 12,
                  }}
                >
                  {t.duration}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// Face ID-подобная анимация: рамка с уголками, схематичное лицо в центре,
// сканирующая линия и пульсирующий ореол. Используется в превью карточки
// «анкета с селфи» на главной.
function FaceIdAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]">
      {/* Пульсирующая подложка — лёгкий зелёный ореол */}
      <div
        className="absolute size-[68%] rounded-[28%] face-id-pulse"
        style={{
          background:
            "radial-gradient(circle at center, rgba(12,196,77,0.18) 0%, rgba(12,196,77,0) 70%)",
        }}
      />
      <svg
        viewBox="0 0 100 100"
        className="relative w-[58%] aspect-square overflow-visible"
        aria-hidden
      >
        {/* Угловые скобки рамки — мигают как индикатор */}
        <g
          stroke="#0CC44D"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="face-id-corner"
        >
          <path d="M6 22 L6 6 L22 6" />
          <path d="M78 6 L94 6 L94 22" />
          <path d="M6 78 L6 94 L22 94" />
          <path d="M78 94 L94 94 L94 78" />
        </g>
        {/* Сканирующая линия — едет вверх-вниз */}
        <g className="face-id-scan">
          <line
            x1="14"
            x2="86"
            y1="50"
            y2="50"
            stroke="#0CC44D"
            strokeWidth="1.2"
            opacity="0.9"
          />
          <line
            x1="14"
            x2="86"
            y1="50"
            y2="50"
            stroke="#0CC44D"
            strokeWidth="6"
            opacity="0.18"
            strokeLinecap="round"
          />
        </g>
        {/* Лицо: пара глаз и улыбка */}
        <g fill="currentColor" className="text-[var(--fg)]">
          <circle cx="38" cy="42" r="2.6" />
          <circle cx="62" cy="42" r="2.6" />
        </g>
        <path
          d="M38 64 Q50 72 62 64"
          stroke="currentColor"
          className="text-[var(--fg)]"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Слово, которое циклически меняется (финтех → телеком → e-commerce → …).
// Между словами короткий fade+slide вверх/вниз, чтобы переход был
// заметным, но не вырвиглазным.
function RotatingWord({
  words,
  interval = 1400,
  duration = 180,
}: {
  words: readonly string[];
  /** Сколько ms показывается каждое слово целиком, прежде чем уйти */
  interval?: number;
  /** Длительность fade+slide перехода */
  duration?: number;
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (words.length < 2) return;
    const id = window.setInterval(() => {
      setPhase("out");
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setPhase("in");
      }, duration);
    }, interval);
    return () => window.clearInterval(id);
  }, [words.length, interval, duration]);

  // Ширина зарезервирована под самое длинное слово, чтобы окружающий
  // текст не «прыгал» при смене.
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
  return (
    <span
      className="relative inline-block align-baseline"
      style={{ minWidth: `${longest.length}ch` }}
    >
      {/* «Призрак» — задаёт ширину контейнера, никогда не виден */}
      <span aria-hidden className="invisible whitespace-nowrap">
        {longest}
      </span>
      <span
        className="absolute left-0 top-0 whitespace-nowrap will-change-transform"
        style={{
          opacity: phase === "in" ? 1 : 0,
          transform: phase === "in" ? "translateY(0)" : "translateY(-8px)",
          transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        }}
      >
        {words[index]}
      </span>
    </span>
  );
}

type Project = (typeof home.projects)[number];

const ProjectCard = ({
  project,
  preview,
  previewClassName = "aspect-[4/3]",
}: {
  project: Project;
  preview: React.ReactNode;
  previewClassName?: string;
}) => {
  const { ui } = useContent();
  // При наведении прячем системный курсор и рисуем плавающую плашку
  // «прочитать кейс» рядом с указателем. На мобиле/touch события не
  // приходят — плашка не показывается, поведение обычное.
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const isPlaceholder = project.href === "#";
  return (
    <>
      <Link
        href={project.href}
        onClick={(e) => {
          if (isPlaceholder) {
            e.preventDefault();
            return;
          }
          playProjectClick();
        }}
        onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setCursor(null)}
        className="group h-full flex flex-col gap-5 bg-[var(--card)] border border-[var(--border)] rounded-[16px] p-4 overflow-hidden transition-colors hover:bg-[var(--card-hover)]"
        style={{ cursor: cursor ? "none" : undefined }}
      >
        <div
          className={`w-full ${previewClassName} rounded-[8px] overflow-hidden relative`}
        >
          {preview}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-[17px] leading-[22px] text-[var(--fg)] font-bold whitespace-pre-line">
              {project.name}
            </span>
            {project.tags && (
              <span className="rounded-full bg-white/30 backdrop-blur-[3px] text-[11px] text-[var(--fg)] leading-[12px] px-[6px] py-[2px]">
                {project.tags}
              </span>
            )}
          </div>
          <p className="text-[15px] leading-[21px] text-[var(--fg)]/55 whitespace-pre-line">
            {project.description}
          </p>
        </div>
        {(project.metric1Value || project.metric2Value) && (
          <div className="flex flex-col gap-2.5 mt-auto pt-2">
            {project.metric1Value && (
              <div className="flex flex-col gap-[2px]">
                <p className="font-bold text-[15px] leading-[18px] text-[var(--fg)]">
                  {project.metric1Value}
                </p>
                <p className="text-[12px] leading-[14px] text-[var(--fg)]/50">
                  {project.metric1Label}
                </p>
              </div>
            )}
            {project.metric2Value && (
              <div className="flex flex-col gap-[2px]">
                <p className="font-bold text-[15px] leading-[18px] text-[var(--fg)]">
                  {project.metric2Value}
                </p>
                <p className="text-[12px] leading-[14px] text-[var(--fg)]/50">
                  {project.metric2Label}
                </p>
              </div>
            )}
          </div>
        )}
      </Link>
      {cursor && (
        <div
          aria-hidden
          className="fixed pointer-events-none z-[100] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--fg)] text-[var(--bg)] text-[12px] leading-none whitespace-nowrap font-medium select-none"
          style={{
            left: cursor.x + 14,
            top: cursor.y + 14,
          }}
        >
          {isPlaceholder && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3"
              aria-hidden
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
          {isPlaceholder ? ui.comingSoon : ui.readCase}
        </div>
      )}
    </>
  );
};

const ProjectPreview = ({ label }: { label: string }) => {
  const { home } = useContent();
  return (
    <div className="absolute inset-0 flex items-end justify-center">
      <div className="text-center pb-6">
        <p className="text-[22px] leading-[26px] font-medium bg-gradient-to-r from-[#ff79e1] via-[#ff5ec4] to-[#a259ff] bg-clip-text text-transparent whitespace-pre-line">
          {home.projectPreviewText}
        </p>
        <p className="mt-2 text-[10px] text-white/40">{label}</p>
      </div>
    </div>
  );
};

// Превью-блок для карточки на главной. Для паспорта — мини-версия
// hero-композиции из самого проекта: три айфона со сдвигом и нахлёстом.
// Для МФО пока остаётся универсальное видео.
function TbankPlaceholder() {
  return (
    <div className="absolute inset-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/projects/tbank/case-1.gif"
        alt=""
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function PreviewContent({ project }: { project: Project }) {
  const { lang } = useLang();
  if (project.href === "#") {
    return <TbankPlaceholder />;
  }
  if (project.href === "/projects/alfabank-passport") {
    const src =
      lang === "ru"
        ? "/projects/alfabank/mfo-2h-new-ru.mov"
        : "/projects/alfabank/mfo-2h-new-en.mov";
    return (
      <div className="absolute inset-0 bg-[var(--bg)] overflow-hidden">
        <video
          key={src}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="absolute left-1/2 top-3 -translate-x-1/2 w-[60%] h-auto block rounded-[20px]"
        />
      </div>
    );
  }
  if (project.href === "/projects/alfabank-mfo") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]">
        <Marquee
          items={["TAKE RATE ×2", "CONVERSION RATE ×2"]}
          colors={["#FF3B5C", "#1FC54C"]}
          speed={5}
          separator="✦"
        />
      </div>
    );
  }
  return <ProjectPreview label={project.name} />;
}

export default function Home() {
  const { theme } = useTheme();
  const { home, site } = useContent();
  const { lang } = useLang();
  return (
    <main className="min-h-screen w-full bg-[var(--bg)] text-[var(--fg)] flex justify-center">
      <div className="w-full max-w-[618px] flex flex-col gap-[31px] py-0 pt-0">
        {/* Header — клеится сверху при скролле */}
        <SiteHeader />

        {/* Profile */}
        <section className="flex flex-col gap-[35px] px-[14px] w-full">
          <Reveal delay={120} y={32}>
            <div className="flex items-start gap-[24px]">
              <div className="relative size-[200px] rounded-[16px] overflow-hidden shrink-0">
                {/* Два аватара друг над другом — кроссфейд при смене темы */}
                <Image
                  src="/figma/avatar-main.png"
                  alt={site.name}
                  fill
                  sizes="200px"
                  priority
                  className={`object-cover transition-opacity duration-300 ${
                    theme === "light" ? "opacity-0" : "opacity-100"
                  }`}
                />
                <Image
                  src="/figma/avatar-light.png"
                  alt={site.name}
                  fill
                  sizes="200px"
                  className={`object-cover transition-opacity duration-300 ${
                    theme === "light" ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
              <div className="hidden sm:block">
                <PixelPlayground />
              </div>
            </div>
          </Reveal>
          <Reveal delay={240} y={32}>
            <p className="text-[25.3px] leading-[30.16px] text-[var(--fg)] whitespace-normal font-medium sm:whitespace-pre-line">
              {home.bio.prefix}{" "}
              <RotatingWord words={home.bio.rotatingWords} />
            </p>
          </Reveal>
        </section>

        {/* Sections */}
        <div className="flex flex-col gap-[32px] w-full">
          {/* Опыт — горизонтальный таймлайн с самолётиком */}
          <section className="flex flex-col w-full">
            <div className="h-[48.89px] flex items-center px-4">
              <h2 className="text-[13px] leading-[16.9px] tracking-[1.04px] uppercase text-[var(--fg)]/50 font-medium">
                {home.experience.label}
              </h2>
            </div>
            <Reveal>
              {/* key={lang} → React размонтирует и заново монтирует таймлайн
                  при смене языка, чтобы CSS-анимации стартовали с нуля. */}
              <ExperienceTimeline
                key={lang}
                items={home.experience.tracks}
              />
            </Reveal>
          </section>

          {/* Projects */}
          <section className="flex flex-col w-full">
            <div className="h-[48.89px] flex items-center px-4">
              <h2 className="text-[13px] leading-[16.9px] tracking-[1.04px] uppercase text-[var(--fg)]/50 font-medium">
                {home.projectsLabel}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 px-4 sm:px-0">
              {home.projects.map((project, i) => (
                <Reveal key={project.name} delay={i * 80}>
                  <ProjectCard
                    project={project}
                    preview={<PreviewContent project={project} />}
                  />
                </Reveal>
              ))}
            </div>
          </section>

          {/* Что я делал в Т-Банке — пока плейсхолдеры. Карточка на всю
              ширину рабочей зоны. */}
          <section className="flex flex-col w-full">
            <div className="h-[48.89px] flex items-center px-4">
              <h2 className="text-[13px] leading-[16.9px] tracking-[1.04px] uppercase text-[var(--fg)]/50 font-medium">
                {home.tbankProjectsLabel}
              </h2>
            </div>
            <div className="flex flex-col gap-3 px-4 sm:px-0">
              {home.tbankProjects.map((project, i) => (
                <Reveal key={`tbank-${i}`} delay={i * 80}>
                  {/* Превью с фиксированной высотой — карточка во всю
                      ширину, но высота как у половинной Альфы. */}
                  <ProjectCard
                    project={project}
                    preview={<PreviewContent project={project} />}
                    previewClassName="h-[160px]"
                  />
                </Reveal>
              ))}
            </div>
          </section>

          {/* Помимо дизайна */}
          <section className="flex flex-col w-full">
            <div className="h-[48.89px] flex items-center px-4">
              <h2 className="text-[13px] leading-[16.9px] tracking-[1.04px] uppercase text-[var(--fg)]/50 font-medium">
                {home.about.title}
              </h2>
            </div>
            <p className="px-4 mb-4 text-[16px] leading-[22px] text-[var(--fg)]/100 whitespace-pre-line">
              {home.about.body}
            </p>

            {/* Бенто 3×2: котики 1×2 | капибары + Spotify | видео + Nintendo */}
            <div className="grid grid-cols-3 gap-3 grid-rows-[120px_120px] px-4 sm:grid-rows-[198px_198px] sm:px-0">
              <Reveal className="col-span-1 row-span-2" delay={0}>
                <BentoMediaTile
                  src={home.about.cats}
                  className="w-full h-full"
                />
              </Reveal>
              <Reveal className="col-span-1 row-span-1" delay={80}>
                <BentoMediaTile
                  src={home.about.capybaras}
                  className="w-full h-full"
                />
              </Reveal>
              <Reveal className="col-span-1 row-span-1" delay={160}>
                <SpotifyNowPlaying data={home.about.nowPlaying} />
              </Reveal>
              <Reveal className="col-span-1 row-span-1" delay={120}>
                <BentoMediaTile
                  src={home.about.video}
                  className="w-full h-full"
                />
              </Reveal>
              <Reveal className="col-span-1 row-span-1" delay={200}>
                <BentoMediaTile
                  src={home.about.nintendo}
                  className="w-full h-full"
                />
              </Reveal>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="relative h-[82.89px] mt-auto flex items-center px-4 text-[13.7px] text-[var(--fg)]/60">
          <span className="leading-[18.9px]">{site.footer.copyright}</span>
        </footer>
      </div>
    </main>
  );
}
