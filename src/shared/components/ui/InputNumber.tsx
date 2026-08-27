'use client';

import React from 'react';

interface InputNumberProps {
  id: string;
  label: string;
  value: number | string;
  onChange: (val: number) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | string;
  helpText?: string;
  required?: boolean;
}

export function InputNumber({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder = '0.00',
  min = 0,
  max,
  step = 'any',
  helpText,
  required = false,
}: InputNumberProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const num = parseFloat(raw);
    onChange(isNaN(num) ? 0 : num);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {helpText && <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">{helpText}</span>}
      </div>

      <div className="relative flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 shadow-2xs transition-all focus-within:border-emerald-700 dark:focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-emerald-700/15">
        {prefix && (
          <div className="pointer-events-none flex items-center pl-3.5 pr-1 text-sm font-bold text-slate-500 dark:text-slate-400 font-mono">
            {prefix}
          </div>
        )}

        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value === 0 ? '' : value}
          onChange={handleChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`w-full py-2.5 text-base font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none bg-transparent ${
            prefix ? 'pl-1.5' : 'pl-3.5'
          } ${suffix ? 'pr-1.5' : 'pr-3.5'}`}
        />

        {suffix && (
          <div className="pointer-events-none flex items-center pr-3.5 pl-1 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}
