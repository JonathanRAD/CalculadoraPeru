'use client';

import React from 'react';

interface SwitchToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  badge?: string;
}

export function SwitchToggle({
  id,
  label,
  description,
  checked,
  onChange,
  badge,
}: SwitchToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 p-4 transition-colors">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <label htmlFor={id} className="cursor-pointer text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            {label}
          </label>
          {badge && (
            <span className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        )}
      </div>

      {/* 3D Skeuomorphic UIverse Toggle */}
      <div className="relative inline-flex shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="uiverse-toggle-checkbox hidden"
        />
        <label htmlFor={id} className="uiverse-toggle-label" />
      </div>
    </div>
  );
}
