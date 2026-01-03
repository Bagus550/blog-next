"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-blue-600 dark:bg-yellow-400 shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300 group"
      aria-label="Toggle Theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <span className={`absolute transition-all duration-500 text-xl ${resolvedTheme === 'dark' ? 'opacity-0 -rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}>
          ☀️
        </span>
        <span className={`absolute transition-all duration-500 text-xl ${resolvedTheme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`}>
          🌙
        </span>
      </div>
      
      <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-black dark:bg-white text-white dark:text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold whitespace-nowrap shadow-xl">
        Ganti Suasana bray
      </span>
    </button>
  );
}