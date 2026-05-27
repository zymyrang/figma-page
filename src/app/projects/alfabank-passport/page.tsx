"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SectionNav from "./SectionNav";
import MediaWithLightbox from "../alfabank/MediaWithLightbox";
import Marquee from "../../Marquee";
import Reveal from "../../Reveal";
import SiteHeader from "../../SiteHeader";
import { useContent, useLang } from "../../LanguageProvider";
import { playBack } from "../../lib/sounds";

// Диалоговая лента «Discovery» в стиле iMessage: вопрос — синий бабл справа,
// ответ — серый слева, между ними короткий индикатор «печатает…» (три точки).
// Запускается одним IntersectionObserver на контейнере; внутри каждой пары
// фазы переключаются по таймерам.
function ChatPair({
  question,
  answer,
  started,
  baseDelay,
  typingDuration = 900,
}: {
  question: string;
  answer: string;
  started: boolean;
  baseDelay: number;
  typingDuration?: number;
}) {
  // hidden → question → typing → answer
  const [phase, setPhase] = useState<
    "hidden" | "question" | "typing" | "answer"
  >("hidden");

  useEffect(() => {
    if (!started) {
      setPhase("hidden");
      return;
    }
    const t1 = setTimeout(() => setPhase("question"), baseDelay);
    const t2 = setTimeout(() => setPhase("typing"), baseDelay + 450);
    const t3 = setTimeout(
      () => setPhase("answer"),
      baseDelay + 450 + typingDuration,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [started, baseDelay, typingDuration]);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Вопрос — синий бабл, справа */}
      {phase !== "hidden" && (
        <div
          className="ml-auto max-w-[82%] sm:max-w-[72%]"
          style={{
            animation: "chatBubbleIn 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          <div className="relative bg-[#007AFF] text-white px-3.5 py-2 rounded-[20px] rounded-br-[6px] text-[14px] leading-[19px] font-medium">
            {question}
            <svg
              aria-hidden
              width="12"
              height="16"
              viewBox="0 0 12 16"
              className="absolute -right-[5px] bottom-0"
            >
              <path d="M0 0 Q0 16 12 16 Q5 14 0 2 Z" fill="#007AFF" />
            </svg>
          </div>
        </div>
      )}

      {/* Индикатор «печатает…» — серый бабл с тремя точками. Виден только
          в фазе typing; в answer заменяется реальным ответом. */}
      {phase === "typing" && (
        <div
          className="mr-auto"
          style={{
            animation: "chatBubbleIn 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          <div className="relative bg-[#3a3a3c] text-white px-3.5 py-2.5 rounded-[20px] rounded-bl-[6px] flex items-center gap-[5px]">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="size-[6px] rounded-full bg-white/85"
                style={{
                  animation: `typingDot 1.2s ease-in-out ${d * 0.18}s infinite`,
                }}
              />
            ))}
            <svg
              aria-hidden
              width="12"
              height="16"
              viewBox="0 0 12 16"
              className="absolute -left-[5px] bottom-0"
            >
              <path d="M12 0 Q12 16 0 16 Q7 14 12 2 Z" fill="#3a3a3c" />
            </svg>
          </div>
        </div>
      )}

      {/* Ответ — серый бабл, слева, заменяет индикатор */}
      {phase === "answer" && (
        <div
          className="mr-auto max-w-[88%] sm:max-w-[78%]"
          style={{
            animation: "chatBubbleIn 420ms cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          <div className="relative bg-[#3a3a3c] text-white px-3.5 py-2 rounded-[20px] rounded-bl-[6px] text-[14px] leading-[19px]">
            {answer}
            <svg
              aria-hidden
              width="12"
              height="16"
              viewBox="0 0 12 16"
              className="absolute -left-[5px] bottom-0"
            >
              <path d="M12 0 Q12 16 0 16 Q7 14 12 2 Z" fill="#3a3a3c" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function DiscoveryChat({
  findings,
}: {
  findings: ReadonlyArray<{ title: string; body: string }>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setStarted(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  // Каждая пара ≈ 2 секунды: question → typing (~900ms) → answer.
  // Pair-to-pair stride = 1800ms.
  return (
    <div ref={ref} className="flex flex-col gap-2.5 px-4 pb-5 sm:pb-7">
      {findings.map((f, i) => (
        <ChatPair
          key={f.title}
          question={f.title}
          answer={f.body}
          started={started}
          baseDelay={i * 1800}
        />
      ))}
    </div>
  );
}

// Облако «проблем»: каждая фраза появляется с небольшим наклоном и потом
// тихо «плавает» (тот же паттерн, что и в кейсе МФО — ScaryWordsCloud).
// Запускается одним IntersectionObserver на контейнере.
const DECODE_POOL =
  "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@*&%$!?+=<>";
const randChar = () =>
  DECODE_POOL[Math.floor(Math.random() * DECODE_POOL.length)];
function FloatingProblems({
  user,
  business,
}: {
  user: { title: string; points: string[] };
  business: { title: string; points: string[] };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const columns = [user, business];

  // Вручную подобранные параметры для каждой из 6 фраз (2 колонки × 3 фразы):
  // лёгкий наклон, разная глубина (opacity), сдвиг по горизонтали, длительность
  // «дыхания» и фаза. Цель — естественная «россыпь», не сетка.
  const decorations: Array<{
    rot: number;
    opacity: number;
    indent: number;
    floatDur: number;
    floatDelay: number;
  }> = [
    { rot: -3, opacity: 1, indent: 0, floatDur: 4.4, floatDelay: 0 },
    { rot: 2, opacity: 0.85, indent: 16, floatDur: 5.2, floatDelay: -1.3 },
    { rot: -2, opacity: 0.92, indent: 6, floatDur: 4.8, floatDelay: -0.6 },
    { rot: 3, opacity: 0.88, indent: 10, floatDur: 4.6, floatDelay: -2.1 },
    { rot: -2, opacity: 1, indent: 0, floatDur: 5, floatDelay: -0.4 },
    { rot: 2, opacity: 0.82, indent: 14, floatDur: 4.2, floatDelay: -1.8 },
  ];

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:gap-8"
    >
      {columns.map((col, sideIdx) => (
        <div key={col.title} className="flex flex-col gap-7">
          <span className="text-[13px] leading-[18px] uppercase tracking-[1px] text-[var(--fg)]/60 text-center font-medium">
            {col.title}
          </span>
          <div className="flex flex-col items-start gap-3">
            {col.points.map((p, i) => {
              const globalIdx = sideIdx * 3 + i;
              const d = decorations[globalIdx] ?? decorations[0];
              return (
                <span
                  key={p}
                  className="inline-block rounded-full bg-[var(--card)]/90 border border-[var(--border)] backdrop-blur-md px-4 py-2 text-[14px] leading-[20px] font-medium text-[var(--fg)] shadow-[0_10px_30px_rgba(0,0,0,0.25)] select-none"
                  style={
                    visible
                      ? ({
                          marginLeft: `${d.indent}px`,
                          transformOrigin: "left center",
                          "--rot": `${d.rot}deg`,
                          "--target-opacity": d.opacity,
                          animation: `scaryFadeIn 700ms ease-out ${globalIdx * 130}ms both, floatY ${d.floatDur}s ease-in-out ${d.floatDelay}s infinite`,
                        } as unknown as React.CSSProperties)
                      : {
                          marginLeft: `${d.indent}px`,
                          transform: `rotate(${d.rot}deg)`,
                          opacity: 0,
                        }
                  }
                >
                  {p}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Вертикальный степпер «Моя роль»: тот же паттерн, что и UseFlow в кейсе МФО.
// Каждый шаг — узел загорается зелёным, вниз чертится линия-коннектор,
// текст шага светлеет. Каскад срабатывает при попадании секции в viewport.
function RoleFlow({
  label,
  steps,
  accent = "#0CC44D",
  animateNodes = true,
}: {
  label?: string;
  steps: string[];
  /** Цвет «загорающегося» узла и линии-коннектора. По умолчанию — зелёный
      акцент проекта. Для нейтрального/«было»-варианта передавай серый. */
  accent?: string;
  /** Если false — узлы рендерятся как статичные кружки без анимации
      загорания. Линии и подписи всё равно анимируются. */
  animateNodes?: boolean;
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

  const stepGap = 300;

  // Прозрачность для свечения и линии — глобально, чтобы оба варианта
  // (зелёный/серый) выглядели одинаково мягко.
  const glow = `${accent}80`;
  const lineColor = `${accent}59`;

  return (
    <div
      ref={ref}
      className="flex flex-col gap-4"
      style={
        {
          "--node-end": accent,
          "--node-glow": glow,
          "--node-glow-0": `${accent}00`,
        } as React.CSSProperties
      }
    >
      {label ? (
        <span className="text-[11px] leading-[14px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
          {label}
        </span>
      ) : null}

      <div className="flex flex-col">
        {steps.map((text, i) => {
          const isLast = i === steps.length - 1;
          const base = i * stepGap;
          return (
            <div key={text} className="flex gap-4">
              <div className="flex flex-col items-center w-[14px] shrink-0 pt-[4px]">
                <span
                  className="size-[14px] rounded-full shrink-0"
                  style={
                    animateNodes
                      ? visible
                        ? {
                            animation: `nodeLight 440ms ease-out ${base}ms both`,
                          }
                        : { backgroundColor: "#343434" }
                      : { backgroundColor: accent }
                  }
                />
                {!isLast ? (
                  <span
                    className="w-[2px] flex-1 rounded-full origin-top"
                    style={
                      visible
                        ? {
                            backgroundColor: lineColor,
                            animation: `lineGrow 260ms linear ${base + 150}ms both`,
                          }
                        : {
                            backgroundColor: lineColor,
                            transform: "scaleY(0)",
                          }
                    }
                  />
                ) : null}
              </div>
              <div
                className={`flex-1 ${isLast ? "" : "pb-5"}`}
                style={
                  visible
                    ? {
                        animation: `labelLight 440ms ease-out ${base + 90}ms both`,
                      }
                    : { opacity: 0.25 }
                }
              >
                <p className="text-[15px] leading-[21px] text-[var(--fg)]">
                  {text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Финальное значение цели «перещёлкивается» как табло аэропорта: цифры
// быстро прокручиваются, остальные символы (m, %) остаются на месте.
// Запускается, когда родитель сигналит started=true.
function FlapValue({
  value,
  started,
  delay,
  className = "",
}: {
  value: string;
  started: boolean;
  delay: number;
  className?: string;
}) {
  const [shown, setShown] = useState<string>(() =>
    value.replace(/\d/g, "0"),
  );
  useEffect(() => {
    if (!started) {
      setShown(value.replace(/\d/g, "0"));
      return;
    }
    let raf = 0;
    let startTs: number | null = null;
    let cancelled = false;
    const duration = 700; // сколько крутится перед финальной остановкой
    const tick = (t: number) => {
      if (cancelled) return;
      if (startTs === null) startTs = t;
      const elapsed = t - startTs - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (elapsed >= duration) {
        setShown(value);
        return;
      }
      // Цифры «крутятся», нецифры (m, %) фиксированы. По мере приближения
      // к концу всё больше цифр слева фиксируется на финальном значении.
      const progress = elapsed / duration;
      const digitsTotal = (value.match(/\d/g) || []).length;
      const digitsLocked = Math.floor(digitsTotal * progress);
      let seenDigits = 0;
      let out = "";
      for (let i = 0; i < value.length; i++) {
        const ch = value[i];
        if (/\d/.test(ch)) {
          if (seenDigits < digitsLocked) {
            out += ch;
          } else {
            out += String(Math.floor(Math.random() * 10));
          }
          seenDigits += 1;
        } else {
          out += ch;
        }
      }
      setShown(out);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [started, value, delay]);
  return <span className={className}>{shown}</span>;
}

// Табло аэропорта со списком целей: моноширинная сетка, разделители между
// строками, при появлении в viewport финальные числа «перещёлкиваются».
function FlapBoard({
  rows,
}: {
  rows: Array<{ label: string; from: string; to: string }>;
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
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="bg-[var(--card)]/40 border border-[var(--border)] rounded-[14px] overflow-hidden font-mono"
      style={{
        fontFamily:
          "'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', ui-monospace, monospace",
      }}
    >
      {rows.map((row, i) => {
        const isLast = i === rows.length - 1;
        const baseDelay = i * 220;
        return (
          <div
            key={row.label}
            className={`flex flex-col gap-1.5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-3.5 ${isLast ? "" : "border-b border-white/[0.07]"}`}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay}ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay}ms`,
            }}
          >
            <span className="text-[11px] uppercase tracking-[2px] text-[var(--fg)]/45">
              {row.label}
            </span>
            <div className="flex items-baseline gap-3 text-[18px] sm:text-[20px]">
              <span className="text-[var(--fg)]/40 line-through decoration-[1.5px]">
                {row.from}
              </span>
              <span className="text-[#0CC44D]">→</span>
              <FlapValue
                value={row.to}
                started={visible}
                delay={baseDelay + 320}
                className="text-[24px] sm:text-[26px] font-bold text-[#0CC44D] tracking-wider"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Карточка цели: «было → стало» с финальным числом, которое масштабируется
// с лёгким overshoot и кратко вспыхивает зелёным. Над «было» прорисовывается
// strike-line слева направо, между значениями — стрелка-указатель.
function GoalCard({
  title,
  from,
  to,
  delay = 0,
}: {
  title: string;
  from: string;
  to: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-2 py-6 px-3 bg-[var(--card)]/40 border border-[var(--border)] rounded-[16px] overflow-hidden"
    >
      <span className="text-[11px] leading-[14px] uppercase tracking-[1px] text-[var(--fg)]/55 font-medium text-center">
        {title}
      </span>
      {/* Старое значение со strike-line, которая прорисовывается. */}
      <span className="relative inline-block text-[15px] leading-[18px] text-[var(--fg)]/35 font-medium whitespace-nowrap mt-1">
        <span>{from}</span>
        <span
          aria-hidden
          className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-[var(--fg)]/35 origin-left"
          style={
            visible
              ? {
                  animation: `goalStrike 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay + 200}ms both`,
                }
              : { transform: "scaleX(0)" }
          }
        />
      </span>
      <span
        className="text-[28px] sm:text-[32px] leading-[32px] sm:leading-[36px] font-bold text-[#0CC44D] inline-block whitespace-nowrap"
        style={
          visible
            ? {
                animation: `goalLand 900ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay + 600}ms both`,
              }
            : { transform: "scale(0.4)", opacity: 0 }
        }
      >
        {to}
      </span>
    </div>
  );
}

// (legacy декодер — оставлен на случай если понадобится)
function DecodeText({
  text,
  started,
  delay,
  perChar = 28,
  tailScramble = 5,
}: {
  text: string;
  started: boolean;
  delay: number;
  perChar?: number;
  tailScramble?: number;
}) {
  const [done, setDone] = useState(false);
  // Заполнитель из nbsp той же длины, чтобы не было «прыжка» вёрстки
  // и чтобы SSR/CSR совпадали (никакого случайного контента на сервере).
  const [shown, setShown] = useState<string>(" ".repeat(text.length));

  useEffect(() => {
    setDone(false);
    if (!started) {
      setShown(" ".repeat(text.length));
      return;
    }
    let raf = 0;
    let startTime: number | null = null;
    let cancelled = false;
    const total = text.length;
    const tick = (t: number) => {
      if (cancelled) return;
      if (startTime === null) startTime = t;
      const elapsed = t - startTime - delay;
      if (elapsed < 0) {
        // До своего «окна» показываем рандом по всей длине — эффект помех.
        let buf = "";
        for (let i = 0; i < total; i++) {
          buf += text[i] === " " ? " " : randChar();
        }
        setShown(buf);
        raf = requestAnimationFrame(tick);
        return;
      }
      const revealed = Math.min(total, Math.floor(elapsed / perChar));
      const tail = Math.min(total - revealed, tailScramble);
      let buf = text.slice(0, revealed);
      for (let i = 0; i < tail; i++) {
        const realCh = text[revealed + i];
        buf += realCh === " " ? " " : randChar();
      }
      // Оставшийся хвост (за tailScramble) — невидимый nbsp, чтобы длина
      // строки на каждом кадре была одинаковой и текст не «прыгал».
      const restLen = total - revealed - tail;
      if (restLen > 0) buf += " ".repeat(restLen);
      setShown(buf);
      if (revealed < total) raf = requestAnimationFrame(tick);
      else {
        setShown(text);
        setDone(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [started, text, delay, perChar, tailScramble]);

  return (
    <span
      style={
        done
          ? undefined
          : {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, monospace",
            }
      }
    >
      {shown}
    </span>
  );
}

// Пункты «расшифровываются» каскадом при появлении карточки в вьюпорте.
function DecodeList({
  points,
  startDelay = 0,
  step = 260,
}: {
  points: string[];
  startDelay?: number;
  step?: number;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <ul
      ref={ref}
      className="flex flex-col gap-2 text-[14px] leading-[20px] text-[var(--fg)]/90"
    >
      {points.map((p, i) => (
        <li key={p} className="flex gap-2">
          <span className="text-[var(--fg)]/40 shrink-0">—</span>
          <DecodeText
            text={p}
            started={started}
            delay={startDelay + i * step}
          />
        </li>
      ))}
    </ul>
  );
}


const ArrowBack = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path
      d="M10 3L5 8l5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Лампочка-инсайт: fill=currentColor, анимация .bulb-anim из globals.css.
const LightBulb = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path d="M9 21a1 1 0 001 1h4a1 1 0 001-1v-1H9v1zm3-19a7 7 0 00-7 7c0 2.4 1.2 4.5 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26A7 7 0 0012 2z" />
  </svg>
);

// Шестилучевой астериск — маркер пунктов «что хочется доделать».
const Asterisk = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path
      d="M12 4v16M4.5 7.5l15 9M19.5 7.5l-15 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Макет iPhone 15: тёмная рамка, скруглённый экран, Dynamic Island.
// Внутрь — скрин или видео; кликабелен (открывается в лайтбоксе).
function PhoneMockup({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 rounded-[30px] bg-[#0b0b0b] p-[5px] shadow-[0_14px_36px_rgba(0,0,0,0.4)] ${className}`}
    >
      <div className="relative overflow-hidden rounded-[25px] bg-black">
        <MediaWithLightbox src={src} className="block w-full h-auto" />
        {/* Dynamic Island */}
        <div className="pointer-events-none absolute left-1/2 top-[7px] z-10 h-[16px] w-[30%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}

// Скриншоты экранов приложения под 6 шагов «Решения» (кадры из видео).
const STEP_SHOTS = [
  "/projects/alfabank/pp-1.png",
  "/projects/alfabank/pp-2.png",
  "/projects/alfabank/pp-3.png",
  "/projects/alfabank/pp-4.png",
  "/projects/alfabank/pp-5.png",
  "/projects/alfabank/pp-6.png",
];

// Видео всего флоу (форма с ПД заблюрена).
const FLOW_VIDEO = "/projects/alfabank/passport-flow.mp4";

// Единый стиль заголовка секции — как в кейсе МФО (с mb-2, чтобы
// расстояние до текста совпадало).
const HEADING = "text-[25px] leading-[32px] text-[var(--fg)] font-medium mb-2";

export default function AlfabankPassportPage() {
  const { alfabankPassport, site, ui } = useContent();
  const { lang } = useLang();
  return (
    <main className="min-h-screen w-full bg-[var(--bg)] text-[var(--fg)] flex justify-center relative">
      <Link
        href="/"
        aria-label="Назад в проект Альфа-Банк"
        onClick={() => playBack()}
        className="fixed left-[31px] top-[16px] size-[48px] rounded-full bg-[var(--card)] border border-[var(--border)] hidden sm:flex items-center justify-center hover:bg-[var(--card-hover)] transition-colors z-50"
      >
        <ArrowBack className="size-[20px] text-[var(--fg)]" />
      </Link>

      <SectionNav sections={alfabankPassport.toc} />

      <div className="w-full max-w-[618px] flex flex-col gap-[56px] py-0">
        {/* Шапка — клеится сверху при скролле */}
        <SiteHeader backHref="/" />

        {/* Summary (заголовок + описание) */}
        <Reveal delay={120}>
          <section className="flex flex-col gap-3 px-4">
            <h1 className="text-[32px] leading-[38px] text-[var(--fg)] font-bold whitespace-pre-line">
              {alfabankPassport.projectTitle}
            </h1>
            <p className="text-[16px] leading-[22px] text-[var(--fg)]/50">
              {alfabankPassport.summary.body}
            </p>
          </section>
        </Reveal>

        {/* Hero — три анимированных экрана продукта сразу после summary.
            Видео уже с айфон-рамками, кладём «как есть». */}
        <Reveal delay={200} className="-mt-10 -mb-10 sm:-mt-12 sm:-mb-12">
          <div className="flex items-end justify-center px-2 sm:px-0">
            <video
              src={alfabankPassport.heroVideos.left}
              autoPlay
              loop
              muted
              playsInline
              className="relative z-10 block w-[180px] h-auto -mr-10 -translate-y-6 sm:w-[296px] sm:-mr-16 sm:-translate-y-10"
            />
            <video
              src={alfabankPassport.heroVideos.center}
              autoPlay
              loop
              muted
              playsInline
              className="relative z-0 block w-[228px] h-auto sm:w-[376px]"
            />
            <video
              src={alfabankPassport.heroVideos.right}
              autoPlay
              loop
              muted
              playsInline
              className="relative z-10 block w-[180px] h-auto -ml-10 sm:w-[296px] sm:-ml-16"
            />
          </div>
        </Reveal>

        {/* Контекст */}
        <Reveal>
          <section id="context" className="flex flex-col gap-5 px-4 scroll-mt-6">
            <div className="flex flex-col gap-2">
              <h2 className={HEADING}>{alfabankPassport.context.label}</h2>
              <p className="text-[16px] leading-[22px] text-[var(--fg)]/100">
                {alfabankPassport.context.body}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-x-6 sm:gap-x-10">
              {alfabankPassport.context.metrics.map((m) => (
                <div key={m.label} className="flex flex-col gap-1.5">
                  <span className="font-bold text-[22px] leading-[24px] text-[var(--fg)]">
                    {m.value}
                  </span>
                  <span className="text-[15px] leading-[20px] text-[var(--fg)]/50">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 mx-auto mt-4 max-w-[340px] sm:grid-cols-2 sm:gap-4 sm:mt-6 sm:max-w-[540px]">
              {alfabankPassport.context.howItWasShots.map((src) => (
                <MediaWithLightbox
                  key={src}
                  src={src}
                  className="block w-full h-auto rounded-[24px]"
                />
              ))}
            </div>
          </section>
        </Reveal>

        {/* Проблема */}
        <section id="problem" className="flex flex-col gap-6 scroll-mt-6">
          <Reveal>
            <div className="px-4">
              <h2 className={HEADING}>{alfabankPassport.problem.label}</h2>
            </div>
          </Reveal>
          <FloatingProblems
            user={alfabankPassport.problem.user}
            business={alfabankPassport.problem.business}
          />
        </section>

        {/* Цели */}
        <section className="flex flex-col gap-5">
          <Reveal>
            <div className="px-4">
              <h2 className={HEADING}>{alfabankPassport.goals.label}</h2>
            </div>
          </Reveal>
          <Marquee
            items={alfabankPassport.goals.marquee}
            colors={["#FF3B5C", "#3B7BFF", "#1FC54C"]}
          />
        </section>

        {/* Дискавери */}
        <Reveal>
          <section
            id="discovery"
            className="flex flex-col gap-5 scroll-mt-6"
          >
            <div className="flex flex-col gap-2 px-4">
              <h2 className={HEADING}>{alfabankPassport.discovery.label}</h2>
              <p className="text-[16px] leading-[22px] text-[var(--fg)]/100">
                {alfabankPassport.discovery.body}
              </p>
            </div>
            {/* Findings в стиле iMessage: вопрос → индикатор «печатает…» → ответ.
                Логика разнесена в компонент DiscoveryChat. */}
            <DiscoveryChat findings={alfabankPassport.discovery.findings} />
            {/* Главный инсайт — плашка с анимированной лампочкой */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[16px] p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <LightBulb className="size-[18px] bulb-anim shrink-0" />
                <span className="text-[13px] leading-[14px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
                  {alfabankPassport.discovery.insightLead}
                </span>
              </div>
              <p className="text-[16px] leading-[22px] text-[var(--fg)] whitespace-pre-line">
                {alfabankPassport.discovery.insight}
              </p>
            </div>
          </section>
        </Reveal>

        {/* Юзерфлоу — два вертикальных степпера «Было» и «Стало»,
            тот же паттерн, что UseFlow из МФО. */}
        <section
          id="user-flow"
          className="flex flex-col gap-5 scroll-mt-6"
        >
          <Reveal>
            <div className="flex flex-col gap-2 px-4">
              <h2 className={HEADING}>{alfabankPassport.userFlow.label}</h2>
              <p className="text-[16px] leading-[22px] text-[var(--fg)]/100">
                {alfabankPassport.userFlow.body}
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:gap-8">
            {[
              {
                ...alfabankPassport.userFlow.before,
                accent: "#5a5a5a",
                animateNodes: false,
              },
              {
                ...alfabankPassport.userFlow.after,
                accent: "#0CC44D",
                animateNodes: true,
              },
            ].map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <span className="text-[13px] leading-[18px] uppercase tracking-[1px] text-[var(--fg)]/60 text-center font-medium">
                  {col.title}
                </span>
                <RoleFlow
                  steps={col.steps}
                  accent={col.accent}
                  animateNodes={col.animateNodes}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Гипотезы */}
        <Reveal>
          <section
            id="hypotheses"
            className="flex flex-col gap-5 scroll-mt-6"
          >
            <h2 className={`${HEADING} px-4`}>
              {alfabankPassport.hypothesesLabel}
            </h2>
            <div className="flex flex-col gap-3">
              {alfabankPassport.hypotheses.map((h) => {
                // Гипотеза может иметь видео-сравнение «Вариант А / Вариант Б».
                // Рендерим, только если оба пути заданы.
                const hh = h as typeof h & {
                  variantA?: string;
                  variantB?: string;
                };
                const hasVariants = Boolean(hh.variantA && hh.variantB);
                return (
                  <div
                    key={h.index}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-[16px] p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] leading-[14px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
                        {lang === "ru"
                          ? `${h.index} ${ui.hypothesis}`
                          : `${ui.hypothesis} ${h.index}`}
                      </span>
                      <span className="text-[11px] leading-[14px] uppercase tracking-[0.88px] text-[#0CC44D]">
                        {h.verdict}
                      </span>
                    </div>
                    <p className="text-[16px] leading-[22px] text-[var(--fg)]">
                      {h.hypothesis}
                    </p>
                    {hasVariants && (
                      <div className="grid grid-cols-1 gap-[62px] mt-4 mb-3 mx-auto max-w-[280px] sm:grid-cols-2 sm:mt-6 sm:mb-5 sm:max-w-[500px]">
                        {[
                          { label: ui.variantA, src: hh.variantA! },
                          { label: ui.variantB, src: hh.variantB! },
                        ].map((v) => (
                          <div
                            key={v.label}
                            className="flex flex-col gap-4"
                          >
                            <span className="text-[11px] leading-[14px] uppercase tracking-[0.88px] text-[var(--fg)]/50 text-center">
                              {v.label}
                            </span>
                            <MediaWithLightbox
                              src={v.src}
                              className="w-full h-auto rounded-[24px]"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col gap-0 mt-1 whitespace-pre-line">
                      <span className="text-[11px] leading-[25px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
                        {ui.result}
                      </span>
                      <p className="text-[14px] leading-[20px] text-[var(--fg)]/70">
                        {h.resultLabel}
                      </p>
                      <p className="font-bold text-[20px] leading-[25px] text-[#0CC44D] mt-1">
                        {h.resultValue}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>

        {/* Отклонённые варианты */}
        <Reveal>
          <section
            id="rejected"
            className="flex flex-col gap-5 scroll-mt-6"
          >
            <div className="flex flex-col gap-2 px-4">
              <h2 className={HEADING}>{alfabankPassport.rejected.label}</h2>
              <p className="text-[16px] leading-[22px] text-[var(--fg)]/100">
                {alfabankPassport.rejected.body}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {alfabankPassport.rejected.items.map((item) => (
                <div
                  key={item.title}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[16px] leading-[22px] text-[var(--fg)] font-medium">
                      {item.title}
                    </span>
                    <span className="text-[11px] leading-[14px] uppercase tracking-[0.88px] text-[#FF3B5C] whitespace-nowrap shrink-0">
                      {item.verdict}
                    </span>
                  </div>
                  <p className="text-[14px] leading-[20px] text-[var(--fg)]/70">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Постанализ и выводы */}
        <Reveal>
          <section
            id="postanalysis"
            className="flex flex-col gap-5 scroll-mt-6"
          >
            <div className="px-4 flex flex-col gap-2">
              <h2 className={HEADING}>{alfabankPassport.postanalysis.title}</h2>
              <p className="text-[16px] leading-[22px] text-[var(--fg)]/100 whitespace-pre-line">
                {alfabankPassport.postanalysis.body}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {alfabankPassport.postanalysis.stats.map((s) => (
                <div
                  key={s.value}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 flex flex-col gap-1"
                >
                  <span className="font-bold text-[22px] leading-[28px] text-[var(--fg)]">
                    {s.value}
                  </span>
                  <span className="text-[13px] leading-[18px] text-[var(--fg)]/70">
                    {s.description}
                  </span>
                </div>
              ))}
            </div>

            {/* Что узнал по дороге */}
            <div className="px-4 flex flex-col gap-3 mt-2">
              <h3 className="text-[20px] leading-[26px] text-[var(--fg)] font-medium">
                {alfabankPassport.postanalysis.learningsTitle}
              </h3>
              <ol className="flex flex-col gap-3 list-none">
                {alfabankPassport.postanalysis.learnings.map((text, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-bold text-[16px] leading-[22px] text-[#0CC44D] shrink-0 w-5 tabular-nums">
                      {i + 1}.
                    </span>
                    <span className="text-[16px] leading-[22px] text-[var(--fg)]">
                      {text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

          </section>
        </Reveal>

        {/* Подвал */}
        <footer className="mt-auto py-8 flex items-center px-4 text-[13.7px] text-[var(--fg)]/60">
          <span className="leading-[18.9px]">{site.footer.copyright}</span>
        </footer>
      </div>
    </main>
  );
}
