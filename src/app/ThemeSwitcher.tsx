"use client";

import { useTheme } from "./ThemeProvider";
import { playToggle } from "./lib/sounds";

const MoonIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

// Свитчер темы — одна круглая кнопка с иконкой текущей темы (луна для
// тёмной, солнце для светлой). Видимая иконка драйвится классом
// html.light через CSS (см. globals.css → .theme-glyph), поэтому на
// загрузке сразу видна правильная иконка — без React-стейта и вспышки.
export default function ThemeSwitcher() {
  const { toggle } = useTheme();

  const handleClick = () => {
    playToggle();
    toggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Переключить тему"
      className="relative inline-flex items-center justify-center size-[33px] rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--card-hover)] transition-colors select-none"
    >
      <span className="theme-glyph theme-glyph--moon">
        <MoonIcon className="size-[14px]" />
      </span>
      <span className="theme-glyph theme-glyph--sun">
        <SunIcon className="size-[15px]" />
      </span>
    </button>
  );
}
