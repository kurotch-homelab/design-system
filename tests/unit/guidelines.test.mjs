import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { escapeHTML, validRange, validFile, selectRows } from '../../apps/catalog/src/utils.js';
import { docs } from '../../apps/catalog/src/content.js';
import { demo, semantics } from '../../apps/catalog/src/patterns.js';
import { decisions, patternRules, states } from '../../apps/catalog/src/guidance-content.js';

test('guidance covers every pattern and every recommendation links to an existing pattern', () => {
  const names = new Set(docs.map((d) => d.name));
  for (const name of names) {
    assert.ok(patternRules[name], name);
    for (const key of ['use', 'avoid', 'why']) assert.equal(patternRules[name][key].length, 2);
  }
  assert.equal(decisions.length, 12);
  assert.equal(states.length, 9);
  for (const d of decisions)
    for (const name of [d.pick, ...d.also]) assert.ok(names.has(name), name);
});
test('light and dark interaction tokens meet text and control contrast targets', async () => {
  const tokens = JSON.parse(await readFile('packages/tokens/dist/tokens.json', 'utf8'));
  const resolve = (value) =>
    value.startsWith('{primitive.') ? tokens.primitive[value.slice(11, -1)] : value;
  const luminance = (hex) => {
    const c = hex
      .slice(1)
      .match(/../g)
      .map((n) => parseInt(n, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => {
    const x = luminance(resolve(a)),
      y = luminance(resolve(b));
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
  for (const [name, theme] of Object.entries(tokens.semantic)) {
    for (const key of ['brand', 'brandHover', 'brandPressed'])
      assert.ok(ratio(theme.onBrand, theme[key]) >= 4.5, `${name}/${key}`);
    assert.ok(ratio(theme.controlBorder, theme.surface) >= 3, `${name}/controlBorder`);
    assert.ok(ratio(theme.focus, theme.surface) >= 3, `${name}/focus`);
  }
});
test('consumer packages and catalog declare no external runtime dependencies', async () => {
  for (const path of [
    'packages/tokens/package.json',
    'packages/styles/package.json',
    'apps/catalog/package.json',
  ]) {
    const pkg = JSON.parse(await readFile(path, 'utf8'));
    assert.deepEqual(pkg.dependencies ?? {}, {});
    assert.deepEqual(pkg.peerDependencies ?? {}, {});
  }
});
test('all 35 patterns provide standard HTML and semantic guidance', () => {
  assert.equal(docs.length, 35);
  assert.equal(new Set(docs.map((d) => d.name)).size, 35);
  for (const doc of docs) {
    assert.ok(semantics[doc.name]);
    assert.ok(demo(doc.name, (ja, en) => en).includes('<'));
    assert.doesNotMatch(
      demo(doc.name, (ja, en) => en),
      /className=|<FormaProvider|onClick=|<Button/,
    );
  }
});
test('validates date ranges without time-zone conversion', () => {
  assert.equal(validRange('2026-11-20', '2026-11-10'), false);
  assert.equal(validRange('2026-11-20', '2026-11-20'), true);
  assert.equal(validRange('2026-12-31', '2027-01-01'), true);
});
test('validates file type and size', () => {
  assert.equal(validFile({ name: 'report.PDF', type: 'application/pdf', size: 5 }), true);
  assert.equal(validFile({ name: 'report.txt', type: 'text/plain', size: 5 }), false);
  assert.equal(
    validFile({ name: 'report.pdf', type: 'application/pdf', size: 6 * 1024 * 1024 }),
    false,
  );
});
test('sorts numeric values, filters and does not mutate caller records', () => {
  const rows = [
    { name: 'Alpha', amount: 20 },
    { name: 'Beta', amount: 3 },
  ];
  assert.deepEqual(
    selectRows(rows, '', { key: 'amount', direction: 1 }, 'en').map((r) => r.amount),
    [3, 20],
  );
  assert.equal(selectRows(rows, 'BETA', null, 'en')[0].name, 'Beta');
  assert.equal(rows[0].amount, 20);
});
test('escapes user-provided HTML', () => {
  assert.equal(
    escapeHTML('<img src="x" onerror=alert(1)>'),
    '&lt;img src=&quot;x&quot; onerror=alert(1)&gt;',
  );
});
