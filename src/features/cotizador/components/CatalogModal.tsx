'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Plus,
  Package,
  Wrench,
  AlertCircle,
  Loader2,
  Archive,
} from 'lucide-react';
import { CatalogItemRecord, UnitType } from '../types';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: CatalogItemRecord) => void;
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

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const [items, setItems] = useState<CatalogItemRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'service'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<'list' | 'new'>('list');

  // New item form
  const [type, setType] = useState<'product' | 'service'>('product');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState<UnitType>('unit');
  const [price, setPrice] = useState<number | ''>('');
  const [isIgvAffected, setIsIgvAffected] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCatalog = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/catalog?q=${encodeURIComponent(search)}&status=${statusFilter}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setItems(data.items || []);
        } else {
          setError(data.message || 'Error cargando catálogo.');
        }
      } catch {
        setError('Error de conexión al cargar el catálogo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [isOpen, search, statusFilter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numPrice = typeof price === 'number' ? price : 0;
    if (numPrice < 0) {
      setFormError('El precio unitario no puede ser negativo.');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type,
          name: name.trim(),
          description: description.trim() || undefined,
          sku: sku.trim() || undefined,
          unit,
          price: numPrice,
          isIgvAffected,
        }),
      });

      const data = await res.json();
      if (data.success && data.item) {
        onSelectItem(data.item);
        setMode('list');
        onClose();
      } else {
        setFormError(data.message || 'Error al guardar el ítem.');
      }
    } catch {
      setFormError('Error de conexión al registrar ítem.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleArchive = async (e: React.MouseEvent, item: CatalogItemRecord) => {
    e.stopPropagation();
    try {
      const newStatus = item.status === 'archived' ? 'active' : 'archived';
      const res = await fetch(`/api/catalog/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(items.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)));
      }
    } catch {}
  };

  const filteredItems = items.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-modal-title"
        className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h2 id="catalog-modal-title" className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-[#00875A] dark:text-[#00C853]" />
              {mode === 'list' ? 'Catálogo de Productos y Servicios' : 'Registrar Nuevo Concepto'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === 'list'
                ? 'Agrega conceptos guardados a tu cotización con un solo clic.'
                : 'Registra un concepto en tu catálogo para reutilizarlo en futuras proformas.'}
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
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, SKU o descripción..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
                />
              </div>

              <div className="flex gap-2">
                <select
                  aria-label="Filtrar por tipo"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'product' | 'service')}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="product">Solo Productos</option>
                  <option value="service">Solo Servicios</option>
                </select>

                <select
                  aria-label="Filtrar por estado"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'active' | 'archived')}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="active">Activos</option>
                  <option value="archived">Archivados</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setMode('new');
                  }}
                  className="rounded-xl bg-[#00875A] hover:bg-[#00704A] px-4 py-2.5 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Agregar Ítem</span>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-[#00875A]" />
                  <span className="text-xs">Cargando catálogo...</span>
                </div>
              ) : error ? (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 p-4 text-xs text-red-700 dark:text-red-300">
                  {error}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-8 text-center space-y-3">
                  <Package className="h-8 w-8 text-slate-400 mx-auto" />
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">No se encontraron productos o servicios</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Haz clic en &quot;+ Agregar Ítem&quot; para registrar tus conceptos frecuentes y cotizar en segundos.
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    className="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 hover:border-[#00875A] transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        {item.type === 'service' ? (
                          <span className="rounded bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 text-[10px] font-bold border border-sky-200 dark:border-sky-800/60 flex items-center gap-1">
                            <Wrench className="h-3 w-3" />
                            Servicio
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-50 dark:bg-emerald-950/70 text-[#00875A] dark:text-[#00C853] px-1.5 py-0.5 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            Producto
                          </span>
                        )}
                        <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#00875A] dark:group-hover:text-[#00C853] transition-colors">
                          {item.name}
                        </span>
                        {item.sku && (
                          <span className="text-[11px] font-mono text-slate-400">
                            [{item.sku}]
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Unidad: {item.unit.toUpperCase()}</span>
                        <span>•</span>
                        <span>{item.isIgvAffected ? 'Afecto a IGV (18%)' : 'Inafecto'}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <div className="text-base font-bold font-mono text-[#00875A] dark:text-[#00C853]">
                          S/ {item.price.toFixed(2)}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Usar en proforma
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleToggleArchive(e, item)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title={item.status === 'archived' ? 'Restaurar ítem' : 'Archivar ítem'}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          /* New Item Form */
          <form onSubmit={handleCreateItem} className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {formError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="catalog-type" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de concepto
                </label>
                <select
                  id="catalog-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'product' | 'service')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="product">Producto</option>
                  <option value="service">Servicio</option>
                </select>
              </div>

              <div>
                <label htmlFor="catalog-sku" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Código SKU o Referencia <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  id="catalog-sku"
                  type="text"
                  maxLength={40}
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ej: POL-24-001"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="catalog-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Producto o Servicio <span className="text-red-500">*</span>
              </label>
              <input
                id="catalog-name"
                type="text"
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Servicio de mantenimiento, Polo de algodón 24/1..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none"
              />
            </div>

            <div>
              <label htmlFor="catalog-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Descripción detallada <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                id="catalog-desc"
                rows={2}
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Especificaciones, alcance o notas..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#00875A] outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="catalog-unit" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unidad de medida
                </label>
                <select
                  id="catalog-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  {UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="catalog-price" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Precio Unitario (PEN) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">S/</span>
                  <input
                    id="catalog-price"
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-8 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:border-[#00875A] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isIgvAffected}
                  onChange={(e) => setIsIgvAffected(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-[#00875A] focus:ring-0 cursor-pointer h-4 w-4"
                />
                <span>Afecto a IGV (18%)</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-6">
                Marca esta opción si la venta de este bien o prestación de servicio se encuentra gravada con el IGV según tu actividad económica.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Volver al catálogo
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#00875A] hover:bg-[#00704A] px-5 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar y Usar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
