import { button as b, badge, field, check, escapeHTML as e, selectRows } from './utils.js';
const names = [
  ['コーポレートサイト刷新', 'Corporate website renewal'],
  ['顧客管理システム', 'Customer management system'],
  ['ブランドガイドライン', 'Brand guidelines'],
  ['採用サイト制作', 'Recruitment website'],
  ['業務プロセス改善', 'Process improvement'],
  ['ECサイト構築', 'E-commerce platform'],
  ['サービス紹介資料', 'Service presentation'],
  ['社内ポータル整備', 'Internal portal'],
];
const clients = [
  ['株式会社 北山', 'Kitayama Inc.'],
  ['三原商事', 'Mihara Trading'],
  ['Studio Noma', 'Studio Noma'],
  ['株式会社 東雲', 'Shinonome Inc.'],
];
export function createProjectState() {
  return {
    rows: names.map((name, i) => ({
      id: `PRJ-00${i + 1}`,
      name,
      client: clients[i % 4],
      owner: ['AT', 'KS', 'RS', 'YT'][i % 4],
      status: ['active', 'review', 'active', 'draft', 'done', 'active', 'review', 'draft'][i],
      amount: [2400000, 4800000, 1200000, 1800000, 3200000, 3600000, 600000, 2200000][i],
      date: [
        '2026-11-20',
        '2026-11-25',
        '2026-12-02',
        '2026-12-10',
        '2026-11-08',
        '2026-12-15',
        '2026-11-30',
        '2027-01-12',
      ][i],
    })),
    query: '',
    filter: 'all',
    page: 1,
    sort: null,
    selected: new Set(),
    hidden: new Set(),
    editing: null,
  };
}
const statusLabels = (t) => ({
  active: t('進行中', 'In progress'),
  review: t('確認待ち', 'In review'),
  draft: t('準備中', 'Planned'),
  done: t('完了', 'Completed'),
});
export function table(state, t, locale, compact = false) {
  const statuses = statusLabels(t),
    n = locale === 'ja' ? 0 : 1;
  const columns = [
    ['name', t('案件名', 'Project')],
    ['client', t('クライアント', 'Client')],
    ['status', t('ステータス', 'Status')],
    ['owner', t('担当者', 'Owner')],
    ['amount', t('金額', 'Value')],
    ['date', t('納期', 'Due date')],
  ].filter(([key]) => !compact || ['name', 'status', 'owner', 'date'].includes(key));
  const data = state.rows
    .filter((r) => state.filter === 'all' || r.status === state.filter)
    .map((r) => ({ ...r, name: r.name[n], client: r.client[n], statusText: statuses[r.status] }));
  const filtered = selectRows(data, state.query, state.sort, locale),
    size = compact ? 4 : 5,
    pages = Math.max(1, Math.ceil(filtered.length / size));
  state.page = Math.min(state.page, pages);
  const rows = filtered.slice((state.page - 1) * size, state.page * size),
    shown = columns.filter(([key]) => !state.hidden.has(key));
  const value = (row, key) =>
    key === 'name'
      ? `<div class="project-cell"><strong>${e(row.name)}</strong><small>${row.id}</small></div>`
      : key === 'status'
        ? badge(
            statuses[row.status],
            { active: 'info', review: 'warning', draft: 'neutral', done: 'success' }[row.status],
          )
        : key === 'owner'
          ? `<span class="person"><span class="f-avatar" aria-hidden="true" style="width:26px;height:26px">${row.owner}</span>${row.owner}</span>`
          : key === 'amount'
            ? e(
                new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency: 'JPY',
                  maximumFractionDigits: 0,
                }).format(row.amount),
              )
            : e(row[key]);
  return `<div class="f-data-table"><div class="f-table-toolbar"><div class="f-field f-search"><label for="project-search">${t('案件を検索', 'Search projects')}</label><input type="search" class="f-input" id="project-search" value="${e(state.query)}" placeholder="${t('案件名・クライアントで検索…', 'Search projects or clients…')}"></div><div class="f-table-actions"><select class="f-input" id="status-filter" aria-label="${t('ステータスで絞り込み', 'Filter by status')}"><option value="all">${t('すべての状態', 'All statuses')}</option>${Object.entries(
    statuses,
  )
    .map(
      ([key, label]) =>
        `<option value="${key}" ${state.filter === key ? 'selected' : ''}>${label}</option>`,
    )
    .join(
      '',
    )}</select>${b(t('表示列', 'Columns'), '', 'secondary', 'popovertarget="columns-popover"')}<div class="f-popover f-popover-content native-popover" id="columns-popover" popover><div class="stack">${columns.map(([key, label]) => check(label, `data-column="${key}" ${state.hidden.has(key) ? '' : 'checked'} ${shown.length === 1 && !state.hidden.has(key) ? 'disabled' : ''}`)).join('')}</div></div></div></div><div class="f-selection" ${state.selected.size ? '' : 'hidden'}><span role="status">${state.selected.size} ${t('件を選択中', 'selected')}</span>${b(t('解除', 'Clear'), 'clear-selection', 'ghost')}</div><div class="f-table-scroll" tabindex="0" role="region" aria-label="${t('案件一覧（横にスクロールできます）', 'Project list (scroll horizontally)')}"><table><caption class="f-sr-only">${t('案件一覧', 'Project list')}</caption><thead><tr><th scope="col">${check('', `aria-label="${t('このページをすべて選択', 'Select all on this page')}" id="select-all" ${rows.length && rows.every((r) => state.selected.has(r.id)) ? 'checked' : ''} ${rows.length ? '' : 'disabled'}`)}</th>${shown.map(([key, label]) => `<th scope="col" class="${key === 'amount' ? 'f-number-cell' : ''}" ${state.sort?.key === key ? `aria-sort="${state.sort.direction === 1 ? 'ascending' : 'descending'}"` : ''}><button type="button" class="f-sort" data-action="sort" data-key="${key}">${label} <span aria-hidden="true">${state.sort?.key === key ? (state.sort.direction === 1 ? '↑' : '↓') : '↕'}</span><span class="f-sr-only"> ${t('並べ替え', 'Sort')}</span></button></th>`).join('')}<th scope="col"><span class="f-sr-only">${t('操作', 'Actions')}</span></th></tr></thead><tbody>${rows.map((row) => `<tr ${state.selected.has(row.id) ? 'data-selected="true"' : ''}><td>${check('', `aria-label="${t('行を選択', 'Select row')} ${row.id}" data-row="${row.id}" ${state.selected.has(row.id) ? 'checked' : ''}`)}</td>${shown.map(([key]) => `<td class="${key === 'amount' ? 'f-number-cell' : ''}">${value(row, key)}</td>`).join('')}<td>${b(t('詳細', 'Details'), 'edit-project', 'ghost', `data-id="${row.id}"`)}</td></tr>`).join('')}</tbody></table>${rows.length ? '' : `<div class="f-empty">${t('該当する項目がありません', 'No matching items')}</div>`}</div><div class="f-table-footer"><span>${filtered.length ? `${(state.page - 1) * size + 1}–${Math.min(state.page * size, filtered.length)}` : '0'} / ${filtered.length}</span><nav class="f-pagination" aria-label="${t('ページ', 'Page')}">${b(t('前へ', 'Previous'), 'table-prev', 'secondary', state.page === 1 ? 'disabled' : '')}<span aria-live="polite">${state.page} / ${pages}</span>${b(t('次へ', 'Next'), 'table-next', 'secondary', state.page === pages ? 'disabled' : '')}</nav></div></div>`;
}
export function projects(state, t, locale, compact = false) {
  return `<div class="projects ${compact ? 'compact-projects' : ''}">${
    compact
      ? ''
      : `<div class="eyebrow">WORKSPACE / PROJECTS</div><div class="page-heading"><div><h1>${t('案件管理', 'Projects')}</h1><p>${t('チームの進捗と、次に取り組むことを。', 'A shared view of progress and what comes next.')}</p></div>${b('＋ ' + t('新規案件', 'New project'), 'new-project', 'primary')}</div><div class="metrics">${[
          [t('すべての案件', 'Total projects'), state.rows.length],
          [t('進行中', 'In progress'), state.rows.filter((r) => r.status === 'active').length],
          [t('確認待ち', 'In review'), state.rows.filter((r) => r.status === 'review').length],
          [
            t('案件総額', 'Total value'),
            new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: 'JPY',
              notation: 'compact',
            }).format(state.rows.reduce((sum, r) => sum + r.amount, 0)),
          ],
        ]
          .map(
            ([label, value]) =>
              `<div><span>${label}</span><strong>${value}</strong><small>${t('現在の管理対象', 'In this workspace')}</small></div>`,
          )
          .join('')}</div>`
  }<div id="project-table">${table(state, t, locale, compact)}</div></div>`;
}
export function editor(row, t, locale) {
  const n = locale === 'ja' ? 0 : 1;
  return `<dialog class="f-drawer" id="project-editor" aria-labelledby="editor-title"><header class="f-between"><h2 id="editor-title">${t('案件を編集', 'Edit project')}</h2>${b('×', 'close-dialog', 'ghost', `aria-label="${t('閉じる', 'Close')}"`)}</header><form id="project-form" class="f-dialog-content stack" novalidate>${field('project-name', t('案件名', 'Project name'), 'text', `required value="${e(row.name[n])}" aria-describedby="project-error"`)}${field('project-client', t('クライアント', 'Client'), 'text', `required value="${e(row.client[n])}" aria-describedby="project-error"`)}<div class="f-field"><label for="project-status">${t('ステータス', 'Status')}</label><select class="f-input" id="project-status">${Object.entries(
    statusLabels(t),
  )
    .map(
      ([key, label]) =>
        `<option value="${key}" ${row.status === key ? 'selected' : ''}>${label}</option>`,
    )
    .join(
      '',
    )}</select></div>${field('project-amount', t('金額（円）', 'Value (JPY)'), 'number', `min="0" required value="${row.amount}"`)}${field('project-date', t('納期', 'Due date'), 'date', `required value="${row.date}"`)}<span class="f-error" id="project-error" role="alert"></span><button class="f-button f-button--primary" type="submit">${t('変更を保存', 'Save changes')}</button>${b(t('キャンセル', 'Cancel'), 'close-dialog')}</form></dialog>`;
}
export function business(t) {
  return `<div class="business-site"><header class="business-nav"><a href="#patterns/company" class="business-logo">▤ stride<span> / ${t('業務管理', 'Work management')}</span></a><button class="cta-text plain-button" data-action="features">${t('サービス', 'Service')}</button></header><section class="business-hero"><div><div class="eyebrow">A CLEARER WAY TO WORK</div><h1>${t('仕事の流れを、', 'Bring clarity')}<br>${t('ひとつに。', 'to everyday work.')}</h1><p>${t('案件、チーム、日々の進捗。必要な情報をまとめ、目の前の仕事に集中できる業務管理サービス。', 'Projects, people, and progress. Keep essential information together so your team can focus on the work ahead.')}</p>${b(t('できることを見る', 'Explore the service') + ' →', 'features', 'primary')}<small>${t('Formaを使った、架空のサービスサイトです。', 'A fictional service website built with Forma.')}</small></div><div class="business-preview"><div class="mini-nav"><span class="mini-mark">s.</span>stride<span class="mini-dot"></span></div><div class="mini-body"><div class="f-between"><strong>${t('今週の進捗', 'This week')}</strong>${badge(t('順調', 'On track'), 'success')}</div><div class="mini-total">24<span>/ 32 ${t('タスク完了', 'tasks completed')}</span></div><label for="business-progress">${t('完了率', 'Completion')}</label><progress id="business-progress" max="100" value="75">75%</progress><hr class="f-divider">${[t('要件の確認', 'Review requirements'), t('デザインの共有', 'Share design'), t('リリースの準備', 'Prepare release')].map((x, i) => `<div class="mini-task"><span class="${i < 2 ? 'done' : ''}">${i < 2 ? '✓' : ''}</span>${x}</div>`).join('')}</div></div></section><section class="business-features" id="company-features"><div class="eyebrow">BUILT FOR YOUR EVERYDAY</div><h2>${t('チームが迷わず動ける仕組み。', 'Give your team a clear way forward.')}</h2><div class="feature-grid">${[
    [
      t('状況が見える', 'See the whole picture'),
      t(
        '案件ごとの進捗と担当者を一覧で把握。確認のためのやり取りを減らします。',
        'See project status and ownership together. Spend less time asking for updates.',
      ),
    ],
    [
      t('情報がつながる', 'Keep context together'),
      t(
        '必要な資料と履歴を案件に集約。担当が変わっても、仕事が止まりません。',
        'Keep documents and history with the project, making handoffs straightforward.',
      ),
    ],
    [
      t('次が分かる', 'Know what comes next'),
      t(
        '期限と優先度を明確に。今日取り組む仕事を、チームで共有できます。',
        'Make deadlines and priorities explicit so everyone knows where to focus.',
      ),
    ],
  ]
    .map(
      ([title, desc], i) =>
        `<article><span class="feature-index">0${i + 1}</span><h3>${title}</h3><p>${desc}</p></article>`,
    )
    .join(
      '',
    )}</div></section><section class="business-steps"><h2>${t('小さく始めて、チームへ広げる。', 'Start small. Bring your team along.')}</h2><ol>${[t('案件を登録する', 'Create a project'), t('担当と期限を決める', 'Assign owners and deadlines'), t('進捗を共有する', 'Share your progress')].map((x) => `<li>${x}</li>`).join('')}</ol></section><section class="business-faq"><h2>${t('よくある質問', 'Frequently asked questions')}</h2><div class="f-accordion"><details><summary>${t('小規模なチームでも使えますか？', 'Does it work for a small team?')}<span>+</span></summary><div>${t('はい。少人数のチームから使い始められる設計です。', 'Yes. The concept is designed to work for small teams.')}</div></details><details><summary>${t('このサイトから申し込めますか？', 'Can I sign up here?')}<span>+</span></summary><div>${t('このページはデザインガイドラインの画面例です。申込受付は行っていません。', 'This is a design guideline example. It does not accept registrations.')}</div></details></div></section><footer>stride <span>${t('Formaによる画面パターン', 'A Forma interface pattern')} ↗</span></footer></div>`;
}
