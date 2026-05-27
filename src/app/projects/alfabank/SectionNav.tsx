"use client";

import { useEffect, useState } from "react";
import { playSwoosh } from "../../lib/sounds";

type SectionEntry = { id: string; label: string };

export default function SectionNav({ sections }: { sections: SectionEntry[] }) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    // Подход через позицию скролла надёжнее IntersectionObserver для случая
    // когда секция короче активной зоны: активным считаем ПОСЛЕДНЮЮ секцию,
    // чей верх ушёл выше триггер-линии (1/3 высоты viewport-а).
    let raf = 0;

    const compute = () => {
      // Триггер у самого верха viewport-а (а не на 1/3): иначе короткая
      // секция типа «Контекст» при клике скроллится в начало, но 1/3 линия
      // уже захватывает следующую секцию «Как было до», и активным становится
      // не тот пункт.
      const trigger = 120;
      let nextActive = sections[0]?.id ?? "";
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= trigger) {
          nextActive = s.id;
        }
      }
      // Особый случай: достигли низа страницы — форсим последнюю секцию,
      // даже если её топ ещё не пересёк триггер (короткая секция в самом низу).
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) nextActive = sections[sections.length - 1]?.id ?? nextActive;
      setActiveId(nextActive);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  return (
    <nav
      aria-label="Разделы статьи"
      className="hidden lg:flex fixed right-[40px] top-1/2 -translate-y-1/2 z-40 flex-col gap-5"
    >
      {sections.map((s) => {
        const isActive = activeId === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={() => playSwoosh()}
            className="group flex items-center gap-4 text-[18px] leading-[24px] transition-colors"
          >
            <span
              className={`block w-[4px] h-[24px] rounded-full transition-colors ${
                isActive ? "bg-[var(--fg)]" : "bg-transparent"
              }`}
            />
            <span
              className={`whitespace-nowrap transition-colors ${
                isActive
                  ? "text-[var(--fg)] font-medium"
                  : "text-[var(--fg)]/40 group-hover:text-[var(--fg)]/70"
              }`}
            >
              {s.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
