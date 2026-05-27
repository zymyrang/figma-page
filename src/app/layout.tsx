import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";
import { LanguageProvider } from "./LanguageProvider";

export const metadata: Metadata = {
  title: "Zharkyn Kalysh — Product Designer",
  description:
    "Product designer with 6 years of experience designing B2C and B2B products in fintech and telecom.",
  openGraph: {
    title: "Zharkyn Kalysh — Product Designer",
    description:
      "Product designer with 6 years of experience designing B2C and B2B products in fintech and telecom.",
    url: "https://zharkyn.design",
    siteName: "zharkyn.design",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zharkyn Kalysh — Product Designer",
    description:
      "Product designer with 6 years of experience designing B2C and B2B products in fintech and telecom.",
  },
};

// Антифликер: проставляем класс темы до отрисовки контента, чтобы при
// выбранной светлой теме не было вспышки тёмной.
const themeScript = `try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light')}catch(e){}`;
// Антифликер языка: если пользователь сохранил русский — прячем body
// классом lang-pending до тех пор, пока React не перерисует в RU.
// Иначе видна вспышка SSR-английского.
const langScript = `try{if(localStorage.getItem('lang')==='ru')document.documentElement.classList.add('lang-pending')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Инлайн-скрипты антифликера: помещаем в <head>, чтобы они
            выполнились синхронно ДО парсинга <body> и первого пайнта.
            next/script даже с beforeInteractive грузится асинхронно
            (поэтому светлая/EN-тема не успевала примениться). */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: langScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--fg)]">
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
