import { ProPlan } from '@/features/auth/types';

export interface CreateLicenseInput {
  plan: ProPlan;
  clientName: string;
  clientEmail?: string;
  durationDays?: number;
  createdBy?: string;
}

export interface RedeemLicenseInput {
  code: string;
  userId?: string;
  userEmail?: string;
}

export function validateCreateLicenseInput(data: unknown): { isValid: boolean; data?: CreateLicenseInput; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de solicitud inválidos.' };
  }

  const payload = data as Record<string, unknown>;
  const rawPlan = String(payload.plan || '').toLowerCase();
  const plan: ProPlan = rawPlan === 'monthly' ? 'monthly' : 'yearly';
  const clientName = typeof payload.clientName === 'string' ? payload.clientName.trim() : '';
  const clientEmail = typeof payload.clientEmail === 'string' ? payload.clientEmail.trim() : undefined;
  
  let durationDays: number | undefined = undefined;
  if (typeof payload.durationDays === 'number' && payload.durationDays > 0) {
    durationDays = Math.floor(payload.durationDays);
  } else if (typeof payload.durationDays === 'string' && parseInt(payload.durationDays, 10) > 0) {
    durationDays = parseInt(payload.durationDays, 10);
  }

  if (!clientName) {
    return { isValid: false, error: 'El nombre o razón social del cliente es obligatorio.' };
  }

  if (clientName.length < 2 || clientName.length > 150) {
    return { isValid: false, error: 'El nombre debe tener entre 2 y 150 caracteres.' };
  }

  if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    return { isValid: false, error: 'El correo electrónico tiene un formato inválido.' };
  }

  return {
    isValid: true,
    data: {
      plan,
      clientName,
      clientEmail,
      durationDays,
      createdBy: typeof payload.createdBy === 'string' ? payload.createdBy : 'Admin Panel',
    },
  };
}

export function validateRedeemLicenseInput(data: unknown): { isValid: boolean; data?: RedeemLicenseInput; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de solicitud inválidos.' };
  }

  const payload = data as Record<string, unknown>;
  const code = typeof payload.code === 'string' ? payload.code.trim().toUpperCase() : '';

  if (!code) {
    return { isValid: false, error: 'El código de activación es obligatorio.' };
  }

  if (code.length < 4 || code.length > 40) {
    return { isValid: false, error: 'Código de activación con longitud no válida.' };
  }

  return {
    isValid: true,
    data: {
      code,
      userId: typeof payload.userId === 'string' ? payload.userId : undefined,
      userEmail: typeof payload.userEmail === 'string' ? payload.userEmail : undefined,
    },
  };
}
