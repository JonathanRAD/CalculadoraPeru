'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, Volume2, VolumeX, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

interface ReceiptPrinterProps {
  initialPlan?: 'yearly' | 'monthly';
  onCheckoutClick?: (plan: 'yearly' | 'monthly') => void;
  className?: string;
}

export default function ReceiptPrinter({
  initialPlan = 'yearly',
  onCheckoutClick,
  className = '',
}: ReceiptPrinterProps) {
  const [plan] = useState<'yearly' | 'monthly'>(initialPlan);
  const [status, setStatus] = useState<'idle' | 'printing' | 'printed'>('printing');
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Financial calculations
  const totalAmount = plan === 'yearly' ? 149.00 : 16.00;
  const subtotal = Number((totalAmount / 1.18).toFixed(2));
  const tax = Number((totalAmount - subtotal).toFixed(2));

  // Formatted date matching reference: "11 AUG 2026 - 14:32"
  const [formattedDate] = useState(() => {
    const now = new Date();
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];
    const d = String(now.getDate()).padStart(2, '0');
    const m = months[now.getMonth()];
    const y = now.getFullYear();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${d} ${m} ${y} - ${hrs}:${mins}`;
  });

  // Web Audio POS Thermal Printer Sound Synthesis
  const playPrinterClick = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2600;
      filter.Q.value = 3.5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
    } catch {
      // Audio not supported or blocked
    }
  };

  const playPrinterClickRef = useRef(playPrinterClick);
  useEffect(() => {
    playPrinterClickRef.current = playPrinterClick;
  });

  // Printing Animation
  useEffect(() => {
    if (status !== 'printing') return;

    let current = 0;
    const interval = setInterval(() => {
      current += 2.2;
      if (soundEnabled && Math.random() > 0.45) {
        playPrinterClickRef.current();
      }

      if (current >= 100) {
        current = 100;
        setProgress(100);
        setStatus('printed');
        clearInterval(interval);
      } else {
        setProgress(current);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [status, soundEnabled]);

  const handleReprint = () => {
    setProgress(0);
    setStatus('printing');
  };

  return (
    // FIXED RESERVED HEIGHT CONTAINER: Prevents any layout shift while receipt descends!
    <div className={`relative w-full max-w-[340px] sm:max-w-[370px] h-[630px] sm:h-[640px] flex flex-col items-center select-none ${className}`}>
      
      {/* ============================================================ */}
      {/* HARDWARE CASING (Exact Match to Video Reference) */}
      {/* ============================================================ */}
      <div className="relative z-30 w-full bg-[#242629] dark:bg-[#1E2023] text-white rounded-[24px] p-5 shadow-2xl shadow-black/80 border border-neutral-700/60 transition-all">
        
        {/* Top Header: Spark Square Button + Home Pill Button */}
        <div className="flex items-center justify-between pb-4">
          {/* Left: Square Button with 4-point Star Logo */}
          <div className="w-8 h-8 rounded-lg bg-[#303338] border border-neutral-600/60 flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4 text-neutral-300 fill-current" viewBox="0 0 24 24">
              <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
            </svg>
          </div>

          {/* Right: Pill Button matching "🏠 Home" */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
              className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#303338] hover:bg-[#383C42] border border-neutral-600/50 text-neutral-200 hover:text-white text-xs font-semibold transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
          </div>
        </div>

        {/* Info Row: "CalculaPerú PRO" + plan details + total */}
        <div className="flex items-start justify-between pt-2 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight leading-tight">
              CalculaPerú PRO
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5 font-normal">
              {plan === 'yearly' ? 'Plan Anual · 12 meses (S/ 12.42/mes)' : 'Plan Mensual · 30 días (S/ 16.00/mes)'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-neutral-400 font-normal block">
              Total
            </span>
            <span className="text-lg font-bold text-white tracking-tight font-sans">
              S/ {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Status Row: Loader circle + "Printing your receipt" */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {status === 'printing' ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-500 border-t-white animate-spin" />
                <span className="text-xs text-neutral-300 font-normal">
                  Printing your receipt
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-300 font-normal">
                  Receipt ready
                </span>
              </>
            )}
          </div>

          {status === 'printed' && (
            <button
              type="button"
              onClick={handleReprint}
              className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reprint</span>
            </button>
          )}
        </div>

        {/* Recessed Slit (Paper Aperture) */}
        <div className="mt-4">
          <div className="h-2.5 w-full bg-[#111214] rounded-full shadow-[inset_0_3px_4px_rgba(0,0,0,0.95)] border-t border-neutral-700/50" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* THERMAL RECEIPT PAPER (Exact Replica from Video Screenshot) */}
      {/* ============================================================ */}
      <div 
        className="absolute top-[175px] z-20 w-[84%] sm:w-[86%] overflow-hidden flex flex-col items-center pointer-events-auto"
        style={{
          maxHeight: `${(progress / 100) * 410}px`,
          transition: 'max-height 0.04s linear',
        }}
      >
        {/* Paper Sheet */}
        <div className="w-full bg-[#EAEAE6] text-[#282A2E] px-5 pt-7 pb-4 shadow-xl shadow-black/20 font-mono text-[11px] leading-relaxed space-y-3">
          
          {/* Top Demo Badge */}
          <div className="text-[9px] uppercase tracking-widest text-amber-900 bg-amber-200/90 border border-amber-300 rounded px-1.5 py-0.5 text-center font-bold">
            MUESTRA ILUSTRATIVA · DEMO
          </div>

          {/* Top Logo: Dark rounded square with 4-point star in negative space */}
          <div className="flex justify-center pt-1 pb-1">
            <div className="w-10 h-10 rounded-md bg-[#242629] flex items-center justify-center shadow-xs">
              <svg className="w-5 h-5 text-[#EAEAE6] fill-current" viewBox="0 0 24 24">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>
          </div>

          {/* Line Item: PRO PLAN */}
          <div className="space-y-0.5">
            <div className="flex justify-between items-baseline font-bold tracking-wider text-neutral-900 text-xs">
              <span>CALCULAPERÚ PRO</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-neutral-600">
              {plan === 'yearly' ? 'Plan Anual (12 meses · S/ 12.42/mes)' : 'Plan Mensual (30 días · S/ 16.00/mes)'}
            </div>
          </div>

          {/* Dotted Divider */}
          <div className="border-b border-dotted border-neutral-400/80 my-1" />

          {/* Subtotal, Tax, TOTAL PAID */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-neutral-700">
              <span>Subtotal</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-700">
              <span>IGV (18%)</span>
              <span>S/ {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-neutral-950 text-xs pt-1">
              <span>IMPORTE PLAN</span>
              <span>S/ {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Dotted Divider */}
          <div className="border-b border-dotted border-neutral-400/80 my-1" />

          {/* Order, Paid with, Date */}
          <div className="space-y-0.5 text-[10px] text-neutral-700">
            <div className="flex justify-between">
              <span>Tipo</span>
              <span>Ejemplo Referencial</span>
            </div>
            <div className="flex justify-between">
              <span>Método</span>
              <span>Yape / Plin / Transf.</span>
            </div>
            <div className="flex justify-between">
              <span>Fecha</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* SVG Barcode & Number */}
          <div className="pt-2 pb-1 flex flex-col items-center space-y-1">
            <svg className="w-40 h-8" viewBox="0 0 160 32" preserveAspectRatio="none">
              <rect x="0" y="0" width="2.5" height="28" fill="#242629" />
              <rect x="4" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="7.5" y="0" width="3.5" height="28" fill="#242629" />
              <rect x="13" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="16.5" y="0" width="5" height="28" fill="#242629" />
              <rect x="23.5" y="0" width="2.5" height="28" fill="#242629" />
              <rect x="28" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="31" y="0" width="3.5" height="28" fill="#242629" />
              <rect x="37" y="0" width="2.5" height="28" fill="#242629" />
              <rect x="42" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="45.5" y="0" width="3.5" height="28" fill="#242629" />
              <rect x="51" y="0" width="2.5" height="28" fill="#242629" />
              <rect x="56" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="59.5" y="0" width="5" height="28" fill="#242629" />
              <rect x="66.5" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="70" y="0" width="3.5" height="28" fill="#242629" />
              <rect x="76" y="0" width="2.5" height="28" fill="#242629" />
              <rect x="81" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="84.5" y="0" width="5" height="28" fill="#242629" />
              <rect x="91.5" y="0" width="2.5" height="28" fill="#242629" />
              <rect x="96" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="99" y="0" width="3.5" height="28" fill="#242629" />
              <rect x="105" y="0" width="2.5" height="28" fill="#242629" />
              <rect x="110" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="113.5" y="0" width="3.5" height="28" fill="#242629" />
              <rect x="119" y="0" width="2.5" height="28" fill="#242629" />
              <rect x="124.5" y="0" width="5" height="28" fill="#242629" />
              <rect x="131.5" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="135" y="0" width="2.5" height="28" fill="#242629" />
              <rect x="140" y="0" width="3.5" height="28" fill="#242629" />
              <rect x="146" y="0" width="1.2" height="28" fill="#242629" />
              <rect x="149.5" y="0" width="5" height="28" fill="#242629" />
              <rect x="156" y="0" width="2.5" height="28" fill="#242629" />
            </svg>
            <span className="text-[10px] tracking-[0.2em] text-neutral-700 font-mono">
              083 2843
            </span>
          </div>

        </div>

        {/* Perforated Sawtooth (Zigzag) Bottom Cut */}
        <div className="w-full -mt-[1px] leading-none text-[#EAEAE6]">
          <svg 
            className="w-full h-2.5 fill-current" 
            viewBox="0 0 100 8" 
            preserveAspectRatio="none"
          >
            <polygon points="
              0,0 2,8 4,0 6,8 8,0 10,8 12,0 14,8 16,0 18,8 20,0 22,8 24,0 26,8 28,0 30,8 
              32,0 34,8 36,0 38,8 40,0 42,8 44,0 46,8 48,0 50,8 52,0 54,8 56,0 58,8 60,0 
              62,8 64,0 66,8 68,0 70,8 72,0 74,8 76,0 78,8 80,0 82,8 84,0 86,8 88,0 90,8 
              92,0 94,8 96,0 98,8 100,0
            " />
          </svg>
        </div>

      </div>

      {/* Action Button: Pinned to bottom of the fixed container so it never causes layout shift */}
      <div className="absolute bottom-3 sm:bottom-4 z-30 w-[84%] sm:w-[86%]">
        {status === 'printed' && (
          <button
            type="button"
            onClick={() => onCheckoutClick && onCheckoutClick(plan)}
            className="w-full py-2.5 px-4 bg-[#00875A] hover:bg-[#00704A] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20 transition-all hover:scale-[1.01] cursor-pointer animate-in fade-in duration-200"
          >
            <span>
              {plan === 'yearly'
                ? 'Activar Plan Anual (S/ 149 · S/ 12.42/mes)'
                : 'Activar Plan Mensual (S/ 16 / mes)'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}
