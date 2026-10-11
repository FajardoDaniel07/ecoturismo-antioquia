/**
 * Puerta de publicación (T-027, ADR 0003): construye escenarios reales con `astro build` y comprueba
 * el código de salida y el mensaje. Se ejecuta con `npm run test:build`; tarda varios minutos.
 *
 * Tres familias:
 *  1. Los cuatro cruces: sitio académico u operador real, por vista previa o publicación.
 *  2. Defectos que detienen siempre (`error`, o el esquema de Astro): fallan en las dos compilaciones.
 *  3. Defectos que solo detienen la publicación (`release`): la vista previa construye y avisa.
 *
 * El código de salida de un fallo no es estable en Windows (1 o 3221226505, una aserción de libuv al
 * cerrar), así que se comprueba "distinto de 0" y no un valor concreto.
 */
import { describe, expect, test } from 'vitest';
import { build, type BuildResult } from './run-build';

const TIMEOUT = 600_000;
const NOT_INDEXABLE = /<meta[^>]+name="robots"[^>]*noindex/;
const ACADEMIC_NOTICE = 'Proyecto académico';

function builds(result: BuildResult): void {
  expect(result.status, result.output.slice(-1500)).toBe(0);
  expect(result.html).toContain('<h1');
}

function fails(result: BuildResult, criterion: string | null, fragment: string): void {
  expect(result.status, 'debe terminar con un código distinto de 0').not.toBe(0);
  expect(result.output).not.toContain('Complete!');
  if (criterion) expect(result.output).toContain(criterion);
  expect(result.output).toContain(fragment);
}

// ---------------------------------------------------------------------------
// 1. Los cuatro cruces
// ---------------------------------------------------------------------------

describe.concurrent('cuatro cruces: tipo de sitio por compilación', () => {
  test(
    'CA-125, CA-126, CA-133: académico en vista previa construye, con aviso y sin indexar',
    async () => {
      const r = await build('academico', 'preview');
      builds(r);
      expect(r.html).toContain(ACADEMIC_NOTICE);
      expect(r.html).toMatch(NOT_INDEXABLE);
      expect(r.html).not.toContain('99871');
    },
    TIMEOUT,
  );

  test(
    'CA-119 (b), CA-133, CA-139: académico en publicación construye sin identificadores ni revisión legal',
    async () => {
      const r = await build('academico', 'release');
      builds(r);
      expect(r.html).toContain(ACADEMIC_NOTICE);
      expect(r.html).toMatch(NOT_INDEXABLE);
      expect(r.html).not.toContain('99871');
    },
    TIMEOUT,
  );

  test(
    'CA-125, CA-126: sin-fotos (académico) construye en vista previa y en publicación',
    async () => {
      const [preview, release] = await Promise.all([
        build('sin-fotos', 'preview'),
        build('sin-fotos', 'release'),
      ]);
      builds(preview);
      builds(release);
      expect(release.html).toContain(ACADEMIC_NOTICE);
      expect(release.html).toMatch(NOT_INDEXABLE);
    },
    TIMEOUT,
  );

  test(
    'CA-138: operador real en vista previa construye, sin aviso académico y sin indexar',
    async () => {
      const r = await build('completo', 'preview');
      builds(r);
      expect(r.html).not.toContain(ACADEMIC_NOTICE);
      expect(r.html).toMatch(NOT_INDEXABLE);
    },
    TIMEOUT,
  );

  test(
    'CA-138, CA-97, CA-119 (a): operador real en publicación construye, indexable, con identificador y sin aviso',
    async () => {
      const r = await build('completo', 'release');
      builds(r);
      expect(r.html).not.toContain(ACADEMIC_NOTICE);
      expect(r.html).not.toMatch(NOT_INDEXABLE);
      expect(r.html).toContain('99871');
    },
    TIMEOUT,
  );

  test(
    'CA-118 (a), CA-119 (a): operador real incompleto construye en vista previa y avisa de los seis pendientes',
    async () => {
      const r = await build('minimo', 'preview');
      builds(r);
      expect(r.html).not.toContain(ACADEMIC_NOTICE);
      expect(r.html).not.toContain('99871');
      for (const file of [
        'politica-de-datos',
        'terminos-y-condiciones',
        'politica-de-cancelacion',
      ]) {
        expect(r.output).toMatch(new RegExp(`\\[release\\] CA-118 · [^\\n]*${file}\\.md`));
      }
      for (const field of ['rnt', 'nit', 'legalName']) {
        expect(r.output).toContain(`identifiers.${field}`);
      }
    },
    TIMEOUT,
  );

  test(
    'CA-118 (a), CA-119 (a), CA-99: operador real incompleto falla en publicación nombrando los seis pendientes',
    async () => {
      const r = await build('minimo', 'release');
      fails(r, 'CA-118', 'No se puede construir el sitio (publicación): 6 problema(s)');
      for (const file of [
        'politica-de-datos',
        'terminos-y-condiciones',
        'politica-de-cancelacion',
      ]) {
        expect(r.output).toMatch(new RegExp(`\\[release\\] CA-118 · [^\\n]*${file}\\.md · status`));
      }
      for (const field of ['rnt', 'nit', 'legalName']) {
        expect(r.output).toMatch(
          new RegExp(`\\[release\\] CA-119 · [^\\n]*operador\\.json · identifiers\\.${field}`),
        );
      }
    },
    TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// 2. Defectos que detienen siempre
// ---------------------------------------------------------------------------

/** [escenario, criterio (o null si el mensaje no lo lleva), fragmento del mensaje]. */
const ALWAYS_FAIL: [string, string | null, string][] = [
  ['invalido-sin-modo', 'CA-125', 'siteKind'],
  ['invalido-modo-desconocido', 'CA-125', 'siteKind'],
  ['invalido-identificador-en-academico', 'CA-119', 'identifiers.rnt'],
  ['invalido-legal-sin-rotulo', 'CA-134', 'status: sample'],
  ['invalido-muestra-en-operador', 'CA-118', 'textos de muestra'],
  ['invalido-muestra-con-fecha', 'CA-121', 'reviewedOn'],
  ['invalido-politica-sin-terceros', 'CA-135', 'Vercel'],
  // El esquema de Astro detiene la lectura antes de validateSite(): el mensaje trae campo y criterio.
  ['invalido-altitud-ausente', null, 'altitude'],
  ['invalido-altitud-cero', 'CA-20', 'altitude.meters'],
  ['invalido-clima-invertido', 'CA-24', 'minC'],
  ['invalido-dificultad-invalida', 'CA-27', 'difficulty'],
  ['invalido-slug-con-tilde', 'CA-31', 'kebab-case'],
  ['invalido-nombre-largo', 'CA-33', '37 caracteres'],
  ['invalido-nombre-repetido', 'CA-33', 'únicos'],
  ['invalido-foto-pequena', 'CA-43', '1200 px'],
  ['invalido-foto-pequena-operador', 'CA-43', '1200 px'],
  ['invalido-foto-sin-autor', 'CA-46', 'author'],
  ['invalido-licencia-tipo-nc', 'CA-47', 'NC'],
  ['invalido-licencia-nombre-nc', 'CA-47', 'NC'],
  ['invalido-licencia-nombre-nc-operador', 'CA-47', 'NC'],
  ['invalido-alt-vacio', 'CA-48', 'alt'],
  ['invalido-alt-con-autor', 'CA-48', 'autor'],
  ['invalido-alt-con-autor-operador', 'CA-48', 'autor'],
  ['invalido-ruta-sin-trazado', 'CA-77', 'dos puntos'],
  ['invalido-ruta-sin-trazado-operador', 'CA-77', 'dos puntos'],
  ['invalido-ruta-un-punto', 'CA-77', 'dos puntos'],
  ['invalido-ruta-elevacion-parcial', 'CA-77', 'todos los puntos o en ninguno'],
  ['invalido-ruta-elevacion-parcial-operador', 'CA-77', 'todos los puntos o en ninguno'],
  ['invalido-ruta-sin-destino', 'CA-78', 'no-existe'],
  ['invalido-ruta-sin-destino-operador', 'CA-78', 'no-existe'],
  ['invalido-ruta-sin-elevacion', 'CA-78', 'elevation'],
  ['invalido-ruta-elevacion-invertida', 'CA-78', 'minM'],
  ['invalido-dos-principales', 'CA-15', 'destino principal'],
  ['invalido-dos-principales-operador', 'CA-15', 'destino principal'],
  ['invalido-sin-destinos', 'CA-100', 'al menos un destino'],
  ['invalido-sin-destinos-operador', 'CA-100', 'al menos un destino'],
  ['invalido-fuera-de-rango', 'CA-122', 'rango'],
  ['invalido-umbrales-desordenados', 'CA-122', 'ascendente'],
];

describe.concurrent('CA-99: los errores detienen la vista previa y la publicación', () => {
  for (const [scenario, criterion, fragment] of ALWAYS_FAIL) {
    for (const mode of ['preview', 'release'] as const) {
      test(
        `${criterion ?? 'CA-20'}: ${scenario} falla en ${mode === 'preview' ? 'vista previa' : 'publicación'}`,
        async () => {
          const r = await build(scenario, mode);
          fails(r, criterion, fragment);
          // CA-99: el mensaje nombra el archivo (salvo CA-100, que es de la colección).
          if (criterion !== 'CA-100')
            expect(r.output).toContain(scenario.replace(/-operador$/, ''));
        },
        TIMEOUT,
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 3. Defectos que solo detienen la publicación
// ---------------------------------------------------------------------------

/** [escenario, criterio, campo o archivo que el aviso debe nombrar]. */
const RELEASE_ONLY: [string, string, string][] = [
  ['invalido-altitud-sin-verificar', 'CA-104', 'altitude.verified'],
  ['invalido-altitud-sin-verificar-operador', 'CA-104', 'altitude.verified'],
  ['invalido-contacto-de-relleno', 'CA-120', 'hours'],
  ['invalido-contacto-de-relleno-operador', 'CA-120', 'hours'],
  ['invalido-identificador-de-relleno', 'CA-120', 'identifiers.rnt'],
  ['invalido-identificador-ficticio', 'CA-120', 'identifiers.rnt'],
];

describe.concurrent('CA-139: lo que solo detiene la publicación', () => {
  for (const [scenario, criterion, field] of RELEASE_ONLY) {
    test(
      `${criterion}: ${scenario} construye en vista previa con aviso y falla en publicación`,
      async () => {
        const [preview, release] = await Promise.all([
          build(scenario, 'preview'),
          build(scenario, 'release'),
        ]);
        builds(preview);
        expect(preview.output).toContain(`[release] ${criterion}`);
        expect(preview.output).toContain(field);
        fails(release, criterion, field);
      },
      TIMEOUT,
    );
  }

  test(
    'CA-104, CA-100, CA-139: un territorio sin verificar excluye todos los destinos y detiene también la vista previa',
    async () => {
      for (const scenario of [
        'invalido-territorio-sin-verificar',
        'invalido-territorio-sin-verificar-operador',
      ]) {
        const [preview, release] = await Promise.all([
          build(scenario, 'preview'),
          build(scenario, 'release'),
        ]);
        // En vista previa el territorio sin verificar solo avisa (CA-104)... pero deja sin destinos (CA-100).
        fails(preview, 'CA-100', 'al menos un destino');
        expect(preview.output).toContain('[release] CA-104');
        fails(release, 'CA-104', 'territorio.json');
        expect(release.output).toContain('CA-100');
      }
    },
    TIMEOUT,
  );

  describe.concurrent('SITE_URL (CA-139)', () => {
    for (const scenario of ['academico', 'completo']) {
      test(
        `${scenario}: sin SITE_URL construye en vista previa y falla en publicación`,
        async () => {
          const [preview, release] = await Promise.all([
            build(scenario, 'preview', { siteUrl: null }),
            build(scenario, 'release', { siteUrl: null }),
          ]);
          builds(preview);
          fails(
            release,
            'CA-139',
            'Falta SITE_URL: define la dirección pública del sitio antes de publicar',
          );
        },
        TIMEOUT,
      );

      for (const [label, value] of [
        ['ruta relativa', '/mi-sitio'],
        ['sin protocolo', 'localhost:4321'],
        ['solo texto', 'mi sitio'],
      ] as const) {
        test(
          `${scenario}: SITE_URL ${label} falla en publicación`,
          async () => {
            const r = await build(
              scenario,
              'release',
              { siteUrl: value },
              label.replace(/\s/g, '-'),
            );
            fails(r, 'CA-139', 'SITE_URL debe ser una dirección absoluta');
          },
          TIMEOUT,
        );
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Pendiente: dependen de páginas que aún no existen (hoy solo hay `index.html`)
// ---------------------------------------------------------------------------

describe('pendiente de H5', () => {
  test.todo(
    'CA-97, CA-133 (T-074): `completo` publica sitemap.xml y robots.txt con `Sitemap`; `academico` no tiene sitemap.xml',
  );
  test.todo(
    'CA-133: la metaetiqueta de no indexar está en todos los HTML de `academico`, no solo en el inicio',
  );
  test.todo(
    'CA-121, CA-134: páginas legales: `completo` con fecha e identificador; `academico` con rótulo de muestra',
  );
  test.todo('CA-31: N destinos publicados producen exactamente N páginas /destinos/<slug>/');
});
