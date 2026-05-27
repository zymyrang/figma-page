"use client";

import Link from "next/link";
import LangSwitcher from "./LangSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import { useContent } from "./LanguageProvider";
import { playBack } from "./lib/sounds";

const HeaderLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="inline-flex items-center h-[33px] px-[13px] rounded-full bg-[var(--card)] border border-[var(--border)] text-[14px] leading-[18.9px] text-[var(--fg)] hover:bg-[var(--card-hover)] transition-colors"
    >
      <span className="whitespace-nowrap">{children}</span>
    </a>
  );
};

const BackArrow = ({ className = "" }: { className?: string }) => (
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

// Общая шапка сайта. Десктоп — горизонтальная (как было), мобилка —
// стек: ряд «[назад?] имя + свитчеры», затем кнопки навигации.
// backHref передаётся на страницах кейсов — на мобилке кнопка «назад»
// встроена в шапку (на десктопе остаётся отдельная фикс-кнопка).
export default function SiteHeader({ backHref }: { backHref?: string }) {
  const { site } = useContent();
  return (
    <header className="sticky top-0 z-30 bg-[var(--bg)]/85 backdrop-blur-md rounded-b-[16px] overflow-hidden">
      {/* Десктоп */}
      <div className="relative hidden h-[64.89px] sm:block">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[15.9px] leading-[22.4px] text-[var(--fg)]">
          {site.name}
        </div>
        <div className="absolute left-[150px] top-4 flex items-center gap-2">
          <LangSwitcher />
          <ThemeSwitcher />
        </div>
        <nav className="absolute right-[20px] top-4 flex gap-[9px] items-center">
          {site.navLinks.map((link) => (
            <HeaderLink key={link.label} href={link.href}>
              {link.label}
            </HeaderLink>
          ))}
        </nav>
      </div>

      {/* Мобилка */}
      <div className="flex flex-col gap-3 px-4 py-3 sm:hidden">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              onClick={() => playBack()}
              aria-label="Назад"
              className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--fg)]"
            >
              <BackArrow className="size-[18px]" />
            </Link>
          ) : null}
          <span className="text-[17px] leading-[22px] text-[var(--fg)] font-medium">
            {site.name}
          </span>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <LangSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          {site.navLinks.map((link) => (
            <HeaderLink key={link.label} href={link.href}>
              {link.label}
            </HeaderLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
