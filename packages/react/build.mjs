import { copyFile, readFile, writeFile } from 'node:fs/promises';
const shared = await readFile(new URL('../styles/dist/forma.css', import.meta.url), 'utf8');
const react = await readFile(new URL('./src/react.css', import.meta.url), 'utf8');
await writeFile(new URL('./dist/forma.css', import.meta.url), shared + '\n' + react);
await writeFile(
  new URL('./dist/styles.d.ts', import.meta.url),
  '// The stylesheet is a side-effect-only module.\nexport {};\n',
);
await copyFile(new URL('../../LICENSE', import.meta.url), new URL('./LICENSE', import.meta.url));
