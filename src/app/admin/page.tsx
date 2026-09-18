'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Sparkles,
  Users,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Search,
  MessageCircle,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { LicenseCode, SafeUser, ProPlan } from '@/features/auth/types';

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Data
  const [licenses, setLicenses] = useState<LicenseCode[]>([]);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'licenses' | 'users'>('licenses');

  // Generator form
  const [newPlan, setNewPlan] = useState<ProPlan>('yearly');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newDurationDays, setNewDurationDays] = useState('365');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLicense, setGeneratedLicense] = useState<LicenseCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Search filter
  const [searchFilter, setSearchFilter] = useState('');

  // Direct activate modal/form
  const [isDirectActivating, setIsDirectActivating] = useState<string | null>(null);
  const [directPlan, setDirectPlan] = useState<ProPlan>('yearly');

  // Check sessionStorage for previous auth in this tab
  useEffect(() => {
    const savedSecret = sessionStorage.getItem('calculaperu_admin_secret');
    if (savedSecret) {
      setAdminSecret(savedSecret);
      validateAndLoad(savedSecret);
    }
  }, []);

  const validateAndLoad = async (secret: string) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const [licRes, userRes] = await Promise.all([
        fetch('/api/admin/licenses', { headers: { 'x-admin-secret': secret } }),
        fetch('/api/admin/users', { headers: { 'x-admin-secret': secret } }),
      ]);

      if (licRes.status === 401 || userRes.status === 401) {
        setAuthError('Clave de administrador incorrecta.');
        setIsAuthenticated(false);
        sessionStorage.removeItem('calculaperu_admin_secret');
        setIsLoading(false);
        return;
      }

      const [licData, userData] = await Promise.all([licRes.json(), userRes.json()]);

      if (licData.success && userData.success) {
        setLicenses(licData.licenses || []);
        setUsers(userData.users || []);
        setIsAuthenticated(true);
        sessionStorage.setItem('calculaperu_admin_secret', secret);
      }
    } catch {
      setAuthError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecret.trim()) return;
    validateAndLoad(adminSecret.trim());
  };

  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          plan: newPlan,
          clientName: newClientName.trim(),
          clientEmail: newClientEmail.trim() || undefined,
          durationDays: parseInt(newDurationDays, 10) || (newPlan === 'yearly' ? 365 : 30),
        }),
      });

      const data = await res.json();
      if (data.success && data.license) {
        setGeneratedLicense(data.license);
        setLicenses((prev) => [data.license, ...prev]);
        setNewClientName('');
        setNewClientEmail('');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch {
      alert('Error al generar licencia.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCopyWhatsAppMessage = (lic: LicenseCode) => {
    const planText = lic.plan === 'yearly' ? 'Anual (365 días)' : 'Mensual (30 días)';
    const text = `👋 ¡Hola ${lic.assignedClientName}! Gracias por adquirir tu suscripción a *CalculaPerú PRO* ⭐\n\nTu código de licencia único y exclusivo es:\n👉 *${lic.code}* (Plan ${planText})\n\n📌 *Pasos sencillos para activarlo:*\n1. Ingresa a: https://www.calculaperu.com.pe\n2. Inicia sesión o crea tu cuenta gratis con tu correo.\n3. En tu perfil, ingresa tu código en *"Canjear Código"* y pulsa Canjear.\n\n¡Listo! Tu cuenta quedará activada y podrás emitir boletas oficiales ilimitadas con tu membrete desde cualquier computadora o celular.\n\nCualquier consulta estamos atentos para ayudarte.`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const handleDirectActivate = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          userId,
          plan: directPlan,
          durationDays: directPlan === 'yearly' ? 365 : 30,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? data.user : u)));
        setIsDirectActivating(null);
        alert(`✓ Plan ${directPlan === 'yearly' ? 'Anual' : 'Mensual'} activado directamente.`);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch {
      alert('Error de conexión.');
    }
  };

  // ---------------------------------------------------------------------------
  // 1. GATE DE AUTENTICACIÓN
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-900">
        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Panel Administrativo Privado
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Ingresa la clave maestra para emitir licencias y gestionar clientes
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clave de Seguridad (Master Key)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="admin2026"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-sm outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-900/50">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <span>Ingresar al Panel de Control</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-500">
            Clave predeterminada de desarrollo: <code className="text-amber-400">admin2026</code>
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. DASHBOARD DE ADMINISTRACIÓN
  // ---------------------------------------------------------------------------
  const totalLicenses = licenses.length;
  const redeemedLicenses = licenses.filter((l) => l.status === 'redeemed').length;
  const availableLicenses = licenses.filter((l) => l.status === 'available').length;
  const totalUsers = users.length;
  const proUsers = users.filter((u) => u.isPro).length;

  const filteredLicenses = licenses.filter(
    (l) =>
      l.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.assignedClientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (l.redeemedByUserEmail && l.redeemedByUserEmail.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00875A] to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">CalculaPerú Admin Hub</h1>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                PRODUCCIÓN
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generación de códigos únicos, gestión de clientes y licencias multi-dispositivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => validateAndLoad(adminSecret)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('calculaperu_admin_secret');
              setIsAuthenticated(false);
            }}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 rounded-xl text-xs font-semibold text-red-300 transition-colors cursor-pointer"
          >
            Salir
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium block">Total Licencias Emitidas</span>
          <span className="text-2xl font-black text-white">{totalLicenses}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Generadas en el sistema</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-emerald-400 font-medium block">Licencias Canjeadas</span>
          <span className="text-2xl font-black text-emerald-400">{redeemedLicenses}</span>
          <span className="text-[10px] text-slate-500 block mt-1">{availableLicenses} disponibles para venta</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-blue-400 font-medium block">Usuarios Registrados</span>
          <span className="text-2xl font-black text-blue-400">{totalUsers}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Cuentas en plataforma</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-amber-400 font-medium block">Suscriptores PRO Activos</span>
          <span className="text-2xl font-black text-amber-400">{proUsers}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Con acceso ilimitado</span>
        </div>
      </div>

      {/* License Generator Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Generador de Códigos de Licencia Únicos (1 Solo Uso)
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Genera un código formal e irrepetible para entregar a un cliente que pagó por Yape, Plin o Transferencia.
        </p>

        <form onSubmit={handleGenerateLicense} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Plan de Suscripción
            </label>
            <select
              value={newPlan}
              onChange={(e) => {
                const p = e.target.value as ProPlan;
                setNewPlan(p);
                setNewDurationDays(p === 'yearly' ? '365' : '30');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="yearly">Plan Anual (S/ 199.00 / 365 días)</option>
              <option value="monthly">Plan Mensual (S/ 29.00 / 30 días)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Nombre o Empresa del Cliente *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Estudio Contable Rojas"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Correo / WhatsApp (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. cliente@empresa.pe"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isGenerating ? 'Generando...' : 'Generar Licencia'}</span>
            </button>
          </div>
        </form>

        {/* Recently Generated License Banner */}
        {generatedLicense && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-extrabold block">
                ✓ Licencia Generada con Éxito para: {generatedLicense.assignedClientName}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-black font-mono text-white bg-slate-950 px-3 py-1 rounded-lg border border-emerald-500/40">
                  {generatedLicense.code}
                </span>
                <span className="text-xs text-slate-300">
                  ({generatedLicense.plan === 'yearly' ? 'Anual 365 días' : 'Mensual 30 días'})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopyCode(generatedLicense.code)}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCode === generatedLicense.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === generatedLicense.code ? 'Copiado' : 'Copiar Código'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyWhatsAppMessage(generatedLicense)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{copiedWhatsApp ? '¡Mensaje Copiado!' : 'Copiar para WhatsApp'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('licenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'licenses'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Licencias Emitidas ({licenses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Usuarios Registrados ({users.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por cliente, código o email..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* TAB 1: LICENCIAS */}
      {activeTab === 'licenses' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-bold">Código de Licencia</th>
                  <th className="p-3.5 font-bold">Cliente / Razón Social</th>
                  <th className="p-3.5 font-bold">Plan</th>
                  <th className="p-3.5 font-bold">Estado</th>
                  <th className="p-3.5 font-bold">Canjeado Por</th>
                  <th className="p-3.5 font-bold">Fecha Emisión</th>
                  <th className="p-3.5 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredLicenses.map((lic) => {
                  const isRedeemed = lic.status === 'redeemed';
                  return (
                    <tr key={lic.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-white">
                        {lic.code}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-white block">{lic.assignedClientName}</span>
                        {lic.assignedClientEmail && (
                          <span className="text-[10px] text-slate-500">{lic.assignedClientEmail}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200">
                          {lic.plan === 'yearly' ? 'Anual (365d)' : 'Mensual (30d)'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {isRedeemed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                            CANJEADO ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            DISPONIBLE
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400">
                        {lic.redeemedByUserEmail ? (
                          <span className="text-emerald-400 font-medium">{lic.redeemedByUserEmail}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {new Date(lic.createdAt).toLocaleDateString('es-PE')}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(lic.code)}
                            title="Copiar código"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyWhatsAppMessage(lic)}
                            title="Copiar mensaje de WhatsApp para el cliente"
                            className="p-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 rounded-lg transition-colors cursor-pointer border border-emerald-800/60"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredLicenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      No se encontraron licencias con ese criterio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USUARIOS */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-bold">Usuario / Razón Social</th>
                  <th className="p-3.5 font-bold">Correo</th>
                  <th className="p-3.5 font-bold">Estado PRO</th>
                  <th className="p-3.5 font-bold">Vigencia Hasta</th>
                  <th className="p-3.5 font-bold">Empresa Guardada</th>
                  <th className="p-3.5 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredUsers.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-[10px] text-slate-500">ID: {u.id}</span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-300">
                        {u.email}
                      </td>
                      <td className="p-3.5">
                        {u.isPro ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 w-fit">
                            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                            PRO ({u.plan === 'yearly' ? 'ANUAL' : 'MENSUAL'})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            GRATUITO
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400">
                        {u.proExpiresAt ? (
                          <span>{new Date(u.proExpiresAt).toLocaleDateString('es-PE')}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[11px]">
                        {u.companyName ? (
                          <span className="text-white block">{u.companyName}</span>
                        ) : (
                          <span className="text-slate-600">Sin configurar</span>
                        )}
                        {u.companyRuc && <span className="text-slate-500 text-[10px]">RUC: {u.companyRuc}</span>}
                      </td>
                      <td className="p-3.5 text-right">
                        {isDirectActivating === u.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <select
                              value={directPlan}
                              onChange={(e) => setDirectPlan(e.target.value as ProPlan)}
                              className="bg-slate-950 border border-slate-700 rounded-lg p-1 text-[11px] text-white"
                            >
                              <option value="yearly">Anual</option>
                              <option value="monthly">Mensual</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleDirectActivate(u.id)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsDirectActivating(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsDirectActivating(u.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            + Activar PRO
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No hay usuarios registrados que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
