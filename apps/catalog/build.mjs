import { mkdir, copyFile, readdir } from 'node:fs/promises';
const dist = new URL('./dist/', import.meta.url);
await mkdir(new URL('assets/', dist), { recursive: true });
await copyFile(new URL('./index.html', import.meta.url), new URL('index.html', dist));
await copyFile(new URL('./font-study.html', import.meta.url), new URL('font-study.html', dist));
for (const name of await readdir(new URL('./src/', import.meta.url))) {
  if (/\.(js|css)$/.test(name))
    await copyFile(new URL('./src/' + name, import.meta.url), new URL('assets/' + name, dist));
}
await copyFile(
  new URL('../../packages/styles/dist/forma.css', import.meta.url),
  new URL('assets/forma.css', dist),
);
await copyFile(new URL('../../GUIDELINES.md', import.meta.url), new URL('GUIDELINES.md', dist));
