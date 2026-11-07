// Validate the portable skill in independent applications outside this checkout.
import { cp, mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, extname, join, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';

const root = process.cwd();
const scratch = await realpath(await mkdtemp(join(tmpdir(), 'forma-consumer-test-')));
const skill = join(scratch, 'standalone skill');
const movedSkill = join(scratch, 'relocated skill 日本語');
const html = join(scratch, 'html');
const react = join(scratch, 'react');
const tokens = join(scratch, 'tokens');
const live = process.argv.includes('--github-packages');
let browser, server, packageServer;
let registry = 'https://npm.pkg.github.com';
const run = (args, cwd) => new Promise((resolveRun, rejectRun) => {
  const child = spawn(process.execPath, args, { cwd, env: { ...process.env, NODE_PATH: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.on('data', (data) => { stdout += data; });
  child.stderr.on('data', (data) => { stderr += data; });
  child.on('error', rejectRun);
  child.on('close', (code) => code === 0 ? resolveRun(stdout) : rejectRun(new Error(stderr || stdout || `Exit ${code}`)));
});
try {
  await cp(join(root, 'skills/forma-design-system'), skill, { recursive: true });
  await mkdir(html);
  await mkdir(react);
  await mkdir(tokens);
  if (!process.env.npm_execpath) throw new Error('Run with npm run test:skill:consumer.');
  if (live && !process.env.NODE_AUTH_TOKEN) throw new Error('GitHub Packages consumer validation requires NODE_AUTH_TOKEN.');
  const dependencies = {},
    devDependencies = {};
  for (const name of [
    'react',
    'react-dom',
    '@types/react',
    '@types/react-dom',
    'typescript',
    'esbuild',
  ]) {
    const pkg = JSON.parse(await readFile(join(root, 'node_modules', name, 'package.json')));
    (name.startsWith('react') ? dependencies : devDependencies)[name] = pkg.version;
  }
  await writeFile(
    join(react, 'package.json'),
    JSON.stringify(
      {
        name: 'isolated-forma-consumer',
        private: true,
        type: 'module',
        dependencies,
        devDependencies,
      },
      null,
      2,
    ),
  );
  await run(
    [
      join(skill, 'scripts/forma.mjs'),
      'install',
      '--target',
      react,
      '--mode',
      'react',
      '--assets-dir',
      'public/forma',
    ],
    scratch,
  );
  await run(
    [
      join(skill, 'scripts/forma.mjs'),
      'install',
      '--target',
      html,
      '--mode',
      'css',
      '--assets-dir',
      'assets/forma',
    ],
    scratch,
  );
  await cp(join(skill, 'assets/examples/html/index.html'), join(html, 'index.html'));
  await cp(join(skill, 'assets/examples/html/theme.mjs'), join(html, 'theme.mjs'));
  await cp(join(skill, 'assets/examples/react/FormaExample.tsx'), join(react, 'FormaExample.tsx'));
  await cp(
    join(skill, 'assets/examples/react/FormaBoundary.tsx'),
    join(react, 'FormaBoundary.tsx'),
  );
  await run([join(skill, 'scripts/forma.mjs'), 'install', '--target', tokens, '--mode', 'tokens', '--assets-dir', 'design/forma'], scratch);
  // Local validation serves freshly packed packages from an isolated registry, never from the skill.
  // Release validation instead consumes the actual GitHub Packages versions.
  if (!live) {
    const entries = new Map(), archives = new Map();
    for (const part of ['react', 'styles', 'tokens']) {
      const pkg = JSON.parse(await readFile(join(root, 'packages', part, 'package.json'), 'utf8'));
      const [{ filename }] = JSON.parse(await run([process.env.npm_execpath, 'pack', '--workspace', pkg.name, '--ignore-scripts', '--json', '--pack-destination', scratch], root));
      const bytes = await readFile(join(scratch, filename));
      entries.set(pkg.name, { pkg, filename, integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64') });
      archives.set('/tarballs/' + filename, bytes);
    }
    packageServer = createServer((request, response) => {
      const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (archives.has(path)) return response.writeHead(200, { 'Content-Type': 'application/octet-stream' }).end(archives.get(path));
      const item = entries.get(path.slice(1));
      if (!item) return response.writeHead(404, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'not found' }));
      const version = { ...item.pkg, dist: { integrity: item.integrity, tarball: registry + '/tarballs/' + item.filename } };
      response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify({ name: item.pkg.name, 'dist-tags': { latest: item.pkg.version }, versions: { [item.pkg.version]: version } }));
    });
    await new Promise((resolveListen) => packageServer.listen(0, '127.0.0.1', resolveListen));
    registry = `http://127.0.0.1:${packageServer.address().port}`;
  }
  await rename(skill, movedSkill);
  for (const [app, packageName] of [[react, 'react'], [html, 'styles'], [tokens, 'tokens']]) {
    await writeFile(join(app, '.npmrc'), 'registry=https://registry.npmjs.org/\n@kurotch-homelab:registry=' + registry + '\n' + (live ? '//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}\n' : ''));
    await run([process.env.npm_execpath, 'install', '--prefer-offline', '--ignore-scripts', '--no-audit', '--no-fund'], app);
    const pkg = JSON.parse(await readFile(join(app, 'package.json'), 'utf8'));
    const name = '@kurotch-homelab/forma-' + packageName;
    assert.match(pkg.dependencies[name], /^\d+\.\d+\.\d+$/);
    const lock = JSON.parse(await readFile(join(app, 'package-lock.json'), 'utf8'));
    assert.ok(lock.packages['node_modules/' + name].resolved.startsWith(registry + '/'));
    assert.match(lock.packages['node_modules/' + name].integrity, /^sha512-/);
    await run([join(movedSkill, 'scripts/forma.mjs'), 'sync', '--target', app], scratch);
    await run([join(movedSkill, 'scripts/forma.mjs'), 'verify', '--target', app], scratch);
  }
  assert.equal(JSON.parse(await readFile(join(tokens, 'design/forma/tokens.json'), 'utf8')).primitive.white, '#ffffff');
  await writeFile(
    join(react, 'main.tsx'),
    `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@kurotch-homelab/forma-react/styles.css';
import { FormaBoundary } from './FormaBoundary';
import FormaExample from './FormaExample';
createRoot(document.getElementById('root')!).render(<StrictMode><FormaBoundary><main><FormaExample /></main></FormaBoundary></StrictMode>);
`,
  );
  await writeFile(
    join(react, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      },
      include: ['*.tsx'],
    }),
  );
  await run(['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'], react);
  await writeFile(
    join(react, 'build.mjs'),
    `import { build } from 'esbuild';
import { cp, mkdir, writeFile } from 'node:fs/promises';
await mkdir('dist', {recursive:true});
await build({entryPoints:['main.tsx'],bundle:true,format:'esm',target:'es2022',outfile:'dist/app.js',minify:true,define:{'process.env.NODE_ENV':'"production"'}});
await cp('public/forma','dist/forma',{recursive:true});
await writeFile('dist/index.html','<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Forma standalone consumer</title><link rel="stylesheet" href="./app.css"><link rel="stylesheet" href="./forma/fonts/fonts.css"><style>body{margin:0}.forma{min-height:100vh}</style></head><body><div id="root"></div><script type="module" src="./app.js"></script></body></html>');
`,
  );
  await run(['build.mjs'], react);
  await run([join(movedSkill, 'scripts/forma.mjs'), 'verify', '--target', react], scratch);
  await run([join(movedSkill, 'scripts/forma.mjs'), 'verify', '--target', html], scratch);
  server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const isReact = url.pathname.startsWith('/react/');
      const served = isReact ? join(react, 'dist') : html;
      const part =
        decodeURIComponent(url.pathname.replace(/^\/(react|html)\//, '')) || 'index.html';
      const path = resolve(served, part);
      if (!path.startsWith(served + sep)) {
        response.writeHead(403).end();
        return;
      }
      const types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.ttf': 'font/ttf',
      };
      response
        .writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' })
        .end(await readFile(path));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'no-preference',
    colorScheme: 'light',
  });
  const blocked = [],
    errors = [];
  await context.route('**/*', (route) => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    blocked.push(route.request().url());
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}/react/`);
  await page.getByRole('button', { name: 'サイト刷新', exact: true }).click();
  await page.getByRole('dialog').getByLabel('案件名', { exact: true }).fill('');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('案件名を入力してください。');
  await page
    .getByRole('dialog')
    .getByLabel('案件名', { exact: true })
    .fill('スキルから導入した案件');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'スキルから導入した案件', exact: true }),
  ).toBeFocused();
  await page.getByRole('button', { name: '通知を閉じる' }).click();
  await expect(page.locator('.f-toast')).toHaveCount(0);
  await mkdir(join(root, 'output/playwright'), { recursive: true });
  const report = {
    registryInstall: live ? 'github-packages' : 'local-registry-fixture',
    formaPackages: ['react', 'styles', 'tokens'],
    externalRequests: blocked,
    errors,
    versions: dependencies,
    checks: [],
  };
  for (const app of ['react', 'html']) {
    await page.goto(`${origin}/${app}/`);
    if (app === 'html') {
      await page.getByRole('button', { name: '保存', exact: true }).click();
      await expect(page.getByRole('alert')).toHaveText('案件名を入力してください。');
      await page.getByLabel('案件名', { exact: true }).fill('ローカルのHTML案件');
      await page.getByRole('button', { name: '保存', exact: true }).click();
      await page.getByRole('button', { name: '保存内容を確認' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: '保存内容を確認' })).toBeFocused();
    }
    await page.evaluate(() => document.fonts.ready);
    const localFaces = await page.evaluate(() =>
      Array.from(document.fonts)
        .filter(
          (face) => face.family.replaceAll('"', '').replaceAll("'", '') === 'IBM Plex Sans JP',
        )
        .map((face) => ({ weight: Number(face.weight), status: face.status }))
        .sort((a, b) => a.weight - b.weight),
    );
    assert.deepEqual(
      localFaces,
      [400, 500, 600].map((weight) => ({ weight, status: 'loaded' })),
    );
    for (const weight of [400, 500, 600])
      assert.equal(
        await page.evaluate(
          (weight) => document.fonts.check(`${weight} 14px "IBM Plex Sans JP"`, '案件'),
          weight,
        ),
        true,
      );
    assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      await page.screenshot({ path: join(root, `output/playwright/skill-${app}-${width}.png`) });
    }
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await expect(page.locator('.forma')).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('.forma')).toHaveAttribute('data-motion', 'reduce');
    assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
    report.checks.push({
      app,
      localFonts: [400, 500, 600],
      widths: [390, 768, 1440],
      axe: 'light/dark passed',
      keyboardAndValidation: 'passed',
    });
  }
  assert.deepEqual(blocked, []);
  assert.deepEqual(errors, []);
  await writeFile(join(root, 'output/skill-validation.json'), JSON.stringify(report, null, 2));
  console.log(
    'Standalone consumer passed: registry package install and sync, TypeScript build, local fonts, real React/HTML workflows, axe, 390/768/1440px, dark/reduced motion; no external browser requests.',
  );
} finally {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  if (packageServer) await new Promise((resolve) => packageServer.close(resolve));
  const actual = await realpath(scratch),
    parent = await realpath(tmpdir());
  assert.ok(actual.startsWith(parent + sep) && basename(actual).startsWith('forma-consumer-test-'));
  await rm(actual, { recursive: true, force: true });
}
