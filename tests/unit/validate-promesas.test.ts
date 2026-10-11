import { describe, expect, it } from 'vitest';
import { validateSite } from '../../src/lib/content/validate';
import { dest, rutaEntry, validRaw } from './helpers/site';

const found = (raw: ReturnType<typeof validRaw>) =>
  validateSite(raw, 'release').issues.filter((i) => i.criterion === 'CA-137');

describe('promesas comerciales en el build (CA-137)', () => {
  it('un contenido sin términos no da avisos', () => {
    expect(found(validRaw())).toEqual([]);
  });

  it('avisa (no detiene) por un término en el resumen, el cuerpo o una ruta', () => {
    const raw = validRaw();
    raw.destinos[0]!.data.summary = 'Reserva tu cupo ya.';
    raw.destinos[1]!.body = 'El precio incluye guía incluido.';
    raw.rutas = [rutaEntry('r', 'valle', { properties: { name: 'Ruta con tarifa' } })];
    const issues = found(raw);
    expect(issues.length).toBeGreaterThanOrEqual(5);
    expect(issues.every((i) => i.severity === 'warning')).toBe(true);
    expect(issues.map((i) => i.field)).toEqual(
      expect.arrayContaining(['summary', '(cuerpo)', 'properties.name']),
    );
    expect(validateSite(raw, 'release').site).not.toBeNull();
  });

  it('el aviso lleva archivo, campo y el contexto de la coincidencia', () => {
    const raw = validRaw();
    raw.destinos.push(dest('extra', { altitude: { meters: 700, verified: true, source: 'x' } }));
    raw.destinos[4]!.body = 'Visita la Reserva Natural del cañón.';
    const [issue] = found(raw);
    expect(issue).toMatchObject({ file: 'destinos/extra', field: '(cuerpo)', severity: 'warning' });
    expect(issue?.message).toContain('Reserva Natural');
  });
});
