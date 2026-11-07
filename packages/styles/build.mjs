import { copyFile, readFile, writeFile, mkdir } from 'node:fs/promises';
await mkdir(new URL('./dist', import.meta.url), { recursive: true });
const tokens = await readFile(new URL('../tokens/dist/tokens.css', import.meta.url), 'utf8');
const styles = await readFile(new URL('./src/styles.css', import.meta.url), 'utf8');
const motion = await readFile(new URL('./src/motion.css', import.meta.url), 'utf8');
await writeFile(
  new URL('./dist/forma.css', import.meta.url),
  tokens + '\n' + styles + '\n' + motion,
);
await copyFile(new URL('../../LICENSE', import.meta.url), new URL('./LICENSE', import.meta.url));
