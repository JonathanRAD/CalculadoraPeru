'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  Building2,
  User,
  Download,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  Upload,
  Lock,
  Trash2,
  Image as ImageIcon,
  Clock,
  Briefcase,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  generateOfficialPayrollSlipPdf,
  PayrollSlipOptions,
} from '@/shared/utils/payrollSlipGenerator';
import { exportToCsv } from '@/shared/utils/exportExcel';
import { formatCurrency } from '@/core/math/formatters';
import { usePro } from '@/features/premium/context/ProContext';

interface PayrollSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationData: Omit<
    PayrollSlipOptions,
    | 'companyName'
    | 'companyRuc'
    | 'companyAddress'
    | 'workerName'
    | 'workerDni'
    | 'workerPosition'
    | 'workerStartDate'
    | 'periodMonthYear'
    | 'cuspp'
    | 'laborRegime'
    | 'contractType'
    | 'paymentMethod'
    | 'workedDays'
    | 'workedHours'
    | 'unworkedDays'
    | 'subsidizedDays'
  >;
}

export function PayrollSlipModal({
  isOpen,
  onClose,
  calculationData,
}: PayrollSlipModalProps) {
  // Worker inputs
  const [workerName, setWorkerName] = useState('');
  const [workerDni, setWorkerDni] = useState('');
  const [workerPosition, setWorkerPosition] = useState('');
  const [workerStartDate, setWorkerStartDate] = useState('');
  const [cuspp, setCuspp] = useState('');

  // Legal MTPE/SUNAFIL inputs
  const [laborRegime, setLaborRegime] = useState('Régimen General (D.L. 728)');
  const [contractType, setContractType] = useState('A plazo indeterminado');
  const [paymentMethod, setPaymentMethod] = useState('Depósito en cuenta sueldo');
  const [workedDays, setWorkedDays] = useState('30');
  const [workedHours, setWorkedHours] = useState('240');

  // Company inputs
  const [companyName, setCompanyName] = useState('');
  const [companyRuc, setCompanyRuc] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');

  // Period
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    const month = d.toLocaleDateString('es-PE', { month: 'long' });
    const year = d.getFullYear();
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  });

  const { isPro, openActivationModal, subscriberName, user } = usePro();
  const [companyLogoBase64, setCompanyLogoBase64] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Auto-populate saved company profile from user account
  React.useEffect(() => {
    if (user) {
      if (user.companyName && !companyName) setCompanyName(user.companyName);
      if (user.companyRuc && !companyRuc) setCompanyRuc(user.companyRuc);
      if (user.companyAddress && !companyAddress) setCompanyAddress(user.companyAddress);
      if (user.companyLogoBase64 && !companyLogoBase64) setCompanyLogoBase64(user.companyLogoBase64);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen del logotipo debe pesar menos de 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCompanyLogoBase64(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      generateOfficialPayrollSlipPdf({
        ...calculationData,
        isPro,
        companyLogoBase64: isPro && companyLogoBase64 ? companyLogoBase64 : undefined,
        companyName: isPro ? (companyName.trim() || undefined) : undefined,
        companyRuc: isPro ? (companyRuc.trim() || undefined) : undefined,
        companyAddress: isPro ? (companyAddress.trim() || undefined) : undefined,
        workerName: workerName.trim() || undefined,
        workerDni: workerDni.trim() || undefined,
        workerPosition: workerPosition.trim() || undefined,
        workerStartDate: workerStartDate.trim() || undefined,
        cuspp: cuspp.trim() || undefined,
        periodMonthYear: period,
        laborRegime,
        contractType,
        paymentMethod,
        workedDays: parseInt(workedDays, 10) || 30,
        workedHours: parseInt(workedHours, 10) || 240,
        unworkedDays: 0,
        subsidizedDays: 0,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error generando boleta:', err);
      setIsGenerating(false);
    }
  };

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    try {
      const columns = [
        { header: 'Periodo', key: 'periodo' },
        { header: 'Empresa', key: 'empresa' },
        { header: 'RUC Empresa', key: 'ruc' },
        { header: 'Trabajador', key: 'trabajador' },
        { header: 'DNI', key: 'dni' },
        { header: 'Cargo', key: 'cargo' },
        { header: 'Régimen Laboral', key: 'regimen' },
        { header: 'Tipo Contrato', key: 'contrato' },
        { header: 'Días Laborados', key: 'dias' },
        { header: 'Horas Ordinarias', key: 'horas' },
        { header: 'Sistema Pensionario', key: 'pension' },
        { header: 'Sueldo Básico (PEN)', key: 'basico' },
        { header: 'Asignación Familiar (PEN)', key: 'asig_fam' },
        { header: 'Ingresos Variables (PEN)', key: 'variables' },
        { header: 'Ingresos No Remunerativos (PEN)', key: 'no_remunerativo' },
        { header: 'Total Bruto (PEN)', key: 'total_bruto' },
        { header: 'Aporte Pensión (PEN)', key: 'afp_onp' },
        { header: 'Renta 5ta Categoría (PEN)', key: 'quinta' },
        { header: 'Otros Descuentos (PEN)', key: 'otros_desc' },
        { header: 'Total Descuentos (PEN)', key: 'total_desc' },
        { header: 'Sueldo Neto a Pagar (PEN)', key: 'neto' },
        { header: 'Aporte EsSalud 9% (PEN)', key: 'essalud' },
      ];

      const rows = [
        {
          periodo: period,
          empresa: companyName || 'Mi Empresa',
          ruc: companyRuc || '20XXXXXXXXX',
          trabajador: workerName || 'Trabajador',
          dni: workerDni || '-',
          cargo: workerPosition || 'Empleado',
          regimen: laborRegime,
          contrato: contractType,
          dias: workedDays,
          horas: workedHours,
          pension: calculationData.pensionSystemName,
          basico: calculationData.baseSalary,
          asig_fam: calculationData.familyAllowance,
          variables: calculationData.variableIncome,
          no_remunerativo: calculationData.nonRemunerativeIncome,
          total_bruto: calculationData.totalGross,
          afp_onp: calculationData.pensionDeduction,
          quinta: calculationData.fifthCategoryTax,
          otros_desc: calculationData.otherDeductions,
          total_desc: calculationData.totalDeductions,
          neto: calculationData.netSalary,
          essalud: calculationData.essaludContribution,
        },
      ];

      exportToCsv(`Planilla_${period.replace(/\s+/g, '_')}`, columns, rows);

      setTimeout(() => {
        setIsExportingExcel(false);
      }, 1000);
    } catch (err) {
      console.error('Error exportando Excel:', err);
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-xs max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#00875A] dark:text-[#00C853]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Emitir Boleta de Pago Oficial (D.S. N° 001-98-TR)
              </h3>
              <p className="text-[11px] text-slate-500">
                Formato legal del MTPE / PLAME con firmas y control de asistencia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRO Status Banner vs Activation Prompt */}
        {isPro ? (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Membresía PRO Activa ({subscriberName || 'VIP'}) · Boletas con Membrete Ilimitadas</span>
            </div>
            <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 font-bold px-2 py-0.5 rounded-full">
              S/ 0.00
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span>Emisión gratuita con marca de agua. Para emitir con membrete oficial y RUC propio:</span>
            </div>
            <button
              type="button"
              onClick={openActivationModal}
              className="font-bold underline text-amber-900 dark:text-amber-200 hover:text-amber-700 text-left cursor-pointer shrink-0 text-[11px]"
            >
              Activar Código PRO →
            </button>
          </div>
        )}

        {/* Calculation Summary Pill */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold block">
              Remuneración Neta a Liquidar:
            </span>
            <span className="text-base font-black font-mono text-[#00875A] dark:text-[#00C853]">
              {formatCurrency(calculationData.netSalary)}
            </span>
          </div>
          <div className="text-right text-[11px] text-slate-600 dark:text-slate-400">
            <span>Sueldo Bruto: {formatCurrency(calculationData.totalGross)}</span>
            <span className="block text-slate-400">Descuentos: {formatCurrency(calculationData.totalDeductions)}</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          
          {/* Period */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#00875A]" />
              <span>Periodo de Pago (Mes y Año)</span>
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Ej. Septiembre 2026"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
            />
          </div>

          {/* Worker Section */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-[#00875A]" />
              <span>Datos del Trabajador</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Nombres y Apellidos
                </label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez Ramos"
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Número de DNI
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Ej. 45892103"
                  value={workerDni}
                  onChange={(e) => setWorkerDni(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Cargo / Puesto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Analista Contable / Vendedor"
                  value={workerPosition}
                  onChange={(e) => setWorkerPosition(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  CUSPP (Opcional si es AFP)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 128491JPMRA1"
                  value={cuspp}
                  onChange={(e) => setCuspp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                />
              </div>
            </div>
          </div>

          {/* Legal Attendance & Labor Data (MTPE / SUNAFIL) */}
          <div className="space-y-3 pt-2">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Control Laboral y de Asistencia (SUNAFIL)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Régimen Laboral
                </label>
                <select
                  value={laborRegime}
                  onChange={(e) => setLaborRegime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A] text-xs"
                >
                  <option value="Régimen General (D.L. 728)">Régimen General (D.L. 728)</option>
                  <option value="Régimen Especial MYPE (D.L. 1086)">Régimen Especial MYPE</option>
                  <option value="Microempresa (D.L. 1086)">Microempresa</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Tipo de Contrato
                </label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A] text-xs"
                >
                  <option value="A plazo indeterminado">A plazo indeterminado</option>
                  <option value="Sujeto a modalidad (Plazo fijo)">Sujeto a modalidad (Plazo fijo)</option>
                  <option value="Tiempo parcial (Part-time)">Tiempo parcial (Part-time)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Forma de Pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A] text-xs"
                >
                  <option value="Depósito en cuenta sueldo">Depósito Cta. Sueldo</option>
                  <option value="Transferencia interbancaria">Transferencia Bancaria</option>
                  <option value="Efectivo en caja">Efectivo</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Días Efectivamente Laborados
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={workedDays}
                  onChange={(e) => setWorkedDays(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Horas Ordinarias Laboradas
                </label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={workedHours}
                  onChange={(e) => setWorkedHours(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                />
              </div>
            </div>
          </div>

          {/* Company Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Datos del Empleador (Empresa)</span>
              </span>
              {isPro ? (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  MEMBRETE PRO HABILITADO ✓
                </span>
              ) : (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> BLOQUEADO (GRATIS)
                </span>
              )}
            </div>

            {/* Warning when Free */}
            {!isPro && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Personalización Corporativa Bloqueada</span>
                </div>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-[11px]">
                  En el modo gratuito, este documento se emitirá como <strong>&quot;EMISIÓN DE PRUEBA&quot;</strong> con una <strong>marca de agua diagonal</strong>. Para colocar el RUC y logotipo oficial de tu empresa:
                </p>
                <button
                  type="button"
                  onClick={openActivationModal}
                  className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01] transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Desbloquear RUC, Logo y Quitar Marca de Agua con PRO</span>
                </button>
              </div>
            )}

            {/* Company Logo Uploader (PRO only) */}
            {isPro ? (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Logotipo de tu Empresa en la Boleta (Opcional)</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    PNG / JPG
                  </span>
                </div>

                {companyLogoBase64 ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <img src={companyLogoBase64} alt="Logo" className="w-14 h-10 object-contain rounded bg-white p-0.5 border border-slate-100" />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block">Logo cargado con éxito</span>
                      <span className="text-[10px] text-slate-400">Saldrá impreso en la cabecera de la boleta</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCompanyLogoBase64(null)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-900 cursor-pointer transition-colors text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Subir imagen de Logo corporativo</span>
                    <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleLogoChange} className="hidden" />
                  </label>
                )}
              </div>
            ) : (
              <div 
                onClick={openActivationModal}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Subir Logotipo Corporativo (Exclusivo con PRO)</span>
                </div>
                <span className="font-bold text-amber-600 text-[11px] underline">Desbloquear →</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Razón Social / Nombre Comercial
                </label>
                <input
                  type="text"
                  disabled={!isPro}
                  placeholder={isPro ? "Ej. Servicios Generales Lima S.A.C." : "EMISIÓN DE PRUEBA (REQUIERE PRO)"}
                  value={isPro ? companyName : ''}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-colors ${
                    isPro 
                      ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-[#00875A]' 
                      : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed italic'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  RUC de la Empresa (11 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={11}
                  disabled={!isPro}
                  placeholder={isPro ? "Ej. 20601928371" : "RUC NO REGISTRADO (REQUIERE PRO)"}
                  value={isPro ? companyRuc : ''}
                  onChange={(e) => setCompanyRuc(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-colors ${
                    isPro 
                      ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-[#00875A]' 
                      : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed italic'
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Dirección Fiscal (Opcional)
              </label>
              <input
                type="text"
                disabled={!isPro}
                placeholder={isPro ? "Ej. Av. Javier Prado Este 1420, San Isidro, Lima" : "Dirección Fiscal bloqueada en modo gratuito"}
                value={isPro ? companyAddress : ''}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-colors ${
                  isPro 
                    ? 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-[#00875A]' 
                    : 'bg-slate-100 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed italic'
                }`}
              />
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className={`flex-1 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isPro 
                ? 'bg-[#00875A] hover:bg-[#00704A] text-white shadow-emerald-950/20' 
                : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-950/20'
            }`}
          >
            {isGenerating ? (
              <span>Generando Boleta Legal...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  {isPro
                    ? 'Descargar Boleta Oficial Certificada (PRO S/ 0.00)'
                    : 'Descargar Boleta de Prueba con Marca de Agua (PDF)'}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="sm:w-auto px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{isExportingExcel ? 'Exportando...' : 'Exportar a Excel (.CSV)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
