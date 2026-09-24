import { CompanyProfile } from '@/features/auth/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export function validateLoginInput(data: unknown): { isValid: boolean; data?: LoginInput; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Credenciales inválidas.' };
  }

  const payload = data as Record<string, unknown>;
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { isValid: false, error: 'Ingresa un correo electrónico válido.' };
  }

  if (!password || password.length < 6 || password.length > 1024) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  return { isValid: true, data: { email, password } };
}

export function validateRegisterInput(data: unknown): { isValid: boolean; data?: RegisterInput; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos de registro inválidos.' };
  }

  const payload = data as Record<string, unknown>;
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = typeof payload.password === 'string' ? payload.password : '';
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';

  if (!name || name.length < 2 || name.length > 120) {
    return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres.' };
  }

  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { isValid: false, error: 'Ingresa un correo electrónico válido.' };
  }

  if (!password || password.length < 8 || password.length > 1024) {
    return { isValid: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe incluir al menos una letra mayúscula.' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe incluir al menos una letra minúscula.' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'La contraseña debe incluir al menos un número.' };
  }

  return { isValid: true, data: { email, password, name } };
}

export function validateCompanyProfileInput(data: unknown): { isValid: boolean; data?: CompanyProfile; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Datos corporativos inválidos.' };
  }

  const payload = data as Record<string, unknown>;
  const companyName = typeof payload.companyName === 'string' ? payload.companyName.trim() : undefined;
  const companyRuc = typeof payload.companyRuc === 'string' ? payload.companyRuc.trim() : undefined;
  const companyAddress = typeof payload.companyAddress === 'string' ? payload.companyAddress.trim() : undefined;
  const companyLogoBase64 = typeof payload.companyLogoBase64 === 'string' ? payload.companyLogoBase64 : undefined;

  if ((companyName?.length ?? 0) > 160 || (companyAddress?.length ?? 0) > 500) {
    return { isValid: false, error: 'Los datos de empresa superan el límite permitido.' };
  }
  if (companyLogoBase64 && (companyLogoBase64.length > 450000 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(companyLogoBase64))) {
    return { isValid: false, error: 'El logo debe ser PNG, JPEG o WebP y no superar 330 KB.' };
  }

  if (companyRuc && !/^(10|20)\d{9}$/.test(companyRuc)) {
    return { isValid: false, error: 'El RUC debe iniciar con 10 o 20 y contener exactamente 11 dígitos numéricos.' };
  }

  return {
    isValid: true,
    data: {
      companyName,
      companyRuc,
      companyAddress,
      companyLogoBase64,
    },
  };
}
