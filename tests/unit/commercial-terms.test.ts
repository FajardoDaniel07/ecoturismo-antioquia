import { describe, expect, it } from 'vitest';
import { findCommercialTerms } from '../../src/lib/content/commercial-terms';

const terms = (text: string) => findCommercialTerms(text).map((m) => m.term);

describe('findCommercialTerms (CA-137)', () => {
  it.each([
    ['Haz tu reserva hoy', 'reserva'],
    ['Reservar es fácil', 'reserva'],
    ['Quedan pocos cupos', 'cupo'],
    ['El precio incluye almuerzo', 'precio'],
    ['La tarifa es única', 'tarifa'],
    ['Cuesta 120000 COP', 'cop'],
    ['Con guía incluido', 'guia-incluido'],
    ['Con guia incluida', 'guia-incluido'],
    ['RESERVAS abiertas', 'reserva'],
  ])('encuentra %j', (text, term) => {
    expect(terms(text)).toEqual([term]);
  });

  it.each([
    'Una copa de vino',
    'Una vista preciosa',
    'Guías locales del municipio',
    'cop como palabra minúscula',
    'Copacabana queda cerca',
    'Un cupón de descuento',
  ])('no encuentra %j', (text) => {
    expect(terms(text)).toEqual([]);
  });

  it('devuelve el texto, la posición y el contexto de cada coincidencia', () => {
    const text = 'Aquí no se venden salidas: no hay reserva ni cupos.';
    const found = findCommercialTerms(text);
    expect(found.map((m) => [m.term, m.text])).toEqual([
      ['reserva', 'reserva'],
      ['cupo', 'cupos'],
    ]);
    expect(text.slice(found[0]!.index, found[0]!.index + 7)).toBe('reserva');
    expect(found[0]!.context).toContain('no hay reserva ni');
  });

  it('un nombre propio como "Reserva Natural" también se detecta (se revisa a mano)', () => {
    expect(terms('Reserva Natural Cañón del Río Claro')).toEqual(['reserva']);
  });

  it('compara sin tildes y mantiene las posiciones del texto original', () => {
    const text = 'Ñandú: guía incluido y TARIFA';
    const found = findCommercialTerms(text);
    expect(found.map((m) => text.slice(m.index, m.index + m.text.length))).toEqual([
      'guía incluido',
      'TARIFA',
    ]);
  });
});
