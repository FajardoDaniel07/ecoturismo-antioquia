import { test, expect } from './fixtures';

test('humo: la página de plantilla se sirve con su título y su encabezado', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Ecoturismo Antioquia');
  await expect(page.getByRole('heading', { level: 1, name: 'Ecoturismo Antioquia' })).toBeVisible();
});

test('humo: la página de plantilla no pide teselas de OpenStreetMap', async ({
  page,
  tileRequests,
}) => {
  await page.goto('/');
  expect(tileRequests).toEqual([]);
});
