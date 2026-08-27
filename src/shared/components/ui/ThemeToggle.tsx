'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/shared/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="relative flex h-9 items-center rounded-xl border border-slate-200 bg-slate-100/90 p-1 transition-all hover:border-slate-300 dark:border-slate-700/80 dark:bg-slate-800 cursor-pointer shadow-2xs group"
    >
      <div className="flex items-center gap-1">
        {/* Light Icon Container */}
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
            !isDark
              ? 'bg-white text-amber-500 shadow-xs scale-100'
              : 'text-slate-400 hover:text-slate-200 scale-95'
          }`}
        >
          <Sun className="h-4 w-4" />
        </div>

        {/* Dark Icon Container */}
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
            isDark
              ? 'bg-slate-900 text-teal-400 shadow-xs scale-100 ring-1 ring-slate-700'
              : 'text-slate-400 hover:text-slate-600 scale-95'
          }`}
        >
          <Moon className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}
