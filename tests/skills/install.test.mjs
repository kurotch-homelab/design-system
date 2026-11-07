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

test('portable skill is complete, compact at entry, and validates from outside the repository', async () => {
  const source = await readFile(join(skill, 'SKILL.md'), 'utf8');
  assert.ok(source.split('\n').length < 100);
  assert.match(source, /name: forma-design-system/);
  assert.match(source, /description: .+Use when/);
  for (const match of source.matchAll(/\]\((references\/[^)]+)\)/g))
    assert.ok((await readFile(join(skill, match[1]))).length);
  assert.equal(run(['self-check']).ok, true);
});
test('CSS installation is offline, includes local licensed fonts, and is idempotent', async () => {
  const target = await project('HTML project 日本語');
  await writeFile(join(target, 'index.html'), '<h1>Keep the existing application</h1>');
  const args = ['install', '--target', target, '--mode', 'css', '--assets-dir', 'assets/forma'];
  run([...args, '--dry-run']);
  assert.deepEqual(await tree(target), ['index.html']);
  const installed = run(args);
  assert.equal(installed.packageJsonChanged, false);
  assert.equal(installed.install, null);
  assert.match(await readFile(join(target, 'assets/forma/LICENSE'), 'utf8'), /MIT License/);
  assert.match(await readFile(join(target, 'vendor/forma/LICENSE'), 'utf8'), /MIT License/);
  assert.match(
    await readFile(join(target, 'vendor/forma/THIRD_PARTY_NOTICES.md'), 'utf8'),
    /SIL Open Font License 1\.1/,
  );
  assert.match(
    await readFile(join(target, 'assets/forma/fonts/OFL.txt'), 'utf8'),
    /SIL OPEN FONT LICENSE/,
  );
  assert.equal(
    (await readFile(join(target, 'assets/forma/fonts/IBMPlexSansJP-Regular.ttf'))).readUInt32BE(0),
    0x00010000,
  );
  assert.equal(
    await readFile(join(target, 'index.html'), 'utf8'),
    '<h1>Keep the existing application</h1>',
  );
  assert.equal(run(['verify', '--target', target]).ok, true);
  const second = run(args);
  assert.deepEqual(second.filesChanged, []);
  assert.equal(second.packageJsonChanged, false);
});
test('tokens-only integration does not add fonts, application CSS, React or package.json', async () => {
  const target = await project('native app');
  run(['install', '--target', target, '--mode', 'tokens', '--assets-dir', 'design/forma']);
  const entries = await tree(target);
  assert.ok(entries.includes('design/forma/tokens.json'));
  assert.match(await readFile(join(target, 'design/forma/LICENSE'), 'utf8'), /MIT License/);
  assert.ok(!entries.some((name) => /fonts|\.tgz|package\.json|forma\.css/.test(name)));
  assert.equal(run(['verify', '--target', target]).ok, true);
});
test('React dependencies stay local and preserve existing package metadata', async () => {
  const original = {
    name: 'consumer',
    private: true,
    scripts: { build: 'existing build' },
    dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
  };
  const target = await project('React app', original);
  const args = ['install', '--target', target, '--mode', 'react', '--fonts', 'system'];
  run([...args, '--dry-run']);
  assert.deepEqual(JSON.parse(await readFile(join(target, 'package.json'))), original);
  const result = run(args);
  assert.equal(result.install.command[0], 'npm');
  const pkg = JSON.parse(await readFile(join(target, 'package.json')));
  assert.deepEqual(pkg.scripts, original.scripts);
  assert.equal(pkg.dependencies.react, original.dependencies.react);
  assert.match(
    pkg.dependencies['@kurotch-homelab/forma-react'],
    /^file:vendor\/forma\/[^/]+\.tgz$/,
  );
  assert.ok(!JSON.stringify(pkg).includes(skill));
  assert.ok(!JSON.stringify(pkg).includes(process.cwd()));
  assert.equal(run(['verify', '--target', target]).ok, true);
  assert.deepEqual(run(args).filesChanged, []);
});
test('targeted workspace uses its own portable dependency and the root package manager', async () => {
  const workspace = await project('workspace', {
    private: true,
    packageManager: 'pnpm@10.0.0',
    workspaces: ['apps/*'],
  });
  await writeFile(join(workspace, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
  const app = await project('workspace/apps/web', {
    name: 'web',
    dependencies: { react: '^19.0.0' },
  });
  const info = run(['inspect', '--target', app]);
  assert.equal(info.manager, 'pnpm');
  assert.equal(info.workspaceRoot, workspace);
  const result = run(['install', '--target', app, '--mode', 'react']);
  assert.deepEqual(result.install, { cwd: workspace, command: ['pnpm', 'install'] });
  assert.equal(JSON.parse(await readFile(join(workspace, 'package.json'))).dependencies, undefined);
  assert.equal(run(['verify', '--target', app]).ok, true);
});
test('existing file or dependency conflicts stop before any writes; managed edits are detected', async () => {
  const target = await project('conflicts', { dependencies: { react: '^19.0.0' } });
  await mkdir(join(target, 'public/forma'), { recursive: true });
  await writeFile(join(target, 'public/forma/forma.css'), 'user styling');
  const before = await tree(target),
    pkg = await readFile(join(target, 'package.json'), 'utf8');
  assert.match(
    run(['install', '--target', target, '--mode', 'react'], { ok: false }),
    /would be overwritten/,
  );
  assert.deepEqual(await tree(target), before);
  assert.equal(await readFile(join(target, 'package.json'), 'utf8'), pkg);
  const installed = await project('modified install');
  run(['install', '--target', installed, '--mode', 'css']);
  await writeFile(join(installed, 'public/forma/forma.css'), 'application changed this');
  assert.match(run(['verify', '--target', installed], { ok: false }), /Modified/);
  assert.match(run(['install', '--target', installed], { ok: false }), /Modified/);
  const conflict = await project('existing registry dependency', {
    dependencies: { react: '^19.0.0', '@kurotch-homelab/forma-react': '^0.1.0' },
  });
  assert.match(
    run(['install', '--target', conflict, '--mode', 'react'], { ok: false }),
    /conflicts/,
  );
  assert.deepEqual(await tree(conflict), ['package.json']);
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
  await writeFile(join(altered, 'assets/styles/tokens.css'), 'changed');
  const target = await project('untouched project');
  assert.match(run(['self-check'], { ok: false, from: altered }), /checksum mismatch/);
  assert.match(
    run(['install', '--target', target], { ok: false, from: altered }),
    /checksum mismatch/,
  );
  assert.deepEqual(await tree(target), []);
});
