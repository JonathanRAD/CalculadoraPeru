'use client';

import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Building2, HelpCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { usePro } from '@/features/premium/context/ProContext';
import { PERU_CONSTANTS } from '@/core/constants/peru';

interface SunafilFinesCardProps {
  obligationType: 'cts' | 'gratificacion' | 'liquidacion' | 'boleta';
  workerCount?: number;
}

const CURRENT_UIT = PERU_CONSTANTS.CURRENT_UIT;

// Escala oficial de multas SUNAFIL en porcentajes de la UIT según D.S. 008-2020-TR
// Infracciones Graves (No depositar CTS o Grati)
const FINE_RATES_GRAVE = {
  micro: [0.11, 0.14, 0.17, 0.23], // 1-10 trabajadores
  pequena: [0.45, 0.59, 0.77, 1.02],
  general: [1.57, 2.09, 2.68, 3.56],
};

// Infracciones Muy Graves (No pagar liquidación dentro de las 48 horas)
const FINE_RATES_MUY_GRAVE = {
  micro: [0.25, 0.32, 0.38, 0.51],
  pequena: [0.77, 1.02, 1.36, 1.82],
  general: [2.63, 3.51, 4.50, 6.01],
};

export function SunafilFinesCard({ obligationType, workerCount = 1 }: SunafilFinesCardProps) {
  const { isPro, openActivationModal } = usePro();
  const [businessType, setBusinessType] = useState<'micro' | 'pequena' | 'general'>('pequena');
  const [affectedWorkers, setAffectedWorkers] = useState(workerCount || 1);
  const [isExpanded, setIsExpanded] = useState(false);

  const isMuyGrave = obligationType === 'liquidacion';
  const table = isMuyGrave ? FINE_RATES_MUY_GRAVE : FINE_RATES_GRAVE;

  // Bracket index based on affected workers
  const bracketIndex = affectedWorkers <= 1 ? 0 : affectedWorkers <= 5 ? 1 : affectedWorkers <= 10 ? 2 : 3;
  const uitFactor = table[businessType][bracketIndex];
  const fineEstimated = Math.round(uitFactor * CURRENT_UIT);

  const titleMap = {
    cts: 'Multa SUNAFIL por No Depositar CTS a Tiempo',
    gratificacion: 'Multa SUNAFIL por No Pagar Gratificación antes del 15',
    liquidacion: 'Multa SUNAFIL por No Pagar Liquidación dentro de 48 Horas',
    boleta: 'Multa SUNAFIL por No Entregar Boleta de Pago Formal',
  };

  const deadlineMap = {
    cts: 'Plazo legal estricto: Hasta el 15 de mayo y 15 de noviembre.',
    gratificacion: 'Plazo legal estricto: Hasta el 15 de julio y 15 de diciembre.',
    liquidacion: 'Plazo legal estricto: Dentro de las 48 horas hábiles del cese laboral (D.L. 728).',
    boleta: 'Plazo legal: A más tardar el tercer día hábil posterior al pago (D.S. 001-98-TR).',
  };

  return (
    <div className="rounded-3xl border border-amber-300/80 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/70 via-white to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 p-5 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                ALERTA NORMATIVA SUNAFIL 2026
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                PRO EXCLUSIVO
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {titleMap[obligationType]}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          aria-label="Alternar detalles"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        {deadlineMap[obligationType]} El incumplimiento genera multas no subsanables calculadas en base a la UIT vigente (S/ {CURRENT_UIT.toLocaleString('es-PE')}).
      </p>

      {/* Simulator parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label htmlFor={`sunafil-regime-${obligationType}`} className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Régimen Laboral de la Empresa:
          </label>
          <select
            id={`sunafil-regime-${obligationType}`}
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value as 'micro' | 'pequena' | 'general')}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none"
          >
            <option value="micro">Microempresa (REMYPE)</option>
            <option value="pequena">Pequeña Empresa (REMYPE)</option>
            <option value="general">Régimen General (No MYPE)</option>
          </select>
        </div>

        <div>
          <label htmlFor={`sunafil-workers-${obligationType}`} className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Trabajadores Afectados:
          </label>
          <input
            id={`sunafil-workers-${obligationType}`}
            type="number"
            min={1}
            max={500}
            value={affectedWorkers}
            onChange={(e) => setAffectedWorkers(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* Fine Result Badge */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
            Rango estimado de sanción económica:
          </span>
          <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
            S/ {fineEstimated.toLocaleString('es-PE')}
          </span>
          <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
            ({(uitFactor * 100).toFixed(1)}% de 1 UIT)
          </span>
        </div>

        {!isPro && (
          <button
            type="button"
            onClick={openActivationModal}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            Desbloquear reporte
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
          <p>• <strong>Base Legal:</strong> D.S. N° 019-2006-TR y modificatorias por D.S. N° 008-2020-TR (Reglamento de la Ley General de Inspección del Trabajo).</p>
          <p>• <strong>Intereses BCRP:</strong> Además de la multa inspectiva de SUNAFIL, el empleador está obligado por ley a abonar los intereses legales laborales fijados por el BCRP desde el día siguiente del vencimiento hasta la fecha efectiva de pago.</p>
        </div>
      )}
    </div>
  );
}
