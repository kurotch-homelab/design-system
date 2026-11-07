// Maintainer-only bundling. The resulting skill does not depend on this script or repository.
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { docs } from '../apps/catalog/src/content.js';
import { demo, semantics } from '../apps/catalog/src/patterns.js';
import { patternRules } from '../apps/catalog/src/guidance-content.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = join(root, 'skills/forma-design-system');
const hash = (data) => createHash('sha256').update(data).digest('hex');
const registry = 'https://npm.pkg.github.com';
for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md'])
  await copyFile(join(root, name), join(skill, name));
await mkdir(join(skill, 'references'), { recursive: true });
const packages = {};
for (const name of ['react', 'styles', 'tokens']) {
  const pkg = JSON.parse(await readFile(join(root, 'packages', name, 'package.json'), 'utf8'));
  if (pkg.publishConfig?.registry !== registry) throw new Error('Forma packages must use GitHub Packages.');
  packages[name] = { name: pkg.name, version: pkg.version, registry };
}

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
    '同梱のReact例と取得したパッケージの型定義を使い、利用アプリで操作を確認します。',
  );
await writeFile(
  join(skill, 'references/REACT.md'),
  '# Forma React API\n\nInstall the version recorded in bundle.json from GitHub Packages, then follow INTEGRATION.md. Authentication and a package-manager install are required; no source checkout is needed. Import `@kurotch-homelab/forma-react/styles.css` once and serve the bundled fonts. The package includes ES Modules, declarations and component sources; React is its only runtime peer dependency.\n\n' +
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
  if (name.endsWith('.tgz') || name.startsWith('assets/styles/')) throw new Error('Remove packaged code from the skill: ' + name);
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
  JSON.stringify({ registry, packages, files: Object.entries(files).sort(([a], [b]) => a.localeCompare(b, 'en')) }),
);
await writeFile(
  join(skill, 'bundle.json'),
  JSON.stringify(
    { schemaVersion: 2, registry, name: 'forma-design-system', snapshotId, packages, files },
    null,
    2,
  ) + '\n',
);
console.log(
  `GitHub Packages Forma skill: ${Object.keys(files).length} files, snapshot ${snapshotId.slice(0, 12)}`,
);
