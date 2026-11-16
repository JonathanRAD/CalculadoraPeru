'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  Boxes,
  Calculator,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Smartphone,
  Workflow,
  X,
} from 'lucide-react';
import { CONSENT_STORAGE_KEY } from '@/shared/lib/cookie-consent';
import {
  OPEN_EVENT,
  PROMPT_STORAGE_KEY,
  afterDismiss,
  readMemory,
  shouldShowPrompt,
} from './prompt-rules';

const WHATSAPP_NUMBER = '51913544715';
const WHATSAPP_TEXT = 'Hola, vi CalculaPerú y me interesa que desarrollen un sistema a medida para mi negocio.';

const EXAMPLES = [
  {
    icon: FileText,
    title: 'Cotizadores y proformas',
    text: 'Cotizaciones con tu logo, IGV, descuentos y PDF listo para enviar por WhatsApp. Ya existe una versión base: el Cotizador PRO de CalculaPerú.',
  },
  {
    icon: Calculator,
    title: 'Calculadoras y simuladores de tu rubro',
    text: 'Precios, comisiones, costos o planillas con las reglas de tu negocio, como las calculadoras de este sitio pero con tus fórmulas.',
  },
  {
    icon: LayoutDashboard,
    title: 'Paneles de control',
    text: 'Tus ventas, gastos y metas en un solo lugar, en vez de varias hojas de Excel que hay que juntar a mano.',
  },
  {
    icon: Boxes,
    title: 'Inventario, pedidos y clientes',
    text: 'Control de stock, seguimiento de pedidos y directorio de clientes, accesibles desde el celular.',
  },
  {
    icon: Workflow,
    title: 'Automatización de tareas repetitivas',
    text: 'Formularios, reportes en PDF o Excel y envíos por correo o WhatsApp para dejar de copiar y pegar datos.',
  },
  {
    icon: Smartphone,
    title: 'Aplicaciones web para celular',
    text: 'Herramientas que se abren desde el navegador, se pueden instalar como app y no requieren programas en tu computadora.',
  },
];

const CASE_STUDY = {
  label: 'Un proyecto propio',
  title: 'Plataforma de despacho para servicios técnicos a domicilio',
  text: 'Desarrollada como proyecto de tesis de Ingeniería de Sistemas para una empresa multiservicios de Lima: la central recibe las solicitudes, asigna al técnico adecuado según especialidad y cercanía, y el cliente sigue el servicio en tiempo real.',
  points: [
    'App móvil para clientes y técnicos, con mapa, chat y fotos de evidencia.',
    'Panel web de despacho con seguimiento en vivo y semáforo de tiempos de atención.',
    'Validación del inicio del servicio con PIN de seguridad y certificados de garantía con código QR verificable.',
    'Reportes de tiempos listos para exportar a Excel y SPSS.',
  ],
  tags: ['React Native', 'React', 'TypeScript', 'Firebase'],
  status: 'Estado: validado con pruebas automáticas y de punta a punta, listo para un piloto controlado.',
};

const STEPS = [
  { title: 'Me cuentas qué haces hoy', text: 'En Excel, papel o WhatsApp. No hace falta que sepas de tecnología.' },
  { title: 'Te envío una propuesta', text: 'Con el alcance, el plazo y el precio, antes de empezar y sin compromiso.' },
  { title: 'Pruebas un primer avance', text: 'Validamos juntos lo esencial antes de seguir con el resto.' },
  { title: 'Entrega y acompañamiento', text: 'Te lo dejo funcionando y te explico cómo usarlo.' },
];

export function CustomSystemsPrompt() {
  const pathname = usePathname() || '/';
  const [promptVisible, setPromptVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const startedAt = useRef<number>(0);

  const saveMemory = useCallback((memory: object) => {
    try {
      localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(memory));
    } catch {}
  }, []);

  // Evalúa periódicamente si corresponde mostrar el aviso (unos segundos en el sitio y cookies resueltas).
  useEffect(() => {
    startedAt.current = startedAt.current || Date.now();
    const interval = window.setInterval(() => {
      let consentChosen = false;
      let memoryRaw: string | null = null;
      try {
        consentChosen = Boolean(localStorage.getItem(CONSENT_STORAGE_KEY));
        memoryRaw = localStorage.getItem(PROMPT_STORAGE_KEY);
      } catch {}

      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      const show = shouldShowPrompt({
        now: Date.now(),
        pathname,
        secondsOnSite: (Date.now() - startedAt.current) / 1000,
        consentChosen,
        reducedDataRequested: Boolean(connection?.saveData),
        memory: readMemory(memoryRaw),
      });

      setPromptVisible((current) => (current === show ? current : show));
    }, 1500);
    return () => window.clearInterval(interval);
  }, [pathname]);

  // Permite abrir el detalle desde otros lugares (por ejemplo, el pie de página).
  useEffect(() => {
    const open = () => setModalOpen(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  // El elemento <dialog> nativo gestiona el foco, la tecla Esc y el fondo inactivo.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modalOpen && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    }
    if (!modalOpen && dialog.open) {
      dialog.close();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const dismiss = () => {
    saveMemory(afterDismiss(Date.now()));
    setPromptVisible(false);
  };

  const openDetails = () => {
    setModalOpen(true);
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;

  return (
    <>
      {promptVisible && !modalOpen && (
        <aside
          aria-label="Sistemas a medida"
          className="fixed bottom-3 left-3 z-40 w-[min(20rem,calc(100vw-1.5rem))] animate-in fade-in slide-in-bg-bottom-3 duration-500 motion-reduce:animate-none"
        >
          <div className="rounded-lg border border-brand-200 bg-white p-3.5 text-[13px] shadow-lg dark:border-brand-900/60 dark:bg-[#18202A]">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 dark:text-white">¿Tu negocio aún trabaja con Excel o papel?</p>
                <p className="mt-0.5 hidden leading-relaxed text-slate-600 dark:text-slate-300 sm:block">
                  Desarrollo sistemas web a medida: cotizadores, paneles, inventarios y más.
                </p>
                <button
                  type="button"
                  onClick={openDetails}
                  className="mt-1 inline-flex cursor-pointer items-center gap-1 font-bold text-brand-800 sm:mt-2 hover:underline dark:text-brand-400"
                >
                  Ver ejemplos <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Cerrar aviso de sistemas a medida"
                className="-mr-1 -mt-1 cursor-pointer rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="custom-systems-title"
        onClose={() => setModalOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setModalOpen(false);
        }}
        className="m-auto max-h-[90vh] w-[min(44rem,calc(100vw-1.5rem))] overflow-y-auto rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-lg backdrop:bg-slate-950/70 dark:border-slate-700 dark:bg-[#18202A] dark:text-slate-100"
      >
        {modalOpen && (
          <div className="p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[13px] font-bold text-brand-700 dark:text-brand-400">Sistemas a medida</span>
                <h2 id="custom-systems-title" className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                  Herramientas hechas para cómo trabaja tu negocio
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
                className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-3 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
              Además de las calculadoras, desarrollo sistemas web a la medida de MYPES, profesionales y equipos en Perú. Si hoy llevas algo en Excel, papel o chats de WhatsApp y te quita tiempo o genera errores, probablemente se puede ordenar y automatizar.
            </p>

            <h3 className="mt-6 text-[15px] font-bold">Ejemplos de lo que se puede construir</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {EXAMPLES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-lg border border-slate-200 p-3.5 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-[15px] font-bold">
                    <Icon className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                    {title}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">
              Son tipos de sistemas posibles, no una lista cerrada: cada proyecto se define según tu caso.
            </p>

            <section aria-label={CASE_STUDY.title} className="mt-6 rounded-lg border border-brand-200 bg-brand-50/60 p-4 dark:border-brand-900/60 dark:bg-brand-950/30">
              <span className="text-[13px] font-bold text-brand-700 dark:text-brand-400">{CASE_STUDY.label}</span>
              <h3 className="mt-1 text-[15px] font-bold">{CASE_STUDY.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{CASE_STUDY.text}</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[13px] text-slate-700 dark:text-slate-200">
                {CASE_STUDY.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {CASE_STUDY.tags.map((tag) => (
                  <span key={tag} className="rounded border border-brand-300 px-2 py-0.5 text-[13px] font-bold text-brand-800 dark:border-brand-800 dark:text-brand-300">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">{CASE_STUDY.status}</p>
            </section>

            <h3 className="mt-6 text-[15px] font-bold">Cómo trabajamos</h3>
            <ol className="mt-3 space-y-2.5">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3 text-[13px]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-700 text-[13px] font-bold text-white">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-bold text-slate-900 dark:text-white">{step.title}</span>
                    <span className="text-slate-600 dark:text-slate-300">{step.text}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contacto?motivo=sistema_a_medida"
                onClick={() => setModalOpen(false)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-brand-700 px-4 py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-800"
              >
                Contarme mi idea <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded border border-slate-300 px-4 py-3 text-[15px] font-bold transition-colors hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Escribir por WhatsApp
              </a>
            </div>
            <p className="mt-3 text-center text-[13px] text-slate-500 dark:text-slate-400">
              Sin compromiso. Si prefieres seguir con las calculadoras, puedes cerrar esta ventana.
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}
