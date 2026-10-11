import { test, expect } from './fixtures';

test('humo: la página de inicio se sirve con título, idioma y un único h1', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Ecoturismo Antioquia/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-CO');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('humo: la página de inicio no pide teselas de OpenStreetMap', async ({
  page,
  tileRequests,
}) => {
  await page.goto('/');
  expect(tileRequests).toEqual([]);
});
