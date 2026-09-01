'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Share2,
  Store,
  Download,
  Send,
  AlertCircle,
  Plus,
  Trash2,
  Check,
  XCircle,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CALCULATORS_REGISTRY } from '@/features/calculators/registry';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mqpkkwno';

interface SampleItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

const SAMPLE_CATALOG = [
  { id: '1', name: 'Polos Cuello Redondo 24/1 (Docena)', price: 180 },
  { id: '2', name: 'Estampado Serigráfico Frontal (x24)', price: 84 },
  { id: '3', name: 'Bolsas Kraft c/ Logo (x24)', price: 19.2 },
  { id: '4', name: 'Servicio de Delivery Lima Metropolitana', price: 25 },
  { id: '5', name: 'Bordado Computarizado en Pecho (x12)', price: 48 },
];

export default function CotizadorLandingPage() {
  // Form states
  const [heroEmail, setHeroEmail] = useState('');
  const [heroStatus, setHeroStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [bottomEmail, setBottomEmail] = useState('');
  const [bottomStatus, setBottomStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Interactive Live Ticket Simulation State
  const [ticketItems, setTicketItems] = useState<SampleItem[]>([
    { id: '1', name: 'Polos Cuello Redondo 24/1 (Docena)', qty: 2, price: 180 },
    { id: '2', name: 'Estampado Serigráfico Frontal (x24)', qty: 1, price: 84 },
  ]);
  const [includeIgv, setIncludeIgv] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculations
  const subtotal = ticketItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const igv = includeIgv ? subtotal * 0.18 : 0;
  const total = subtotal + igv;

  const addItemToTicket = (catalogItem: typeof SAMPLE_CATALOG[0]) => {
    const existing = ticketItems.find((i) => i.name === catalogItem.name);
    if (existing) {
      setTicketItems(
        ticketItems.map((i) =>
          i.name === catalogItem.name ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setTicketItems([
        ...ticketItems,
        { id: `catalog-${catalogItem.id}`, name: catalogItem.name, qty: 1, price: catalogItem.price },
      ]);
    }
  };

  const removeItem = (id: string) => {
    setTicketItems(ticketItems.filter((i) => i.id !== id));
  };

  const handleCopyWhatsApp = () => {
    const text = `*COTIZACIÓN CONFECCIONES TEXTIL LIMA*\n` +
      ticketItems.map((i) => `• ${i.qty}x ${i.name} - S/ ${(i.qty * i.price).toFixed(2)}`).join('\n') +
      `\n\nSubtotal: S/ ${subtotal.toFixed(2)}` +
      (includeIgv ? `\nIGV (18%): S/ ${igv.toFixed(2)}` : '') +
      `\n*TOTAL: S/ ${total.toFixed(2)}*`;

    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmit = async (
    email: string,
    fuente: 'hero' | 'final',
    setStatus: (s: 'idle' | 'loading' | 'success' | 'error') => void,
    clearInput: () => void
  ) => {
    if (!email || !email.includes('@')) return;
    setStatus('loading');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          fuente,
          fecha: new Date().toISOString(),
          proyecto: 'CalculaPerú Cotizador MVP',
        }),
      });

      if (response.ok) {
        setStatus('success');
        clearInput();
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#E3A62F', '#3E8967', '#ffffff'],
          });
        } catch {}
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1F19] text-slate-100 font-sans selection:bg-[#E3A62F] selection:text-slate-950">
      
      {/* 🌟 Top Announcement Bar with Incentive / FOMO */}
      <div className="bg-[#173228] border-b border-[#254B3E] px-4 py-2.5 text-center text-xs font-semibold text-[#E3A62F] flex flex-wrap items-center justify-center gap-2">
        <Gift className="h-4 w-4 text-[#E3A62F]" />
        <span>
          <strong>BENEFICIO BETA:</strong> Los primeros 100 negocios registrados obtendrán <strong>3 meses de Cuenta PRO Gratis</strong> al lanzar.
        </span>
      </div>

      {/* 🎯 HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#1E3B30]">
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Value Proposition & Form 1 */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 rounded-full bg-[#18362B] px-3.5 py-1 text-xs font-bold text-[#E3A62F] border border-[#2D5B4B]">
                <Store className="h-3.5 w-3.5" />
                <span>NUEVA HERRAMIENTA PARA NEGOCIOS DEL PERÚ</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Cotiza en <span className="text-[#E3A62F]">30 segundos</span>. <br />
                Sin volver a escribir todo.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Deja de perder horas escribiendo precios en WhatsApp o lidiando con Excels en el celular. Guarda tus productos, arma cotizaciones con IGV automático y envíalas en PDF formal a tus clientes.
              </p>

              {/* Form 1 (Hero) */}
              <div className="pt-2 max-w-md mx-auto lg:mx-0">
                {heroStatus === 'success' ? (
                  <div className="rounded-2xl bg-[#1C4234] border border-[#3E8967] p-5 text-left space-y-2 animate-in fade-in shadow-lg">
                    <div className="flex items-center gap-2 text-[#E3A62F] font-bold text-sm">
                      <CheckCircle2 className="h-5 w-5 text-[#3E8967]" />
                      <span>¡Registro confirmado con éxito!</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Tienes tu lugar reservado entre los primeros 100 negocios con beneficio PRO. Te avisaremos en cuanto abramos el acceso beta.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSubmit(heroEmail, 'hero', setHeroStatus, () => setHeroEmail(''));
                    }}
                    className="space-y-3"
                  >
                    <input type="hidden" name="fuente" value="hero" />
                    
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="email"
                        required
                        value={heroEmail}
                        onChange={(e) => setHeroEmail(e.target.value)}
                        placeholder="Ingresa tu correo o WhatsApp..."
                        className="flex-1 rounded-xl border border-[#2B5445] bg-[#142C23] px-4 py-3.5 text-sm font-semibold text-white placeholder:text-slate-400 focus:border-[#E3A62F] focus:ring-2 focus:ring-[#E3A62F]/20 outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={heroStatus === 'loading'}
                        className="rounded-xl bg-[#E3A62F] px-6 py-3.5 text-sm font-black text-slate-950 hover:bg-[#f0b443] transition-all cursor-pointer shadow-lg shadow-[#E3A62F]/15 flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
                      >
                        {heroStatus === 'loading' ? (
                          <span>Registrando...</span>
                        ) : (
                          <>
                            <span>Probar Gratis Primero</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {heroStatus === 'error' && (
                      <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Hubo un error al registrar. Inténtalo de nuevo.
                      </p>
                    )}

                    <div className="flex items-center justify-center lg:justify-start gap-4 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-[#3E8967]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Cupo PRO asegurado
                      </span>
                      <span>•</span>
                      <span>100% Gratuito</span>
                      <span>•</span>
                      <span>Sin spam</span>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* Right Column: INTERACTIVE LIVE DEMO TICKET */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm">
                
                {/* Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#E3A62F]/20 to-[#3E8967]/30 blur-xl opacity-70 pointer-events-none" />

                {/* The Interactive Ticket */}
                <div className="relative rounded-2xl bg-[#FCFAF2] text-slate-900 p-5 sm:p-6 shadow-2xl border border-amber-200/80 font-mono">
                  
                  {/* Interactive Ribbon */}
                  <div className="flex items-center justify-between mb-3 text-[10px] font-sans font-bold">
                    <span className="rounded bg-emerald-100 text-emerald-900 px-2 py-0.5 border border-emerald-300">
                      ⚡ DEMO EN VIVO (Pruébalo)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIncludeIgv(!includeIgv)}
                      className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      {includeIgv ? 'Con IGV 18% [ON]' : 'Sin IGV [OFF]'}
                    </button>
                  </div>

                  {/* Ticket Header */}
                  <div className="text-center border-b-2 border-dashed border-slate-300 pb-3 mb-3">
                    <div className="inline-block rounded bg-slate-900 text-white px-2 py-0.5 text-[9px] font-sans font-black uppercase tracking-wider mb-0.5">
                      PROFORMA N° 00142
                    </div>
                    <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      CONFECCIONES TEXTIL LIMA S.A.C.
                    </div>
                    <div className="text-[10px] text-slate-600 font-sans">
                      RUC: 20601984712 • Gamarra, Lima
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Cliente: Comercializadora San Juan
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 text-xs border-b-2 border-dashed border-slate-300 pb-3 mb-3 min-h-[110px]">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1">
                      <span>Ítem / Cant.</span>
                      <span>Total (S/)</span>
                    </div>

                    {ticketItems.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-xs font-sans">
                        Haz clic en un producto abajo para agregarlo
                      </div>
                    ) : (
                      ticketItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-slate-800 text-[11px] group">
                          <div className="flex items-center gap-1.5 pr-2">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-slate-300 hover:text-rose-600 cursor-pointer"
                              title="Quitar"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            <span className="font-bold text-slate-900">{item.qty}x</span>
                            <span className="truncate max-w-[150px]">{item.name}</span>
                          </div>
                          <span className="font-bold shrink-0">S/ {(item.qty * item.price).toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick Add Product Buttons in Demo */}
                  <div className="mb-3 font-sans">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      + Agregar producto guardado:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {SAMPLE_CATALOG.slice(0, 3).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => addItemToTicket(cat)}
                          className="rounded-md bg-amber-100/80 hover:bg-amber-200 text-amber-950 border border-amber-300/80 px-2 py-0.5 text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-0.5"
                        >
                          <Plus className="h-2.5 w-2.5" />
                          <span>{cat.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-1 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span>Subtotal (Neto):</span>
                      <span className="font-bold">S/ {subtotal.toFixed(2)}</span>
                    </div>
                    {includeIgv && (
                      <div className="flex justify-between text-slate-600">
                        <span>IGV (18% SUNAT):</span>
                        <span>S/ {igv.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-slate-950 pt-1.5 border-t border-slate-300">
                      <span>TOTAL A COBRAR:</span>
                      <span className="text-emerald-800 font-mono">S/ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Quick Action Preview */}
                  <div className="mt-3 pt-2.5 border-t-2 border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans gap-2">
                    <button
                      type="button"
                      onClick={handleCopyWhatsApp}
                      className="w-full sm:flex-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-2 text-center text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>¡Copiado para WhatsApp!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Copiar a WhatsApp</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        import('@/shared/utils/pdfGenerator').then(({ generateOfficialPdf }) => {
                          generateOfficialPdf({
                            title: 'PROFORMA / COTIZACIÓN COMERCIAL',
                            subtitle: 'Documento generado formalmente vía CalculaPerú Cotizador',
                            businessName: 'CONFECCIONES TEXTIL LIMA S.A.C.',
                            businessRuc: '20601984712',
                            businessPhone: '+51 987 654 321',
                            items: [
                              ...ticketItems.map((i) => ({
                                label: `${i.qty}x ${i.name}`,
                                value: `S/ ${(i.qty * i.price).toFixed(2)}`,
                              })),
                              { label: 'Subtotal (Neto)', value: `S/ ${subtotal.toFixed(2)}` },
                              ...(includeIgv ? [{ label: 'IGV (18% SUNAT)', value: `S/ ${igv.toFixed(2)}` }] : []),
                            ],
                            totalLabel: 'Total a Pagar',
                            totalValue: `S/ ${total.toFixed(2)}`,
                            notes: [
                              'Validez de la presente cotización: 15 días calendario.',
                              'Condiciones de pago: 50% de adelanto al confirmar y 50% contra entrega.',
                              'Precios expresados en Soles Peruanos (PEN).',
                            ],
                          });
                        });
                      }}
                      className="w-full sm:flex-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-2 px-2 text-center text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Descargar PDF</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ⚔️ VISUAL COMPARISON: "ANTES VS DESPUÉS" */}
      <section className="py-16 sm:py-24 bg-[#0A1713] border-b border-[#1E3B30]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E3A62F] bg-[#1C3B2F] px-3 py-1 rounded-full border border-[#2B5445]">
              LA DIFERENCIA ANTE TUS CLIENTES
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-3">
              ¿Cómo te ven tus clientes hoy vs. con CalculaPerú?
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Una cotización limpia y ordenada cierra hasta 3 veces más ventas que un texto desordenado:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* ANTES (WhatsApp Desordenado) */}
            <div className="rounded-3xl border border-rose-900/40 bg-[#161214] p-6 sm:p-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 px-3 py-1 rounded-md border border-rose-800/60">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>ANTES: El método tradicional</span>
                </div>
                <h3 className="text-lg font-bold text-white">Texto informal y cálculos al ojo</h3>
                
                {/* Fake WhatsApp Bubble */}
                <div className="rounded-2xl bg-[#0f241d] border border-[#1d4638] p-4 text-xs text-slate-200 font-sans space-y-2">
                  <div className="text-slate-400 text-[10px]">Tú (11:42 AM):</div>
                  <p className="leading-relaxed">
                    Hola amigo buenos días, mira son 2 docenas de polos a 180 c/u, los estampados serían 84 soles y las bolsas 19.20... creo que con el IGV te saldría como 546 soles masomenos te paso mi BCP... ✍️
                  </p>
                </div>

                <ul className="text-xs text-rose-300 space-y-1.5 pt-2">
                  <li>❌ Se ve informal y genera desconfianza en clientes medianos o corporativos.</li>
                  <li>❌ Si el cliente te pide factura, te toca recalcular todo a mano.</li>
                  <li>❌ No tienes ningún registro ni historial de cuánto cotizaste.</li>
                </ul>
              </div>
            </div>

            {/* DESPUÉS (Cotización Pro en PDF) */}
            <div className="rounded-3xl border-2 border-[#3E8967] bg-[#12261F] p-6 sm:p-8 space-y-4 flex flex-col justify-between shadow-xl shadow-[#3E8967]/10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E3A62F] bg-[#1C3B2F] px-3 py-1 rounded-md border border-[#2B5445]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#3E8967]" />
                  <span>CON CALCULAPERÚ: Proforma en 30 Segundos</span>
                </div>
                <h3 className="text-lg font-bold text-white">PDF formal y resumen listo con 1 clic</h3>

                {/* Clean Summary Card */}
                <div className="rounded-2xl bg-[#18382C] border border-[#2E614D] p-4 text-xs text-slate-100 font-sans space-y-2">
                  <div className="flex items-center justify-between border-b border-[#285744] pb-2">
                    <span className="font-bold text-white">COTIZACIÓN N° 00142</span>
                    <span className="text-[10px] text-[#E3A62F] font-bold">Total: S/ 546.56</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    ✅ 3 Ítems detallados • RUC y Razón Social • IGV (18%) desglosado • Válido por 15 días
                  </div>
                </div>

                <ul className="text-xs text-emerald-300 space-y-1.5 pt-2">
                  <li>✔ Apariencia 100% profesional que te posiciona como un negocio formal.</li>
                  <li>✔ Cálculo automático de IGV y descuentos en Soles sin equivocaciones.</li>
                  <li>✔ Tus productos quedan guardados para usarlos en futuras cotizaciones.</li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 🏢 NICHOS PERUANOS: "¿Para quién es?" */}
      <section className="py-16 sm:py-24 bg-[#0E1F19] border-b border-[#1E3B30]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3E8967] bg-[#16382B] px-3 py-1 rounded-full border border-[#285744]">
              RUBROS EN EL PERÚ
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-3">
              Hecho para los negocios que mueven el país
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#234B3C] bg-[#12261F] p-5 text-center space-y-2">
              <div className="h-10 w-10 rounded-xl bg-amber-950/60 text-[#E3A62F] mx-auto flex items-center justify-center font-bold">
                👕
              </div>
              <div className="font-bold text-sm text-white">Confección & Textil</div>
              <p className="text-[11px] text-slate-400">Gamarra, polos, uniformes y merchandising</p>
            </div>

            <div className="rounded-2xl border border-[#234B3C] bg-[#12261F] p-5 text-center space-y-2">
              <div className="h-10 w-10 rounded-xl bg-blue-950/60 text-blue-400 mx-auto flex items-center justify-center font-bold">
                🔧
              </div>
              <div className="font-bold text-sm text-white">Servicios Técnicos</div>
              <p className="text-[11px] text-slate-400">Instalaciones, mantenimiento y carpintería</p>
            </div>

            <div className="rounded-2xl border border-[#234B3C] bg-[#12261F] p-5 text-center space-y-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-950/60 text-emerald-400 mx-auto flex items-center justify-center font-bold">
                🎂
              </div>
              <div className="font-bold text-sm text-white">Catering & Pastelería</div>
              <p className="text-[11px] text-slate-400">Tortas, bocaditos, menús y eventos</p>
            </div>

            <div className="rounded-2xl border border-[#234B3C] bg-[#12261F] p-5 text-center space-y-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-950/60 text-indigo-400 mx-auto flex items-center justify-center font-bold">
                📦
              </div>
              <div className="font-bold text-sm text-white">Ferreterías & Imprentas</div>
              <p className="text-[11px] text-slate-400">Insumos, papelería, gigantografías y más</p>
            </div>
          </div>

        </div>
      </section>

      {/* 📩 FORM 2 (Cierre / Final) */}
      <section className="py-16 sm:py-24 bg-[#0A1713]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-8">
          
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18362B] px-3.5 py-1 text-xs font-bold text-[#E3A62F] border border-[#2D5B4B]">
              <Gift className="h-3.5 w-3.5 text-[#E3A62F]" />
              <span>3 MESES PRO GRATIS PARA LOS PRIMEROS 100</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Asegura tu cupo antes del lanzamiento oficial
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
              Deja tu correo o WhatsApp para avisarte en cuanto habilitemos el acceso privado y reclamar tus 3 meses de cuenta PRO gratis.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {bottomStatus === 'success' ? (
              <div className="rounded-2xl bg-[#1C4234] border border-[#3E8967] p-6 text-left space-y-2 animate-in fade-in shadow-xl">
                <div className="flex items-center gap-2 text-[#E3A62F] font-bold text-base">
                  <CheckCircle2 className="h-5 w-5 text-[#3E8967]" />
                  <span>¡Cupo Beta PRO Reservado!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Te avisaremos directamente a tu correo cuando esté listo. ¡Gracias por confiar en CalculaPerú!
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(bottomEmail, 'final', setBottomStatus, () => setBottomEmail(''));
                }}
                className="space-y-3"
              >
                <input type="hidden" name="fuente" value="final" />

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    required
                    value={bottomEmail}
                    onChange={(e) => setBottomEmail(e.target.value)}
                    placeholder="Escribe tu correo electrónico..."
                    className="flex-1 rounded-xl border border-[#2B5445] bg-[#142C23] px-4 py-3.5 text-sm font-semibold text-white placeholder:text-slate-400 focus:border-[#E3A62F] focus:ring-2 focus:ring-[#E3A62F]/20 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={bottomStatus === 'loading'}
                    className="rounded-xl bg-[#E3A62F] px-6 py-3.5 text-sm font-black text-slate-950 hover:bg-[#f0b443] transition-all cursor-pointer shadow-lg shadow-[#E3A62F]/15 flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
                  >
                    {bottomStatus === 'loading' ? (
                      <span>Guardando...</span>
                    ) : (
                      <>
                        <span>Quiero Acceso PRO</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {bottomStatus === 'error' && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Hubo un problema al conectar. Inténtalo de nuevo.
                  </p>
                )}

                <p className="text-[11px] text-slate-400">
                  Cero spam. Solo te escribiremos para darte tu acceso exclusivo.
                </p>
              </form>
            )}
          </div>

          <div className="pt-8 border-t border-[#1C3B2F] flex items-center justify-center gap-3 text-xs text-slate-400">
            <Link href="/" className="text-[#E3A62F] hover:underline font-bold">
              ← Volver al Portal de {CALCULATORS_REGISTRY.length} Calculadoras
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
