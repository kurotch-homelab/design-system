#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { access, lstat, mkdir, readFile, realpath, rename, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join, relative, resolve, sep, win32 } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const ownerPath = 'vendor/forma/installation.json';
const reactName = '@kurotch-homelab/forma-react';
const hash = (data) => createHash('sha256').update(data).digest('hex');
const slash = (path) => path.split(sep).join('/');
const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
};
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const optionalJson = async (path) => ((await exists(path)) ? json(path) : null);
function localPath(root, path) {
  if (
    typeof path !== 'string' ||
    !path ||
    isAbsolute(path) ||
    win32.isAbsolute(path) ||
    path.includes('\\') ||
    path.split('/').some((part) => !part || part === '.' || part === '..')
  )
    throw new Error(`Expected a relative path without traversal: ${path}`);
  const full = resolve(root, path);
  if (!full.startsWith(root + sep)) throw new Error(`Path escapes the selected directory: ${path}`);
  return full;
}
async function noSymlinks(root, path) {
  localPath(root, path);
  let cursor = root;
  for (const part of path.split('/')) {
    cursor = join(cursor, part);
    try {
      if ((await lstat(cursor)).isSymbolicLink())
        throw new Error(`Refusing to write through a symbolic link: ${cursor}`);
    } catch (error) {
      if (error.code === 'ENOENT') break;
      throw error;
    }
  }
}
function parse(argv) {
  const command = argv.shift() ?? 'help',
    options = {};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (!['--target', '--mode', '--assets-dir', '--fonts', '--manager'].includes(flag))
      throw new Error(`Unknown option: ${flag}`);
    if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error(`Missing value for ${flag}`);
    options[flag.slice(2)] = argv[++i];
  }
  return { command, options };
}
async function bundle() {
  const manifest = await json(join(skillRoot, 'bundle.json'));
  if (manifest.schemaVersion !== 1 || !manifest.files || !manifest.packages)
    throw new Error('Unsupported or incomplete Forma bundle.');
  const files = new Map();
  for (const [path, checksum] of Object.entries(manifest.files)) {
    await noSymlinks(skillRoot, path);
    const content = await readFile(localPath(skillRoot, path));
    if (hash(content) !== checksum) throw new Error(`Skill asset checksum mismatch: ${path}`);
    files.set(path, content);
  }
  const digest = hash(
    JSON.stringify(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b, 'en'))),
  );
  if (digest !== manifest.snapshotId) throw new Error('Skill snapshot checksum mismatch.');
  for (const item of Object.values(manifest.packages))
    if (!files.has(item.path)) throw new Error(`Missing bundled package: ${item.path}`);
  return { manifest, files };
}
async function inspect(target, override) {
  const pkg = await optionalJson(join(target, 'package.json'));
  const dependencies = { ...pkg?.devDependencies, ...pkg?.peerDependencies, ...pkg?.dependencies };
  let installedReact = null;
  try {
    const require = createRequire(join(target, '__forma_probe__.cjs'));
    installedReact = (await json(require.resolve('react/package.json'))).version;
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
  }
  let manager = null,
    workspaceRoot = target,
    lockRoot = null,
    ambiguous = false;
  for (let current = target; ; current = dirname(current)) {
    const config = current === target ? pkg : await optionalJson(join(current, 'package.json'));
    if (!manager && config?.packageManager) manager = config.packageManager.split('@')[0];
    const locks = [];
    for (const [file, name] of [
      ['package-lock.json', 'npm'],
      ['npm-shrinkwrap.json', 'npm'],
      ['pnpm-lock.yaml', 'pnpm'],
      ['yarn.lock', 'yarn'],
      ['bun.lock', 'bun'],
      ['bun.lockb', 'bun'],
    ])
      if (await exists(join(current, file))) locks.push(name);
    if (locks.length && !lockRoot) {
      lockRoot = current;
      if (!manager) {
        ambiguous = new Set(locks).size > 1;
        if (!ambiguous) manager = locks[0];
      }
    }
    if (config?.workspaces || (await exists(join(current, 'pnpm-workspace.yaml')))) {
      workspaceRoot = current;
      break;
    }
    if (dirname(current) === current) break;
  }
  if (workspaceRoot === target && lockRoot) workspaceRoot = lockRoot;
  if (override) {
    if (!['npm', 'pnpm', 'yarn', 'bun'].includes(override))
      throw new Error(`Unsupported package manager: ${override}`);
    manager = override;
    ambiguous = false;
  }
  if (manager && !['npm', 'pnpm', 'yarn', 'bun'].includes(manager))
    throw new Error(`Unsupported packageManager field: ${manager}`);
  if (!manager && !ambiguous) manager = 'npm';
  const frameworks = [
    'next',
    'react',
    'vue',
    'nuxt',
    'svelte',
    '@sveltejs/kit',
    'astro',
    'vite',
  ].filter((name) => dependencies[name]);
  return {
    target,
    workspaceRoot,
    manager,
    ambiguousManager: ambiguous,
    frameworks,
    declaredReact: dependencies.react ?? null,
    installedReact,
    suggestedMode: dependencies.react ? 'react' : 'css',
    hasPackageJson: !!pkg,
    package: pkg,
  };
}
async function owned(target) {
  await noSymlinks(target, ownerPath);
  const previous = await optionalJson(localPath(target, ownerPath));
  if (
    previous &&
    (previous.schemaVersion !== 1 || previous.skill !== 'forma-design-system' || !previous.files)
  )
    throw new Error('Existing Forma installation manifest has an unsupported format.');
  return previous;
}
async function verifyFiles(target, previous) {
  const problems = [];
  for (const [path, checksum] of Object.entries(previous.files)) {
    await noSymlinks(target, path);
    const full = localPath(target, path);
    if (!(await exists(full))) problems.push(`Missing: ${path}`);
    else if (hash(await readFile(full)) !== checksum) problems.push(`Modified: ${path}`);
  }
  if (previous.dependency) {
    const pkg = await json(join(target, 'package.json'));
    if (pkg.dependencies?.[previous.dependency.name] !== previous.dependency.spec)
      problems.push(`Dependency changed: ${previous.dependency.name}`);
    const relativeTarball = previous.dependency.spec.replace(/^file:/, '');
    localPath(target, relativeTarball);
    if (!Object.hasOwn(previous.files, relativeTarball))
      problems.push('Dependency is not a managed local tarball.');
  }
  if (problems.length)
    throw new Error(
      `Installed files differ; preserve and reconcile them before continuing:\n${problems.join('\n')}`,
    );
}
async function writeAtomic(root, path, content) {
  await noSymlinks(root, path);
  const full = localPath(root, path);
  await mkdir(dirname(full), { recursive: true });
  const temp = `${full}.forma-${process.pid}.tmp`;
  await writeFile(temp, content, { flag: 'wx' });
  await rename(temp, full);
}
async function install(target, options) {
  const { manifest, files } = await bundle();
  const info = await inspect(target, options.manager);
  const mode = !options.mode || options.mode === 'auto' ? info.suggestedMode : options.mode;
  if (!['react', 'css', 'tokens'].includes(mode)) throw new Error(`Unsupported mode: ${mode}`);
  const fonts = options.fonts ?? 'bundled';
  if (!['bundled', 'system'].includes(fonts)) throw new Error(`Unsupported fonts mode: ${fonts}`);
  const assetsDir = options['assets-dir'] ?? 'public/forma';
  localPath(target, assetsDir);
  if (
    assetsDir
      .split('/')
      .some((part) => ['.git', 'node_modules', '.agents', '.codex'].includes(part))
  )
    throw new Error('Choose an application asset directory, not metadata or dependencies.');
  if (mode === 'react') {
    if (!info.package || (!info.declaredReact && !info.installedReact))
      throw new Error(
        'React mode needs an existing React application. Use CSS mode or set up the requested React project first.',
      );
    if (info.ambiguousManager)
      throw new Error(
        'Multiple lockfile managers found. Inspect the workspace and pass --manager.',
      );
    if (info.installedReact) {
      const [major, minor] = info.installedReact.split('.').map(Number);
      if (!(major === 19 || (major === 18 && minor >= 3)))
        throw new Error(
          `Installed React ${info.installedReact} is outside the bundled adapter peer range. Use CSS mode or resolve the version explicitly.`,
        );
    }
  }
  const previous = await owned(target);
  if (previous) await verifyFiles(target, previous);
  const planned = new Map();
  const copy = (source, destination) => {
    const content = files.get(source);
    if (!content) throw new Error(`Bundle does not include ${source}`);
    localPath(target, destination);
    planned.set(destination, content);
  };
  copy('LICENSE', `${assetsDir}/LICENSE`);
  copy('LICENSE', 'vendor/forma/LICENSE');
  copy('THIRD_PARTY_NOTICES.md', 'vendor/forma/THIRD_PARTY_NOTICES.md');
  copy('assets/styles/tokens.css', `${assetsDir}/tokens.css`);
  copy('assets/styles/tokens.json', `${assetsDir}/tokens.json`);
  if (mode !== 'tokens') {
    copy('assets/styles/forma.css', `${assetsDir}/forma.css`);
    if (fonts === 'bundled') {
      for (const path of files.keys())
        if (path.startsWith('assets/fonts/'))
          copy(path, `${assetsDir}/fonts/${path.slice('assets/fonts/'.length)}`);
    } else {
      planned.set(
        `${assetsDir}/fonts/fonts.css`,
        Buffer.from(
          '/* Explicit system-font alternative to the reference IBM Plex Sans JP. */\n.forma[data-theme] { --f-font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Yu Gothic", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif; }\n',
        ),
      );
    }
  }
  for (const path of files.keys())
    if (path.startsWith('references/'))
      copy(path, `vendor/forma/docs/${path.slice('references/'.length)}`);
  let dependency = previous?.dependency ?? null,
    packageContent = null;
  if (mode === 'react') {
    const item = manifest.packages.react;
    const archive = `vendor/forma/${item.path.slice('assets/packages/'.length)}`;
    copy(item.path, archive);
    dependency = { name: item.name, spec: `file:${archive}` };
    const packagePath = join(target, 'package.json');
    await noSymlinks(target, 'package.json');
    const original = await readFile(packagePath, 'utf8');
    const pkg = info.package;
    for (const section of [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies',
    ]) {
      const existing = pkg[section]?.[reactName];
      if (
        existing &&
        !(
          section === 'dependencies' &&
          (existing === dependency.spec || existing === previous?.dependency?.spec)
        )
      )
        throw new Error(
          `Existing ${section}.${reactName} conflicts with the bundled dependency. Reconcile it explicitly.`,
        );
    }
    if (pkg.dependencies?.[reactName] !== dependency.spec) {
      pkg.dependencies = { ...pkg.dependencies, [reactName]: dependency.spec };
      const indent = original.match(/\n([\t ]+)"/)?.[1] ?? '  ';
      const eol = original.includes('\r\n') ? '\r\n' : '\n';
      packageContent = Buffer.from(
        (JSON.stringify(pkg, null, indent) + '\n').replaceAll('\n', eol),
      );
    }
  }
  const checksums = { ...previous?.files };
  const writes = [];
  // Check the full plan before creating any directory or editing package.json.
  for (const [path, content] of planned) {
    await noSymlinks(target, path);
    const full = localPath(target, path),
      expected = hash(content);
    checksums[path] = expected;
    if (await exists(full)) {
      const existing = hash(await readFile(full));
      if (existing === expected) continue;
      if (!previous?.files[path] || existing !== previous.files[path])
        throw new Error(`Existing file would be overwritten: ${path}`);
    }
    writes.push([path, content]);
  }
  const installation = {
    schemaVersion: 1,
    skill: 'forma-design-system',
    snapshotId: manifest.snapshotId,
    mode,
    fonts: mode === 'tokens' ? null : fonts,
    assetsDir,
    packages: Object.fromEntries(
      Object.entries(manifest.packages).map(([key, item]) => [
        key,
        { name: item.name, version: item.version },
      ]),
    ),
    dependency,
    files: checksums,
  };
  const ownerContent = Buffer.from(JSON.stringify(installation, null, 2) + '\n');
  if (
    !(await exists(localPath(target, ownerPath))) ||
    !ownerContent.equals(await readFile(localPath(target, ownerPath)))
  )
    writes.push([ownerPath, ownerContent]);
  const output = {
    action: options.dryRun ? 'dry-run' : 'installed',
    target,
    mode,
    fonts: installation.fonts,
    assetsDir,
    snapshotId: manifest.snapshotId,
    filesChanged: writes.map(([path]) => path),
    packageJsonChanged: !!packageContent,
    packageManager: info.manager,
    install:
      mode === 'react' ? { cwd: info.workspaceRoot, command: [info.manager, 'install'] } : null,
    next: [
      'Integrate CSS/fonts and the correct UI boundary in existing application files.',
      'Run the project build and interaction checks; file verification alone is not completion.',
    ],
  };
  if (!options.dryRun) {
    for (const [path, content] of writes.filter(([path]) => path !== ownerPath))
      await writeAtomic(target, path, content);
    if (packageContent) await writeAtomic(target, 'package.json', packageContent);
    if (writes.some(([path]) => path === ownerPath))
      await writeAtomic(target, ownerPath, ownerContent);
  }
  return output;
}
async function main() {
  const { command, options } = parse(process.argv.slice(2));
  if (command === 'help' || command === '--help')
    return {
      commands: ['inspect', 'install', 'verify', 'self-check'],
      usage:
        'node forma.mjs install --target <app> --mode react|css|tokens --assets-dir public/forma [--fonts bundled|system] [--dry-run]',
      note: 'No repository or registry is needed for Forma. This script never runs a package manager.',
    };
  if (command === 'self-check') {
    const { manifest } = await bundle();
    return {
      ok: true,
      skill: manifest.name,
      snapshotId: manifest.snapshotId,
      files: Object.keys(manifest.files).length,
      packages: manifest.packages,
    };
  }
  const target = await realpath(resolve(options.target ?? process.cwd()));
  if (!(await lstat(target)).isDirectory())
    throw new Error('Target must be an existing directory.');
  if (target === skillRoot || target.startsWith(skillRoot + sep))
    throw new Error('Choose the application, not the skill directory, as target.');
  if (command === 'inspect') {
    const result = await inspect(target, options.manager);
    delete result.package;
    return result;
  }
  if (command === 'install') return install(target, options);
  if (command === 'verify') {
    const previous = await owned(target);
    if (!previous) throw new Error('No Forma installation manifest found in the target.');
    await verifyFiles(target, previous);
    return {
      ok: true,
      target,
      mode: previous.mode,
      snapshotId: previous.snapshotId,
      files: Object.keys(previous.files).length,
      dependency: previous.dependency,
      note: 'Run the project build and UI checks separately.',
    };
  }
  throw new Error(`Unknown command: ${command}`);
}
main()
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(`Forma: ${error.message}`);
    process.exitCode = 1;
  });
