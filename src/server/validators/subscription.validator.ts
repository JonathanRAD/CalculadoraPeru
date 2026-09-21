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
  const plan: ProPlan = rawPlan === 'monthly' ? 'monthly' : 'yearly';
  
  let amount = typeof payload.amount === 'number' && payload.amount > 0 
    ? payload.amount 
    : (plan === 'yearly' ? 149 : 16);

  const couponCode = typeof payload.couponCode === 'string' && payload.couponCode.trim() 
    ? payload.couponCode.trim().toUpperCase() 
    : undefined;

  const userId = typeof payload.userId === 'string' && payload.userId.trim()
    ? payload.userId.trim()
    : undefined;

  if (!customerName || customerName.length < 2) {
    return { isValid: false, error: 'El nombre completo o razón social es obligatorio.' };
  }

  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return { isValid: false, error: 'El correo electrónico es inválido.' };
  }

  if (!customerPhone || customerPhone.replace(/\D/g, '').length < 8) {
    return { isValid: false, error: 'El número de celular/WhatsApp debe tener al menos 8 dígitos.' };
  }

  if (!operationCode || operationCode.length < 4) {
    return { isValid: false, error: 'El número o código de operación Yape/Plin es obligatorio (mínimo 4 caracteres).' };
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
