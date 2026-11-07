import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

let scratch, skill;
before(async () => {
  scratch = await realpath(await mkdtemp(join(tmpdir(), 'forma-skill-test-')));
  skill = join(scratch, 'portable skill 日本語');
  await cp(resolve('skills/forma-design-system'), skill, { recursive: true });
});
after(async () => {
  const actual = await realpath(scratch),
    parent = await realpath(tmpdir());
  assert.ok(actual.startsWith(parent + sep) && basename(actual).startsWith('forma-skill-test-'));
  await rm(actual, { recursive: true, force: true });
});
async function project(name, pkg) {
  const directory = join(scratch, name);
  await mkdir(directory, { recursive: true });
  if (pkg) await writeFile(join(directory, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  return directory;
}
function run(args, { ok = true, from = skill } = {}) {
  const result = spawnSync(process.execPath, [join(from, 'scripts/forma.mjs'), ...args], {
    cwd: scratch,
    encoding: 'utf8',
    env: { ...process.env, NODE_PATH: '' },
  });
  if (ok) {
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  }
  assert.notEqual(result.status, 0, 'Expected the installer to reject the operation');
  return result.stderr;
}
async function tree(directory) {
  const out = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    out.push(entry.name);
    if (entry.isDirectory())
      out.push(...(await tree(join(directory, entry.name))).map((name) => `${entry.name}/${name}`));
  }
  return out.sort();
}

const root = process.cwd();
async function packageManagerInstall(target, mode) {
  const part = mode === 'css' ? 'styles' : mode;
  const directory = join(root, 'packages', part);
  const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
  const destination = join(target, 'node_modules', pkg.name);
  await mkdir(destination, { recursive: true });
  await cp(join(directory, 'dist'), join(destination, 'dist'), { recursive: true });
  await cp(join(directory, 'LICENSE'), join(destination, 'LICENSE'));
  await writeFile(join(destination, 'package.json'), JSON.stringify(pkg));
}
async function finish(target, mode) {
  await packageManagerInstall(target, mode);
  run(['sync', '--target', target]);
  assert.equal(run(['verify', '--target', target]).ok, true);
}
test('skill carries pinned registry metadata and no packaged implementation', async () => {
  const source = await readFile(join(skill, 'SKILL.md'), 'utf8');
  assert.ok(source.split('\n').length < 100);
  assert.match(source, /name: forma-design-system/);
  assert.match(source, /description: .+Use when/);
  for (const match of source.matchAll(/\]\((references\/[^)]+)\)/g))
    assert.ok((await readFile(join(skill, match[1]))).length);
  const checked = run(['self-check']);
  assert.equal(checked.ok, true);
  for (const item of Object.values(checked.packages)) {
    assert.equal(item.registry, 'https://npm.pkg.github.com');
    assert.match(item.version, /^\d+\.\d+\.\d+$/);
    assert.equal(item.path, undefined);
  }
  assert.ok(!(await tree(skill)).some((path) => path.endsWith('.tgz') || path.startsWith('assets/styles/')));
});
test('CSS integration fetches a dependency before sync, preserves licenses and is idempotent', async () => {
  const target = await project('HTML project 日本語');
  await writeFile(join(target, 'index.html'), '<h1>Keep the existing application</h1>');
  const args = ['install', '--target', target, '--mode', 'css', '--assets-dir', 'assets/forma'];
  run([...args, '--dry-run']);
  assert.deepEqual(await tree(target), ['index.html']);
  const prepared = run(args);
  assert.equal(prepared.dependency.name, '@kurotch-homelab/forma-styles');
  assert.equal(prepared.install.command[0], 'npm');
  assert.ok(!(await tree(target)).includes('assets/forma/forma.css'));
  assert.match(run(['sync', '--target', target], { ok: false }), /package manager before sync/);
  await finish(target, 'css');
  assert.equal(await readFile(join(target, 'assets/forma/forma.css'), 'utf8'), await readFile(join(root, 'packages/styles/dist/forma.css'), 'utf8'));
  assert.match(await readFile(join(target, 'assets/forma/LICENSE'), 'utf8'), /MIT License/);
  assert.match(await readFile(join(target, 'assets/forma/fonts/OFL.txt'), 'utf8'), /SIL OPEN FONT LICENSE/);
  assert.equal(await readFile(join(target, 'index.html'), 'utf8'), '<h1>Keep the existing application</h1>');
  assert.deepEqual(run(args).filesChanged, []);
  assert.deepEqual(run(['sync', '--target', target]).filesChanged, []);
});
test('tokens mode installs only the token dependency and copies installed JSON/CSS', async () => {
  const target = await project('native app');
  const result = run(['install', '--target', target, '--mode', 'tokens', '--assets-dir', 'design/forma']);
  assert.equal(result.dependency.name, '@kurotch-homelab/forma-tokens');
  await finish(target, 'tokens');
  const entries = await tree(target);
  assert.ok(entries.includes('design/forma/tokens.json'));
  assert.ok(!entries.some((name) => /fonts|\.tgz|forma\.css/.test(name)));
  assert.match(await readFile(join(target, 'design/forma/LICENSE'), 'utf8'), /MIT License/);
  const pkg = JSON.parse(await readFile(join(target, 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(pkg.dependencies), ['@kurotch-homelab/forma-tokens']);
});
test('React uses an exact registry version and preserves existing package fields', async () => {
  const original = { name: 'consumer', private: true, scripts: { build: 'existing build' }, dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' } };
  const target = await project('React app', original);
  const args = ['install', '--target', target, '--mode', 'react', '--fonts', 'system'];
  run([...args, '--dry-run']);
  assert.deepEqual(JSON.parse(await readFile(join(target, 'package.json'))), original);
  const prepared = run(args);
  const pkg = JSON.parse(await readFile(join(target, 'package.json')));
  assert.deepEqual(pkg.scripts, original.scripts);
  assert.equal(pkg.dependencies.react, original.dependencies.react);
  assert.equal(pkg.dependencies['@kurotch-homelab/forma-react'], prepared.dependency.spec);
  assert.match(prepared.dependency.spec, /^\d+\.\d+\.\d+$/);
  assert.ok(!(await tree(target)).some((name) => name.endsWith('.tgz')));
  await finish(target, 'react');
  assert.deepEqual(run(args).filesChanged, []);
});
test('workspace preparation changes only the selected app and leaves registry credentials alone', async () => {
  const workspace = await project('workspace', { private: true, packageManager: 'pnpm@10.0.0', workspaces: ['apps/*'] });
  await writeFile(join(workspace, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
  const npmrc = '@example:registry=https://registry.example.test/\n';
  await writeFile(join(workspace, '.npmrc'), npmrc);
  const app = await project('workspace/apps/web', { name: 'web', dependencies: { react: '^19.0.0' } });
  const result = run(['install', '--target', app, '--mode', 'react']);
  assert.deepEqual(result.install, { cwd: workspace, command: ['pnpm', 'install'] });
  assert.equal(JSON.parse(await readFile(join(workspace, 'package.json'))).dependencies, undefined);
  assert.equal(await readFile(join(workspace, '.npmrc'), 'utf8'), npmrc);
  await finish(app, 'react');
});
test('sync detects user CSS before writes and refuses wrong installed versions', async () => {
  const target = await project('conflicts');
  run(['install', '--target', target, '--mode', 'css']);
  await packageManagerInstall(target, 'css');
  await writeFile(join(target, 'public/forma/forma.css'), 'user styling');
  const before = await tree(target);
  assert.match(run(['sync', '--target', target], { ok: false }), /would be overwritten/);
  assert.deepEqual(await tree(target), before);
  assert.equal(await readFile(join(target, 'public/forma/forma.css'), 'utf8'), 'user styling');
  const wrong = await project('wrong version');
  run(['install', '--target', wrong, '--mode', 'tokens']);
  await packageManagerInstall(wrong, 'tokens');
  const path = join(wrong, 'node_modules/@kurotch-homelab/forma-tokens/package.json');
  const pkg = JSON.parse(await readFile(path, 'utf8')); pkg.version = '0.0.0';
  await writeFile(path, JSON.stringify(pkg));
  assert.match(run(['sync', '--target', wrong], { ok: false }), /does not match/);
});
test('modified managed files and conflicting dependencies are preserved', async () => {
  const target = await project('modified install');
  run(['install', '--target', target, '--mode', 'css']);
  await finish(target, 'css');
  await writeFile(join(target, 'public/forma/forma.css'), 'application changed this');
  assert.match(run(['verify', '--target', target], { ok: false }), /Modified/);
  assert.match(run(['install', '--target', target], { ok: false }), /Modified/);
  const conflict = await project('existing registry dependency', { dependencies: { react: '^19.0.0', '@kurotch-homelab/forma-react': '^0.1.0' } });
  assert.match(run(['install', '--target', conflict, '--mode', 'react'], { ok: false }), /conflicts/);
  assert.deepEqual(await tree(conflict), ['package.json']);
});
test('legacy managed file dependency migrates to a registry version without deleting old assets', async () => {
  const { createHash } = await import('node:crypto');
  const archive = 'vendor/forma/legacy.tgz';
  const target = await project('legacy', { dependencies: { react: '^19.0.0', '@kurotch-homelab/forma-react': `file:${archive}` } });
  await mkdir(join(target, 'vendor/forma'), { recursive: true });
  const data = Buffer.from('legacy archive');
  await writeFile(join(target, archive), data);
  await writeFile(join(target, 'vendor/forma/installation.json'), JSON.stringify({ schemaVersion: 1, skill: 'forma-design-system', mode: 'react', dependency: { name: '@kurotch-homelab/forma-react', spec: `file:${archive}` }, files: { [archive]: createHash('sha256').update(data).digest('hex') } }));
  const result = run(['install', '--target', target, '--mode', 'react']);
  assert.match(result.dependency.spec, /^\d+\.\d+\.\d+$/);
  assert.deepEqual(await readFile(join(target, archive)), data);
  await finish(target, 'react');
});
test('invalid mode, traversal, absent React and symlink destinations are rejected without escaping', async (t) => {
  const target = await project('invalid paths');
  assert.match(
    run(['install', '--target', target, '--mode', 'react'], { ok: false }),
    /existing React/,
  );
  assert.match(
    run(['install', '--target', target, '--mode', 'css', '--assets-dir', '../outside'], {
      ok: false,
    }),
    /traversal/,
  );
  assert.match(
    run(['install', '--target', target, '--mode', 'unknown'], { ok: false }),
    /Unsupported mode/,
  );
  assert.match(run(['install', '--target', skill], { ok: false }), /not the skill/);
  const outside = await project('outside destination');
  try {
    await symlink(
      outside,
      join(target, 'public'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
  } catch (error) {
    if (error.code === 'EPERM') {
      t.diagnostic(
        'Symlink creation is unavailable; traversal and other rejection checks completed.',
      );
      return;
    }
    throw error;
  }
  assert.match(
    run(['install', '--target', target, '--mode', 'css'], { ok: false }),
    /symbolic link/,
  );
  assert.deepEqual(await tree(outside), []);
});
test('tampered skill asset is rejected before installation', async () => {
  const altered = join(scratch, 'altered skill');
  await cp(skill, altered, { recursive: true });
  await writeFile(join(altered, 'assets/fonts/fonts.css'), 'changed');
  const target = await project('untouched project');
  assert.match(run(['self-check'], { ok: false, from: altered }), /checksum mismatch/);
  assert.match(
    run(['install', '--target', target], { ok: false, from: altered }),
    /checksum mismatch/,
  );
  assert.deepEqual(await tree(target), []);
});
