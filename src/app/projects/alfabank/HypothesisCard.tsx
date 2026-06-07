"use client";

import type { alfabankMfo } from "@/content";
import { useContent, useLang } from "../../LanguageProvider";
import BeforeAfterSlider from "./BeforeAfterSlider";

type Hypothesis = (typeof alfabankMfo.hypotheses)[number];

export default function HypothesisCard({
  data,
}: {
  data: Hypothesis;
}) {
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

      {/* Интерактивное сравнение: перетаскиваемый слайдер «Вариант А / Б» */}
      <BeforeAfterSlider
        before={data.after}
        after={data.before}
        beforeLabel={ui.variantA}
        afterLabel={ui.variantB}
        className="w-full"
      />

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
