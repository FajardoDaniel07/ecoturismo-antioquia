/**
 * Suite esencial, parte 1 (C-7): una prueba por tipo de página (inicio, detalle, legal, créditos, 404),
 * sobre el escenario `academico` en modo publicación y sobre el contenido real (`real`).
 *
 *  - axe: ninguna violación serious ni critical (WCAG 2.2 AA).
 *  - Aviso académico y metaetiqueta de no indexar en cada página (CA-126, CA-133).
 *  - 360 px sin desplazamiento horizontal (CA-123, Definition of Done).
 *  - Sin JavaScript: contenido y enlaces disponibles; la galería es una cuadrícula (CA-65).
 *  - Teclado en el visor de fotos: abrir, flechas, Esc y foco de vuelta (CA-54 a CA-60).
 *
 * El mapa y Lighthouse quedan para cuando exista el mapa simple.
 */
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { defaultScenario, scenarios, urlOf } from './scenarios';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const DETAIL_WITH_PHOTOS = '/destinos/canon-del-sol-quieto/';

const real = scenarios.find((s) => s.name === 'real');
const SITES = [
  { name: 'academico', base: urlOf(defaultScenario), detail: DETAIL_WITH_PHOTOS },
  ...(real ? [{ name: 'real', base: urlOf(real), detail: null }] : []),
];

/** Salta la prueba fuera de los proyectos indicados (los demás no aportan nada distinto). */
function onlyIn(...names: string[]) {
  test.skip(!names.includes(test.info().project.name), `solo en ${names.join(', ')}`);
}

/** Las rutas de las cinco páginas; el detalle del contenido real se descubre desde el inicio. */
async function pagesOf(site: (typeof SITES)[number], page: Page) {
  let detail = site.detail;
  if (!detail) {
    await page.goto(`${site.base}/`);
    detail = await page.locator('main a[href^="/destinos/"]').first().getAttribute('href');
    expect(detail, 'el inicio enlaza a algún destino').toBeTruthy();
  }
  return [
    { name: 'inicio', path: '/' },
    { name: 'detalle', path: detail as string },
    { name: 'legal', path: '/legal/politica-de-datos/' },
    { name: 'créditos', path: '/creditos/' },
    { name: '404', path: '/no-existe/' },
  ];
}

for (const site of SITES) {
  test.describe(`${site.name}: páginas`, () => {
    test(`CA-126, CA-133: aviso académico y noindex en cada tipo de página (${site.name})`, async ({
      page,
    }) => {
      onlyIn('escritorio', 'movil', 'sin-javascript');
      for (const p of await pagesOf(site, page)) {
        const response = await page.goto(site.base + p.path);
        expect(response?.status(), p.name).toBe(p.name === '404' ? 404 : 200);
        await expect(
          page.getByRole('region', { name: 'Aviso del sitio' }),
          `${p.name}: aviso`,
        ).toBeVisible();
        await expect(page.locator('meta[name="robots"]'), `${p.name}: robots`).toHaveAttribute(
          'content',
          /noindex/,
        );
        await expect(page.getByRole('heading', { level: 1 }), `${p.name}: h1`).toHaveCount(1);
      }
    });

    test(`axe: sin violaciones serious ni critical en cada tipo de página (${site.name})`, async ({
      page,
    }) => {
      onlyIn('escritorio', 'movil');
      for (const p of await pagesOf(site, page)) {
        await page.goto(site.base + p.path);
        const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
        const serious = results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        );
        expect(
          serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(' | ')}`),
          `${p.name}`,
        ).toEqual([]);
      }
    });

    test(`360 px sin desplazamiento horizontal en cada tipo de página (${site.name})`, async ({
      page,
    }) => {
      onlyIn('movil');
      for (const p of await pagesOf(site, page)) {
        await page.goto(site.base + p.path);
        const { scroll, client } = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(client, `${p.name}: ancho de la ventana`).toBe(360);
        expect(scroll, `${p.name}: scrollWidth ${scroll} frente a ${client}`).toBeLessThanOrEqual(
          client,
        );
      }
    });

    test(`sin JavaScript: contenido y enlaces disponibles (${site.name})`, async ({ page }) => {
      onlyIn('sin-javascript');
      await page.goto(`${site.base}/`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // El listado de destinos y su navegación funcionan solo con HTML.
      const destinoLinks = page.locator('main a[href^="/destinos/"]');
      expect(await destinoLinks.count()).toBeGreaterThan(0);
      const href = await destinoLinks.first().getAttribute('href');
      await page.goto(site.base + (href as string));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // El pie enlaza los legales y los créditos.
      await page.goto(`${site.base}/`);
      await page
        .getByRole('contentinfo')
        .getByRole('link', { name: /Créditos/ })
        .click();
      await expect(
        page.getByRole('heading', { level: 1, name: 'Créditos de las fotos' }),
      ).toBeVisible();
    });
  });
}

test.describe('academico: galería', () => {
  test('CA-65: sin JavaScript la galería es una cuadrícula de imágenes, sin botones', async ({
    page,
  }) => {
    onlyIn('sin-javascript');
    await page.goto(DETAIL_WITH_PHOTOS);
    const grid = page.getByRole('region', { name: /Fotos de/ });
    const images = grid.getByRole('img');
    expect(await images.count()).toBeGreaterThanOrEqual(3);
    await expect(images.first()).toBeVisible();
    await expect(page.getByRole('button', { name: /^Abrir foto/ })).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('CA-54 a CA-60: teclado en el visor: abrir con Enter, flechas, Esc y foco de vuelta', async ({
    page,
  }) => {
    onlyIn('escritorio');
    await page.goto(DETAIL_WITH_PHOTOS);
    // El visor se carga cuando la cuadrícula se acerca a la ventana: las miniaturas pasan a ser botones.
    await page.getByRole('region', { name: /Fotos de/ }).scrollIntoViewIfNeeded();
    const thumbs = page.getByRole('button', { name: /^Abrir foto/ });
    await expect(thumbs.first()).toBeVisible();
    expect(await thumbs.count()).toBeGreaterThanOrEqual(3);

    const second = thumbs.nth(1);
    await second.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Visor de fotos' });
    await expect(dialog).toBeVisible();
    // El foco entra en el diálogo (Cerrar tiene autofocus).
    await expect(dialog.getByRole('button', { name: 'Cerrar' })).toBeFocused();

    const counter = dialog.locator('[data-counter]');
    const first = await counter.textContent();
    await page.keyboard.press('ArrowRight');
    await expect(counter).not.toHaveText(first ?? '');
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toHaveText(first ?? '');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(second).toBeFocused();
  });
});
