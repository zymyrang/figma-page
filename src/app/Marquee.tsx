"use client";

// Бегущая строка в духе zhukdsgn.framer.website: dot-matrix шрифт VT323,
// uppercase, расширенный tracking, мягкий fade по краям. Контент дублируем
// два раза, и сдвигаем трэк на -50% — петля выглядит бесшовно.
export default function Marquee({
  items,
  speed = 6,
  separator = "✦",
  colors,
}: {
  items: string[];
  /** Длительность одного полного цикла прокрутки (секунд). Чем больше — тем медленнее. */
  speed?: number;
  separator?: string;
  /** Цвета по индексу элемента. Если задан — добавляется неоновое свечение
      (text-shadow). Цвет должен быть достаточно насыщенным, чтобы оставаться
      читаемым и на светлой теме. */
  colors?: string[];
}) {
  const sequence = [...items, ...items];
  return (
    <div
      className="relative w-full overflow-hidden border-y border-[var(--border)] py-3"
      style={{
        // Мягкие края: текст плавно растворяется по бокам контейнера.
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className="flex w-max items-center gap-6 whitespace-nowrap"
        style={{
          animation: `marqueeScroll ${speed}s linear infinite`,
          fontFamily: "'Pixelizer', ui-monospace, SFMono-Regular, monospace",
          fontWeight: 700,
        }}
        aria-hidden
      >
        {sequence.map((item, i) => {
          const color = colors ? colors[i % colors.length] : undefined;
          const textStyle: React.CSSProperties = color
            ? {
                color,
                textShadow: `0 0 10px ${color}cc, 0 0 22px ${color}66, 0 0 36px ${color}33`,
              }
            : {};
          return (
            <span
              key={i}
              className="flex items-center gap-6 text-[26px] leading-[26px] uppercase tracking-[0.08em]"
              style={!color ? { color: "var(--fg)" } : undefined}
            >
              <span style={textStyle}>{item}</span>
              <span className="text-[var(--fg)]/30">{separator}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
