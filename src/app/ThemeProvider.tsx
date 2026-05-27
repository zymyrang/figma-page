"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Стартуем с "dark" — совпадает с SSR-разметкой. После маунта
  // подтягиваем реальное значение из класса html.light, который ставит
  // антифликер-скрипт. Лэйзи-инициализатор с document вызывал hydration
  // mismatch на кнопках ThemeSwitcher (aria-pressed).
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.documentElement.classList.contains("light")) {
      setTheme("light");
    }
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    // Включаем плавный переход цветов только на время переключения.
    root.classList.add("theme-transition");
    root.classList.toggle("light", next === "light");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage недоступен — просто не запоминаем выбор
    }
    setTheme(next);
    window.setTimeout(() => root.classList.remove("theme-transition"), 380);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
