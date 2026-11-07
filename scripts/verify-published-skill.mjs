import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

if (!process.env.npm_execpath) throw new Error('Run through npm.');
const pkg = JSON.parse(await readFile('skills/forma-design-system/package.json', 'utf8'));
const root = await mkdtemp(join(tmpdir(), 'forma-published-skill-'));
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', env: process.env });
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || 'Verification failed.');
  return result.stdout;
}
try {
  const npm = (...args) => run(process.execPath, [process.env.npm_execpath, ...args]);
  const [{ filename, integrity }] = JSON.parse(npm('pack', `${pkg.name}@${pkg.version}`, '--registry', 'https://npm.pkg.github.com', '--ignore-scripts', '--json'));
  const local = await readFile(join('output/packages', filename));
  if (integrity !== 'sha512-' + createHash('sha512').update(local).digest('base64')) throw new Error('Published skill differs from validated archive.');
  run('tar', ['-xzf', filename]);
  const check = JSON.parse(run(process.execPath, [join(root, 'package/scripts/forma.mjs'), 'self-check']));
  if (!check.ok) throw new Error('Published skill self-check failed.');
  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink() || entry.name.endsWith('.tgz')) throw new Error('Unexpected bundled package/link.');
      if (entry.isDirectory()) await inspect(join(directory, entry.name));
    }
  }
  await inspect(join(root, 'package'));
  console.log(`${pkg.name}@${pkg.version}: downloaded from GitHub Packages; integrity and self-check passed.`);
} finally {
  if (!resolve(root).startsWith(resolve(tmpdir()) + sep)) throw new Error('Cleanup escaped temporary directory.');
  await rm(root, { recursive: true, force: true });
}
