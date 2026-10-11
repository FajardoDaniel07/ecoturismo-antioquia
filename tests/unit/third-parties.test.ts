import { describe, expect, it } from 'vitest';
import {
  THIRD_PARTIES,
  findMissingThirdParties,
  isDeclaredOrigin,
} from '../../src/lib/privacy/third-parties';

describe('registro de terceros (CA-135, CA-136)', () => {
  it('declara OpenStreetMap, WhatsApp y Vercel', () => {
    expect(THIRD_PARTIES.map((t) => t.name)).toEqual(['OpenStreetMap', 'WhatsApp', 'Vercel']);
  });

  it('una política que los nombra a todos no tiene faltantes', () => {
    const text =
      'Usamos teselas de OpenStreetMap, un enlace a whatsapp y el alojamiento de VERCEL.';
    expect(findMissingThirdParties(text)).toEqual([]);
  });

  it.each(['OpenStreetMap', 'WhatsApp', 'Vercel'])('detecta que falta %s', (name) => {
    const others = THIRD_PARTIES.filter((t) => t.name !== name).map((t) => t.name);
    const missing = findMissingThirdParties(`Nombramos a ${others.join(', ')}.`);
    expect(missing.map((t) => t.name)).toEqual([name]);
  });

  it('un texto vacío no nombra a nadie', () => {
    expect(findMissingThirdParties('')).toHaveLength(3);
  });

  it('isDeclaredOrigin acepta el propio sitio y los orígenes declarados', () => {
    const site = 'https://ejemplo.vercel.app';
    expect(isDeclaredOrigin(site, site)).toBe(true);
    expect(isDeclaredOrigin('https://tile.openstreetmap.org', site)).toBe(true);
    expect(isDeclaredOrigin('https://wa.me', site)).toBe(true);
    expect(isDeclaredOrigin('https://fonts.googleapis.com', site)).toBe(false);
    expect(isDeclaredOrigin('https://otro.openstreetmap.org', site)).toBe(false);
  });
});
