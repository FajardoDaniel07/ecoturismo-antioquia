// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// En Vercel, las vistas previas no tienen SITE_URL: se usa su propia dirección (https://$VERCEL_URL).
// La publicación sigue exigiendo SITE_URL (la comprueba loadSite(), que solo lee esa variable).
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:4321');

// SITE_URL solo es obligatoria en la compilación de publicación (la valida el contenido, ADR 0003).
// OUT_DIR permite a las pruebas construir cada escenario en su propia carpeta.
// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'always',
  outDir: process.env.OUT_DIR ?? 'dist',
  vite: {
    plugins: [tailwindcss()],
  },
});
