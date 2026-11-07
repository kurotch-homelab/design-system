import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const paths = ['apps/catalog/src', 'scripts', 'packages/tokens', 'packages/styles', 'apps/catalog'];
for (const dir of paths)
  for (const file of await readdir(dir))
    if (/\.(js|mjs)$/.test(file)) {
      const r = spawnSync(process.execPath, ['--check', `${dir}/${file}`], { stdio: 'inherit' });
      if (r.status) process.exit(r.status);
    }
console.log('All JavaScript syntax checks passed.');
