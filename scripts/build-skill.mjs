// Maintainer-only bundling. The resulting skill does not depend on this script or repository.
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { docs } from '../apps/catalog/src/content.js';
import { demo, semantics } from '../apps/catalog/src/patterns.js';
import { patternRules } from '../apps/catalog/src/guidance-content.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = join(root, 'skills/forma-design-system');
const hash = (data) => createHash('sha256').update(data).digest('hex');
const previous = await readFile(join(skill, 'bundle.json'), 'utf8')
  .then(JSON.parse)
  .catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md'])
  await copyFile(join(root, name), join(skill, name));
for (const directory of ['assets/packages', 'assets/styles', 'references'])
  await mkdir(join(skill, directory), { recursive: true });
const packages = {};
for (const name of ['react', 'styles', 'tokens']) {
  const pkg = JSON.parse(await readFile(join(root, `packages/${name}/package.json`), 'utf8'));
  if (!process.env.npm_execpath)
    throw new Error('Run via npm run build:skill so the npm CLI can be located without a shell.');
  const result = spawnSync(
    process.execPath,
    [
      process.env.npm_execpath,
      'pack',
      '--workspace',
      pkg.name,
      '--pack-destination',
      join(skill, 'assets/packages'),
      '--json',
    ],
    { cwd: root, encoding: 'utf8' },
  );
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  const [{ filename }] = JSON.parse(result.stdout);
  packages[name] = { name: pkg.name, version: pkg.version, path: `assets/packages/${filename}` };
}
const currentArchives = new Set(Object.values(packages).map((pkg) => pkg.path));
for (const pkg of Object.values(previous?.packages ?? {})) {
  if (currentArchives.has(pkg.path)) continue;
  if (!/^assets\/packages\/kurotch-homelab-forma-(react|styles|tokens)-[0-9A-Za-z.+-]+\.tgz$/.test(pkg.path))
    throw new Error('Unexpected previous package path.');
  const stale = resolve(skill, pkg.path);
  if (dirname(stale) !== resolve(skill, 'assets/packages'))
    throw new Error('Previous package must remain inside assets/packages.');
  const data = await readFile(stale).catch((error) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (data && hash(data) !== previous.files[pkg.path])
    throw new Error(`Preserve modified package before rebuilding: ${pkg.path}`);
  if (data) await rm(stale);
}
for (const [source, destination] of [
  ['packages/styles/dist/forma.css', 'forma.css'],
  ['packages/tokens/dist/tokens.css', 'tokens.css'],
  ['packages/tokens/dist/tokens.json', 'tokens.json'],
])
  await copyFile(join(root, source), join(skill, 'assets/styles', destination));

let design = await readFile(join(root, 'GUIDELINES.md'), 'utf8');
design = design
  .replaceAll('`packages/react/README.md`', '同梱のREACT.md')
  .replace(
    '利用先はREADMEの読み込み例を指定するか、同じ書体をセルフホストする。',
    'このスキルでは同梱のfonts.cssと書体をセルフホストする。',
  );
await writeFile(
  join(skill, 'references/DESIGN.md'),
  '# Bundled Forma design reference\n\nThis is a complete local design reference. Catalog mentions describe the original examples; the catalog and source repository are not prerequisites. Use the bundled HTML.md and React examples instead.\n\n' +
    design,
);
const reactDoc = await readFile(join(root, 'packages/react/README.md'), 'utf8');
const body = reactDoc
  .slice(reactDoc.indexOf('## Provider'), reactDoc.indexOf('## 検証と参照'))
  .replace(
    'ローカルの`/react/index.html`では各部品を操作し、使用例をコピーできます。',
    '同梱のReact例と型定義を使い、利用アプリで操作を確認します。',
  );
await writeFile(
  join(skill, 'references/REACT.md'),
  '# Forma React API\n\nInstall the bundled package with the skill installer, then follow INTEGRATION.md. No build from the source repository or registry download of Forma is required. Import `@kurotch-homelab/forma-react/styles.css` once and serve the bundled fonts. The package includes ES Modules, declarations and component sources; React is its only runtime peer dependency.\n\n' +
    body.trimEnd() + '\n',
);
let html =
  '# Forma HTML patterns\n\nThese are structural examples, not a standalone JavaScript component library. Implement the listed behaviors in the host framework. Replace sample IDs with unique IDs, labels with product text, and placeholder destinations with real routes. No catalog script is included or required. For a complete executable form and native dialog, use the bundled HTML example.\n\n';
for (const doc of docs) {
  const rule = patternRules[doc.name];
  html += `## ${doc.name}\n\n${doc.description[0]} / ${doc.description[1]}\n\n- Use: ${rule.use[0]} / ${rule.use[1]}\n- Avoid: ${rule.avoid[0]} / ${rule.avoid[1]}\n- Why: ${rule.why[0]} / ${rule.why[1]}\n- Structure: ${semantics[doc.name]}\n\n`;
  if (doc.name.startsWith('Date'))
    html +=
      'Native date values are YYYY-MM-DD; display follows browser/OS. Validate ranges explicitly.\n\n';
  if (doc.name === 'ComboBox')
    html += 'Native datalist permits free input. Use Select for a fixed list.\n\n';
  const markup = demo(doc.name, (ja) => ja)
    .replaceAll(/ data-(?:action|index)="[^"]*"/g, '')
    .replaceAll(/href="#[^"]*"/g, 'href="#"')
    .replaceAll('><', '>\n<');
  html += '```html\n' + markup + '\n```\n\n';
}
await writeFile(join(skill, 'references/HTML.md'), html.trimEnd() + '\n');
async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error('Skill distribution must not contain symlinks.');
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(path)));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}
const files = {};
for (const path of await walk(skill)) {
  const name = relative(skill, path).split(sep).join('/');
  if (name !== 'bundle.json') files[name] = hash(await readFile(path));
}
for (const required of [
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
  'assets/fonts/IBMPlexSansJP-Regular.ttf',
  'assets/fonts/IBMPlexSansJP-Medium.ttf',
  'assets/fonts/IBMPlexSansJP-SemiBold.ttf',
  'assets/fonts/OFL.txt',
])
  if (!files[required]) throw new Error(`Missing self-contained font asset: ${required}`);
const snapshotId = hash(
  JSON.stringify(Object.entries(files).sort(([a], [b]) => a.localeCompare(b, 'en'))),
);
await writeFile(
  join(skill, 'bundle.json'),
  JSON.stringify(
    { schemaVersion: 1, name: 'forma-design-system', snapshotId, packages, files },
    null,
    2,
  ) + '\n',
);
console.log(
  `Self-contained Forma skill: ${Object.keys(files).length} files, snapshot ${snapshotId.slice(0, 12)}`,
);
