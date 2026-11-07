// Run after build/tests with npm authentication supplied by the user's environment or Actions.
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

if (!process.env.npm_execpath) throw new Error('Run with npm run publish:packages.');
const registry = 'https://npm.pkg.github.com';
const destination = resolve('output/packages');
await mkdir(destination, { recursive: true });
const npm = (...args) => spawnSync(process.execPath, [process.env.npm_execpath, ...args], {
  encoding: 'utf8', env: process.env,
});
for (const directory of ['packages/tokens', 'packages/styles', 'packages/react', 'skills/forma-design-system']) {
  const pkg = JSON.parse(await readFile(`${directory}/package.json`, 'utf8'));
  if (pkg.publishConfig?.registry !== registry) throw new Error('Unexpected publish registry.');
  const packed = npm('pack', `./${directory}`, '--ignore-scripts', '--json', '--pack-destination', destination);
  if (packed.status !== 0) throw new Error(packed.stderr);
  const [{ filename }] = JSON.parse(packed.stdout);
  const archive = resolve(destination, filename);
  const integrity = 'sha512-' + createHash('sha512').update(await readFile(archive)).digest('base64');
  const version = `${pkg.name}@${pkg.version}`;
  const existing = npm('view', version, 'dist.integrity', '--json', '--registry', registry);
  if (existing.status === 0) {
    if (JSON.parse(existing.stdout) !== integrity) throw new Error(`${version} already exists with different contents. Bump its version.`);
    console.log(`${version}: already published, integrity matches.`);
    continue;
  }
  let code;
  try { code = JSON.parse(existing.stdout).error?.code; } catch { /* npm may not return JSON on a transport error. */ }
  if (code !== 'E404') throw new Error(existing.stderr || 'Unable to check published version.');
  const published = npm('publish', archive, '--registry', registry, '--ignore-scripts', '--access', 'public');
  if (published.status !== 0) throw new Error(published.stderr);
  const verified = npm('view', version, 'dist.integrity', '--json', '--registry', registry);
  if (verified.status !== 0 || JSON.parse(verified.stdout) !== integrity) throw new Error(`${version}: published integrity verification failed.`);
  console.log(`${version}: published and verified.`);
}
