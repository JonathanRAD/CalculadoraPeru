'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
  BarChart3,
  TrendingUp,
  Activity,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Trash2,
  ChevronRight,
  Filter,
  FileCode2,
  Clock,
  UserCheck,
  UserX,
  Eye,
  LogOut,
  SlidersHorizontal,
  Smartphone,
  Monitor,
  Globe,
  CreditCard,
  Send,
  CheckCircle,
} from 'lucide-react';
import { LicenseCode, SafeUser, ProPlan, SubscriptionRequest, SubscriptionStatus } from '@/features/auth/types';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';

type AdminTab = 'dashboard' | 'subscriptions' | 'licenses' | 'users' | 'audit' | 'system';

interface TrafficDay {
  date: string;
  dayName: string;
  visits: number;
  uniqueUsers: number;
}

interface TopCalculator {
  name: string;
  slug: string;
  visits: number;
  share: number;
}

interface TopSearchItem {
  query: string;
  count: number;
  lastSearched: string;
}

interface DeviceShare {
  mobile: number;
  desktop: number;
}

interface SystemHealth {
  supabase: string;
  dbLatencyMs: number;
  authStatus: string;
  resendEmail: string;
  nodeEnv: string;
  serverTime: string;
}

interface AuditLog {
  action: string;
  performedBy: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export default function AdminPage() {
  // Authentication & Security Gate
  const [adminSecret, setAdminSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  // Data Stores
  const [licenses, setLicenses] = useState<LicenseCode[]>([]);
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [trafficHistory, setTrafficHistory] = useState<TrafficDay[]>([]);
  const [topCalculators, setTopCalculators] = useState<TopCalculator[]>([]);
  const [topSearches, setTopSearches] = useState<TopSearchItem[]>([]);
  const [deviceShare, setDeviceShare] = useState<DeviceShare>({ mobile: 68, desktop: 32 });
  const [liveActiveVisitors, setLiveActiveVisitors] = useState<number>(0);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Subscriptions & Payment Requests Store
  const [subscriptions, setSubscriptions] = useState<SubscriptionRequest[]>([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [subscriptionSearch, setSubscriptionSearch] = useState('');
  const [approvingSubId, setApprovingSubId] = useState<string | null>(null);
  const [approvedResultModal, setApprovedResultModal] = useState<{
    subscription: SubscriptionRequest;
    licenseCode: string;
    whatsappUrl: string;
  } | null>(null);
  const [rejectingSub, setRejectingSub] = useState<SubscriptionRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectedResultModal, setRejectedResultModal] = useState<{
    subscription: SubscriptionRequest;
    whatsappUrl?: string;
    notes?: string;
  } | null>(null);

  // Search & Filters
  const [licenseSearch, setLicenseSearch] = useState('');
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<'all' | 'available' | 'redeemed' | 'revoked'>('all');
  const [licensePlanFilter, setLicensePlanFilter] = useState<'all' | 'yearly' | 'monthly'>('all');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [userProFilter, setUserProFilter] = useState<'all' | 'pro' | 'free'>('all');

  // License Generator Modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<ProPlan>('yearly');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newDurationDays, setNewDurationDays] = useState('365');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newlyGenerated, setNewlyGenerated] = useState<LicenseCode | null>(null);

  // Destructive Revocation Confirmation Modal (admin-ui-builder requirement)
  const [revokingLicense, setRevokingLicense] = useState<LicenseCode | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Direct User PRO Grant Modal
  const [grantingUser, setGrantingUser] = useState<SafeUser | null>(null);
  const [grantPlan, setGrantPlan] = useState<ProPlan>('yearly');
  const [isGranting, setIsGranting] = useState(false);

  // Copy Feedback Toasts
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedTextNotice, setCopiedTextNotice] = useState<string | null>(null);

  // Hovered data point in traffic chart
  const [hoveredPoint, setHoveredPoint] = useState<TrafficDay | null>(null);

  // Load and validate admin credentials
  const fetchAllData = useCallback(async (secret: string) => {
    setIsLoading(true);
    setAuthError('');
    try {
      const [licRes, userRes, metricsRes, subRes] = await Promise.all([
        fetch('/api/admin/licenses', { headers: { 'x-admin-secret': secret } }),
        fetch('/api/admin/users', { headers: { 'x-admin-secret': secret } }),
        fetch('/api/admin/metrics', { headers: { 'x-admin-secret': secret } }),
        fetch('/api/admin/subscriptions', { headers: { 'x-admin-secret': secret } }),
      ]);

      if (licRes.status === 401 || userRes.status === 401 || metricsRes.status === 401 || subRes.status === 401) {
        setAuthError('Clave de administrador incorrecta o sesión caducada.');
        setIsAuthenticated(false);
        sessionStorage.removeItem('calculaperu_admin_secret');
        setIsLoading(false);
        return;
      }

      const [licData, userData, metricsData, subData] = await Promise.all([
        licRes.json(),
        userRes.json(),
        metricsRes.json(),
        subRes.json(),
      ]);

      if (licData.success) setLicenses(licData.licenses || []);
      if (userData.success) setUsers(userData.users || []);
      if (subData.success) setSubscriptions(subData.subscriptions || []);
      if (metricsData.success) {
        setTrafficHistory(metricsData.trafficHistory || []);
        setTopCalculators(metricsData.topCalculators || []);
        setTopSearches(metricsData.topSearches || []);
        setDeviceShare(metricsData.deviceShare || { mobile: 68, desktop: 32 });
        setLiveActiveVisitors(metricsData.liveActiveVisitors || 0);
        setSystemHealth(metricsData.systemHealth || null);
        setAuditLogs(metricsData.recentLogs || []);
      }

      setIsAuthenticated(true);
      sessionStorage.setItem('calculaperu_admin_secret', secret);
    } catch {
      setAuthError('Error de red o conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('calculaperu_admin_secret');
    if (saved) {
      setAdminSecret(saved);
      fetchAllData(saved);
    }
  }, [fetchAllData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecret.trim()) return;
    fetchAllData(adminSecret.trim());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminSecret('');
    sessionStorage.removeItem('calculaperu_admin_secret');
  };

  // Copy helper with feedback
  const handleCopy = (text: string, label = 'Copiado al portapapeles') => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setCopiedTextNotice(label);
    setTimeout(() => {
      setCopiedCode(null);
      setCopiedTextNotice(null);
    }, 2500);
  };

  // Issue License Handler
  const handleIssueLicense = async (e: React.FormEvent) => {
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
        setNewlyGenerated(data.license);
        setLicenses(prev => [data.license, ...prev]);
        setNewClientName('');
        setNewClientEmail('');
      } else {
        alert(data.message || 'Error al emitir la licencia.');
      }
    } catch {
      alert('Error de conexión al emitir licencia.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Revoke License Handler (Destructive confirmation)
  const handleConfirmRevoke = async () => {
    if (!revokingLicense) return;
    setIsRevoking(true);

    try {
      const res = await fetch(`/api/admin/licenses?code=${revokingLicense.code}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': adminSecret },
      });

      const data = await res.json();
      if (data.success) {
        setLicenses(prev =>
          prev.map(l => (l.code === revokingLicense.code ? { ...l, status: 'revoked' as const } : l))
        );
        setRevokingLicense(null);
        handleCopy('', 'Licencia revocada correctamente');
      } else {
        alert(data.message || 'Error al revocar la licencia.');
      }
    } catch {
      alert('Error de conexión.');
    } finally {
      setIsRevoking(false);
    }
  };

  // Direct PRO Grant to User Handler
  const handleConfirmGrantPro = async () => {
    if (!grantingUser) return;
    setIsGranting(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          userId: grantingUser.id,
          plan: grantPlan,
          isPro: !grantingUser.isPro,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers(prev =>
          prev.map(u =>
            u.id === grantingUser.id
              ? {
                  ...u,
                  isPro: !grantingUser.isPro,
                  plan: !grantingUser.isPro ? grantPlan : null,
                }
              : u
          )
        );
        setGrantingUser(null);
      } else {
        alert(data.message || 'Error al modificar suscripción.');
      }
    } catch {
      alert('Error de conexión.');
    } finally {
      setIsGranting(false);
    }
  };

  // Approve Subscription Handler
  const handleApproveSubscription = async (sub: SubscriptionRequest) => {
    setApprovingSubId(sub.id);
    try {
      const res = await fetch(`/api/admin/subscriptions/${sub.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
      });

      const data = await res.json();
      if (data.success) {
        setSubscriptions(prev =>
          prev.map(s =>
            s.id === sub.id
              ? { ...s, status: 'approved', generatedLicenseCode: data.licenseCode }
              : s
          )
        );
        // Refresh licenses & users to reflect changes immediately
        fetchAllData(adminSecret);

        setApprovedResultModal({
          subscription: sub,
          licenseCode: data.licenseCode || '',
          whatsappUrl: data.whatsappUrl || '',
        });
      } else {
        alert(data.message || 'Error al aprobar la solicitud.');
      }
    } catch {
      alert('Error de conexión al aprobar la solicitud.');
    } finally {
      setApprovingSubId(null);
    }
  };

  // Reject Subscription Handler
  const handleConfirmRejectSubscription = async () => {
    if (!rejectingSub) return;
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${rejectingSub.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ notes: rejectReason }),
      });

      const data = await res.json();
      if (data.success) {
        setSubscriptions(prev =>
          prev.map(s =>
            s.id === rejectingSub.id
              ? { ...s, status: 'rejected', notes: rejectReason }
              : s
          )
        );
        const subToNotify = rejectingSub;
        const returnedWaUrl = data.whatsappUrl;
        const recordedReason = rejectReason;

        setRejectingSub(null);
        setRejectReason('');

        if (returnedWaUrl) {
          setRejectedResultModal({
            subscription: subToNotify,
            whatsappUrl: returnedWaUrl,
            notes: recordedReason,
          });
        }
      } else {
        alert(data.message || 'Error al rechazar la solicitud.');
      }
    } catch {
      alert('Error de conexión al rechazar la solicitud.');
    } finally {
      setIsRejecting(false);
    }
  };

  // Filtered Subscriptions
  const pendingSubscriptionsCount = useMemo(
    () => subscriptions.filter(s => s.status === 'pending').length,
    [subscriptions]
  );

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesSearch =
        subscriptionSearch === '' ||
        sub.customerName.toLowerCase().includes(subscriptionSearch.toLowerCase()) ||
        sub.customerEmail.toLowerCase().includes(subscriptionSearch.toLowerCase()) ||
        sub.customerPhone.includes(subscriptionSearch) ||
        sub.operationCode.toLowerCase().includes(subscriptionSearch.toLowerCase()) ||
        (sub.generatedLicenseCode && sub.generatedLicenseCode.toLowerCase().includes(subscriptionSearch.toLowerCase()));

      const matchesStatus =
        subscriptionFilter === 'all' || sub.status === subscriptionFilter;

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, subscriptionSearch, subscriptionFilter]);

  // Filtered Licenses
  const filteredLicenses = useMemo(() => {
    return licenses.filter(lic => {
      const matchesSearch =
        licenseSearch === '' ||
        lic.code.toLowerCase().includes(licenseSearch.toLowerCase()) ||
        lic.assignedClientName.toLowerCase().includes(licenseSearch.toLowerCase()) ||
        (lic.assignedClientEmail && lic.assignedClientEmail.toLowerCase().includes(licenseSearch.toLowerCase()));

      const matchesStatus =
        licenseStatusFilter === 'all' || lic.status === licenseStatusFilter;

      const matchesPlan =
        licensePlanFilter === 'all' || lic.plan === licensePlanFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [licenses, licenseSearch, licenseStatusFilter, licensePlanFilter]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        userSearch === '' ||
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.companyRuc && u.companyRuc.includes(userSearch)) ||
        (u.companyName && u.companyName.toLowerCase().includes(userSearch.toLowerCase()));

      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchesPro =
        userProFilter === 'all' ||
        (userProFilter === 'pro' && u.isPro) ||
        (userProFilter === 'free' && !u.isPro);

      return matchesSearch && matchesRole && matchesPro;
    });
  }, [users, userSearch, userRoleFilter, userProFilter]);

  // Stats Calculations
  const stats = useMemo(() => {
    const totalVisits = trafficHistory.reduce((acc, curr) => acc + curr.visits, 0);
    const proCount = users.filter(u => u.isPro).length;
    const activeLicenses = licenses.filter(l => l.status === 'available').length;
    const redeemedLicenses = licenses.filter(l => l.status === 'redeemed').length;
    const estimatedIncome = redeemedLicenses * 149; // Updated annual baseline

    return {
      totalVisits,
      totalUsers: users.length,
      proCount,
      activeLicenses,
      redeemedLicenses,
      estimatedIncome,
    };
  }, [trafficHistory, users, licenses]);

  // =========================================================================
  // 1. SECURITY GATE (LOGIN SCREEN)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white p-4 font-sans select-none">
        <div className="w-full max-w-md bg-slate-850 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-750 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white">CalculaPerú Admin OS</h1>
                <p className="text-xs text-slate-400">Panel de Control y Back-Office</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Clave Maestra de Administrador</span>
              </label>
              <input
                type="password"
                value={adminSecret}
                onChange={e => setAdminSecret(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-750 flex items-center justify-between text-xs text-slate-400">
            <Link href="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>← Volver al Sitio Público</span>
            </Link>
            <span className="font-mono text-[11px] text-slate-400">v2.4.0-PROD</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. FULL BACK-OFFICE APP INTERFACE (STANDALONE)
  // =========================================================================
  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#0A0E17] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Toast Notification Alert */}
      {copiedTextNotice && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copiedTextNotice}</span>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* SIDEBAR NAVIGATION                                                    */}
      {/* --------------------------------------------------------------------- */}
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex flex-col justify-between hidden md:flex select-none">
        <div className="p-5 space-y-6">
          
          {/* Logo & Version Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                CP
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight block text-slate-900 dark:text-white">
                  CalculaPerú
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                  Admin OS
                </span>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard & Métricas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('subscriptions')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'subscriptions'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4" />
                <span>Solicitudes PRO</span>
              </div>
              {pendingSubscriptionsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse shadow-xs">
                  {pendingSubscriptionsCount} pend.
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">
                  {subscriptions.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('licenses')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'licenses'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <KeyRound className="w-4 h-4" />
                <span>Gestor de Licencias</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">
                {licenses.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Directorio de Usuarios</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">
                {users.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Logs de Auditoría</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'system'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Supabase & Servidor</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ver Sitio Público</span>
            </div>
            <span className="text-[10px] text-slate-400">calculaperu.com.pe</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión Admin</span>
          </button>
        </div>
      </aside>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN VIEWPORT AREA                                                    */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden items-center gap-1 overflow-x-auto text-xs font-bold">
              {(['dashboard', 'subscriptions', 'licenses', 'users', 'audit'] as AdminTab[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 rounded-lg capitalize ${
                    activeTab === t ? 'bg-[#00875A] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Sistema en Línea · Servidor Operativo
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-400 font-mono text-[11px]">
                Latencia: {systemHealth?.dbLatencyMs || 24}ms
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchAllData(adminSecret)}
              disabled={isLoading}
              title="Actualizar datos"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                setNewlyGenerated(null);
                setIsIssueModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Emitir Licencia PRO</span>
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <main className="p-6 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* ================================================================= */}
          {/* TAB 1: DASHBOARD & LIVE METRICS                                   */}
          {/* ================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Alert: Pending Subscriptions */}
              {pendingSubscriptionsCount > 0 && (
                <div className="p-4.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                        <span>
                          {pendingSubscriptionsCount === 1
                            ? '1 Solicitud de Pago Yape/Plin pendiente de validación'
                            : `${pendingSubscriptionsCount} Solicitudes de Pago Yape/Plin pendientes de validación`}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      </h4>
                      <p className="text-xs text-amber-900/80 dark:text-amber-400/80 mt-0.5">
                        Hay clientes esperando que apruebes su pago para emitir su código de activación PRO.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubscriptionFilter('pending');
                      setActiveTab('subscriptions');
                    }}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <span>Revisar Solicitudes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Live Real-Time Telemetry Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {liveActiveVisitors > 0 ? liveActiveVisitors : 1} {liveActiveVisitors === 1 ? 'usuario activo ahora' : 'usuarios activos ahora'}
                      </span>
                      <span className="text-[10px] text-emerald-300 font-bold bg-emerald-900/80 border border-emerald-600/50 px-2 py-0.5 rounded-full font-mono">
                        ÚLTIMOS 15 MIN
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Telemetría nativa privada en vivo (conteo sin cookies de terceros ni scripts lentos)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-200">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    <span>{deviceShare.mobile}% Móvil</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-200">
                    <Monitor className="w-3.5 h-3.5 text-purple-400" />
                    <span>{deviceShare.desktop}% Computadora</span>
                  </div>
                </div>
              </div>

              {/* KPI Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Visitas Totales (14 Días)</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                      {stats.totalVisits.toLocaleString('es-PE')}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                      En vivo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {stats.totalVisits > 0
                      ? `Promedio de ~${Math.max(1, Math.round(stats.totalVisits / 14))} visitas al día`
                      : 'Contando visitas reales en tiempo real'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Usuarios Registrados</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                      {stats.totalUsers}
                    </span>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                      Total
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Base de datos de clientes y contadores</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Membresías PRO Activas</span>
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {stats.proCount}
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950 px-1.5 py-0.2 rounded">
                      VIP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Acceso ilimitado a boletas oficiales</p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Licencias Disponibles</span>
                    <KeyRound className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                      {stats.activeLicenses}
                    </span>
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100/70 dark:bg-purple-950 px-1.5 py-0.2 rounded">
                      Listas
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{stats.redeemedLicenses} canjeadas en total</p>
                </div>

              </div>

              {/* Traffic Trend Chart (SVG Responsive & Interactive) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#00875A]" />
                      <span>Tráfico y Visitas Diarias (Últimos 14 Días)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Conteo real de visitas registradas en el portal en los últimos 14 días
                    </p>
                  </div>
                  {hoveredPoint && (
                    <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold">
                      {hoveredPoint.dayName} {hoveredPoint.date}: {hoveredPoint.visits.toLocaleString()} visitas ({hoveredPoint.uniqueUsers.toLocaleString()} únicos)
                    </div>
                  )}
                </div>

                {/* SVG Visual Graph */}
                <div className="relative h-48 w-full pt-4">
                  {trafficHistory.length > 0 ? (
                    <div className="h-full flex items-end gap-1.5 sm:gap-2">
                      {trafficHistory.map((pt) => {
                        const maxVal = Math.max(...trafficHistory.map(p => p.visits), 1);
                        const heightPct = pt.visits > 0 ? Math.round((pt.visits / maxVal) * 100) : 0;

                        return (
                          <div
                            key={pt.date}
                            className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                            onMouseEnter={() => setHoveredPoint(pt)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            {/* Bar Column */}
                            <div
                              style={{ height: `${Math.max(heightPct, 4)}%` }}
                              className={`w-full rounded-t-lg transition-all duration-200 ${
                                pt.visits > 0
                                  ? 'bg-gradient-to-t from-[#00875A] to-emerald-400 shadow-md shadow-emerald-700/20 group-hover:brightness-110'
                                  : 'bg-slate-200 dark:bg-slate-800 opacity-40 group-hover:opacity-80'
                              }`}
                            />
                            {/* Date Label */}
                            <span className="text-[10px] text-slate-400 font-mono mt-2 truncate w-full text-center">
                              {pt.date.split('/')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                      Cargando historial de tráfico...
                    </div>
                  )}
                </div>
              </div>

              {/* 2-Column: Real Top Pages Visited + Real User Searches */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Top Visited Pages Ranking */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-500" />
                      <span>Páginas y Calculadoras Más Visitadas</span>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {topCalculators.length} registradas
                    </span>
                  </div>

                  <div className="space-y-3">
                    {topCalculators.length > 0 ? (
                      topCalculators.map(c => (
                        <div key={c.slug} className="space-y-1.5 text-xs p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                          <div className="flex items-center justify-between font-medium">
                            <Link
                              href={c.slug}
                              target="_blank"
                              className="text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 font-semibold transition-colors"
                            >
                              <span className="truncate max-w-[260px] sm:max-w-xs">{c.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            </Link>
                            <span className="font-mono text-slate-500 shrink-0">
                              {c.visits.toLocaleString()} {c.visits === 1 ? 'visita' : 'visitas'} ({c.share}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${Math.max(c.share, 4)}%` }}
                              className="h-full bg-[#00875A] rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        Aún no se han registrado visitas en el período.
                      </div>
                    )}
                  </div>
                </div>

                {/* Real User Searches */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-500" />
                      <span>Términos Más Buscados por los Usuarios</span>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {topSearches.length} términos
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {topSearches.length > 0 ? (
                      topSearches.map((item, idx) => (
                        <div
                          key={item.query}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              &ldquo;{item.query}&rdquo;
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] font-bold">
                              {item.count} {item.count === 1 ? 'búsqueda' : 'búsquedas'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center space-y-2">
                        <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Las búsquedas de los usuarios aparecerán aquí en vivo
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          Cada vez que alguien busque un cálculo (ej: &quot;CTS&quot;, &quot;Sueldo&quot;, &quot;Horas Extras&quot;), se registrará automáticamente.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* System & Engine Status */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-500" />
                  <span>Estado del Motor y Servicios</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">PostgreSQL</span>
                        <span className="text-[11px] text-slate-400">
                          {systemHealth?.supabase === 'connected' ? 'Supabase Cloud Activo' : 'Storage Local Híbrido'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                      ACTIVO
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Sesiones & Auth</span>
                        <span className="text-[11px] text-slate-400">JWT HMAC-SHA256 HttpOnly</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                      SEGURO
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-teal-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">Telemetría Nativa</span>
                        <span className="text-[11px] text-slate-400">Eventos beacon no bloqueantes</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-bold text-[10px]">
                      OPERATIVO
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: SOLICITUDES DE PAGO PRO (YAPE / PLIN)                        */}
          {/* ================================================================= */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header & Overview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#00875A] dark:text-[#00C853]" />
                    <span>Solicitudes de Pago PRO (Yape / Plin)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Valida las operaciones de pago de clientes y aprueba su suscripción con emisión de licencia y envío por WhatsApp
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchAllData(adminSecret)}
                    disabled={isLoading}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                </div>
              </div>

              {/* Subscriptions Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">Total Solicitudes</span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {subscriptions.length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 shadow-xs space-y-1">
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Pendientes de Validación</span>
                  <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                    {pendingSubscriptionsCount}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 shadow-xs space-y-1">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Aprobadas y Activas</span>
                  <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {subscriptions.filter(s => s.status === 'approved').length}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">Ingresos Validados</span>
                  <div className="text-2xl font-black font-mono text-[#00875A] dark:text-[#00C853]">
                    S/ {subscriptions
                      .filter(s => s.status === 'approved')
                      .reduce((sum, s) => sum + s.amount, 0)
                      .toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subscriptionSearch}
                    onChange={e => setSubscriptionSearch(e.target.value)}
                    placeholder="Buscar por cliente, correo, teléfono o código op..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSubscriptionFilter(st)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs capitalize transition-all cursor-pointer ${
                        subscriptionFilter === st
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {st === 'all'
                        ? `Todas (${subscriptions.length})`
                        : st === 'pending'
                        ? `Pendientes (${pendingSubscriptionsCount})`
                        : st === 'approved'
                        ? `Aprobadas (${subscriptions.filter(s => s.status === 'approved').length})`
                        : `Rechazadas (${subscriptions.filter(s => s.status === 'rejected').length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscriptions List */}
              {filteredSubscriptions.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 space-y-3">
                  <CreditCard className="w-10 h-10 mx-auto text-slate-400 stroke-[1.5]" />
                  <p className="text-sm font-semibold">No se encontraron solicitudes con los filtros aplicados.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSubscriptions.map(sub => {
                    const cleanPhone = sub.customerPhone.replace(/\D/g, '');
                    const phoneWithCountry = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
                    const waDirectUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(
                      `Hola ${sub.customerName}, te escribimos de CalculaPerú referente a tu solicitud de suscripción PRO (Op: ${sub.operationCode}).`
                    )}`;

                    return (
                      <div
                        key={sub.id}
                        className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-xs space-y-4 ${
                          sub.status === 'pending'
                            ? 'border-amber-400/80 dark:border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/10'
                            : sub.status === 'approved'
                            ? 'border-emerald-200 dark:border-emerald-800/60'
                            : 'border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          
                          {/* Left: Customer & Plan Details */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-base text-slate-900 dark:text-white">
                                {sub.customerName}
                              </span>

                              {/* Status Badge */}
                              {sub.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                                  <Clock className="w-3 h-3" />
                                  <span>Pendiente de Validación</span>
                                </span>
                              )}
                              {sub.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Aprobada y Activada</span>
                                </span>
                              )}
                              {sub.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800">
                                  <X className="w-3 h-3" />
                                  <span>Rechazada</span>
                                </span>
                              )}

                              <span className="text-[11px] text-slate-400">
                                · {new Date(sub.createdAt).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            {/* Contact Links */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                              <span>📧 <a href={`mailto:${sub.customerEmail}`} className="underline hover:text-emerald-600">{sub.customerEmail}</a></span>
                              <span>📱 Tel: <strong>{sub.customerPhone}</strong></span>
                              <a
                                href={waDirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Chatear en WhatsApp</span>
                              </a>
                            </div>
                          </div>

                          {/* Center: Operation Code & Plan Amount */}
                          <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-750">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                Plan Adquirido
                              </span>
                              <span className="font-bold text-xs text-slate-900 dark:text-white">
                                {sub.plan === 'yearly' ? 'Plan Anual (365 d)' : 'Plan Mensual (30 d)'}
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold block text-sm">
                                S/ {sub.amount.toFixed(2)}
                              </span>
                            </div>

                            <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                Cód. Op. Yape/Plin
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-750">
                                  {sub.operationCode}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(sub.operationCode, 'Código de operación copiado')}
                                  title="Copiar código de operación"
                                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            {sub.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveSubscription(sub)}
                                  disabled={approvingSubId === sub.id}
                                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {approvingSubId === sub.id ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>Emitiendo...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      <span>Aprobar y Emitir Licencia</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRejectingSub(sub)}
                                  className="px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                                >
                                  Rechazar
                                </button>
                              </>
                            )}

                            {sub.status === 'approved' && sub.generatedLicenseCode && (
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                                    Licencia Generada
                                  </span>
                                  <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                                    {sub.generatedLicenseCode}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(sub.generatedLicenseCode || '', 'Código de licencia copiado')}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                                  title="Copiar código"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(
                                    `¡Hola ${sub.customerName}! Tu acceso PRO en CalculaPerú ha sido activado con éxito. Tu código de activación oficial es: ${sub.generatedLicenseCode}. ¡Gracias por tu preferencia!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            )}

                            {sub.status === 'rejected' && sub.notes && (
                              <span className="text-xs text-red-500 italic max-w-xs">
                                Motivo: {sub.notes}
                              </span>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: LICENSES MANAGEMENT                                        */}
          {/* ================================================================= */}
          {activeTab === 'licenses' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#00875A]" />
                    <span>Gestor de Licencias y Códigos PRO</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Emite, monitorea y administra las licencias para clientes de CalculaPerú PRO
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewlyGenerated(null);
                    setIsIssueModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#00875A] hover:bg-[#00704A] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Emitir Nueva Licencia</span>
                </button>
              </div>

              {/* Filters Toolbar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3 text-xs">
                
                {/* Search Input */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={licenseSearch}
                    onChange={e => setLicenseSearch(e.target.value)}
                    placeholder="Buscar por código, cliente o correo..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold">Estado:</span>
                  <select
                    value={licenseStatusFilter}
                    onChange={e => setLicenseStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="available">Disponibles</option>
                    <option value="redeemed">Canjeadas</option>
                    <option value="revoked">Revocadas</option>
                  </select>
                </div>

                {/* Plan Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold">Plan:</span>
                  <select
                    value={licensePlanFilter}
                    onChange={e => setLicensePlanFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
                  >
                    <option value="all">Todos los planes</option>
                    <option value="yearly">Plan Anual (S/ 149)</option>
                    <option value="monthly">Plan Mensual (S/ 16)</option>
                  </select>
                </div>
              </div>

              {/* Dense Data Table */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5 pl-5">Código</th>
                        <th className="p-3.5">Cliente / Razón Social</th>
                        <th className="p-3.5">Plan y Duración</th>
                        <th className="p-3.5">Estado</th>
                        <th className="p-3.5">Canjeado Por</th>
                        <th className="p-3.5 text-right pr-5">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {filteredLicenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            No se encontraron licencias con los filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        filteredLicenses.map(lic => {
                          const isCopied = copiedCode === lic.code;

                          return (
                            <tr
                              key={lic.id || lic.code}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors"
                            >
                              {/* Code with Quick Copy */}
                              <td className="p-3.5 pl-5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                                    {lic.code}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(lic.code, `Código ${lic.code} copiado`)}
                                    title="Copiar código"
                                    className="p-1 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  >
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </td>

                              {/* Client Details */}
                              <td className="p-3.5">
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {lic.assignedClientName}
                                </div>
                                {lic.assignedClientEmail && (
                                  <div className="text-[11px] text-slate-400">{lic.assignedClientEmail}</div>
                                )}
                              </td>

                              {/* Plan & Duration */}
                              <td className="p-3.5">
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {lic.plan === 'yearly' ? 'Plan Anual' : 'Plan Mensual'}
                                </span>
                                <span className="text-[11px] text-slate-400 block font-mono">
                                  {lic.durationDays} días
                                </span>
                              </td>

                              {/* Status Badge */}
                              <td className="p-3.5">
                                {lic.status === 'available' && (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                                    DISPONIBLE
                                  </span>
                                )}
                                {lic.status === 'redeemed' && (
                                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px]">
                                    CANJEADA
                                  </span>
                                )}
                                {lic.status === 'revoked' && (
                                  <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold text-[10px]">
                                    REVOCADA
                                  </span>
                                )}
                              </td>

                              {/* Redeemed By */}
                              <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                                {lic.redeemedByUserEmail || (lic.redeemedAt ? 'Canje Anónimo' : '—')}
                              </td>

                              {/* Actions */}
                              <td className="p-3.5 text-right pr-5">
                                <div className="flex items-center justify-end gap-1.5">
                                  {lic.status === 'available' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const msg = `¡Hola ${lic.assignedClientName}! Tu suscripción a CalculaPerú PRO (${lic.plan === 'yearly' ? 'Plan Anual' : 'Plan Mensual'}) ha sido activada con éxito.\n\nTu código de activación es: ${lic.code}\n\nPuedes activarlo ahora mismo en: https://calculaperu.com.pe/pro o directamente en la web. ¡Gracias por confiar en CalculaPerú!`;
                                        handleCopy(msg, 'Mensaje para WhatsApp copiado');
                                      }}
                                      title="Copiar mensaje de WhatsApp"
                                      className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {lic.status !== 'revoked' && (
                                    <button
                                      type="button"
                                      onClick={() => setRevokingLicense(lic)}
                                      title="Revocar Licencia (Acción Destructiva)"
                                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: USERS DIRECTORY                                            */}
          {/* ================================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span>Directorio de Usuarios Registrados</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Visualiza usuarios, activa membresías PRO directamente y gestiona roles del sistema
                </p>
              </div>

              {/* Filter Toolbar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3 text-xs">
                
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Buscar por nombre, correo, RUC o empresa..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold">Membresía:</span>
                  <select
                    value={userProFilter}
                    onChange={e => setUserProFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
                  >
                    <option value="all">Todos</option>
                    <option value="pro">Solo PRO VIP</option>
                    <option value="free">Solo Estándar</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold">Rol:</span>
                  <select
                    value={userRoleFilter}
                    onChange={e => setUserRoleFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
                  >
                    <option value="all">Todos los roles</option>
                    <option value="admin">Administrador</option>
                    <option value="user">Usuario Regular</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5 pl-5">Usuario</th>
                        <th className="p-3.5">Empresa / RUC</th>
                        <th className="p-3.5">Rol</th>
                        <th className="p-3.5">Estado PRO</th>
                        <th className="p-3.5">Vencimiento</th>
                        <th className="p-3.5 text-right pr-5">Acciones Rápidas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            No se encontraron usuarios registrados.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                            <td className="p-3.5 pl-5">
                              <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                            </td>

                            <td className="p-3.5">
                              {u.companyName ? (
                                <div>
                                  <div className="font-semibold text-slate-800 dark:text-slate-200">{u.companyName}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">RUC: {u.companyRuc || '—'}</div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">No registrado</span>
                              )}
                            </td>

                            <td className="p-3.5">
                              {u.role === 'admin' ? (
                                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-[10px]">
                                  ADMIN
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold text-[10px]">
                                  USUARIO
                                </span>
                              )}
                            </td>

                            <td className="p-3.5">
                              {u.isPro ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                                    PRO {u.plan || 'Activo'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400">Plan Gratuito</span>
                              )}
                            </td>

                            <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                              {u.proExpiresAt ? new Date(u.proExpiresAt).toLocaleDateString('es-PE') : '—'}
                            </td>

                            <td className="p-3.5 text-right pr-5">
                              <button
                                type="button"
                                onClick={() => setGrantingUser(u)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                                  u.isPro
                                    ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                                }`}
                              >
                                {u.isPro ? 'Desactivar PRO' : 'Activar PRO Directo'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: AUDIT LOGS                                                 */}
          {/* ================================================================= */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <span>Registro Inmutable de Auditoría</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Trazabilidad de seguridad de todas las emisiones, canjes y modificaciones de licencias en CalculaPerú
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5 pl-5">Evento / Acción</th>
                        <th className="p-3.5">Ejecutado Por</th>
                        <th className="p-3.5">Objetivo (Target ID)</th>
                        <th className="p-3.5">Detalles</th>
                        <th className="p-3.5 text-right pr-5">Fecha y Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400">
                            No hay eventos registrados recientemente.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50">
                            <td className="p-3.5 pl-5">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {log.action}
                              </span>
                            </td>
                            <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                              {log.performedBy}
                            </td>
                            <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400">
                              {log.targetId || '—'}
                            </td>
                            <td className="p-3.5 text-slate-400 font-mono text-[11px] max-w-xs truncate">
                              {log.metadata ? JSON.stringify(log.metadata) : '—'}
                            </td>
                            <td className="p-3.5 text-right pr-5 text-slate-500 font-mono text-[11px]">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString('es-PE') : 'Reciente'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: SYSTEM & SUPABASE SETUP                                    */}
          {/* ================================================================= */}
          {activeTab === 'system' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-500" />
                  <span>Configuración de Supabase & Variables de Entorno</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Gestiona la persistencia real en la nube y despliega el esquema SQL con 1 clic
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Supabase Status Card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Estado de la Conexión</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                      {systemHealth?.supabase === 'connected' ? 'SUPABASE NATIVO' : 'STORAGE LOCAL (FALLBACK)'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    El backend limpio de <strong>CalculaPerú</strong> cuenta con un adaptador automático: si configuras tus claves de Supabase en <code>.env.local</code>, se conecta directamente a PostgreSQL. Si aún no las has configurado, opera de forma transparente en local sin interrumpir el servicio.
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 font-mono text-xs space-y-1.5">
                    <div className="text-slate-400"># Variables para .env.local</div>
                    <div className="text-emerald-600 dark:text-emerald-400">NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co</div>
                    <div className="text-emerald-600 dark:text-emerald-400">NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...</div>
                    <div className="text-emerald-600 dark:text-emerald-400">SUPABASE_SERVICE_ROLE_KEY=eyJhbG...</div>
                  </div>
                </div>

                {/* SQL Schema Deployer Card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-emerald-500" />
                      <span>Esquema SQL para Supabase (`schema.sql`)</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Incluye las tablas <code>profiles</code>, <code>licenses</code>, <code>audit_logs</code>, índices de alto rendimiento y políticas Row Level Security (RLS) para proteger los datos de tus usuarios.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const sqlSnippet = `-- Copia el archivo completo de: src/server/db/schema.sql\n-- O ejecuta este comando en tu terminal para verlo: type "src/server/db/schema.sql"`;
                      handleCopy(sqlSnippet, 'Ruta del esquema SQL copiada. Abre src/server/db/schema.sql');
                    }}
                    className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar Ruta del Esquema SQL (`schema.sql`)</span>
                  </button>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: EMITIR NUEVA LICENCIA PRO                                    */}
      {/* ===================================================================== */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-xs max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[#00875A] dark:text-[#00C853]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Emitir Licencia PRO</h3>
                  <p className="text-[11px] text-slate-500">Genera un código oficial para tu cliente</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newlyGenerated ? (
              <div className="space-y-4 text-center py-2 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-[#00875A] dark:text-[#00C853]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">CÓDIGO GENERADO:</span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3">
                    <span>{newlyGenerated.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(newlyGenerated.code, 'Código copiado')}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-500 shadow-xs cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Asignada a: <strong>{newlyGenerated.assignedClientName}</strong> ({newlyGenerated.plan === 'yearly' ? 'Plan Anual · 365 días' : 'Plan Mensual · 30 días'}).
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `¡Hola ${newlyGenerated.assignedClientName}! Tu suscripción a CalculaPerú PRO (${newlyGenerated.plan === 'yearly' ? 'Plan Anual' : 'Plan Mensual'}) ha sido activada.\n\nTu código de activación oficial es: ${newlyGenerated.code}\n\nActívalo en: https://calculaperu.com.pe/pro o directamente en la plataforma. ¡Gracias por confiar en CalculaPerú!`;
                      handleCopy(msg, 'Mensaje para WhatsApp copiado al portapapeles');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Copiar Mensaje para WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="w-full py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
                  >
                    Cerrar ventana
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIssueLicense} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Plan de la Suscripción</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewPlan('yearly');
                        setNewDurationDays('365');
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        newPlan === 'yearly'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Plan Anual (365 días)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPlan('monthly');
                        setNewDurationDays('30');
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        newPlan === 'monthly'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Plan Mensual (30 días)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Nombre o Razón Social del Cliente *</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    placeholder="Ej. Estudio Contable Rujel SAC"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico (Opcional)</label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={e => setNewClientEmail(e.target.value)}
                    placeholder="cliente@empresa.pe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generando licencia criptográfica...</span>
                    </>
                  ) : (
                    <>
                      <span>Generar Código de Activación</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: CONFIRMACIÓN DESTRUTIVA - REVOCAR LICENCIA                   */}
      {/* (Regla obligatoria de seguridad de la skill admin-ui-builder)         */}
      {/* ===================================================================== */}
      {revokingLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/60 shadow-2xl p-6 sm:p-8 space-y-5 text-xs">
            
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                ¿Estás seguro de revocar esta licencia?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Esta acción es <strong className="text-red-600">destructiva e irreversible</strong>. El código{' '}
                <code className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-900 dark:text-white">
                  {revokingLicense.code}
                </code>{' '}
                dejará de ser válido y, si ya fue canjeado por un usuario, se le retirará el acceso PRO inmediatamente.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={isRevoking}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isRevoking ? 'Revocando licencia...' : 'Sí, revocar y anular licencia'}
              </button>

              <button
                type="button"
                onClick={() => setRevokingLicense(null)}
                disabled={isRevoking}
                className="w-full py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                Cancelar y mantener activa
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: ACTIVAR / DESACTIVAR PRO DIRECTAMENTE A USUARIO              */}
      {/* ===================================================================== */}
      {grantingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {grantingUser.isPro ? 'Desactivar Membresía PRO' : 'Conceder Membresía PRO'}
                  </h3>
                  <p className="text-[11px] text-slate-500">{grantingUser.name} ({grantingUser.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGrantingUser(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!grantingUser.isPro ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Periodo a conceder:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGrantPlan('yearly')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        grantPlan === 'yearly'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Plan Anual (365 días)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGrantPlan('monthly')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        grantPlan === 'monthly'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Plan Mensual (30 días)
                    </button>
                  </div>
                </div>

                <p className="text-slate-500 text-xs">
                  El usuario podrá emitir boletas sin marca de agua y descargar reportes oficiales inmediatamente sin requerir código.
                </p>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                El usuario volverá al <strong>Plan Gratuito</strong> estándar. Sus boletas de prueba volverán a emitirse con marca de agua.
              </p>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmGrantPro}
                disabled={isGranting}
                className={`w-full py-2.5 px-4 font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  grantingUser.isPro
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-[#00875A] hover:bg-[#00704A] text-white'
                }`}
              >
                {isGranting
                  ? 'Guardando cambios...'
                  : grantingUser.isPro
                  ? 'Confirmar Desactivación PRO'
                  : 'Confirmar Activación Directa'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: SOLICITUD APROBADA - CÓDIGO GENERADO Y ENVIAR POR WHATSAPP     */}
      {/* ===================================================================== */}
      {approvedResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/40 shadow-2xl p-6 sm:p-8 space-y-6 text-xs text-center">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500/40 text-[#00875A] dark:text-[#00C853] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                ¡Solicitud Aprobada con Éxito!
              </h3>
              <p className="text-xs text-slate-500">
                Se ha generado y emitido la licencia PRO para{' '}
                <strong className="text-slate-900 dark:text-white">{approvedResultModal.subscription.customerName}</strong>
              </p>
            </div>

            {/* License Code Display Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider block">
                CÓDIGO OFICIAL EMITIDO:
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-black font-mono tracking-wider text-slate-900 dark:text-white select-all">
                  {approvedResultModal.licenseCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(approvedResultModal.licenseCode, 'Código copiado al portapapeles')}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-xs"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                href={approvedResultModal.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Código por WhatsApp al Cliente</span>
              </a>

              <button
                type="button"
                onClick={() => setApprovedResultModal(null)}
                className="w-full py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                Cerrar y volver a la bandeja
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: RECHAZAR SOLICITUD DE PAGO                                     */}
      {/* ===================================================================== */}
      {rejectingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-red-500/30 shadow-2xl p-6 sm:p-8 space-y-5 text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Rechazar Solicitud de Pago
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingSub(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              ¿Deseas rechazar la operación <strong className="font-mono text-slate-900 dark:text-white">{rejectingSub.operationCode}</strong> enviada por{' '}
              <strong>{rejectingSub.customerName}</strong> ({rejectingSub.customerEmail})?
            </p>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Motivo del rechazo (opcional):
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Ej. Operación no figura en cuenta, monto incompleto..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-slate-900 dark:text-white outline-none focus:border-red-500"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmRejectSubscription}
                disabled={isRejecting}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50"
              >
                {isRejecting ? 'Rechazando...' : 'Confirmar Rechazo'}
              </button>
              <button
                type="button"
                onClick={() => setRejectingSub(null)}
                className="w-full py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: SOLICITUD RECHAZADA - NOTIFICAR POR WHATSAPP                    */}
      {/* ===================================================================== */}

      {rejectedResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-amber-500/40 shadow-2xl p-6 sm:p-8 space-y-6 text-xs text-center">
            
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Solicitud Observada / Rechazada
              </h3>
              <p className="text-xs text-slate-500">
                Se registró el rechazo para{' '}
                <strong className="text-slate-900 dark:text-white">{rejectedResultModal.subscription.customerName}</strong>
              </p>
            </div>

            {/* Observation Card */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-left space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider block">
                MOTIVO / OBSERVACIÓN:
              </span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {rejectedResultModal.notes || 'Operación no encontrada en el extracto bancario.'}
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-amber-200/60 dark:border-amber-800/40">
                <span>Operación: <strong className="font-mono text-slate-900 dark:text-white">{rejectedResultModal.subscription.operationCode}</strong></span>
                <span>Tel: <strong className="text-slate-900 dark:text-white">{rejectedResultModal.subscription.customerPhone}</strong></span>
              </div>
            </div>

            <div className="space-y-2.5">
              {rejectedResultModal.whatsappUrl && (
                <a
                  href={rejectedResultModal.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Avisar al Cliente por WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setRejectedResultModal(null)}
                className="w-full py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                Cerrar y volver a la bandeja
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

