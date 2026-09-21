'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  Sparkles,
  Check,
  Copy,
  Download,
  QrCode,
  Tag,
  Clock,
  Building2,
  User,
  FileSpreadsheet,
} from 'lucide-react';
import {
  generateOfficialSettlementPdf,
  type OfficialSettlementPdfOptions,
} from '@/shared/utils/pdfGenerator';
import { exportToCsv } from '@/shared/utils/exportExcel';
import { formatCurrency } from '@/core/math/formatters';
import { usePro } from '@/features/premium/context/ProContext';
import { useModalAnimation } from '@/shared/hooks/useModalAnimation';

interface SettlementReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationData: Omit<
    OfficialSettlementPdfOptions,
    'workerName' | 'workerDni' | 'workerPosition' | 'companyName' | 'companyRuc'
  >;
}

export function SettlementReportModal({
  isOpen,
  onClose,
  calculationData,
}: SettlementReportModalProps) {
  const { shouldRender, backdropClass, modalClass } = useModalAnimation(isOpen);

  // Document customization fields

  const [workerName, setWorkerName] = useState('');
  const [workerDni, setWorkerDni] = useState('');
  const [workerPosition, setWorkerPosition] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyRuc, setCompanyRuc] = useState('');

  // Payment state
  const { isPro, subscriberName, openActivationModal } = usePro();
  const [operationCode, setOperationCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [step, setStep] = useState<'details' | 'payment'>('details');

  if (!isOpen) return null;

  const yapeNumber = '913 544 715';
  const yapeHolder = 'Jonathan Rujel';
  const originalPrice = 19.90;
  const currentPrice = isPro || isCouponApplied ? 0.00 : 9.90;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('913544715');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCoupon = couponCode.trim().toUpperCase();
    if (cleanCoupon === 'PROMO' || cleanCoupon === 'CALCULA100' || cleanCoupon === 'DEMO') {
      setIsCouponApplied(true);
    } else {
      alert('Cupón no válido o expirado.');
    }
  };

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      generateOfficialSettlementPdf({
        ...calculationData,
        workerName: workerName.trim() || undefined,
        workerDni: workerDni.trim() || undefined,
        workerPosition: workerPosition.trim() || undefined,
        companyName: companyName.trim() || undefined,
        companyRuc: companyRuc.trim() || undefined,
      });

      try {
        import('canvas-confetti').then((m) => {
          const fire = m.default || m;
          fire({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        });
      } catch {
        // confetti optional
      }

      setTimeout(() => {
        setIsGenerating(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error generando liquidación:', err);
      setIsGenerating(false);
    }
  };

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    try {
      const columns = [
        { header: 'Concepto', key: 'concepto' },
        { header: 'Base Legal', key: 'ley' },
        { header: 'Periodo / Cómputo', key: 'periodo' },
        { header: 'Importe (PEN)', key: 'monto' },
      ];

      const rows = [
        { concepto: 'Sueldo Básico', ley: 'D.L. 728', periodo: 'Mensual', monto: calculationData.baseSalary },
        { concepto: 'Asignación Familiar', ley: 'Ley 25129', periodo: 'Mensual', monto: calculationData.familyAllowance },
        { concepto: 'CTS Trunca', ley: 'D.S. 001-97-TR', periodo: `${calculationData.ctsMonths} meses`, monto: calculationData.ctsTrunca },
        { concepto: 'Gratificación Trunca', ley: 'Ley 27735', periodo: `${calculationData.gratiMonths} meses`, monto: calculationData.gratiTrunca },
        { concepto: `Bonificación Extraordinaria (${calculationData.isEps ? '6.75% EPS' : '9% EsSalud'})`, ley: 'Ley 30334', periodo: 'Semestre cese', monto: calculationData.bonoEsSalud },
        { concepto: 'Vacaciones Truncas', ley: 'D.L. 713', periodo: `${calculationData.vacacionesMonths} meses`, monto: calculationData.vacacionesTruncas },
        ...(calculationData.despidoIndemnizacion ? [{ concepto: 'Indemnización Despido Arbitrario', ley: 'D.L. 728 Art. 38', periodo: '1.5 sueldos/año', monto: calculationData.despidoIndemnizacion }] : []),
        { concepto: 'TOTAL LIQUIDACIÓN A PERCIBIR', ley: 'MTPE', periodo: 'Neto a liquidar', monto: calculationData.totalSettlement },
      ];

      exportToCsv(`Liquidacion_${(workerName || 'Oficial').replace(/\s+/g, '_')}`, columns, rows);
    } catch (err) {
      console.error('Error exportando Excel:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs ${backdropClass}`}
    >
      <div className={`relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden ${modalClass}`}>

        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#00875A] dark:text-[#00C853]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Liquidación Oficial Certificada (PDF)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Formato legal formal listo para presentar a RRHH o SUNAFIL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Tabs header */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
            <button
              type="button"
              onClick={() => setStep('details')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                step === 'details'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              1. Datos del Documento (Opcional)
            </button>
            <button
              type="button"
              onClick={() => setStep('payment')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                step === 'payment'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              2. Obtener Documento
            </button>
          </div>

          {step === 'details' ? (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5" />
                <p className="text-emerald-900 dark:text-emerald-300 text-[11px] leading-relaxed">
                  Puedes ingresar tus nombres o los de la empresa para que aparezcan en el membrete y las casillas de firma. Si prefieres no colocarlos, el documento se emitirá en blanco para rellenar a mano.
                </p>
              </div>

              {/* Worker inputs */}
              <div className="space-y-3">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-[#00875A]" />
                  <span>Datos del Trabajador</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Nombre completo del colaborador
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Carlos Alberto Mendoza"
                      value={workerName}
                      onChange={(e) => setWorkerName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Número de DNI
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      placeholder="Ej. 74829103"
                      value={workerDni}
                      onChange={(e) => setWorkerDni(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                    Cargo o Puesto de trabajo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Asistente Administrativo / Operario"
                    value={workerPosition}
                    onChange={(e) => setWorkerPosition(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                  />
                </div>
              </div>

              {/* Company inputs */}
              <div className="space-y-3 pt-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Datos de la Empresa / Empleador</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      Razón Social o Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Corporación Perú S.A.C."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                      RUC de la Empresa (11 dígitos)
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="Ej. 20601234567"
                      value={companyRuc}
                      onChange={(e) => setCompanyRuc(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#00875A]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="w-full py-3 rounded-xl bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Continuar al Pago y Descarga</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ) : (
            /* Step 2: Payment & Download */
            <div className="space-y-4">
              
              {/* Document Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Total Liquidación calculada:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    {formatCurrency(calculationData.totalSettlement)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Precio del Informe Oficial PDF:</span>
                  <div className="flex items-center gap-2">
                    {!isCouponApplied && (
                      <span className="line-through text-slate-400 text-[11px]">S/ {originalPrice.toFixed(2)}</span>
                    )}
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {currentPrice === 0 ? '¡GRATIS CON CUPÓN!' : `S/ ${currentPrice.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* PRO Active Banner vs Yape Payment Box */}
              {isPro ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/50 text-emerald-900 dark:text-emerald-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Membresía PRO Activa ({subscriberName || 'VIP'})</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-bold text-[10px]">
                      S/ 0.00 ILIMITADO
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    Como usuario de <strong>CalculaPerú PRO</strong>, tu liquidación oficial certificada bajo D.L. 728 y la exportación a Excel están totalmente incluidas sin cobros adicionales.
                  </p>
                </div>
              ) : (
                <>
                  {/* Yape / Plin Box */}
                  {!isCouponApplied && (
                    <div className="p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                            Y
                          </div>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white text-xs block">
                              Paga S/ 9.90 con Yape o Plin
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              Titular: <strong>{yapeHolder}</strong>
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold text-[10px]">
                          0% comisión
                        </span>
                      </div>

                      {/* Phone Pill */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800">
                        <div className="font-mono text-xs font-bold text-purple-900 dark:text-purple-300">
                          📱 {yapeNumber}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPhone}
                          className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-[10px] flex items-center gap-1 hover:bg-purple-200 transition-colors"
                        >
                          {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPhone ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-semibold">
                          Ingresa tu número de celular o código de operación de Yape:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. 912345678 / Op: 482910"
                          value={operationCode}
                          onChange={(e) => setOperationCode(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Coupon form + Link to PRO activation */}
                  {!isCouponApplied && (
                    <div className="space-y-2">
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            placeholder="¿Tienes cupón? (Prueba: PROMO)"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none text-xs"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors cursor-pointer text-xs"
                        >
                          Aplicar
                        </button>
                      </form>

                      <button
                        type="button"
                        onClick={openActivationModal}
                        className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>¿Ya tienes suscripción PRO? Activar aquí con tu código</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* What is included */}
              <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00875A]" />
                  <span>Citación expresa de D.L. 728, D.S. 001-97-TR, Ley 27735 y D.L. 713.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Cláusula legal del plazo perentorio de 48 horas bajo apercibimiento de SUNAFIL.</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span>Recuadros de firma formal para Empleador y Trabajador.</span>
                </div>
              </div>

              {/* Final action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGenerating}
                  className="flex-1 py-3.5 rounded-xl bg-[#00875A] hover:bg-[#00704A] disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10"
                >
                  {isGenerating ? (
                    <span>Generando Liquidación Certificada...</span>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>
                        {isCouponApplied
                          ? 'Descargar Liquidación Oficial (PDF)'
                          : 'Confirmar y Descargar (PDF)'}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={isExportingExcel}
                  className="px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{isExportingExcel ? 'Exportando...' : 'Excel (.CSV)'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
