import { describe, expect, it } from 'vitest';
import { buildWhatsAppUrl, formatPhone, whatsAppMessage } from '../../src/lib/contact/whatsapp';
import { navLinks } from '../../src/lib/nav';
import { DESCRIPTION_MAX, TITLE_MAX, documentTitle } from '../../src/lib/seo/meta';

describe('documentTitle (CA-33)', () => {
  it('añade el nombre del sitio', () => {
    expect(documentTitle('Valle de Cocora')).toBe('Valle de Cocora | Ecoturismo Antioquia');
    expect(documentTitle()).toBe('Ecoturismo Antioquia');
  });

  it('un nombre de 37 caracteres cabe en el límite de 60', () => {
    expect(documentTitle('x'.repeat(37)).length).toBeLessThanOrEqual(TITLE_MAX);
    expect(DESCRIPTION_MAX).toBe(160);
  });
});

describe('WhatsApp (CA-36, CA-83)', () => {
  it('abre wa.me/573127951683 con el texto codificado', () => {
    const url = buildWhatsAppUrl('+573127951683', whatsAppMessage('operator'));
    expect(url.startsWith('https://wa.me/573127951683?text=')).toBe(true);
    expect(new URL(url).searchParams.get('text')).toBe(
      'Hola, quiero información sobre las salidas de Ecoturismo Antioquia.',
    );
    expect(url).not.toContain(' ');
  });

  it('el mensaje de un detalle nombra el destino', () => {
    const url = buildWhatsAppUrl('+573127951683', whatsAppMessage('operator', 'Valle de Cocora'));
    expect(new URL(url).searchParams.get('text')).toBe(
      'Hola, quiero información sobre la salida a Valle de Cocora.',
    );
  });

  it('codifica caracteres especiales del nombre', () => {
    const url = buildWhatsAppUrl('+573127951683', whatsAppMessage('operator', 'Cañón & Río #1'));
    expect(new URL(url).searchParams.get('text')).toContain('Cañón & Río #1');
    expect(url).toContain('%26');
  });

  it('CA-132: en modo académico el mensaje dice que es un proyecto de prueba', () => {
    expect(whatsAppMessage('academic')).toBe(
      'Hola. Escribo desde el sitio Ecoturismo Antioquia, un proyecto académico de prueba.',
    );
    expect(whatsAppMessage('academic', 'Jardín')).toBe(
      'Hola. Escribo desde el sitio Ecoturismo Antioquia, un proyecto académico de prueba. Vi el destino Jardín.',
    );
    const url = buildWhatsAppUrl('+573127951683', whatsAppMessage('academic', 'Jardín'));
    expect(url.startsWith('https://wa.me/573127951683?text=')).toBe(true);
  });

  it('formatea el número', () => {
    expect(formatPhone('+573127951683')).toBe('+57 312 795 1683');
    expect(formatPhone('3127951683')).toBe('3127951683');
  });
});

describe('navLinks (CA-93)', () => {
  it('todas las secciones, en orden', () => {
    expect(navLinks({ galeria: true, mapa: true }).map((l) => l.label)).toEqual([
      'Destinos',
      'Galería',
      'Mapa de rutas',
      'Contacto',
    ]);
  });

  it('una sección no publicada no tiene enlace', () => {
    expect(navLinks({ galeria: false, mapa: true }).map((l) => l.label)).toEqual([
      'Destinos',
      'Mapa de rutas',
      'Contacto',
    ]);
    expect(navLinks({ galeria: false, mapa: false }).map((l) => l.label)).toEqual([
      'Destinos',
      'Contacto',
    ]);
  });

  it('los enlaces llevan a la página de inicio', () => {
    for (const l of navLinks({ galeria: true, mapa: true })) expect(l.href).toMatch(/^\/#[a-z-]+$/);
  });
});
