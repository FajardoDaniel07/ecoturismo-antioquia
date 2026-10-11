import { describe, expect, it } from 'vitest';
import { isPlaceholder } from '../../src/lib/content/placeholders';

describe('isPlaceholder (CA-120)', () => {
  it.each([
    '000',
    '123456',
    'XXXX',
    'ejemplo',
    'pendiente',
    'NIT 000.000.000-0',
    '',
    '   ',
    'correo@ejemplo.com',
    'N/D',
    'Por definir',
    'RNT 1111111',
    '654321',
  ])('rechaza %j', (value) => {
    expect(isPlaceholder(value)).toBe(true);
  });

  it.each([
    '+573127951683',
    'danielfajardog1902@gmail.com',
    'Lunes a viernes, de 10 a. m. a 10 p. m.',
    'NIT 901.234.567-8',
    'RNT 84521',
  ])('acepta %j', (value) => {
    expect(isPlaceholder(value)).toBe(false);
  });
});
