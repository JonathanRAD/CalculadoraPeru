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
    primary: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
    success: 'bg-teal-50/80 border-teal-200 text-teal-950',
    warning: 'bg-amber-50/80 border-amber-200 text-amber-950',
    neutral: 'bg-slate-50/80 border-slate-200 text-slate-900',
  };

  const valueColors = {
    primary: 'text-emerald-700',
    success: 'text-teal-700',
    warning: 'text-amber-700',
    neutral: 'text-slate-800',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4.5 sm:p-5 transition-all shadow-xs ${styles[type]}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {badge && (
          <span className="inline-flex items-center gap-1 rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-2xs border border-slate-200/60">
            <Sparkles className="h-3 w-3 text-amber-500" />
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <div className={`text-2xl sm:text-3xl font-black tracking-tight ${valueColors[type]}`}>
          {value}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          </div>
        )}
      </div>

      {subValue && (
        <p className="mt-1 text-xs font-medium text-slate-600">
          {subValue}
        </p>
      )}

      {icon && (
        <div className="absolute -bottom-2 -right-2 text-slate-900/5 pointer-events-none">
          {icon}
        </div>
      )}
    </div>
  );
}
