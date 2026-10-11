import { describe, expect, it } from 'vitest';
import {
  SITE_URL_MISSING,
  isFatal,
  siteUrlIssues,
  validateSite,
  type BuildMode,
  type Issue,
} from '../../src/lib/content/validate';
import { photo } from './helpers/content';
import { dest, entry, fullOperator, legals, rutaEntry, rules, validRaw } from './helpers/site';

const MODES: BuildMode[] = ['preview', 'release'];
const blocking = (issues: Issue[], mode: BuildMode) =>
  issues.filter((i) => i.severity === 'error' || (mode === 'release' && i.severity === 'release'));

describe('fotos (CA-43, CA-47, CA-48)', () => {
  const withPhoto = (over: Partial<ReturnType<typeof photo>>) => {
    const raw = validRaw();
    raw.destinos[1]!.data.photos = [{ ...photo(), ...over }];
    return raw;
  };

  it('CA-43: rechaza un lado mayor menor de 1200 px y acepta 1200', () => {
    for (const mode of MODES) {
      const small = validRaw();
      small.destinos[1]!.data.photos = [photo(1199, 800)];
      const r = validateSite(small, mode);
      expect(rules(r.issues, 'CA-43')).toHaveLength(1);
      expect(r.site).toBeNull();
    }
    const ok = validRaw();
    ok.destinos[1]!.data.photos = [photo(1200, 800)];
    const r = validateSite(ok, 'release');
    expect(rules(r.issues, 'CA-43')).toEqual([]);
    expect(r.site?.photos[0]?.tier).toBe('small');
  });

  it('CA-47: rechaza un nombre de licencia con NC o ND', () => {
    for (const name of ['CC BY-NC 4.0', 'CC BY-ND 2.0', 'CC BY-NC-SA 4.0']) {
      const raw = withPhoto({ license: { ...photo().license, name } });
      const r = validateSite(raw, 'preview');
      expect(rules(r.issues, 'CA-47')).toHaveLength(1);
      expect(r.site).toBeNull();
    }
    expect(rules(validateSite(withPhoto({}), 'preview').issues, 'CA-47')).toEqual([]);
  });

  it('CA-48: el texto alternativo no menciona al autor ni a la licencia', () => {
    const autor = validateSite(withPhoto({ alt: 'Foto de ana pérez en el sendero' }), 'preview');
    expect(rules(autor.issues, 'CA-48')).toHaveLength(1);
    const lic = validateSite(withPhoto({ alt: 'Sendero con licencia CC BY 4.0' }), 'preview');
    expect(rules(lic.issues, 'CA-48')).toHaveLength(1);
    expect(rules(validateSite(withPhoto({}), 'preview').issues, 'CA-48')).toEqual([]);
  });
});

describe('galería (CA-51)', () => {
  it('sin fotos publicadas, la sección de galería no existe', () => {
    const { site } = validateSite(validRaw(), 'release');
    expect(site?.photos).toEqual([]);
    expect(site?.sections.galeria).toBe(false);
  });

  it('una foto de un destino excluido no cuenta', () => {
    const raw = validRaw();
    raw.destinos[0]!.data.altitude.verified = false;
    raw.destinos[0]!.data.photos = [photo()];
    expect(validateSite(raw, 'preview').site?.sections.galeria).toBe(false);
  });
});

describe('rutas (CA-67, CA-77, CA-78)', () => {
  it('CA-67: sin rutas publicadas, la sección de mapa no existe', () => {
    const raw = validRaw();
    raw.rutas = [];
    expect(validateSite(raw, 'release').site?.sections.mapa).toBe(false);
    expect(validateSite(validRaw(), 'release').site?.sections.mapa).toBe(true);
  });

  it('CA-78: una ruta cuyo destino no existe falla en los dos modos', () => {
    for (const mode of MODES) {
      const raw = validRaw();
      raw.rutas = [rutaEntry('huerfana', 'no-existe')];
      const r = validateSite(raw, mode);
      expect(rules(r.issues, 'CA-78')[0]).toMatchObject({
        severity: 'error',
        field: 'properties.destino',
      });
      expect(r.site).toBeNull();
    }
  });

  it('CA-78: la ruta de un destino no publicado se excluye con aviso', () => {
    const raw = validRaw();
    raw.destinos[1]!.data.altitude.verified = false;
    const r = validateSite(raw, 'preview');
    expect(r.site?.rutas).toEqual([]);
    expect(rules(r.issues, 'CA-78')[0]?.severity).toBe('warning');
  });

  it('CA-77: la elevación por punto es completa o ausente', () => {
    const mixed = validRaw();
    mixed.rutas = [
      rutaEntry('mezcla', 'valle', {
        geometry: {
          type: 'LineString',
          coordinates: [
            [-75.5, 6.2, 1500],
            [-75.4, 6.3],
          ],
        },
      }),
    ];
    for (const mode of MODES) {
      const r = validateSite(mixed, mode);
      expect(rules(r.issues, 'CA-77')[0]?.severity).toBe('error');
      expect(r.site).toBeNull();
    }

    const none = validRaw();
    none.rutas = [
      rutaEntry('sin-elevacion', 'valle', {
        geometry: {
          type: 'LineString',
          coordinates: [
            [-75.5, 6.2],
            [-75.4, 6.3],
          ],
        },
      }),
    ];
    expect(validateSite(none, 'release').site?.rutas[0]?.hasPointElevation).toBe(false);
    expect(validateSite(validRaw(), 'release').site?.rutas[0]?.hasPointElevation).toBe(true);
  });

  it('avisa si un punto cae fuera de Antioquia (coordenadas invertidas)', () => {
    const raw = validRaw();
    raw.rutas = [
      rutaEntry('invertida', 'valle', {
        geometry: {
          type: 'LineString',
          coordinates: [
            [6.2, -75.5],
            [6.3, -75.4],
          ],
        },
      }),
    ];
    const r = validateSite(raw, 'release');
    expect(rules(r.issues, 'CA-77')[0]?.severity).toBe('warning');
    expect(r.site).not.toBeNull();
  });

  it('avisa de más de 400 puntos y de más de tres rutas en un piso', () => {
    const raw = validRaw();
    const coordinates = Array.from({ length: 401 }, (_, i): [number, number] => [
      -75.5 + i / 1e4,
      6.2,
    ]);
    raw.rutas = ['a', 'b', 'c', 'd'].map((id) =>
      rutaEntry(`ruta-${id}`, 'valle', {
        geometry: { type: 'LineString', coordinates },
      }),
    );
    const r = validateSite(raw, 'release');
    expect(r.issues.filter((i) => i.severity === 'warning').length).toBeGreaterThanOrEqual(5);
    expect(r.site?.rutas).toHaveLength(4);
  });

  it('ordena las rutas por elevación mínima y luego por nombre', () => {
    const raw = validRaw();
    raw.rutas = [
      rutaEntry('z', 'valle', {
        properties: { name: 'Zeta', elevation: { minM: 1500, maxM: 1700 } },
      }),
      rutaEntry('a', 'bosque', {
        properties: { name: 'Alfa', elevation: { minM: 2500, maxM: 2600 } },
      }),
      rutaEntry('b', 'valle', {
        properties: { name: 'Beta', elevation: { minM: 1500, maxM: 1600 } },
      }),
    ];
    expect(validateSite(raw, 'release').site?.rutas.map((r) => r.properties.name)).toEqual([
      'Beta',
      'Zeta',
      'Alfa',
    ]);
  });
});

describe('textos legales (CA-118)', () => {
  it('borrador: vista previa lo publica, publicación falla nombrando los tres', () => {
    const raw = validRaw();
    raw.legal = legals('draft');
    const preview = validateSite(raw, 'preview');
    expect(preview.site?.legal.map((l) => l.status)).toEqual(['draft', 'draft', 'draft']);
    expect(blocking(preview.issues, 'preview')).toEqual([]);

    const release = validateSite(raw, 'release');
    expect(release.site).toBeNull();
    const drafts = rules(release.issues, 'CA-118');
    expect(drafts).toHaveLength(3);
    expect(drafts.map((d) => d.message).join(' ')).toContain('Política de datos');
  });

  it('revisados: publican con su slug', () => {
    const { site } = validateSite(validRaw(), 'release');
    expect(site?.legal.map((l) => l.slug)).toEqual([
      'politica-de-datos',
      'terminos-y-condiciones',
      'politica-de-cancelacion',
    ]);
  });

  it('falla si falta un tipo o hay uno repetido', () => {
    for (const mode of MODES) {
      const missing = validRaw();
      missing.legal = missing.legal.slice(0, 2);
      expect(validateSite(missing, mode).site).toBeNull();

      const twice = validRaw();
      twice.legal = [...twice.legal, ...legals('reviewed').slice(0, 1)];
      expect(validateSite(twice, mode).site).toBeNull();
    }
  });
});

describe('identificadores del operador (CA-119, CA-120)', () => {
  const withoutIds = () => {
    const raw = validRaw();
    raw.operador = [entry('operador', fullOperator({ identifiers: { others: [] } }), 'sitio')];
    return raw;
  };

  it('CA-119: ausentes, la vista previa se genera sin mostrarlos y la publicación falla', () => {
    const preview = validateSite(withoutIds(), 'preview');
    expect(preview.site?.operator.identifiers).toEqual([]);
    expect(blocking(preview.issues, 'preview')).toEqual([]);

    const release = validateSite(withoutIds(), 'release');
    expect(release.site).toBeNull();
    const text = rules(release.issues, 'CA-119')
      .map((i) => i.message)
      .join(' ');
    expect(text).toContain('RNT');
    expect(text).toContain('NIT');
    expect(text).toContain('razón social');
  });

  it('entregados, se publican en el modelo', () => {
    const { site } = validateSite(validRaw(), 'release');
    expect(site?.operator.identifiers.map((i) => i.label)).toEqual([
      'Registro Nacional de Turismo (RNT)',
      'NIT',
      'razón social',
    ]);
  });

  it('CA-120: un valor de relleno o marcado ficticio no llega al modelo y detiene la publicación', () => {
    for (const bad of [
      { value: 'NIT 000.000.000-0', fictitious: false },
      { value: 'RNT 84521', fictitious: true },
      { value: 'pendiente', fictitious: false },
    ]) {
      const raw = validRaw();
      raw.operador = [
        entry(
          'operador',
          fullOperator({
            identifiers: {
              rnt: bad,
              nit: { value: 'NIT 901.234.567-8', fictitious: false },
              legalName: { value: 'Montaña S. A. S.', fictitious: false },
              others: [],
            },
          }),
          'sitio',
        ),
      ];
      const preview = validateSite(raw, 'preview');
      expect(preview.site?.operator.identifiers.map((i) => i.label)).not.toContain(
        'Registro Nacional de Turismo (RNT)',
      );
      expect(rules(preview.issues, 'CA-120')).toHaveLength(1);
      expect(validateSite(raw, 'release').site).toBeNull();
    }
  });

  it('CA-120: un dato de contacto de relleno detiene la publicación; los reales no', () => {
    const raw = validRaw();
    raw.operador = [entry('operador', fullOperator({ email: 'correo@ejemplo.com' }), 'sitio')];
    expect(rules(validateSite(raw, 'release').issues, 'CA-120')[0]?.field).toBe('email');
    expect(rules(validateSite(validRaw(), 'release').issues, 'CA-120')).toEqual([]);
  });

  it('CA-120: los identificadores adicionales también se revisan', () => {
    const raw = validRaw();
    raw.operador = [
      entry(
        'operador',
        fullOperator({
          identifiers: {
            rnt: { value: 'RNT 84521', fictitious: false },
            nit: { value: 'NIT 901.234.567-8', fictitious: false },
            legalName: { value: 'Montaña S. A. S.', fictitious: false },
            others: [
              { label: 'Matrícula mercantil', value: '123456', fictitious: false },
              { label: 'Otro', value: 'Código 7788', fictitious: false },
            ],
          },
        }),
        'sitio',
      ),
    ];
    const r = validateSite(raw, 'preview');
    expect(rules(r.issues, 'CA-120')).toHaveLength(1);
    expect(r.site?.operator.identifiers.map((i) => i.label)).toContain('Otro');
  });
});

describe('tabla de severidades: dos modos', () => {
  it('un sitio válido y completo pasa en los dos modos sin avisos que detengan', () => {
    for (const mode of MODES) {
      const r = validateSite(validRaw(), mode);
      expect(blocking(r.issues, mode)).toEqual([]);
      expect(r.site?.mode).toBe(mode);
    }
  });

  it('un destino extra con nombre propio no rompe las reglas entre archivos', () => {
    const raw = validRaw();
    raw.destinos.push(dest('extra', { altitude: { meters: 600, verified: true, source: 'x' } }));
    expect(validateSite(raw, 'release').site?.destinos).toHaveLength(5);
  });
});

describe('SITE_URL y severidad fatal (CA-97)', () => {
  it('solo la publicación exige SITE_URL, con el mensaje acordado', () => {
    expect(siteUrlIssues('preview', undefined)).toEqual([]);
    expect(siteUrlIssues('release', 'https://ejemplo.co')).toEqual([]);
    for (const empty of [undefined, '', '  ']) {
      const [issue] = siteUrlIssues('release', empty);
      expect(issue?.message).toBe(SITE_URL_MISSING);
      expect(issue?.message).toMatch(/^Falta SITE_URL/);
    }
  });

  it('isFatal: error siempre, release solo en publicación, warning nunca', () => {
    const base = { file: 'f', field: 'c', rule: 'r', criterion: 'CA-1', message: 'm' } as const;
    expect(isFatal({ ...base, severity: 'error' }, 'preview')).toBe(true);
    expect(isFatal({ ...base, severity: 'release' }, 'preview')).toBe(false);
    expect(isFatal({ ...base, severity: 'release' }, 'release')).toBe(true);
    expect(isFatal({ ...base, severity: 'warning' }, 'release')).toBe(false);
  });
});
