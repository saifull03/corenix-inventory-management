'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/radix';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 ${className}`}></div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            type="button"
            className={`p-2 rounded-md transition-all duration-300 flex items-center justify-center relative group focus-visible:ring-2 focus-visible:ring-sky-400 ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-300 border border-slate-700/60 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-300 shadow-sm'
            } ${className}`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 transition-transform group-hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 transition-transform group-hover:-rotate-12 text-slate-700" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
