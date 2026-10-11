// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL solo es obligatoria en la compilación de publicación (la valida el contenido, ADR 0003).
// OUT_DIR permite a las pruebas construir cada escenario en su propia carpeta.
// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'always',
  outDir: process.env.OUT_DIR ?? 'dist',
  vite: {
    plugins: [tailwindcss()],
  },
});
