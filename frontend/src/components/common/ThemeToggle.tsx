"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("medrisk-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("medrisk-theme", "light");
    }
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 rounded-xl text-slate-400"
        aria-label="Đổi giao diện"
      >
        <span className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
      title={theme === "light" ? "Chuyển sang Chế độ Tối (Dark Mode)" : "Chuyển sang Chế độ Sáng (Light Mode)"}
      aria-label="Đổi giao diện Sáng / Tối"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-slate-700 hover:text-medical-600 transition-all" />
      ) : (
        <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-all" />
      )}
    </Button>
  );
}
