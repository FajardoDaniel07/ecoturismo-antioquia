import { describe, expect, it } from 'vitest';
import { buildFicha } from '../../src/lib/ficha/build';
import { validateSite, type Destino, type Ruta } from '../../src/lib/content/validate';
import { dest, rutaEntry, validRaw } from './helpers/site';

function publish(
  over: Parameters<typeof dest>[1] = {},
  ruta: Parameters<typeof rutaEntry>[2] = {},
) {
  const raw = validRaw();
  raw.destinos = [
    dest('valle', { altitude: { meters: 1750, verified: true, source: 'x' }, ...over }),
  ];
  raw.rutas = [rutaEntry('sendero', 'valle', ruta)];
  const { site } = validateSite(raw, 'preview');
  if (!site) throw new Error('el escenario debería publicarse');
  return { destino: site.destinos[0] as Destino, ruta: site.rutas[0] as Ruta };
}

const FULL = {
  climate: { minC: 16, maxC: 24 },
  access: 'A 3 horas de Medellín por carretera',
  duration: { value: 5, unit: 'hours' as const },
  distanceKm: 8.5,
  ascentM: 400,
  difficulty: 'moderate' as const,
  minAge: 6,
};

describe('buildFicha (CA-21)', () => {
  it('siete filas en orden fijo con los formatos de S5', () => {
    const { destino } = publish(FULL);
    expect(buildFicha(destino, 'full').map((r) => [r.key, r.label, r.value])).toEqual([
      ['altitude', 'Altitud', '1750 m, piso templado'],
      ['climate', 'Clima habitual', 'Entre 16 y 24 °C'],
      ['access', 'Cómo llegar', 'A 3 horas de Medellín por carretera'],
      ['duration', 'Duración', '5 horas'],
      ['distance', 'Distancia y desnivel', '8,5 km, 400 m de subida'],
      ['difficulty', 'Dificultad', 'Moderada'],
      ['age', 'Edad sugerida', 'Apta desde los 6 años'],
    ]);
  });

  it('la fila de altitud lleva el piso y la de dificultad las marcas (CA-27)', () => {
    const rows = buildFicha(publish(FULL).destino, 'full');
    expect(rows[0]).toMatchObject({ zone: 'temperate', zoneText: 'piso templado' });
    expect(rows.find((r) => r.key === 'difficulty')?.marks).toBe(2);
  });

  it('la variante resumida del listado: altitud, duración y dificultad, en el mismo orden', () => {
    expect(buildFicha(publish(FULL).destino, 'summary').map((r) => r.key)).toEqual([
      'altitude',
      'duration',
      'difficulty',
    ]);
  });
});

describe('datos que faltan (CA-22)', () => {
  it('un dato ausente no genera fila y los demás conservan su orden', () => {
    const { destino } = publish({ duration: FULL.duration, minAge: 0 });
    const rows = buildFicha(destino, 'full');
    expect(rows.map((r) => r.key)).toEqual(['altitude', 'duration', 'age']);
    expect(rows[2]?.value).toBe('Apta para todas las edades');
    for (const r of rows) expect(r.value).not.toMatch(/N\/D|sin dato|^$/i);
  });

  it('sin ningún dato opcional solo queda la altitud', () => {
    expect(buildFicha(publish().destino, 'full')).toHaveLength(1);
  });

  it('solo distancia: la etiqueta pasa a "Distancia"', () => {
    const row = buildFicha(publish({ distanceKm: 8.5 }).destino, 'full').find(
      (r) => r.key === 'distance',
    );
    expect(row).toMatchObject({ label: 'Distancia', value: '8,5 km' });
  });

  it('solo desnivel: la etiqueta pasa a "Desnivel"', () => {
    const row = buildFicha(publish({ ascentM: 400 }).destino, 'full').find(
      (r) => r.key === 'distance',
    );
    expect(row).toMatchObject({ label: 'Desnivel', value: '400 m de subida' });
  });

  it('la variante resumida omite también lo que falta', () => {
    expect(buildFicha(publish().destino, 'summary').map((r) => r.key)).toEqual(['altitude']);
  });
});

describe('ficha de una ruta', () => {
  it('la fila de altitud es la del destino y el resto sale de la ruta', () => {
    const { ruta } = publish(
      { duration: { value: 9, unit: 'hours' } },
      {
        properties: { duration: { value: 3, unit: 'hours' }, difficulty: 'easy' },
      },
    );
    const rows = buildFicha(ruta, 'full');
    expect(rows.map((r) => r.key)).toEqual(['altitude', 'duration', 'difficulty']);
    expect(rows[0]?.value).toBe('1750 m, piso templado');
    expect(rows[1]?.value).toBe('3 horas');
    expect(rows[2]).toMatchObject({ value: 'Fácil', marks: 1 });
  });

  it('mismo orden relativo que la ficha de un destino', () => {
    const { ruta, destino } = publish(FULL, { properties: FULL });
    expect(buildFicha(ruta, 'full').map((r) => r.key)).toEqual(
      buildFicha(destino, 'full').map((r) => r.key),
    );
  });
});
