import { isValidEmail, normalizePhone } from './quote.validator';

export const ALLOWED_CONTACT_CATEGORIES = [
  'consulta_general',
  'calculadora',
  'cotizador',
  'cotizador_feedback',
  'cuenta_pro',
  'error_report',
  'mejora',
  'privacidad',
  'alianza',
  'comercial',
  'soporte_tecnico',
  'sugerencia',
  'otro',
];

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  category: string;
  message: string;
  sourcePath?: string;
  consent: boolean;
  idempotencyKey?: string;
}

export function validateContactInput(raw: unknown): {
  isValid: boolean;
  error?: string;
  data?: ContactInput;
} {
  if (!raw || typeof raw !== 'object') {
    return { isValid: false, error: 'Cuerpo de solicitud inválido.' };
  }

  const body = raw as Record<string, unknown>;

  // Honeypot check
  if (typeof body.honeypot === 'string' && body.honeypot.trim().length > 0) {
    return { isValid: false, error: 'Solicitud rechazada por filtro de seguridad.' };
  }

  // Name
  if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.trim().length > 100) {
    return { isValid: false, error: 'El nombre es obligatorio y debe tener entre 2 y 100 caracteres.' };
  }

  // Email
  if (typeof body.email !== 'string' || !isValidEmail(body.email)) {
    return { isValid: false, error: 'Ingresa un correo electrónico de contacto válido (máximo 254 caracteres).' };
  }

  // Phone (optional)
  let cleanPhone: string | undefined = undefined;
  if (body.phone !== undefined && body.phone !== null && String(body.phone).trim() !== '') {
    if (typeof body.phone !== 'string') {
      return { isValid: false, error: 'El teléfono debe ser un valor de texto.' };
    }
    cleanPhone = normalizePhone(body.phone);
    if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 15) {
      return { isValid: false, error: 'El teléfono debe contener entre 7 y 15 dígitos numéricos.' };
    }
  }

  // Category
  const cat = typeof body.category === 'string' ? body.category.trim() : 'consulta_general';
  if (!ALLOWED_CONTACT_CATEGORIES.includes(cat)) {
    return { isValid: false, error: 'La categoría seleccionada no es válida.' };
  }

  // Message
  if (typeof body.message !== 'string' || body.message.trim().length < 20 || body.message.trim().length > 2000) {
    return { isValid: false, error: 'El mensaje debe tener al menos 20 caracteres y un máximo de 2000.' };
  }

  // Consent
  if (body.consent !== true) {
    return { isValid: false, error: 'Debes aceptar la política de privacidad para enviar tu consulta.' };
  }

  // Source path
  const sourcePath = typeof body.sourcePath === 'string' ? body.sourcePath.slice(0, 200) : '/contacto';

  // Idempotency key
  const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim().slice(0, 100) : undefined;

  return {
    isValid: true,
    data: {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: cleanPhone,
      category: cat,
      message: body.message.trim(),
      sourcePath,
      consent: true,
      idempotencyKey,
    },
  };
}
