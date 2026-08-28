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
    <div className={`relative overflow-hidden rounded-2xl border p-4.5 sm:p-5 transition-all shadow-2xs min-w-0 ${styles[type]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          {label}
        </span>
        {badge && (
          <span className="inline-flex items-center gap-1 rounded-md bg-white/80 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 shrink-0">
            <Sparkles className="h-3 w-3 text-amber-500" />
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2 min-w-0">
        <div
          title={value}
          className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight truncate min-w-0 ${valueColors[type]}`}
        >
          {value}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold shrink-0 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          </div>
        )}
      </div>

      {subValue && (
        <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400 truncate" title={subValue}>
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
