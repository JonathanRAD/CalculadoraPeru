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
  maxLength?: number;
  step?: number | string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
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
  maxLength = 11, // Hasta 11 caracteres (ej: 99,999,999.99)
  step = 'any',
  helpText,
  required = false,
  disabled = false,
}: InputNumberProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    if (raw === '') {
      onChange(0);
      return;
    }

    // Si excede el límite de caracteres, corta únicamente el exceso permitiendo sobrescribir/seleccionar todo libremente
    if (maxLength && raw.length > maxLength) {
      raw = raw.slice(0, maxLength);
    }

    const num = parseFloat(raw);
    if (isNaN(num)) {
      onChange(0);
      return;
    }

    // Si tiene un límite máximo lógico específico (como un porcentaje max=100)
    if (max !== undefined && num > max) {
      onChange(max);
      return;
    }

    if (min !== undefined && num < min) {
      onChange(min);
      return;
    }

    onChange(num);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} title={label} className="text-[15px] font-semibold leading-snug text-slate-900 dark:text-slate-100 sm:min-h-10">
        {label} {required && <span className="text-stamp dark:text-red-300" aria-hidden="true">*</span>}
      </label>

      <div className="flex min-h-12 items-stretch overflow-hidden rounded border border-slate-400 bg-white focus-within:border-brand-600 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-brand-600 dark:border-slate-600 dark:bg-[#0E141B]">
        {prefix && (
          <div className="pointer-events-none flex shrink-0 items-center border-r border-stone-300 bg-stone-100 px-3 font-mono text-[15px] text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            {prefix}
          </div>
        )}

        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={value === 0 && !disabled ? '' : value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          aria-describedby={helpText ? `${id}-help` : undefined}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 font-mono text-[17px] font-medium tabular-nums text-slate-900 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:text-slate-500 dark:text-white dark:placeholder:text-slate-500 dark:disabled:text-slate-400"
        />

        {suffix && (
          <div className="pointer-events-none flex shrink-0 items-center border-l border-stone-300 bg-stone-100 px-3 font-mono text-[15px] text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            {suffix}
          </div>
        )}
      </div>

      {helpText && (
        <span id={`${id}-help`} className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
          {helpText}
        </span>
      )}
    </div>
  );
}
