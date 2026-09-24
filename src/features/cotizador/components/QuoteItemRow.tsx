'use client';

import React from 'react';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Package,
  Wrench,
} from 'lucide-react';
import { QuoteCalculatedItem, DiscountType, UnitType } from '../types';

interface QuoteItemRowProps {
  index: number;
  totalItems: number;
  item: QuoteCalculatedItem;
  onChange: (updated: Partial<QuoteCalculatedItem>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
  { value: 'unit', label: 'Unidad (und)' },
  { value: 'service', label: 'Servicio' },
  { value: 'hour', label: 'Hora (hrs)' },
  { value: 'day', label: 'Día' },
  { value: 'kg', label: 'Kilogramo (kg)' },
  { value: 'meter', label: 'Metro (m)' },
  { value: 'pack', label: 'Paquete / Caja' },
  { value: 'other', label: 'Otro' },
];

export const QuoteItemRow: React.FC<QuoteItemRowProps> = ({
  index,
  totalItems,
  item,
  onChange,
  onDuplicate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 text-slate-900 dark:text-slate-100 shadow-sm transition-all hover:border-emerald-500/50">
      
      {/* Top Bar of Card / Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {index + 1}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            {item.type === 'service' ? (
              <span className="inline-flex items-center gap-1 rounded bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 px-2 py-0.5 border border-sky-200 dark:border-sky-800/60 font-medium text-[11px]">
                <Wrench className="h-3 w-3" />
                Servicio
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/70 text-[#00875A] dark:text-[#00C853] px-2 py-0.5 border border-emerald-200 dark:border-emerald-800/60 font-medium text-[11px]">
                <Package className="h-3 w-3" />
                Producto
              </span>
            )}
            <button
              type="button"
              onClick={() => onChange({ type: item.type === 'service' ? 'product' : 'service' })}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:underline cursor-pointer ml-1"
            >
              Cambiar tipo
            </button>
          </div>
        </div>

        {/* Row Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Subir concepto"
            aria-label={`Mover concepto #${index + 1} hacia arriba`}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalItems - 1}
            className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Bajar concepto"
            aria-label={`Mover concepto #${index + 1} hacia abajo`}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 rounded text-slate-400 hover:text-[#00875A] dark:hover:text-[#00C853] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Duplicar este concepto"
            aria-label={`Duplicar concepto #${index + 1}`}
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors ml-1"
            title="Eliminar concepto"
            aria-label={`Eliminar concepto #${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Description & Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start">
        
        {/* Description Field */}
        <div className="sm:col-span-6 space-y-1">
          <label htmlFor={`desc-${index}`} className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Descripción del concepto <span className="text-red-500">*</span>
          </label>
          <input
            id={`desc-${index}`}
            type="text"
            required
            minLength={2}
            maxLength={200}
            value={item.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Ej: Servicio de mantenimiento preventivo, Polo de algodón..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#00875A] dark:focus:border-[#00C853] transition-colors"
          />
        </div>

        {/* Unit Select */}
        <div className="sm:col-span-2 space-y-1">
          <label htmlFor={`unit-${index}`} className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Unidad
          </label>
          <select
            id={`unit-${index}`}
            value={item.unit}
            onChange={(e) => onChange({ unit: e.target.value as UnitType })}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#00875A] cursor-pointer"
          >
            {UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Field */}
        <div className="sm:col-span-2 space-y-1">
          <label htmlFor={`qty-${index}`} className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input
            id={`qty-${index}`}
            type="number"
            min={0.001}
            max={999999.999}
            step="any"
            inputMode="decimal"
            required
            value={item.quantity === 0 ? '' : item.quantity}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChange({ quantity: isNaN(val) ? 0 : val });
            }}
            placeholder="1"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-[#00875A]"
          />
        </div>

        {/* Unit Price Field */}
        <div className="sm:col-span-2 space-y-1">
          <label htmlFor={`price-${index}`} className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            P. Unit. (PEN) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-mono">S/</span>
            <input
              id={`price-${index}`}
              type="number"
              min={0}
              max={999999999.99}
              step="any"
              inputMode="decimal"
              required
              value={item.unitPrice === 0 ? '' : item.unitPrice}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChange({ unitPrice: isNaN(val) ? 0 : val });
              }}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-7 pr-2.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-[#00875A]"
            />
          </div>
        </div>

      </div>

      {/* Second Line: Discounts, IGV & Line Total */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Discount controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Descuento:</span>
          
          <select
            aria-label={`Tipo de descuento para concepto #${index + 1}`}
            value={item.discountType}
            onChange={(e) => {
              const t = e.target.value as DiscountType;
              onChange({
                discountType: t,
                discountValue: t === 'none' ? 0 : item.discountValue,
              });
            }}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="none">Sin descuento</option>
            <option value="percent">% Porcentaje</option>
            <option value="fixed">S/ Monto fijo</option>
          </select>

          {item.discountType !== 'none' && (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={item.discountType === 'percent' ? 100 : item.grossAmount}
                step="any"
                inputMode="decimal"
                value={item.discountValue === 0 ? '' : item.discountValue}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  onChange({ discountValue: isNaN(v) ? 0 : v });
                }}
                placeholder={item.discountType === 'percent' ? '10%' : 'S/ 20'}
                className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-[#00875A]"
              />
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">
                {item.discountAmount > 0 && `(-S/ ${item.discountAmount.toFixed(2)})`}
              </span>
            </div>
          )}
        </div>

        {/* IGV Checkbox & Total display */}
        <div className="flex items-center gap-4 ml-auto">
          
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white select-none">
            <input
              type="checkbox"
              checked={item.isIgvAffected}
              onChange={(e) => onChange({ isIgvAffected: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-700 text-[#00875A] focus:ring-0 cursor-pointer h-3.5 w-3.5"
            />
            <span>Afecto a IGV</span>
          </label>

          {/* Subtotal line display */}
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Total concepto:</span>
            <span className="text-sm font-bold font-mono text-[#00875A] dark:text-[#00C853]">
              S/ {item.netAmount.toFixed(2)}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
