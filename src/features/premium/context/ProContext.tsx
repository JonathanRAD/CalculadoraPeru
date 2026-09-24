'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SafeUser, CompanyProfile } from '@/features/auth/types';

interface ProContextType {
  // Auth state
  user: SafeUser | null;
  isLoadingUser: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message: string }>;
  updateCompanyProfile: (data: CompanyProfile & { name?: string }) => Promise<{ success: boolean; message: string }>;

  // PRO Status & Session
  isPro: boolean;
  plan: 'yearly' | 'monthly' | null;
  subscriberName: string;
  expiresAt: string | null;
  activatePro: (code: string) => Promise<{ success: boolean; message: string }>;
  logoutPro: () => void;

  // Modals
  isActivationModalOpen: boolean;
  openActivationModal: () => void;
  closeActivationModal: () => void;

  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;

  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const ProContext = createContext<ProContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'calculaperu_pro_session_v1';
const USER_STORAGE_KEY = 'calculaperu_user_account';

export function ProProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const authEpoch = useRef(0);


  // Modals
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // 1. Fetch current logged-in user on mount
  const checkCurrentUser = useCallback(async () => {
    const epoch = authEpoch.current;
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();
      if (epoch !== authEpoch.current) return;
      if (res.ok && data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      if (epoch === authEpoch.current) setUser(null);
    } finally {
      if (epoch === authEpoch.current) setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    try { localStorage.removeItem(USER_STORAGE_KEY); } catch { /* storage may be disabled */ }
    void Promise.resolve().then(checkCurrentUser);
  }, [checkCurrentUser]);

  // Remove legacy browser-only PRO state; the account is the authority.
  useEffect(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const isPro = Boolean(user?.isPro && user.proExpiresAt && new Date(user.proExpiresAt) > new Date());
  const plan = user?.plan ?? null;
  const subscriberName = user?.name || 'Usuario PRO';
  const expiresAt = user?.proExpiresAt ?? null;

  // Modal openers
  const openActivationModal = useCallback(() => setIsActivationModalOpen(true), []);
  const closeActivationModal = useCallback(() => setIsActivationModalOpen(false), []);

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const openProfileModal = useCallback(() => setIsProfileModalOpen(true), []);
  const closeProfileModal = useCallback(() => setIsProfileModalOpen(false), []);

  // Auth methods
  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        authEpoch.current += 1;
        setUser(data.user);
        setIsLoadingUser(false);
        setIsAuthModalOpen(false);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Error al iniciar sesión.' };
    } catch {
      return { success: false, message: 'Error de conexión al servidor.' };
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        authEpoch.current += 1;
        setUser(data.user);
        setIsLoadingUser(false);
        setIsAuthModalOpen(false);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Error al registrar.' };
    } catch {
      return { success: false, message: 'Error de conexión al servidor.' };
    }
  };

  const logout = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (!response.ok) return { success: false, message: 'No se pudo cerrar la sesión. Intenta de nuevo.' };
    } catch {
      return { success: false, message: 'No hay conexión para cerrar la sesión. Intenta de nuevo.' };
    }
    authEpoch.current += 1;
    setUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // ignore
    }
    logoutPro();
    setIsProfileModalOpen(false);
    return { success: true, message: 'Sesión cerrada.' };
  };

  const updateCompanyProfile = async (data: CompanyProfile & { name?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setUser(resData.user);
        return { success: true, message: resData.message };
      }
      return { success: false, message: resData.message || 'Error actualizando perfil.' };
    } catch {
      return { success: false, message: 'Error de conexión.' };
    }
  };

  // Activate license code
  const activatePro = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/pro/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.user) {
          setUser(data.user);
        }

        try {
          import('canvas-confetti').then((m) => {
            const fire = m.default || m;
            fire({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 },
            });
          });
        } catch {
          // confetti optional
        }

        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Código no válido.' };
      }
    } catch (err) {
      console.error('Error al activar:', err);
      return { success: false, message: 'Error de conexión. Inténtalo nuevamente.' };
    }
  };

  const logoutPro = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      document.cookie = 'calculaperu_pro_active=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch {
      // ignore
    }
  }, []);

  return (
    <ProContext.Provider
      value={{
        user,
        isLoadingUser,
        login,
        register,
        logout,
        updateCompanyProfile,
        isPro,
        plan,
        subscriberName,
        expiresAt,
        activatePro,
        logoutPro,
        isActivationModalOpen,
        openActivationModal,
        closeActivationModal,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const context = useContext(ProContext);
  if (!context) {
    throw new Error('usePro debe ser utilizado dentro de un ProProvider');
  }
  return context;
}
