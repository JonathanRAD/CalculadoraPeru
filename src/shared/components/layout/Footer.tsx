import Link from 'next/link';
import { ArrowUpRight, Calculator, LockKeyhole, ShieldCheck } from 'lucide-react';

const POPULAR_LINKS = [
  { href: '/sueldo-neto', label: 'Sueldo neto y planilla' },
  { href: '/calculadora-igv', label: 'IGV 18% SUNAT' },
  { href: '/precio-de-venta', label: 'Precio de venta' },
  { href: '/tipo-de-cambio-dolar-sunat', label: 'Dólar a soles' },
];

const CATEGORY_LINKS = [
  { href: '/#negocios', label: 'Negocios y comercio' },
  { href: '/#laboral', label: 'Laboral y planilla' },
  { href: '/#finanzas', label: 'Finanzas y metas' },
  { href: '/#tributario', label: 'Tributario y diario' },
];

const LEGAL_LINKS = [
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/terminos-y-condiciones', label: 'Términos y condiciones' },
  { href: '/politica-de-privacidad', label: 'Política de privacidad' },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#060b1d] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-11 sm:px-6 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-5">
            <Link href="/" aria-label="Ir al inicio de CalculaPerú" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-400"><Calculator className="h-5 w-5" aria-hidden="true" /></span>
              <span className="text-xl font-bold tracking-tight text-white">Calcula<span className="text-emerald-400">Perú</span></span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">Herramientas gratuitas para calcular trabajo, negocios, finanzas y obligaciones tributarias con contexto peruano.</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-2 text-emerald-400"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Fuentes identificadas</span>
              <span className="inline-flex items-center gap-2 text-slate-300"><LockKeyhole className="h-4 w-4" aria-hidden="true" /> Sin registro</span>
            </div>
          </div>

          <nav aria-label="Categorías de calculadoras" className="lg:col-span-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">Explora</h2>
            <ul className="mt-4 space-y-1">
              {CATEGORY_LINKS.map((link) => <li key={link.href}><Link href={link.href} className="flex min-h-9 items-center text-sm text-slate-400 transition-colors hover:text-emerald-400 focus-visible:text-emerald-400 focus-visible:outline-none">{link.label}</Link></li>)}
            </ul>
          </nav>

          <nav aria-label="Calculadoras populares" className="lg:col-span-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">Más utilizadas</h2>
            <ul className="mt-4 space-y-1">
              {POPULAR_LINKS.map((link) => <li key={link.href}><Link href={link.href} className="group flex min-h-9 items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-emerald-400 focus-visible:text-emerald-400 focus-visible:outline-none">{link.label}<ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" /></Link></li>)}
            </ul>
          </nav>

          <nav aria-label="Información institucional y legal" className="lg:col-span-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">Información</h2>
            <ul className="mt-4 space-y-1">
              {LEGAL_LINKS.map((link) => <li key={link.href}><Link href={link.href} className="flex min-h-9 items-center text-sm text-slate-400 transition-colors hover:text-emerald-400 focus-visible:text-emerald-400 focus-visible:outline-none">{link.label}</Link></li>)}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CalculaPerú. Calcula mejor, decide mejor.</p>
          <p className="max-w-2xl sm:text-right">Los resultados son referenciales y no sustituyen asesoría profesional ni la información de cada entidad competente.</p>
        </div>
      </div>
    </footer>
  );
}
