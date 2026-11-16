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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-300 bg-[#FFFEFB] p-4 dark:border-slate-700 dark:bg-[#18202A]">
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-x-2">
          <label htmlFor={id} className="cursor-pointer text-[15px] font-semibold text-slate-900 dark:text-slate-100">
            {label}
          </label>
          {badge && <span className="font-mono text-[13px] text-brand-700 dark:text-brand-400">{badge}</span>}
        </div>
        {description && <p className="mt-0.5 text-[13px] text-slate-600 dark:text-slate-400">{description}</p>}
      </div>

      <label htmlFor={id} className="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full border border-slate-500 bg-slate-300 transition-colors peer-checked:border-brand-700 peer-checked:bg-brand-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600 dark:border-slate-500 dark:bg-slate-700" />
        <span className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-6" />
      </label>
    </div>
  );
}
