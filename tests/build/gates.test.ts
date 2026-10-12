/**
 * Puerta de publicación (T-027 reducida, ADR 0003): construye escenarios reales con `astro build` y
 * comprueba el código de salida y el mensaje. Se ejecuta con `npm run test:build`.
 *
 * Alcance (decisión del 2026-10-11): solo el modo académico. El modo de operador real queda en el
 * código pero fuera de las pruebas. Los builds van de uno en uno (ver run-build.ts).
 *
 * El código de salida de un fallo no es estable en Windows (1 o 3221226505, una aserción de libuv al
 * cerrar), así que se comprueba "distinto de 0" y no un valor concreto.
 */
import { describe, expect, test } from 'vitest';
import { build, type BuildResult } from './run-build';

const TIMEOUT = 600_000;
const NOT_INDEXABLE = /<meta[^>]+name="robots"[^>]*noindex/;
const NOTICE = 'aria-label="Aviso del sitio"';

function builds(result: BuildResult): void {
  expect(result.status, result.output.slice(-1500)).toBe(0);
  expect(result.read('index.html')).toContain('<h1');
}

function fails(result: BuildResult, criterion: string | null, fragment: string): void {
  expect(result.status, 'debe terminar con un código distinto de 0').not.toBe(0);
  expect(result.output).not.toContain('Complete!');
  if (criterion) expect(result.output).toContain(criterion);
  expect(result.output).toContain(fragment);
}

// ---------------------------------------------------------------------------
// Lo que debe construir
// ---------------------------------------------------------------------------

describe('modo académico: lo que construye', () => {
  test(
    'CA-125, CA-139, CA-133, CA-126: la publicación de `academico` construye; cada página lleva aviso y noindex; sin mapa del sitio',
    async () => {
      const r = await build('academico', 'release');
      builds(r);
      const pages = r.htmlFiles();
      // inicio, 404, créditos, 3 legales y 7 destinos
      expect(pages.length).toBeGreaterThanOrEqual(13);
      for (const page of pages) {
        expect(r.read(page), `${page}: sin metaetiqueta de no indexar`).toMatch(NOT_INDEXABLE);
        expect(r.read(page), `${page}: sin aviso académico`).toContain(NOTICE);
      }
      expect(r.exists('sitemap.xml')).toBe(false);
      const robots = r.read('robots.txt');
      expect(robots).not.toContain('Sitemap');
      expect(robots).not.toMatch(/Disallow: \/\S*/);
    },
    TIMEOUT,
  );

  test(
    'CA-134, CA-121 (b), CA-119 (b): los tres legales llevan el rótulo de muestra, sin fecha ni identificadores',
    async () => {
      const r = await build('academico', 'release');
      builds(r);
      for (const slug of [
        'politica-de-datos',
        'terminos-y-condiciones',
        'politica-de-cancelacion',
      ]) {
        const page = r.read(`legal/${slug}/index.html`);
        expect(page, slug).toContain('Texto de muestra');
        expect(page, slug).not.toContain('Última revisión');
        expect(page, slug).not.toContain('Registro Nacional de Turismo');
      }
    },
    TIMEOUT,
  );

  test(
    'CA-31: un destino por página /destinos/<slug>/ (7), y uno sin altitud verificada no tiene página en vista previa',
    async () => {
      const full = await build('academico', 'release');
      builds(full);
      const details = full.htmlFiles().filter((f) => f.startsWith('destinos/'));
      expect(details).toHaveLength(7);
      for (const file of details) {
        expect(file).toMatch(/^destinos\/[a-z0-9]+(-[a-z0-9]+)*\/index\.html$/);
      }
    },
    TIMEOUT,
  );

  test(
    'CA-38, CA-50: `sin-fotos` construye en vista previa; los créditos dicen que no hay fotos',
    async () => {
      const r = await build('sin-fotos', 'preview');
      builds(r);
      expect(r.read('creditos/index.html')).toContain('no tiene fotos publicadas');
      expect(r.read('index.html')).toContain(NOTICE);
    },
    TIMEOUT,
  );

  test(
    'CA-139: el contenido real publica con SITE_URL, con aviso y noindex en cada página',
    async () => {
      const r = await build('real', 'release');
      builds(r);
      for (const page of r.htmlFiles()) {
        expect(r.read(page), page).toMatch(NOT_INDEXABLE);
        expect(r.read(page), page).toContain(NOTICE);
      }
    },
    TIMEOUT,
  );
});

// ---------------------------------------------------------------------------
// Lo que debe fallar
// ---------------------------------------------------------------------------

/** Errores que detienen la vista previa y la publicación: [escenario, criterio, fragmento del mensaje]. */
const ALWAYS_FAIL: [string, string, string][] = [
  ['invalido-sin-modo', 'CA-125', 'siteKind'],
  ['invalido-identificador-en-academico', 'CA-119', 'identifiers.rnt'],
  ['invalido-legal-sin-rotulo', 'CA-134', 'status: sample'],
  ['invalido-politica-sin-terceros', 'CA-135', 'Vercel'],
  ['invalido-fuera-de-rango', 'CA-122', 'rango'],
  ['invalido-alt-vacio', 'CA-48', 'alt'],
  ['invalido-altitud-cero', 'CA-20', 'altitude.meters'],
  ['invalido-dos-principales', 'CA-15', 'destino principal'],
];

describe('CA-99: los errores detienen la vista previa y la publicación', () => {
  for (const [scenario, criterion, fragment] of ALWAYS_FAIL) {
    for (const mode of ['preview', 'release'] as const) {
      test(
        `${criterion}: ${scenario} falla en ${mode === 'preview' ? 'vista previa' : 'publicación'}`,
        async () => {
          const r = await build(scenario, mode);
          fails(r, criterion, fragment);
          // CA-99: el mensaje nombra el archivo del escenario.
          expect(r.output).toContain(scenario);
        },
        TIMEOUT,
      );
    }
  }
});

describe('CA-139: lo que solo detiene la publicación', () => {
  test(
    'CA-104: una altitud sin verificar avisa en vista previa (y excluye el destino) y falla en publicación',
    async () => {
      const preview = await build('invalido-altitud-sin-verificar', 'preview');
      builds(preview);
      expect(preview.output).toContain('[release] CA-104');
      expect(preview.output).toContain('altitude.verified');
      expect(preview.htmlFiles().filter((f) => f.startsWith('destinos/'))).toHaveLength(3);
      expect(preview.exists('destinos/cafetal-de-la-loma-alta/index.html')).toBe(false);

      const release = await build('invalido-altitud-sin-verificar', 'release');
      fails(release, 'CA-104', 'altitude.verified');
    },
    TIMEOUT,
  );

  test(
    'CA-139: sin SITE_URL, la vista previa construye y la publicación falla con el mensaje',
    async () => {
      const preview = await build('academico', 'preview', { siteUrl: null });
      builds(preview);
      const release = await build('academico', 'release', { siteUrl: null });
      fails(
        release,
        'CA-139',
        'Falta SITE_URL: define la dirección pública del sitio antes de publicar',
      );
    },
    TIMEOUT,
  );

  test(
    'CA-139: una SITE_URL que no es una dirección absoluta http(s) falla en publicación',
    async () => {
      const relative = await build('academico', 'release', {
        siteUrl: '/mi-sitio',
        variant: 'relativa',
      });
      // Astro rechaza una `site` relativa al leer la configuración, antes de que la puerta de contenido
      // nombre SITE_URL: falla igual, pero con su propio mensaje ("Invalid URL").
      fails(relative, null, 'Invalid URL');
      const ftp = await build('academico', 'release', { siteUrl: 'ftp://x.test', variant: 'ftp' });
      fails(ftp, 'CA-139', 'SITE_URL');
    },
    TIMEOUT,
  );
});
