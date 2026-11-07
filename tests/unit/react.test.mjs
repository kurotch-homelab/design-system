import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import * as Forma from '@kurotch-homelab/forma-react';
import { docs } from '../../apps/catalog/src/content.js';

test('React package exports all 35 patterns and has only the React peer dependency', async () => {
  for (const { name } of docs) assert.ok(Forma[name], name);
  const pkg = JSON.parse(await readFile('packages/react/package.json', 'utf8'));
  assert.equal(pkg.name, '@kurotch-homelab/forma-react');
  assert.deepEqual(pkg.dependencies ?? {}, {});
  assert.deepEqual(Object.keys(pkg.peerDependencies), ['react']);
  const shared = await readFile('packages/styles/dist/forma.css', 'utf8');
  assert.ok((await readFile('packages/react/dist/forma.css', 'utf8')).startsWith(shared));
});
test('React components render on the server without browser globals or duplicate field IDs', () => {
  const html = renderToString(
    h(
      Forma.FormaProvider,
      { locale: 'en', theme: 'dark' },
      h(Forma.TextField, { label: 'Name', error: 'Required' }),
      h(Forma.TextField, { label: 'Name' }),
      h(Forma.DateRangePicker, {
        label: 'Dates',
        defaultValue: { start: '2026-11-20', end: '2026-11-10' },
      }),
      h(Forma.Dialog, { title: 'Details', trigger: 'Open' }, 'Content'),
      h(Forma.DataTable, {
        label: 'Projects',
        rows: [
          { id: '1', amount: 30 },
          { id: '2', amount: 3 },
        ],
        getRowId: (row) => row.id,
        columns: [{ key: 'amount', header: 'Amount', accessor: (row) => row.amount }],
        defaultSort: { key: 'amount', direction: 'ascending' },
      }),
    ),
  );
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /End date must be on or after/);
  assert.match(html, /aria-invalid="true"/);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(html.indexOf('<td>3</td>') < html.indexOf('<td>30</td>'));
});
