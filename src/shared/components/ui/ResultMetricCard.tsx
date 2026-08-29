import React from 'react';
import { ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';

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
    primary: 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100',
    success: 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-100',
    warning: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100',
    neutral: 'bg-slate-50/80 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
  };

  const valueColors = {
    primary: 'text-emerald-700 dark:text-emerald-400',
    success: 'text-teal-700 dark:text-teal-400',
    warning: 'text-amber-700 dark:text-amber-400',
    neutral: 'text-slate-900 dark:text-white',
  };

  return (
    <div className={`relative rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs min-w-0 flex flex-col justify-between ${styles[type]}`}>
      <div>
        <div className="flex items-start justify-between gap-1.5 min-h-[32px]">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight" title={label}>
            {label}
          </span>
          {badge && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/80 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shrink-0">
              <Sparkles className="h-3 w-3 text-amber-500" />
              {badge}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
          <div
            title={value}
            className={`text-lg sm:text-xl lg:text-2xl font-black tracking-tight font-mono leading-tight ${valueColors[type]}`}
          >
            {value}
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-bold shrink-0 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
          )}
        </div>
      </div>

      {subValue && (
        <p className="mt-2 text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 leading-snug break-words" title={subValue}>
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
