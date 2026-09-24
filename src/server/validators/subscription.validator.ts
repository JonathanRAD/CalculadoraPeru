import { ProPlan } from '@/features/auth/types';

export interface CreateSubscriptionRequestInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  plan: ProPlan;
  amount: number;
  operationCode: string;
  couponCode?: string;
  userId?: string;
}

export function validateCreateSubscriptionInput(data: unknown): {
  isValid: boolean;
  data?: CreateSubscriptionRequestInput;
  error?: string;
} {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de solicitud inválidos.' };
  }

  const payload = data as Record<string, unknown>;
  const customerName = typeof payload.customerName === 'string' ? payload.customerName.trim() : '';
  const customerEmail = typeof payload.customerEmail === 'string' ? payload.customerEmail.trim().toLowerCase() : '';
  const customerPhone = typeof payload.customerPhone === 'string' ? payload.customerPhone.trim() : '';
  const operationCode = typeof payload.operationCode === 'string' ? payload.operationCode.trim().toUpperCase() : '';
  const rawPlan = String(payload.plan || '').toLowerCase();
  const plan = rawPlan as ProPlan;

  const couponCode = typeof payload.couponCode === 'string' && payload.couponCode.trim() 
    ? payload.couponCode.trim().toUpperCase() 
    : undefined;
  if (couponCode && !isValidPromoCode(couponCode)) {
    return { isValid: false, error: 'El cupón no está disponible o ha expirado.' };
  }
  const amount = couponCode ? 0 : (plan === 'yearly' ? 149 : 16);

  const userId = typeof payload.userId === 'string' && payload.userId.trim()
    ? payload.userId.trim()
    : undefined;

  if (!customerName || customerName.length < 2 || customerName.length > 120) {
    return { isValid: false, error: 'El nombre completo o razón social es obligatorio.' };
  }

  if (!customerEmail || customerEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return { isValid: false, error: 'El correo electrónico es inválido.' };
  }

  if (!customerPhone || customerPhone.length > 30 || customerPhone.replace(/\D/g, '').length < 8) {
    return { isValid: false, error: 'El número de celular/WhatsApp debe tener al menos 8 dígitos.' };
  }

  if (!operationCode || operationCode.length < 4 || operationCode.length > 80) {
    return { isValid: false, error: 'El número o código de operación Yape/Plin es obligatorio (mínimo 4 caracteres).' };
  }

  if (rawPlan !== 'monthly' && rawPlan !== 'yearly') {
    return { isValid: false, error: 'Selecciona un plan válido.' };
  }

  return {
    isValid: true,
    data: {
      customerName,
      customerEmail,
      customerPhone,
      plan,
      amount,
      operationCode,
      couponCode,
      userId,
    },
  };
}

export function isValidPromoCode(code: string): boolean {
  const clean = code.trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,40}$/.test(clean)) return false;
  const allowed = (process.env.PRO_PROMO_CODES || '').split(',').map(item => item.trim().toUpperCase()).filter(Boolean);
  return allowed.includes(clean);
}
