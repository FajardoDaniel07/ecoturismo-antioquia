/**
 * Los cuatro cruces de R2 (modo de sitio × compilación) y cada fila de la tabla de reglas nuevas.
 */
import { describe, expect, it } from 'vitest';
import {
  SITE_URL_INVALID,
  SITE_URL_MISSING,
  siteUrlIssues,
  validateSite,
  type BuildMode,
  type RawSite,
} from '../../src/lib/content/validate';
import { operator } from './helpers/content';
import { PRIVACY_BODY, entry, fullOperator, legals, rules, validRaw } from './helpers/site';
import type { SiteKind } from '../../src/lib/content/schemas';

const MODES: BuildMode[] = ['preview', 'release'];

/** Sitio válido de cada tipo: académico con textos de muestra y sin identificadores. */
function raw(kind: SiteKind): RawSite {
  const r = validRaw();
  if (kind === 'academic') {
    r.legal = legals('sample');
    r.operador = [entry('operador', operator({ siteKind: 'academic' }), 'sitio')];
  }
  return r;
}

const fatal = (r: RawSite, mode: BuildMode) => validateSite(r, mode).site === null;
const kinds = (r: RawSite, mode: BuildMode, c: string) => rules(validateSite(r, mode).issues, c);

describe('los cuatro cruces', () => {
  it.each(MODES)('académico válido pasa en %s, sin indexar', (mode) => {
    const { site, issues } = validateSite(raw('academic'), mode);
    expect(issues.filter((i) => i.severity !== 'warning')).toEqual([]);
    expect(site).toMatchObject({ siteKind: 'academic', indexable: false, mode });
    expect(site?.operator.identifiers).toEqual([]);
  });

  it('operador real: solo es indexable en publicación', () => {
    expect(validateSite(raw('operator'), 'release').site).toMatchObject({
      siteKind: 'operator',
      indexable: true,
    });
    expect(validateSite(raw('operator'), 'preview').site).toMatchObject({ indexable: false });
  });

  it('operador real con borradores: la vista previa pasa y la publicación falla', () => {
    const r = raw('operator');
    r.legal = legals('draft');
    r.operador = [entry('operador', operator({ siteKind: 'operator' }), 'sitio')];
    expect(fatal(r, 'preview')).toBe(false);
    expect(fatal(r, 'release')).toBe(true);
  });

  it('académico con altitud sin verificar: vista previa excluye y avisa; publicación falla', () => {
    const r = raw('academic');
    r.destinos[0]!.data.altitude.verified = false;
    const preview = validateSite(r, 'preview');
    expect(preview.site?.destinos).toHaveLength(3);
    expect(fatal(r, 'release')).toBe(true);
  });
});

describe('CA-125: siteKind', () => {
  it('el modo se copia al modelo y no se deduce de otros datos', () => {
    const r = raw('operator');
    r.operador = [entry('operador', operator({ siteKind: 'academic' }), 'sitio')];
    r.legal = legals('sample');
    expect(validateSite(r, 'release').site?.siteKind).toBe('academic');
  });
});

describe('CA-119 (b): identificadores en modo académico', () => {
  it.each(MODES)('cargar un identificador es error en %s', (mode) => {
    const r = raw('academic');
    r.operador = [entry('operador', fullOperator({ siteKind: 'academic' }), 'sitio')];
    const found = kinds(r, mode, 'CA-119');
    expect(found).toHaveLength(3);
    expect(found.every((i) => i.severity === 'error')).toBe(true);
    expect(fatal(r, mode)).toBe(true);
  });

  it('también los de la lista others', () => {
    const r = raw('academic');
    r.operador = [
      entry(
        'operador',
        operator({
          siteKind: 'academic',
          identifiers: { others: [{ label: 'Matrícula', value: 'M-77', fictitious: false }] },
        }),
        'sitio',
      ),
    ];
    expect(kinds(r, 'preview', 'CA-119')[0]?.field).toBe('identifiers.others[0]');
  });

  it('operador real: identificador ausente sigue siendo solo de publicación', () => {
    const r = raw('operator');
    r.operador = [entry('operador', operator({ siteKind: 'operator' }), 'sitio')];
    expect(fatal(r, 'preview')).toBe(false);
    expect(kinds(r, 'release', 'CA-119').every((i) => i.severity === 'release')).toBe(true);
    expect(fatal(r, 'release')).toBe(true);
  });
});

describe('CA-134 y CA-118 (a): estado de los textos legales', () => {
  it.each(['draft', 'reviewed'] as const)(
    'académico con un texto "%s": error "le falta el rótulo de texto de muestra"',
    (status) => {
      for (const mode of MODES) {
        const r = raw('academic');
        r.legal = legals(status);
        const found = kinds(r, mode, 'CA-134');
        expect(found).toHaveLength(3);
        expect(found[0]?.severity).toBe('error');
        expect(found[0]?.message).toContain('rótulo de texto de muestra');
        expect(fatal(r, mode)).toBe(true);
      }
    },
  );

  it.each(MODES)('operador real con un texto "sample": error en %s', (mode) => {
    const r = raw('operator');
    r.legal = legals('sample');
    expect(kinds(r, mode, 'CA-118').every((i) => i.severity === 'error')).toBe(true);
    expect(fatal(r, mode)).toBe(true);
  });
});

describe('CA-135: la política de datos nombra a los terceros', () => {
  it.each(['OpenStreetMap', 'WhatsApp', 'Vercel'])(
    'falta %s: error en los dos modos y tipos',
    (name) => {
      for (const kind of ['academic', 'operator'] as const) {
        for (const mode of MODES) {
          const r = raw(kind);
          const privacy = r.legal.find((l) => l.data.kind === 'privacy')!;
          privacy.body = PRIVACY_BODY.replace(new RegExp(name, 'i'), 'otro servicio');
          const found = kinds(r, mode, 'CA-135');
          expect(found).toHaveLength(1);
          expect(found[0]?.message).toContain(name);
          expect(found[0]?.severity).toBe('error');
          expect(fatal(r, mode)).toBe(true);
        }
      }
    },
  );

  it('solo la política de datos se revisa', () => {
    const r = raw('academic');
    for (const l of r.legal) if (l.data.kind !== 'privacy') l.body = '';
    expect(kinds(r, 'release', 'CA-135')).toEqual([]);
  });
});

describe('CA-139: SITE_URL', () => {
  it('ausente o no absoluta: solo detiene la publicación', () => {
    expect(siteUrlIssues('preview', undefined)).toEqual([]);
    expect(siteUrlIssues('preview', 'no es url')).toEqual([]);
    expect(siteUrlIssues('release', undefined)[0]).toMatchObject({
      criterion: 'CA-139',
      severity: 'release',
      message: SITE_URL_MISSING,
    });
    for (const bad of ['ejemplo.vercel.app', '/ruta', 'ftp://x.co', 'https://']) {
      expect(siteUrlIssues('release', bad)[0]?.message).toBe(SITE_URL_INVALID);
    }
    for (const good of ['https://ejemplo.vercel.app', 'http://localhost:4321', 'https://x.co/']) {
      expect(siteUrlIssues('release', good)).toEqual([]);
    }
  });
});

describe('comentarios HTML en los cuerpos', () => {
  it('avisan (sin detener) en destinos y textos legales', () => {
    const r = raw('academic');
    r.destinos[0]!.body = 'Texto <!-- cita: Anuario 2014 --> más texto.';
    r.legal[1]!.body = '<!-- nota -->';
    const found = validateSite(r, 'release').issues.filter(
      (i) => i.severity === 'warning' && i.message.includes('comentario HTML'),
    );
    expect(found).toHaveLength(2);
    expect(validateSite(r, 'release').site).not.toBeNull();
  });
});

describe('Comprobación de contacto de relleno (CA-120)', () => {
  it.each(['academic', 'operator'] as const)(
    'un dato de contacto de relleno detiene la publicación (%s)',
    (kind) => {
      const r = raw(kind);
      r.operador = [
        entry('operador', operator({ siteKind: kind, email: 'correo@ejemplo.com' }), 'sitio'),
      ];
      expect(kinds(r, 'release', 'CA-120').length).toBeGreaterThan(0);
      expect(fatal(r, 'release')).toBe(true);
    },
  );
});
