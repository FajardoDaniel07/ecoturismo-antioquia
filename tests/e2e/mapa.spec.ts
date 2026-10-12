/**
 * Suite esencial, parte 2 (C-7): el mapa simple de rutas (CA-67 a CA-80), sobre `academico`.
 * Las teselas de OpenStreetMap están interceptadas siempre (fixtures.ts): nunca hay peticiones reales.
 *
 * Leaflet pinta SVG sin roles ni nombres accesibles; las líneas se localizan por su clase
 * (`route-line`), que es la única forma de alcanzarlas. Todo lo demás, por rol y nombre.
 */
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
/** Lo que no debe pedirse al cargar la página: el módulo del mapa, el CSS de Leaflet, los trazados y las teselas. */
const MAP_ASSETS = /route-map\.client|leaflet|data\/rutas\.json|tile\.openstreetmap\.org/;
const ROUTES = 4;

function onlyIn(...names: string[]) {
  test.skip(!names.includes(test.info().project.name), `solo en ${names.join(', ')}`);
}

const mapBox = (page: Page) => page.getByRole('region', { name: /^Mapa de las rutas/ });
const routeItems = (page: Page) => page.locator('li[id^="ruta-"]');

function watchRequests(page: Page): string[] {
  const urls: string[] = [];
  page.on('request', (request) => urls.push(request.url()));
  return urls;
}

test.describe('mapa de rutas', () => {
  test('CA-79: la carga inicial no pide el módulo, el CSS, los trazados ni teselas', async ({
    page,
    tileRequests,
  }) => {
    onlyIn('escritorio', 'movil');
    const urls = watchRequests(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(urls.filter((u) => MAP_ASSETS.test(u))).toEqual([]);
    expect(tileRequests).toEqual([]);
  });

  test('CA-67, CA-74, CA-79: al acercar la sección aparecen las líneas y la atribución', async ({
    page,
    tileRequests,
  }) => {
    onlyIn('escritorio');
    await page.goto('/');
    const box = mapBox(page);
    await box.scrollIntoViewIfNeeded();
    await expect(page.locator('path.route-line')).toHaveCount(ROUTES);
    await expect(box.getByRole('link', { name: /OpenStreetMap/ })).toBeVisible();
    await expect.poll(() => tileRequests.length).toBeGreaterThan(0);
  });

  test('CA-70, CA-80: el popup de una línea lleva a una entrada existente de la lista', async ({
    page,
  }) => {
    onlyIn('escritorio');
    await page.goto('/');
    await mapBox(page).scrollIntoViewIfNeeded();
    const line = page.locator('path.route-line').first();
    await expect(line).toBeAttached();
    await line.dispatchEvent('click');
    const link = mapBox(page).getByRole('link', { name: 'Ver en la lista' });
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^#ruta-/);
    await link.click();
    await expect(page.locator(href as string)).toBeVisible();
    await expect(routeItems(page)).toHaveCount(ROUTES);
  });

  test('CA-75: con las teselas bloqueadas la caja del mapa desaparece y la lista queda completa', async ({
    page,
  }) => {
    onlyIn('escritorio');
    // Una ruta de la página pesa más que la del contexto: las teselas fallan en vez de llegar.
    await page.route(/tile\.openstreetmap\.org/, (route) => route.abort());
    await page.goto('/');
    const box = page.locator('[data-route-map]');
    await box.scrollIntoViewIfNeeded();
    await expect(box).toHaveAttribute('data-failed', '');
    await expect(box).toBeHidden();
    await expect(routeItems(page)).toHaveCount(ROUTES);
    await expect(routeItems(page).first()).toBeVisible();
  });

  test('CA-65, CA-80: sin JavaScript no hay caja del mapa y la lista de rutas sigue', async ({
    page,
  }) => {
    onlyIn('sin-javascript');
    await page.goto('/');
    await expect(page.locator('[data-route-map]')).toBeHidden();
    await expect(routeItems(page)).toHaveCount(ROUTES);
    await expect(routeItems(page).first()).toBeVisible();
    await expect(
      routeItems(page)
        .first()
        .getByRole('link', { name: /^Ir a / }),
    ).toBeVisible();
  });

  test('axe: sin violaciones serious ni critical con el mapa cargado', async ({ page }) => {
    onlyIn('escritorio', 'movil');
    await page.goto('/');
    await mapBox(page).scrollIntoViewIfNeeded();
    await expect(page.locator('path.route-line')).toHaveCount(ROUTES);
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(
      serious.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target).join(' | ')}`),
    ).toEqual([]);
  });

  test('360 px: con el mapa cargado no hay desplazamiento horizontal', async ({ page }) => {
    onlyIn('movil');
    await page.goto('/');
    await mapBox(page).scrollIntoViewIfNeeded();
    await expect(page.locator('path.route-line')).toHaveCount(ROUTES);
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(client).toBe(360);
    expect(scroll, `scrollWidth ${scroll} frente a ${client}`).toBeLessThanOrEqual(client);
  });
});
