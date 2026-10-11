import { describe, expect, it } from 'vitest';
import {
  difficultyInfo,
  formatAltitude,
  formatAltitudeRange,
  formatClimate,
  formatDistanceAscent,
  formatDuration,
  formatLongDate,
  formatMinAge,
} from '../../src/lib/format/units';

describe('altitud (CA-2, CA-23)', () => {
  it('forma corta, sin separador de miles', () => {
    expect(formatAltitude(2500, 'short')).toBe('2500 m');
    expect(formatAltitude(125, 'short')).toBe('125 m');
  });

  it('forma larga', () => {
    expect(formatAltitude(2500, 'long')).toBe('2500 metros de altitud');
  });

  it('rango con la unidad escrita una sola vez', () => {
    expect(formatAltitudeRange(125, 4080)).toBe('de 125 a 4080 metros de altitud');
    expect(formatAltitudeRange(0, 4080)).toBe('de 0 a 4080 metros de altitud');
  });

  it('nunca escribe "m s. n. m." ni puntos de miles', () => {
    for (const text of [formatAltitude(3500, 'long'), formatAltitudeRange(100, 4100)]) {
      expect(text).not.toMatch(/s\. n\. m\./);
      expect(text).not.toMatch(/\d\.\d{3}/);
    }
  });
});

describe('clima (CA-24)', () => {
  it('escribe "Entre X y Y °C"', () => {
    expect(formatClimate(16, 24)).toBe('Entre 16 y 24 °C');
    expect(formatClimate(-2, 8.5)).toBe('Entre -2 y 8,5 °C');
  });

  it('rechaza mínima mayor o igual que la máxima', () => {
    expect(() => formatClimate(24, 16)).toThrow(/CA-24/);
    expect(() => formatClimate(16, 16)).toThrow(/CA-24/);
  });
});

describe('duración (CA-25)', () => {
  it.each([
    [1, 'hours', '1 hora'],
    [5, 'hours', '5 horas'],
    [1, 'days', '1 día'],
    [2, 'days', '2 días'],
    [1.5, 'hours', '1,5 horas'],
  ] as const)('%s %s -> %s', (value, unit, expected) => {
    expect(formatDuration(value, unit)).toBe(expected);
  });
});

describe('distancia y desnivel (CA-22, CA-26)', () => {
  it('ambas cifras, con coma decimal', () => {
    expect(formatDistanceAscent(8.5, 400)).toEqual({
      label: 'Distancia y desnivel',
      value: '8,5 km, 400 m de subida',
    });
    expect(formatDistanceAscent(8, 400)?.value).toBe('8 km, 400 m de subida');
  });

  it('sin separador de miles en cuatro cifras', () => {
    expect(formatDistanceAscent(12, 1200)?.value).toBe('12 km, 1200 m de subida');
  });

  it('solo una cifra cambia la etiqueta', () => {
    expect(formatDistanceAscent(8.5, undefined)).toEqual({ label: 'Distancia', value: '8,5 km' });
    expect(formatDistanceAscent(undefined, 400)).toEqual({
      label: 'Desnivel',
      value: '400 m de subida',
    });
  });

  it('un desnivel de cero sí se escribe; ninguna cifra, no hay fila', () => {
    expect(formatDistanceAscent(undefined, 0)?.value).toBe('0 m de subida');
    expect(formatDistanceAscent()).toBeNull();
  });
});

describe('edad (CA-28)', () => {
  it('formas literales de la spec', () => {
    expect(formatMinAge(6)).toBe('Apta desde los 6 años');
    expect(formatMinAge(0)).toBe('Apta para todas las edades');
    expect(formatMinAge(1)).toBe('Apta desde 1 año');
  });
});

describe('dificultad (CA-27)', () => {
  it('palabra y marcas', () => {
    expect(difficultyInfo('easy')).toEqual({ word: 'Fácil', marks: 1 });
    expect(difficultyInfo('moderate')).toEqual({ word: 'Moderada', marks: 2 });
    expect(difficultyInfo('demanding')).toEqual({ word: 'Exigente', marks: 3 });
  });
});

describe('fecha larga', () => {
  it('escribe día, mes y año en español, en UTC', () => {
    expect(formatLongDate(new Date('2026-10-10'))).toBe('10 de octubre de 2026');
    expect(formatLongDate(new Date('2026-11-01'))).toBe('1 de noviembre de 2026');
    expect(formatLongDate(new Date('2027-01-31T00:00:00Z'))).toBe('31 de enero de 2027');
  });
});
