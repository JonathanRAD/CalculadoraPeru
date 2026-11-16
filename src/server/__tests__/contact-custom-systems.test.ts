import { describe, expect, it } from 'vitest';
import { ALLOWED_CONTACT_CATEGORIES, validateContactInput } from '../validators/contact.validator';

const base = {
  name: 'María Torres',
  email: 'maria@ejemplo.pe',
  message: 'Tengo una bodega y quiero llevar el inventario y las ventas en un sistema propio.',
  consent: true,
};

describe('contacto: sistemas a medida', () => {
  it('la categoría sistema_a_medida es válida', () => {
    expect(ALLOWED_CONTACT_CATEGORIES).toContain('sistema_a_medida');
    const result = validateContactInput({ ...base, category: 'sistema_a_medida' });
    expect(result.isValid).toBe(true);
    expect(result.data?.category).toBe('sistema_a_medida');
  });

  it('sigue rechazando categorías desconocidas', () => {
    const result = validateContactInput({ ...base, category: 'categoria_inventada' });
    expect(result.isValid).toBe(false);
  });
});
