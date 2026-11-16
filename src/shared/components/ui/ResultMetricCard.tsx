import React from 'react';
import { ArrowUpRight, ArrowDownRight, } from 'lucide-react';

interface ResultMetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  type?: 'primary' | 'success' | 'warning' | 'neutral';
  badge?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function ResultMetricCard({
  label,
  value,
  subValue,
  type = 'primary',
  badge,
  icon,
  trend,
}: ResultMetricCardProps) {
  const styles = {
    primary: 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800 text-brand-950 dark:text-brand-100',
    success: 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-200 dark:border-[#2C3744] text-brand-950 dark:text-brand-100',
    warning: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100',
    neutral: 'bg-slate-50/80 dark:bg-[#18202A] border-slate-200 dark:border-[#2C3744] text-slate-900 dark:text-slate-100',
  };

  const valueColors = {
    primary: 'text-brand-700 dark:text-brand-400',
    success: 'text-brand-700 dark:text-brand-400',
    warning: 'text-amber-700 dark:text-amber-400',
    neutral: 'text-slate-900 dark:text-white',
  };

  return (
    <div className={`relative rounded-lg border p-4 sm:p-5 transition-all min-w-0 flex flex-col justify-between ${styles[type]}`}>
      <div>
        <div className="flex items-start justify-between gap-1.5 min-h-[32px]">
          <span className="text-[13px] sm:text-[13px] font-bold text-slate-500 dark:text-slate-400 leading-tight" title={label}>
            {label}
          </span>
          {badge && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/80 dark:bg-slate-800 px-1.5 py-0.2 text-[13px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shrink-0">
              
              {badge}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
          <div
            title={value}
            className={`text-lg sm:text-xl lg:text-2xl font-bold tracking-tight font-mono leading-tight ${valueColors[type]}`}
          >
            {value}
          </div>
          {trend && (
            <div className={`flex items-center text-[13px] font-bold shrink-0 ${trend === 'up' ? 'text-brand-600' : 'text-rose-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
          )}
        </div>
      </div>

      {subValue && (
        <p className="mt-2 text-[13px] sm:text-[13px] font-medium text-slate-600 dark:text-slate-400 leading-snug break-words" title={subValue}>
          {subValue}
        </p>
      )}

      {icon && (
        <div className="absolute -bottom-2 -right-2 text-slate-900/5 dark:text-white/5 pointer-events-none">
          {icon}
        </div>
      )}
    </div>
  );
}
