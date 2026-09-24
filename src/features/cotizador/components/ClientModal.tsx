'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  UserPlus,
  Building,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ClientRecord } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: (client: ClientRecord) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSelectClient,
}) => {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mode: 'list' or 'new'
  const [mode, setMode] = useState<'list' | 'new'>('list');

  // Form states
  const [name, setName] = useState('');
  const [docType, setDocType] = useState<'none' | 'dni' | 'ruc' | 'other'>('none');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchClients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/clients?q=${encodeURIComponent(search)}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setClients(data.clients || []);
        } else {
          setError(data.message || 'No se pudieron cargar los clientes.');
        }
      } catch {
        setError('Error de conexión al cargar clientes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [isOpen, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          docType,
          docNumber: docNumber.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.client) {
        onSelectClient(data.client);
        setMode('list');
        onClose();
      } else {
        setFormError(data.message || 'Error al registrar cliente.');
      }
    } catch {
      setFormError('Error de conexión al registrar cliente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h2 id="client-modal-title" className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-[#00875A] dark:text-[#00C853]" />
              {mode === 'list' ? 'Directorio de Clientes' : 'Registrar Nuevo Cliente'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === 'list'
                ? 'Selecciona un cliente guardado para completar la cotización.'
                : 'Guarda los datos del cliente para reutilizarlos en futuras cotizaciones.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === 'list' ? (
          <>
            {/* Search and New Button Bar */}
            <div className="flex gap-2.5 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, DNI, RUC o teléfono..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setMode('new');
                }}
                className="rounded-xl bg-[#00875A] hover:bg-[#00704A] px-4 py-2.5 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Nuevo Cliente</span>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#00875A]" />
                  <span className="text-xs">Cargando directorio...</span>
                </div>
              ) : error ? (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 p-4 text-xs text-red-700 dark:text-red-300">
                  {error}
                </div>
              ) : clients.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-8 text-center space-y-3">
                  <Building className="h-8 w-8 text-slate-400 mx-auto" />
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">No tienes clientes registrados aún</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Puedes escribir los datos del cliente directamente en la cotización, o hacer clic en &quot;+ Nuevo Cliente&quot; para guardarlo.
                  </p>
                </div>
              ) : (
                clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectClient(c);
                      onClose();
                    }}
                    className="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 hover:border-[#00875A] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#00875A] dark:group-hover:text-[#00C853] transition-colors">
                        {c.name}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#00875A] dark:text-[#00C853] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                        Seleccionar
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      {c.docNumber && (
                        <span>
                          {c.docType.toUpperCase()}: <strong className="text-slate-700 dark:text-slate-200">{c.docNumber}</strong>
                        </span>
                      )}
                      {c.phone && <span>Tel: {c.phone}</span>}
                      {c.email && <span>Email: {c.email}</span>}
                    </div>

                    {c.address && (
                      <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {c.address}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          /* New Client Form */
          <form onSubmit={handleCreateClient} className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {formError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label htmlFor="client-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre o Razón Social <span className="text-red-500">*</span>
              </label>
              <input
                id="client-name"
                type="text"
                required
                minLength={2}
                maxLength={150}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Inversiones Los Andes S.A.C."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="client-doc-type" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Documento
                </label>
                <select
                  id="client-doc-type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as 'none' | 'dni' | 'ruc' | 'other')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="none">Sin documento</option>
                  <option value="dni">DNI (8 dígitos)</option>
                  <option value="ruc">RUC (11 dígitos)</option>
                  <option value="other">Otro documento</option>
                </select>
              </div>

              <div>
                <label htmlFor="client-doc-num" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Número de Documento
                </label>
                <input
                  id="client-doc-num"
                  type="text"
                  maxLength={20}
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder={docType === 'dni' ? '8 dígitos' : docType === 'ruc' ? '11 dígitos' : 'Opcional'}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="client-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  id="client-phone"
                  type="tel"
                  maxLength={15}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 987654321"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
                />
              </div>

              <div>
                <label htmlFor="client-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  id="client-email"
                  type="email"
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@cliente.pe"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="client-address" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dirección Fiscal o Entrega
              </label>
              <input
                id="client-address"
                type="text"
                maxLength={180}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Av. Javier Prado Este 1234, San Isidro, Lima"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Volver a la lista
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#00875A] hover:bg-[#00704A] px-5 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar y Seleccionar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
