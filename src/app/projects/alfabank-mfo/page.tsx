"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { alfabankMfo } from "@/content";
import { useContent } from "../../LanguageProvider";
import SectionNav from "../alfabank/SectionNav";
import HypothesisCard from "../alfabank/HypothesisCard";
import MediaWithLightbox from "../alfabank/MediaWithLightbox";
import Reveal from "../../Reveal";
import SiteHeader from "../../SiteHeader";
import { playBack } from "../../lib/sounds";


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

// Лампочка-инсайт: SVG с fill=currentColor, чтобы CSS-анимация
// .bulb-anim управляла цветом и свечением (см. globals.css).
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


// Облако «страшных» слов: при появлении в viewport слова поочерёдно
// проявляются (fadeRise keyframe в globals.css), затем рисуется стрелка,
// последней — подпись.
function ScaryWordsCloud({
  surrounding,
  central,
}: {
  surrounding: readonly string[] | string[];
  central: string;
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

  // Слова с индивидуальными размерами и opacity (чем крупнее — тем
  // прозрачнее меньше). Координаты сгруппированы вокруг центра.
  const positions: Array<{
    left: string;
    top: string;
    rot: number;
    size: number;
    opacity: number;
    floatDur: number;
    floatDelay: number;
  }> = [
    // Верхние, плотно вокруг центрального
    {
      left: "32%",
      top: "26%",
      rot: -8,
      size: 22,
      opacity: 0.5,
      floatDur: 4.2,
      floatDelay: 0,
    },
    {
      left: "46%",
      top: "16%",
      rot: 5,
      size: 26,
      opacity: 0.6,
      floatDur: 4.8,
      floatDelay: -1.2,
    },
    {
      left: "58%",
      top: "28%",
      rot: -3,
      size: 18,
      opacity: 0.4,
      floatDur: 3.8,
      floatDelay: -0.5,
    },
    // Нижние
    {
      left: "30%",
      top: "65%",
      rot: -7,
      size: 18,
      opacity: 0.4,
      floatDur: 5.2,
      floatDelay: -2,
    },
    {
      left: "47%",
      top: "75%",
      rot: 6,
      size: 22,
      opacity: 0.5,
      floatDur: 4.5,
      floatDelay: -0.8,
    },
    {
      left: "60%",
      top: "67%",
      rot: -10,
      size: 16,
      opacity: 0.32,
      floatDur: 4,
      floatDelay: -1.6,
    },
  ];

  const wordList = surrounding.slice(0, 6);

  return (
    <div ref={ref} className="relative w-full h-[220px]">
      {/* Окружающие призрачные слова — каждое плавает само по себе */}
      {wordList.map((text, i) => {
        const p = positions[i];
        if (!p) return null;
        return (
          <span
            key={text}
            className="absolute pointer-events-none font-medium text-[var(--fg)] whitespace-nowrap select-none"
            style={
              visible
                ? ({
                    left: p.left,
                    top: p.top,
                    fontSize: `${p.size}px`,
                    "--rot": `${p.rot}deg`,
                    "--target-opacity": p.opacity,
                    transformOrigin: "center",
                    animation: `scaryFadeIn 800ms ease-out ${i * 90}ms both, floatY ${p.floatDur}s ease-in-out ${p.floatDelay}s infinite`,
                  } as React.CSSProperties)
                : {
                    left: p.left,
                    top: p.top,
                    fontSize: `${p.size}px`,
                    transform: `rotate(${p.rot}deg)`,
                    opacity: 0,
                  }
            }
          >
            {text}
          </span>
        );
      })}

      {/* Центральное слово — белый bold, по центру с лёгким свечением */}
      <div
        className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <span
          className="inline-block font-bold text-[var(--fg)] whitespace-nowrap"
          style={
            visible
              ? ({
                  fontSize: "36px",
                  letterSpacing: "-0.02em",
                  textShadow: "0 0 36px rgba(247, 247, 247, 0.2)",
                  "--rot": "0deg",
                  "--target-opacity": 1,
                  animation:
                    "scaryFadeIn 700ms ease-out 650ms both, floatY 5s ease-in-out 0s infinite",
                } as React.CSSProperties)
              : {
                  fontSize: "36px",
                  letterSpacing: "-0.02em",
                  opacity: 0,
                }
          }
        >
          {central}
        </span>
      </div>

    </div>
  );
}

// Pill-чипы с причинами во втором инсайте. По intersection поочерёдно
// проявляются (stagger через animation-delay), затем плавают бесконечно
// (floatY из globals.css). Используется тот же приём с CSS-переменными,
// что и в ScaryWordsCloud.
function CausesChips({ items }: { items: readonly string[] | string[] }) {
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
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-wrap gap-2">
      {items.map((text, i) => (
        <span
          key={text}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2a2a2a] border border-[#3a3a3a] text-[14px] leading-[18px] text-[var(--fg)] font-medium whitespace-nowrap"
          style={
            visible
              ? ({
                  "--rot": "0deg",
                  "--target-opacity": 1,
                  animation: `scaryFadeIn 600ms ease-out ${300 + i * 180}ms both, floatY ${3.4 + i * 0.4}s ease-in-out ${-i * 0.5}s infinite`,
                } as React.CSSProperties)
              : { opacity: 0 }
          }
        >
          <span
            className="size-1.5 rounded-full bg-[#0CC44D] shrink-0"
            aria-hidden
          />
          {text}
        </span>
      ))}
    </div>
  );
}

// Useflow сценария «быстрых офферов» — вертикальный степпер: слева
// рельса с узлами и линией-коннектором, справа текст шага (ложится
// в 1-3 строки сам). По intersection узлы и линия поочерёдно
// «загораются» сверху вниз, текст проявляется из тусклого.
function UseFlow({
  label,
  steps,
}: {
  label: string;
  steps: typeof alfabankMfo.insightUsage.flow;
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

  // Каждый шаг — свой «такт»: загорается узел, чертится линия до
  // следующего, текст проявляется сразу за узлом.
  const stepGap = 300;

  return (
    <div ref={ref} className="flex flex-col gap-4">
      {/* Подпись — явно сообщает, что это путь пользователя */}
      <span className="text-[11px] leading-[14px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
        {label}
      </span>

      <div className="flex flex-col">
        {steps.map((text, i) => {
          const isLast = i === steps.length - 1;
          const base = i * stepGap;
          return (
            <div key={i} className="flex gap-4">
              {/* Рельса: узел + линия-коннектор */}
              <div className="flex flex-col items-center w-[14px] shrink-0 pt-[4px]">
                <span
                  className="size-[14px] rounded-full shrink-0"
                  style={
                    visible
                      ? {
                          animation: `nodeLight 440ms ease-out ${base}ms both`,
                        }
                      : { backgroundColor: "#343434" }
                  }
                />
                {!isLast ? (
                  <span
                    className="w-[2px] flex-1 rounded-full bg-[#0CC44D]/35 origin-top"
                    style={
                      visible
                        ? {
                            animation: `lineGrow 260ms linear ${base + 150}ms both`,
                          }
                        : { transform: "scaleY(0)" }
                    }
                  />
                ) : null}
              </div>
              {/* Текст шага — ширину занимает всю, переносится сам */}
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

// «Как решали» — standalone-блок: заголовок, 2 пронумерованных шага,
// под ними сетка из двух вариантов АБ-теста с подписями.
const HowWeSolvedBlock = ({
  data,
}: {
  data: typeof alfabankMfo.howWeSolved;
}) => (
  <div className="flex flex-col gap-5 px-4">
    <h3 className="text-[25px] leading-[32px] text-[var(--fg)] font-medium mb-0">
      {data.label}
    </h3>

    <ol className="flex flex-col gap-3 list-none">
      {data.steps.map((text, i) => (
        <li key={i} className="flex gap-3">
          <span className="font-bold text-[16px] leading-[22px] text-[#0CC44D] shrink-0 w-5 tabular-nums">
            {i + 1}.
          </span>
          <p className="text-[16px] leading-[22px] text-[var(--fg)] whitespace-pre-line">
            {text}
          </p>
        </li>
      ))}
    </ol>

    <div className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
      {data.variants.map((v) => (
        <div key={v.label} className="flex flex-col gap-3">
          <span className="text-[11px] leading-[14px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
            {v.label}
          </span>
          <MediaWithLightbox
            src={v.src}
            className="block w-full h-auto rounded-[12px]"
          />
          <p className="text-[14px] leading-[20px] text-[var(--fg)]/70 whitespace-pre-line">
            {v.caption}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default function AlfabankMfoPage() {
  const { alfabankMfo, site } = useContent();
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

      <SectionNav sections={alfabankMfo.toc} />

      <div className="w-full max-w-[618px] flex flex-col gap-[56px] py-0">
        {/* Шапка — клеится сверху при скролле */}
        <SiteHeader backHref="/" />

        {/* Summary (заголовок + описание) */}
        <Reveal delay={120}>
          <section className="flex flex-col gap-3 px-4">
            <h1 className="text-[32px] leading-[38px] text-[var(--fg)] font-bold whitespace-pre-line">
              {alfabankMfo.projectTitle}
            </h1>
            <p className="text-[16px] leading-[22px] text-[var(--fg)]/50 whitespace-pre-line">
              {alfabankMfo.summary.body}
            </p>
          </section>
        </Reveal>

        {/* Контекст */}
        <Reveal>
          <section
            id="context"
            className="flex flex-col gap-5 px-4 scroll-mt-6"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-[25px] leading-[32px] text-[var(--fg)] font-medium mb-2">
                {alfabankMfo.context.label}
              </h2>
              <p className="text-[16px] leading-[22px] text-[var(--fg)]/100">
                {alfabankMfo.context.body}
              </p>
            </div>
            <div className="flex gap-10">
              {alfabankMfo.context.metrics.map((m) => (
                <div key={m.label} className="flex flex-col gap-0">
                  <span className="font-bold text-[22px] leading-[24px] text-[var(--fg)]">
                    {m.value}
                  </span>
                  <span className="text-[12px] leading-[24px] text-[var(--fg)]/50">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Как выглядел до */}
        <Reveal>
          <section
            id="before"
            className="flex flex-col gap-8 px-4 scroll-mt-6"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-[25px] leading-[32px] text-[var(--fg)] font-medium mb-2">
                {alfabankMfo.before.label}
              </h2>
              <p className="text-[16px] leading-[22px] text-[var(--fg)]/100">
                {alfabankMfo.before.body}
              </p>
            </div>
            <div className="self-center w-[240px] rounded-[24px] overflow-hidden">
              <MediaWithLightbox
                src={alfabankMfo.before.video}
                className="block w-full h-auto rounded-[24px]"
              />
            </div>
          </section>
        </Reveal>

        {/* А в чём проблема */}
        <Reveal>
          <section id="problem" className="flex flex-col gap-5 scroll-mt-6">
            <div className="px-4 flex flex-col gap-2">
              <h2 className="text-[25px] leading-[32px] text-[var(--fg)] font-medium mb-2">
                {alfabankMfo.problem.title}
              </h2>
              <p className="text-[16px] leading-[22px] text-[var(--fg)]/100 whitespace-pre-line">
                {alfabankMfo.problem.body}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {alfabankMfo.problem.stats.map((s) => (
                <div
                  key={s.value}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 flex flex-col gap-2"
                >
                  <span className="font-bold text-[22px] leading-[28px] text-[var(--fg)]">
                    {s.value}
                  </span>
                  <span className="text-[13px] leading-[16px] text-[var(--fg)]/70 whitespace-pre-line">
                    {s.description}
                  </span>
                </div>
              ))}
            </div>
            <p className="px-4 text-[16px] leading-[22px] text-[var(--fg)]/100">
              {alfabankMfo.problem.bodyExtra}
            </p>
          </section>
        </Reveal>

        {/* Определение задачи */}
        <Reveal>
          <section className="px-4 flex flex-col gap-2 scroll-mt-6">
            <h3 className="text-[25px] leading-[32px] text-[var(--fg)] font-medium mb-2">
              {alfabankMfo.problem.taskTitle}
            </h3>
            <p className="text-[16px] leading-[22px] text-[var(--fg)]/100 whitespace-pre-line">
              {alfabankMfo.problem.taskBody}
            </p>
          </section>
        </Reveal>

        {/* Гипотезы: 2 узких + 1 широкая */}
        <section
          id="hypotheses"
          className="scroll-mt-6 flex flex-col gap-4 whitespace-pre-line"
        >
          <div className="grid grid-cols-1 gap-4 auto-rows-fr items-stretch sm:grid-cols-2">
            {alfabankMfo.hypotheses.map((h, i) => (
              <Reveal key={h.index} delay={i * 100}>
                <HypothesisCard data={h} />
              </Reveal>
            ))}
          </div>
          {/* Неожиданный инсайт — короткий текст в прямоугольнике.
              Сразу после гипотез 1-2, до общего исследования. */}
          <Reveal>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[16px] p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <LightBulb className="size-[18px] bulb-anim shrink-0" />
                <span className="text-[13px] leading-[14px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
                  {alfabankMfo.research.bonusInsightLead}
                </span>
              </div>
              <p className="text-[16px] leading-[22px] text-[var(--fg)] whitespace-pre-line">
                {alfabankMfo.research.bonusInsight}
              </p>
            </div>
          </Reveal>

          {/* Облако «страшных» слов — вынесено за прямоугольник,
              живёт как самостоятельная визуальная вставка. */}
          <Reveal>
            <ScaryWordsCloud
              surrounding={alfabankMfo.scaryWords.surrounding}
              central={alfabankMfo.scaryWords.central}
            />
          </Reveal>


          <Reveal>
            <HowWeSolvedBlock data={alfabankMfo.howWeSolved} />
          </Reveal>
        </section>

        {/* Второй инсайт — отдельной плашкой перед постанализом.
            Под текстом — анимированные чипы с конкретными причинами. */}
        <Reveal>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[16px] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <LightBulb className="size-[18px] bulb-anim shrink-0" />
              <span className="text-[13px] leading-[14px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
                {alfabankMfo.research.secondInsightLead}
              </span>
            </div>
            <p className="text-[16px] leading-[22px] text-[var(--fg)] whitespace-pre-line">
              {alfabankMfo.research.secondInsight}
            </p>
            <CausesChips items={alfabankMfo.research.secondInsightCauses} />
          </div>
        </Reveal>

        {/* Как использовали инсайт — гипотеза о быстрых офферах:
            текст, useflow сценария, видео и метрики проверки. */}
        <Reveal>
          <section className="flex flex-col gap-8 px-4 scroll-mt-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-[25px] leading-[32px] text-[var(--fg)] font-medium mb-2">
                {alfabankMfo.insightUsage.title}
              </h2>
              <p className="text-[16px] leading-[22px] text-[var(--fg)] whitespace-pre-line">
                {alfabankMfo.insightUsage.body}
              </p>
            </div>

            <UseFlow
              label={alfabankMfo.insightUsage.flowLabel}
              steps={alfabankMfo.insightUsage.flow}
            />

            <div className="self-center w-[240px] rounded-[24px] overflow-hidden">
              <MediaWithLightbox
                src={alfabankMfo.insightUsage.video}
                className="w-full h-auto rounded-[24px]"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {alfabankMfo.insightUsage.metrics.map((m) => (
                <div
                  key={m.label}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 flex flex-col gap-1"
                >
                  <span className="font-bold text-[22px] leading-[28px] text-[var(--fg)]">
                    {m.value}
                  </span>
                  <span className="text-[13px] leading-[16px] text-[var(--fg)]/50 font-medium">
                    {m.label}
                  </span>
                  <span className="text-[14px] leading-[20px] text-[var(--fg)]/50">
                    {m.note}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Постанализ */}
        <Reveal>
          <section
            id="postanalysis"
            className="flex flex-col gap-5 scroll-mt-6"
          >
            <div className="px-4 flex flex-col gap-2">
              <h2 className="text-[25.3px] leading-[38px] text-[var(--fg)] font-medium">
                {alfabankMfo.postanalysis.title}
              </h2>
              <p className="text-[16px] leading-[22px] text-[var(--fg)]/100 whitespace-pre-line">
                {alfabankMfo.postanalysis.body}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {alfabankMfo.postanalysis.stats.map((s) => (
                <div
                  key={s.value}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-[12px] p-4 flex flex-col gap-0"
                >
                  <span className="font-bold text-[22px] leading-[28px] text-[var(--fg)]">
                    {s.value}
                  </span>
                  <span className="text-[14px] leading-[20px] text-[var(--fg)]/70">
                    {s.description}
                  </span>
                </div>
              ))}
            </div>

            {/* Что хочется доделать — планы на будущее, 2 колонки */}
            <div className="px-4 flex flex-col gap-4 mt-4">
              <h3 className="text-[20px] leading-[26px] text-[var(--fg)] font-medium">
                {alfabankMfo.postanalysis.futureTitle}
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {alfabankMfo.postanalysis.future.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <Asterisk className="size-[14px] text-[#0CC44D] shrink-0 mt-[3px]" />
                    <p className="text-[15px] leading-[21px] text-[var(--fg)]/80">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
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
