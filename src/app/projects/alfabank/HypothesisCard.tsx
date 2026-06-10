"use client";

import { useState } from "react";
import type { alfabankMfo } from "@/content";
import { useContent, useLang } from "../../LanguageProvider";
import MediaWithLightbox from "./MediaWithLightbox";

type Hypothesis = (typeof alfabankMfo.hypotheses)[number];

export default function HypothesisCard({
  data,
  layout = "tabs",
}: {
  data: Hypothesis;
  /** "tabs" — старый вариант с переключателем (по умолчанию).
      "stack" — оба видео показываются рядом, с подписями «Вариант А/Б»
      над каждым; для гипотез, где сравнение наглядно бок-о-бок. */
  layout?: "tabs" | "stack";
}) {
  const [tab, setTab] = useState<"after" | "before">("after");
  const src = tab === "after" ? data.after : data.before;
  const { ui } = useContent();
  const { lang } = useLang();

  return (
    <div className="flex flex-col gap-4 bg-[var(--card)] border border-[var(--border)] rounded-[16px] p-4 w-full h-full">
      <div className="flex flex-col gap-2">
        <span className="text-[13px] leading-[14px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
          {lang === "ru"
            ? `${data.index} ${ui.hypothesis}`
            : `${ui.hypothesis} ${data.index}`}
        </span>
        <p className="text-[16px] leading-[22px] text-[var(--fg)]">
          {data.hypothesis}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] leading-[14px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
          {ui.solution}
        </span>
        <p className="text-[14px] leading-[20px] text-[var(--fg)]/80">
          {data.solution}
        </p>
      </div>

      {layout === "stack" ? (
        // Два видео бок-о-бок, у каждого подпись над ним: на десктопе в ряд,
        // на мобильном — друг под другом (узких карточек тут нет).
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {[
            { label: ui.variantA, src: data.after },
            { label: ui.variantB, src: data.before },
          ].map((v) => (
            <div key={v.label} className="flex flex-col gap-2">
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
      ) : (
        <>
          {/* Переключатель «Вариант А / Вариант Б» — на всю ширину */}
          <div className="inline-flex p-[3px] bg-[var(--bg)] border border-[var(--border)] rounded-full w-full">
            <button
              type="button"
              onClick={() => setTab("after")}
              className={`flex-1 text-[12px] leading-none px-3 py-[8px] rounded-full transition-colors ${
                tab === "after"
                  ? "bg-[var(--border)] text-[var(--fg)]"
                  : "text-[var(--fg)]/50 hover:text-[var(--fg)]/80"
              }`}
            >
              {ui.variantA}
            </button>
            <button
              type="button"
              onClick={() => setTab("before")}
              className={`flex-1 text-[12px] leading-none px-3 py-[8px] rounded-full transition-colors ${
                tab === "before"
                  ? "bg-[var(--border)] text-[var(--fg)]"
                  : "text-[var(--fg)]/50 hover:text-[var(--fg)]/80"
              }`}
            >
              {ui.variantB}
            </button>
          </div>
          <div>
            <MediaWithLightbox
              src={src}
              className="w-full h-auto rounded-[24px]"
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-0 mt-auto">
        <span className="text-[11px] leading-[25px] uppercase tracking-[0.88px] text-[var(--fg)]/50">
          {ui.result}
        </span>
        <p className="text-[14px] leading-[20px] text-[var(--fg)]/70">
          {data.resultLabel}
        </p>
        <p className="font-bold text-[20px] leading-[25px] text-[#0CC44D] mt-1">
          {data.resultValue}
        </p>
      </div>
    </div>
  );
}
