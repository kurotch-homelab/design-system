import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const dist = new URL('../catalog/dist/react/', import.meta.url);
await mkdir(dist, { recursive: true });
await build({
  entryPoints: [fileURLToPath(new URL('./src/main.tsx', import.meta.url))],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  minify: true,
  sourcemap: true,
  outfile: fileURLToPath(new URL('app.js', dist)),
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
});
await copyFile(new URL('./index.html', import.meta.url), new URL('index.html', dist));
await copyFile(new URL('./src/style.css', import.meta.url), new URL('style.css', dist));
await copyFile(
  new URL('../../packages/react/dist/forma.css', import.meta.url),
  new URL('forma.css', dist),
);
