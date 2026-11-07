import {
  selectionPage,
  statesPage,
  examplesPage,
  componentGuidance,
  recommendation,
  stateMatrix,
} from './guidance.js';
import { docs, groups } from './content.js';
import { motionPage, motionPreferenceLabel, dismissToast } from './motion.js';
import { demo, semantics } from './patterns.js';
import { createProjectState, projects, table, editor, business } from './projects.js';
import { button as b, badge, escapeHTML as e, validRange, validFile } from './utils.js';

const stored = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};
let locale = stored('forma-locale', 'ja') === 'en' ? 'en' : 'ja';
let theme = stored('forma-theme', 'system');
if (!['light', 'dark', 'system'].includes(theme)) theme = 'system';
let density = 'comfortable',
  projectState = createProjectState(),
  demoPage = 1,
  dialogTrigger = null;
const t = (ja, en) => (locale === 'ja' ? ja : en);
const route = () => location.hash.slice(1) || 'intro';
const root = document.getElementById('root');
const media = matchMedia('(prefers-color-scheme: dark)');
const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
let motionPreference = stored('forma-motion', 'system') === 'reduce' ? 'reduce' : 'system';
let toastReturnFocus = null;
function applyMotion() {
  const reduced = motionMedia.matches || motionPreference === 'reduce';
  document.querySelector('.forma')?.setAttribute('data-motion', reduced ? 'reduce' : 'full');
  const select = document.getElementById('motion-preference');
  if (select) select.value = motionPreference;
  const status = document.getElementById('motion-preference-status');
  if (status) status.textContent = motionPreferenceLabel(t, reduced, motionMedia.matches);
}
motionMedia.addEventListener('change', applyMotion);
const icon = (name) => ({ book: '▤', layers: '▱', box: '□', app: '▦', site: '▥' })[name];

function applyTheme() {
  const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.lang = locale;
  document.querySelector('.forma')?.setAttribute('data-theme', resolved);
  document.querySelector('.forma')?.setAttribute('data-density', density);
  document
    .querySelectorAll('[data-theme-choice]')
    .forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.themeChoice === theme)));
  try {
    localStorage.setItem('forma-locale', locale);
    localStorage.setItem('forma-theme', theme);
  } catch {}
}
media.addEventListener('change', applyTheme);
const codeBlock = (source) =>
  `<div class="code-block"><div><span>⌘ HTML / CSS</span><button type="button" data-action="copy">${t('コピー', 'Copy')}</button></div><pre tabindex="0" role="region" aria-label="${t('HTMLの構造例', 'HTML structure example')}"><code>${e(source.replaceAll('><', '>\n<'))}</code></pre><span class="copy-status f-sr-only" role="status"></span></div>`;
function render() {
  const current = route(),
    doc = docs.find((d) => current === `components/${d.name}`);
  const guideTitles = {
    'guides/selection': t('パターンの選び方', 'Choosing a pattern'),
    'guides/states': t('操作状態', 'Interaction states'),
    'guides/examples': t('良い例・避ける例', 'Examples & rationale'),
    'guides/motion': t('動きと遷移', 'Motion & transitions'),
  };
  const section =
    guideTitles[current] ??
    (current.startsWith('components')
      ? t('UIパターン', 'UI patterns')
      : current.startsWith('patterns')
        ? t('画面パターン', 'Patterns')
        : current === 'foundations'
          ? t('デザイン基礎', 'Foundations')
          : t('はじめに', 'Introduction'));
  const nav = (path, label, symbol, end = '') =>
    `<a href="#${path}" class="nav-item ${current === path ? 'active' : ''}" ${current === path ? 'aria-current="page"' : ''}><span aria-hidden="true">${symbol}</span><span>${label}</span>${end ? `<small>${end}</small>` : ''}</a>`;
  root.innerHTML = `<div class="forma"><div class="app-shell"><a class="skip-link" href="#main-content" data-action="skip">${t('本文へ移動', 'Skip to content')}</a><aside class="sidebar" aria-label="${t('メインナビゲーション', 'Main navigation')}"><a class="brand" href="#intro"><span class="forma-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>forma<span class="brand-dot">.</span></span>${badge('0.2.0')}</a><div class="sidebar-subtitle">DESIGN GUIDELINES</div><label class="nav-search"><span aria-hidden="true">⌕</span><input id="nav-search" aria-label="${t('UIパターンを検索', 'Search UI patterns')}" placeholder="${t('UIパターンを検索…', 'Search UI patterns…')}"></label><nav><div class="nav-label">${t('ガイド', 'GUIDES')}</div>${nav('intro', t('はじめに', 'Introduction'), icon('book'))}${nav('foundations', t('デザイン基礎', 'Foundations'), icon('layers'))}${nav('guides/selection', t('パターンの選び方', 'Choosing a pattern'), '↳')}${nav('guides/states', t('操作状態', 'Interaction states'), '◉')}${nav('guides/examples', t('良い例・避ける例', 'Examples & rationale'), '⇄')}${nav('guides/motion', t('動きと遷移', 'Motion & transitions'), '↔')}${nav('components', t('UIパターン', 'UI patterns'), icon('box'), '35')}<div class="nav-label">${t('画面パターン', 'PATTERNS')}</div>${nav('patterns/projects', t('業務アプリ', 'Workspace'), icon('app'))}${nav('patterns/company', t('企業サイト', 'Company website'), icon('site'))}<a href="/react/index.html" class="nav-item"><span aria-hidden="true">↗</span><span>${t('Reactコンポーネント', 'React components')}</span><small>35</small></a><div class="nav-label component-label">${t('UIパターン一覧', 'PATTERN LIBRARY')}</div><div class="component-nav">${docs.map((d) => `<a href="#components/${d.name}" data-search="${e((d.name + ' ' + d.description[locale === 'ja' ? 0 : 1]).toLowerCase())}" class="${doc?.name === d.name ? 'active' : ''}" ${doc?.name === d.name ? 'aria-current="page"' : ''}>${d.name}</a>`).join('')}<p class="no-result" hidden>${t('該当するパターンがありません', 'No matching patterns')}</p></div></nav><div class="sidebar-footer"><span class="release-dot"></span>${t('フレームワーク非依存', 'Framework independent')}<span>v0.2</span></div></aside><button type="button" class="sidebar-scrim" hidden data-action="close-nav" aria-label="${t('メニューを閉じる', 'Close navigation')}"></button><div class="workspace"><header class="topbar"><div class="topbar-location">${b('☰', 'nav', 'ghost', `aria-label="${t('ナビゲーション', 'Navigation')}" aria-expanded="false"`)}<span class="topbar-home">Forma</span><span aria-hidden="true">›</span><span>${section}</span>${doc ? `<span aria-hidden="true">›</span><strong>${doc.name}</strong>` : ''}</div><div class="topbar-controls"><label class="density-control">${t('密度', 'Density')}<select id="density" aria-label="${t('表示密度', 'Display density')}"><option value="comfortable">${t('標準', 'Default')}</option><option value="compact" ${density === 'compact' ? 'selected' : ''}>${t('コンパクト', 'Compact')}</option></select></label><span class="control-divider"></span><button class="locale-toggle" data-action="locale" aria-label="${locale === 'ja' ? 'Switch to English' : '日本語に切り替え'}">${locale === 'ja' ? '日本語' : 'English'}</button><div class="theme-controls" aria-label="${t('テーマ', 'Theme')}">${['light', 'dark', 'system'].map((x, i) => `<button type="button" data-theme-choice="${x}" aria-pressed="${theme === x}" aria-label="${[t('ライトテーマ', 'Light theme'), t('ダークテーマ', 'Dark theme'), t('OS設定に合わせる', 'Use system theme')][i]}">${['☼', '☾', '▣'][i]}</button>`).join('')}</div></div></header><main id="main-content" class="main-content ${current === 'patterns/company' ? 'company-main' : ''}" tabindex="-1">${doc ? componentPage(doc) : current === 'intro' ? intro() : current === 'foundations' ? foundations() : current === 'guides/selection' ? selectionPage(t) : current === 'guides/states' ? statesPage(t) : current === 'guides/examples' ? examplesPage(t) : current === 'guides/motion' ? motionPage(t) : current === 'components' ? index() : current === 'patterns/projects' ? projects(projectState, t, locale) : current === 'patterns/company' ? business(t) : `<h1>${t('ページが見つかりません', 'Page not found')}</h1><a href="#intro">${t('はじめに戻る', 'Back to introduction')}</a>`}</main><footer class="site-footer"><span>Forma Design Guidelines</span><span>${t('明快さから、心地よさへ。', 'Clarity, made tangible.')}<span class="footer-version">v0.2.0</span></span></footer></div></div><div id="overlay-host"></div><div id="toast-host"></div></div>`;
  document.title = `${doc?.name ?? section} — Forma`;
  applyTheme();
  applyMotion();
}
function intro() {
  return `<div class="intro-overline"><span class="eyebrow">FORMA DESIGN GUIDELINES</span><span class="intro-status"><span></span>${t('日々の仕事のための、共通言語', 'A shared language for everyday work')}</span></div><section class="intro-hero"><div class="hero-copy"><h1>${t('使いやすさに、', 'Clarity in every detail.')}<br>${t('美しい秩序を。', 'Confidence in every action.')}</h1><p>${t('迷わず使える。自然に揃う。', 'Easy to use. Considered as a whole.')}<br>${t('ビジネスのための、端正なデザインガイドライン。', 'Precise design guidelines for modern business.')}</p><div class="hero-actions"><a class="cta-primary" href="#components">${t('UIパターンを見る', 'Explore UI patterns')} →</a><a class="cta-text" href="#foundations">${t('設計の考え方', 'Our foundations')} ↗</a></div></div><div class="hero-specimen"><div class="specimen-top"><span>01 / THE ESSENTIALS</span><span>↗</span></div><div class="type-specimen"><span>Aa</span><div><strong>${t('伝わる、文字。', 'Type with purpose.')}</strong><small>IBM Plex Sans JP / 400 · 500 · 600</small></div></div><div class="specimen-colors">${['#1b2330', '#586577', '#dce0e6', '#eef0f3', '#2459cf'].map((c) => `<span style="background:${c}"></span>`).join('')}</div><div class="specimen-bottom"><div class="specimen-spacing">${[8, 12, 20, 32].map((h) => `<i style="height:${h}px"></i>`).join('')}</div><code>4px grid · 6px radius</code></div></div></section><div class="principles-strip">${[
    [
      t('明快な階層', 'Clear hierarchy'),
      t('情報の優先度を、見た目で伝える。', 'Let visual order communicate priority.'),
    ],
    [
      t('一貫した操作', 'Consistent interaction'),
      t('一度覚えれば、次も迷わない。', 'Learn it once. Use it everywhere.'),
    ],
    [
      t('静かな存在感', 'Quiet confidence'),
      t('装飾よりも、仕事に集中できる余白。', 'Space to focus on the work that matters.'),
    ],
  ]
    .map(
      ([title, desc], i) =>
        `<div><span>0${i + 1}</span><div><h3>${title}</h3><p>${desc}</p></div></div>`,
    )
    .join(
      '',
    )}</div><section class="intro-showcase"><div class="section-heading"><div><span class="eyebrow">IN PRACTICE</span><h2>${t('ルールから、使える画面へ。', 'From principles to working interfaces.')}</h2></div><a href="#patterns/projects">${t('画面パターンを見る', 'Explore patterns')} ↗</a></div><div class="showcase-grid"><div class="showcase-main"><div class="showcase-header"><div><span class="sample-label">WORKSPACE</span><h3>${t('チームの仕事を、見通しよく。', 'A clearer view of your team’s work.')}</h3></div>${badge(t('操作できるサンプル', 'Interactive example'))}</div>${projects(projectState, t, locale, true)}</div><div class="showcase-side"><div class="side-example"><div class="sample-label">ACTIONS & STATES</div><h3>${t('ひとつひとつに、意図を。', 'Every element, intentional.')}</h3>${demo('Button', t)}<hr class="f-divider">${demo('Badge', t)}<hr class="f-divider">${demo('Switch', t)}</div><a href="#components" class="library-link"><span><strong>35</strong><span>${t('標準HTMLのUIパターン', 'Standard HTML UI patterns')}</span></span>↗</a></div></div></section><section class="guide-entry"><div><span class="eyebrow">Design with intent</span><h2>${t('迷ったときに、選べる指針。', 'Guidance for the decisions that matter.')}</h2><p>${t('目的からパターンを選び、状態と実例で判断を確かめる。', 'Choose by purpose, then check states and practical examples.')}</p></div><div><a href="#guides/selection">${t('選び方', 'Choosing a pattern')} →</a><a href="#guides/states">${t('操作状態', 'Interaction states')} →</a><a href="#guides/examples">${t('良い例・避ける例', 'Examples & rationale')} →</a><a href="#guides/motion">${t('動きと遷移', 'Motion & transitions')} →</a></div></section><section class="getting-started"><div><span class="eyebrow">USE YOUR OWN STACK</span><h2>${t('共通にするのは、デザイン。', 'Share the design. Choose your stack.')}</h2><p>${t('色・文字・余白・操作の指針と、単独で使えるCSS。', 'Color, type, spacing, interaction guidance, and standalone CSS.')}<br>${t('特定のフレームワークやJSライブラリは不要です。', 'No framework or JavaScript library is required.')}</p><a class="f-link" href="./GUIDELINES.md">${t('ガイドラインを読む', 'Read the guidelines')} ↗</a></div>${codeBlock(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@400;500;600&display=swap">\n<link rel="stylesheet" href="forma.css">\n\n<div class="forma" data-theme="light">\n  <button class="f-button f-button--primary">\n    ${t('保存', 'Save')}\n  </button>\n</div>`)}</section>`;
}
function componentPage(doc) {
  let note = doc.note[locale === 'ja' ? 0 : 1];
  if (doc.name === 'ComboBox')
    note = t(
      '標準のdatalistで候補を提示します。自由入力を許容し、候補UIの見た目・操作はブラウザに委ねます。',
      'A native datalist offers suggestions and permits free text. Suggestion appearance and interaction belong to the browser.',
    );
  if (doc.name.startsWith('Date'))
    note = t(
      '標準のdate入力を使用します。値はYYYY-MM-DD形式、表示とカレンダーはブラウザ・OSに依存します。',
      'Use native date inputs. Values use YYYY-MM-DD; presentation and calendars depend on the browser and OS.',
    );
  const dynamic = [
    'Tabs',
    'Menu',
    'Dialog',
    'Drawer',
    'Toast',
    'DataTable',
    'DateRangePicker',
    'FileUpload',
  ].includes(doc.name);
  let markup =
    doc.name === 'DataTable' ? projects(projectState, t, locale, true) : demo(doc.name, t);
  return `<div class="eyebrow">UI PATTERNS / ${groups[doc.group][1].toUpperCase()}</div><div class="component-heading"><div><h1>${doc.name}</h1><p>${doc.description[locale === 'ja' ? 0 : 1]}</p></div>${badge('HTML / CSS', 'info')}</div><div class="component-tabs"><span>${t('プレビューと使い方', 'Preview & usage')}</span><small>${t('フレームワーク非依存', 'Framework independent')}</small></div><section class="component-playground ${doc.name === 'DataTable' ? 'full-demo' : ''}" aria-label="${t('操作可能なプレビュー', 'Interactive preview')}"><div class="playground-label">LIVE PREVIEW</div><div class="playground-content">${markup}</div></section>${codeBlock(
    demo(doc.name, t)
      .replaceAll(/ data-action="[^"]*"/g, '')
      .replaceAll(/ data-index="[^"]*"/g, ''),
  )}<div class="doc-details"><section><h2>${t('使い方の指針', 'Usage guidance')}</h2><p>${note}</p><h3>${t('アクセシビリティと実装', 'Accessibility & implementation')}</h3><p>${dynamic ? t('このプレビューの操作コードはカタログ内の参考実装です。コピーできるHTMLは構造例です。状態更新、キーボード制御、通知とフォーカス管理は、利用する環境で実装・検証してください。', 'Interaction code is a catalog-only reference. The HTML is a structure example. Implement and test state, keyboard behavior, announcements, and focus management in your application.') : t('標準HTMLの意味と操作を保ち、ラベル・フォーカス表示・状態を明確にします。CSSは見た目のみを担当します。', 'Preserve native semantics and interaction, with clear labels, focus, and states. CSS is responsible only for presentation.')}</p></section><section><h2>${t('標準要素・属性', 'Standard elements & attributes')}</h2><div class="prop-list">${semantics[
    doc.name
  ]
    .split(' · ')
    .map((p) => `<code>${e(p)}</code>`)
    .join(
      '',
    )}</div><p class="muted">${t('使用技術の指定ではなく、実装時に守る構造と振る舞いのガイドです。', 'These are structural and behavioral guidelines, not a required technology stack.')}</p></section></div>${componentGuidance(doc.name, t)}`;
}
function index() {
  return `<div class="eyebrow">PATTERN LIBRARY</div><div class="page-heading"><div><h1>${t('UIパターン', 'UI patterns')}</h1><p>${t('35の構造例。共通のルールで、異なる仕事を支える。', '35 structural examples. Shared principles, diverse workflows.')}</p></div>${badge('35 PATTERNS')}</div>${groups
    .map(
      (g, i) =>
        `<section class="component-group"><div class="section-heading"><h2>${g[locale === 'ja' ? 0 : 1]}</h2></div><div class="component-grid">${docs
          .filter((d) => d.group === i)
          .map(
            (d) =>
              `<a href="#components/${d.name}"><div><strong>${d.name}</strong><span>↗</span></div><p>${d.description[locale === 'ja' ? 0 : 1]}</p></a>`,
          )
          .join('')}</div></section>`,
    )
    .join('')}`;
}
function foundations() {
  return `<div class="eyebrow">DESIGN FOUNDATIONS</div><div class="page-heading"><div><h1>${t('デザイン基礎', 'Foundations')}</h1><p>${t('見た目の統一から、体験の一貫性へ。', 'A coherent appearance. A consistent experience.')}</p></div><a class="cta-text" href="./GUIDELINES.md">${t('仕様を読む', 'Read the specification')} ↗</a></div><section class="foundation-section"><div class="foundation-label"><span>01</span><h2>${t('色', 'Color')}</h2><p>${t('役割で選ぶ。色で迷わせない。', 'Choose by role. Communicate with intention.')}</p></div><div><div class="swatch-grid">${['canvas', 'surface', 'subtle', 'text', 'muted', 'border', 'brand', 'success', 'warning', 'danger'].map((name) => `<div class="swatch"><span style="background:var(--f-${name})"></span><code>${name}</code></div>`).join('')}</div><p class="muted">${t('基本色 → 意味別 → 部品別の3層。CSS変数とJSONで、使用技術に関係なく共有できます。', 'Three layers: primitive → semantic → component. Share CSS variables and JSON across technology stacks.')}</p>${codeBlock('.forma[data-theme="light"] {\n  --f-brand: #2459cf;\n  --f-on-brand: #ffffff;\n  --f-brand-subtle: #edf2ff;\n}')}</div></section><section class="foundation-section"><div class="foundation-label"><span>02</span><h2>${t('文字', 'Typography')}</h2><p>IBM Plex Sans JP</p><p>${t('本文400・ラベル500・見出し600。字間は0を基本に、文字本来の間隔を活かします。', 'Body 400, labels 500, headings 600. Zero tracking preserves the typeface’s natural spacing.')}</p><a class="f-link" href="https://fonts.google.com/specimen/IBM+Plex+Sans+JP">Google Fonts ↗</a></div><div class="type-scale">${[
    [40, 'Display'],
    [28, 'Heading'],
    [20, 'Section'],
    [16, 'Website'],
    [14, 'Application'],
    [12, 'Caption'],
  ]
    .map(
      ([size, name]) =>
        `<div><span>${name}<small>${size}px</small></span><p style="font-size:${size}px">${t('必要な情報が、すぐ見つかる。', 'Find the information you need.')}</p></div>`,
    )
    .join(
      '',
    )}</div></section><section class="foundation-section"><div class="foundation-label"><span>03</span><h2>${t('余白と形', 'Space & shape')}</h2><p>${t('4pxのリズムで、画面を整える。', 'A 4px rhythm brings structure to the screen.')}</p></div><div><div class="spacing-scale">${[4, 8, 12, 16, 24, 32, 48, 64].map((n) => `<div><span>${n}</span><i style="width:${n * 3}px"></i></div>`).join('')}</div><div class="radius-samples">${[4, 6, 8].map((n) => `<div style="border-radius:${n}px">${n}px</div>`).join('')}</div><p class="muted">${t('基本操作は高さ40px。コンパクト表示は32px。影は浮いた面に限定します。', 'Controls are 40px high, or 32px in compact density. Reserve shadows for floating surfaces.')}</p></div></section><section class="foundation-section"><div class="foundation-label"><span>04</span><h2>${t('操作と配慮', 'Interaction & access')}</h2></div><div class="stack"><div class="f-alert f-tone-info"><strong>${t('誰もが使えることを、基本に。', 'Accessibility is a foundation.')}</strong><p>${t('明確なラベル、キーボード操作、フォーカス表示、色に依存しない状態表現を共通ルールにします。', 'Use clear labels, keyboard interaction, visible focus, and state indicators beyond color.')}</p></div><p>${t('ブラウザ標準の入力やdialogを優先します。独自の操作部品を作る場合は、意味とキーボード動作を実装の責任として検証します。', 'Prefer native inputs and dialog. Custom controls must implement and verify their semantics and keyboard behavior.')}</p>${demo('Button', t)}</div></section>`;
}
function notify(message = t('変更を保存しました', 'Changes saved')) {
  const host = document.getElementById('toast-host');
  if (!document.activeElement.closest('.f-toast')) toastReturnFocus = document.activeElement;
  host.innerHTML = `<div class="f-toast"><span role="status"></span>${b('×', 'dismiss-toast', 'ghost', `aria-label="${t('閉じる', 'Close')}"`)}</div>`;
  const status = host.querySelector('[role=status]');
  requestAnimationFrame(() => {
    if (status.isConnected) status.textContent = message;
  });
}
function showDialog(dialog) {
  dialog.inert = false;
  dialog.showModal();
}
function compact() {
  return route() !== 'patterns/projects';
}
function updateTable() {
  const host = document.getElementById('project-table');
  if (!host) return;
  const active = document.activeElement;
  const selector = active.id
    ? `#${active.id}`
    : active.dataset.row
      ? `[data-row="${active.dataset.row}"]`
      : active.dataset.column
        ? `[data-column="${active.dataset.column}"]`
        : null;
  const selection = active.selectionStart;
  const columnsOpen = document.getElementById('columns-popover')?.matches(':popover-open');
  host.innerHTML = table(projectState, t, locale, compact());
  if (columnsOpen) document.getElementById('columns-popover')?.showPopover();
  const next = selector ? host.querySelector(selector) : null;
  next?.focus();
  if (selection != null && next?.type === 'search') next.setSelectionRange(selection, selection);
  const boxes = [...host.querySelectorAll('[data-row]')];
  const all = host.querySelector('#select-all');
  if (all) all.indeterminate = boxes.some((x) => x.checked) && !boxes.every((x) => x.checked);
}
function openEditor(id) {
  dialogTrigger = document.activeElement;
  projectState.editing =
    id ??
    `PRJ-${String(Math.max(...projectState.rows.map((r) => Number(r.id.slice(4)))) + 1).padStart(3, '0')}`;
  const row = projectState.rows.find((r) => r.id === id) ?? {
    id: projectState.editing,
    name: ['', ''],
    client: ['', ''],
    owner: 'AT',
    status: 'draft',
    amount: 0,
    date: '2026-12-01',
  };
  document.getElementById('overlay-host').innerHTML = editor(row, t, locale);
  const dialog = document.getElementById('project-editor');
  dialog.addEventListener('close', () => dialogTrigger?.focus(), { once: true });
  showDialog(dialog);
}
function setTab(index) {
  document.querySelectorAll('[role=tab]').forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = i !== index;
    if (i === index) tab.focus();
  });
}
function closeNav() {
  document.querySelector('.sidebar').classList.remove('is-open');
  document.querySelector('.sidebar-scrim').hidden = true;
  const toggle = document.querySelector('[data-action=nav]');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.focus();
}

document.addEventListener('click', async (event) => {
  const target = event.target.closest('button,a');
  if (!target || target.getAttribute('aria-disabled') === 'true') return;
  if (target.dataset.themeChoice) {
    theme = target.dataset.themeChoice;
    applyTheme();
    return;
  }
  switch (target.dataset.action) {
    case 'motion-replay': {
      const preview = document.getElementById('motion-page-preview');
      preview.classList.remove('f-motion-enter');
      void preview.offsetWidth;
      preview.classList.add('f-motion-enter');
      break;
    }
    case 'motion-progress':
    case 'motion-progress-reset': {
      const progress = document.getElementById('motion-progress');
      const value =
        target.dataset.action === 'motion-progress-reset'
          ? 25
          : Math.min(100, Number(progress.getAttribute('aria-valuenow')) + 25);
      progress.setAttribute('aria-valuenow', String(value));
      progress.firstElementChild.style.width = `${value}%`;
      document.getElementById('motion-progress-value').textContent = `${value}%`;
      document.querySelector('[data-action=motion-progress]').disabled = value === 100;
      break;
    }
    case 'guide-toggle':
      target.setAttribute('aria-pressed', String(target.getAttribute('aria-pressed') !== 'true'));
      break;
    case 'guide-save': {
      target.setAttribute('aria-busy', 'true');
      target.setAttribute('aria-disabled', 'true');
      target.textContent = t('保存中…', 'Saving…');
      document.getElementById('guide-live-status').textContent = t(
        '保存の動作を確認しています。',
        'Demonstrating the saving state.',
      );
      setTimeout(() => {
        if (!target.isConnected) return;
        target.removeAttribute('aria-busy');
        target.removeAttribute('aria-disabled');
        target.textContent = t('保存の動作を試す', 'Try saving');
        document.getElementById('guide-live-status').textContent = t(
          '保存のデモが完了しました。',
          'The save demonstration is complete.',
        );
      }, 900);
      break;
    }
    case 'skip':
      event.preventDefault();
      document.getElementById('main-content').focus();
      break;
    case 'locale':
      locale = locale === 'ja' ? 'en' : 'ja';
      render();
      break;
    case 'nav':
      if (target.getAttribute('aria-expanded') === 'true') {
        closeNav();
        break;
      }
      document.querySelector('.sidebar').classList.add('is-open');
      document.querySelector('.sidebar-scrim').hidden = false;
      target.setAttribute('aria-expanded', 'true');
      document.getElementById('nav-search').focus();
      break;
    case 'close-nav':
      closeNav();
      break;
    case 'notify':
      notify();
      break;
    case 'dismiss-toast':
      dismissToast(
        target.closest('.f-toast'),
        toastReturnFocus?.isConnected ? toastReturnFocus : document.getElementById('main-content'),
      );
      break;
    case 'copy': {
      const block = target.closest('.code-block');
      try {
        await navigator.clipboard.writeText(block.querySelector('code').textContent);
        block.querySelector('.copy-status').textContent = t('コピーしました', 'Copied');
        target.textContent = t('コピー済み', 'Copied');
      } catch {
        block.querySelector('.copy-status').textContent = t(
          'コードを選択してコピーしてください',
          'Select the code and copy it manually',
        );
      }
      break;
    }
    case 'features':
      document.getElementById('company-features').scrollIntoView({
        behavior: motionMedia.matches || motionPreference === 'reduce' ? 'instant' : 'smooth',
      });
      break;
    case 'open-dialog':
      showDialog(document.getElementById(target.dataset.dialog || 'demo-dialog'));
      break;
    case 'close-dialog':
      target.closest('dialog').close();
      break;
    case 'tab':
      setTab(Number(target.dataset.index));
      break;
    case 'demo-prev':
    case 'demo-next':
      demoPage = Math.max(
        1,
        Math.min(5, demoPage + (target.dataset.action === 'demo-next' ? 1 : -1)),
      );
      document.getElementById('demo-page').textContent = `${demoPage} / 5`;
      document.querySelector('[data-action=demo-prev]').disabled = demoPage === 1;
      document.querySelector('[data-action=demo-next]').disabled = demoPage === 5;
      break;
    case 'menu-action':
      target.closest('[popover]').hidePopover();
      notify(target.textContent);
      break;
    case 'remove-file':
      document.getElementById('file-demo').value = '';
      document.getElementById('file-list').innerHTML = '';
      break;
    case 'sort':
      projectState.sort = {
        key: target.dataset.key,
        direction:
          projectState.sort?.key === target.dataset.key && projectState.sort.direction === 1
            ? -1
            : 1,
      };
      updateTable();
      document.querySelector(`[data-action=sort][data-key="${target.dataset.key}"]`)?.focus();
      break;
    case 'table-prev':
    case 'table-next':
      projectState.page += target.dataset.action === 'table-next' ? 1 : -1;
      updateTable();
      document.querySelector(`[data-action=${target.dataset.action}]`)?.focus();
      break;
    case 'clear-selection':
      projectState.selected.clear();
      updateTable();
      break;
    case 'edit-project':
      openEditor(target.dataset.id);
      break;
    case 'new-project':
      openEditor();
      break;
  }
});
document.addEventListener('input', (event) => {
  const input = event.target;
  if (input.id === 'nav-search') {
    let count = 0;
    document.querySelectorAll('.component-nav a').forEach((a) => {
      a.hidden = !a.dataset.search.includes(input.value.toLowerCase());
      if (!a.hidden) count++;
    });
    document.querySelector('.no-result').hidden = !!count;
  }
  if (input.id === 'project-search') {
    projectState.query = input.value;
    projectState.page = 1;
    updateTable();
  }
  if (input.id === 'search-demo')
    document.getElementById('search-status').textContent = input.value
      ? t(`「${input.value}」で検索中`, `Searching for “${input.value}”`)
      : t('入力すると検索条件が更新されます', 'Type to update the search');
  if (input.id === 'zoom') document.getElementById('zoom-output').value = input.value;
  if (['start-date', 'end-date'].includes(input.id)) {
    const start = document.getElementById('start-date'),
      end = document.getElementById('end-date'),
      valid = validRange(start.value, end.value);
    end.setCustomValidity(
      valid ? '' : t('終了日は開始日以降にしてください', 'End date must follow the start date'),
    );
    end.setAttribute('aria-invalid', String(!valid));
    document.getElementById('range-error').textContent = end.validationMessage;
  }
});
document.addEventListener('change', (event) => {
  const input = event.target;
  if (input.id === 'motion-preference') {
    motionPreference = input.value;
    try {
      localStorage.setItem('forma-motion', motionPreference);
    } catch {}
    applyMotion();
  }
  if (input.id === 'pattern-choice')
    document.getElementById('pattern-recommendation').innerHTML = recommendation(input.value, t);
  if (input.id === 'state-kind')
    document.getElementById('state-matrix').innerHTML = stateMatrix(input.value, t);
  if (input.id === 'density') {
    density = input.value;
    applyTheme();
  }
  if (input.id === 'status-filter') {
    projectState.filter = input.value;
    projectState.page = 1;
    updateTable();
  }
  if (input.dataset.row) {
    input.checked
      ? projectState.selected.add(input.dataset.row)
      : projectState.selected.delete(input.dataset.row);
    updateTable();
  }
  if (input.id === 'select-all') {
    document
      .querySelectorAll('[data-row]')
      .forEach((x) =>
        input.checked
          ? projectState.selected.add(x.dataset.row)
          : projectState.selected.delete(x.dataset.row),
      );
    updateTable();
  }
  if (input.dataset.column) {
    input.checked
      ? projectState.hidden.delete(input.dataset.column)
      : projectState.hidden.add(input.dataset.column);
    updateTable();
  }
  if (input.id === 'file-demo') {
    const file = input.files?.[0];
    const error = document.getElementById('file-error'),
      list = document.getElementById('file-list');
    error.textContent = '';
    input.removeAttribute('aria-invalid');
    list.innerHTML = '';
    if (file && !validFile(file)) {
      input.value = '';
      input.setAttribute('aria-invalid', 'true');
      error.textContent = t(
        'PDF形式・5 MiB以下のファイルを選択してください',
        'Choose a PDF file no larger than 5 MiB',
      );
    } else if (file)
      list.innerHTML = `<li>${e(file.name)}${b('×', 'remove-file', 'ghost', `aria-label="${e(t('削除', 'Remove') + ' ' + file.name)}"`)}</li>`;
  }
});
document.addEventListener('submit', (event) => {
  const form = event.target;
  event.preventDefault();
  if (form.id === 'text-demo') {
    const input = document.getElementById('company'),
      invalid = !input.value.trim();
    input.setAttribute('aria-invalid', String(invalid));
    document.getElementById('company-error').textContent = invalid
      ? t('会社名を入力してください', 'Enter a company name')
      : '';
    if (invalid) input.focus();
    else notify(t('入力内容を確認しました', 'Input validated'));
  }
  if (form.id === 'project-form') {
    const name = document.getElementById('project-name'),
      client = document.getElementById('project-client'),
      amount = document.getElementById('project-amount'),
      date = document.getElementById('project-date');
    const invalid = [name, client, amount, date].filter(
      (x) => !x.value.trim() || !x.validity.valid,
    );
    [name, client, amount, date].forEach((x) =>
      x.setAttribute('aria-invalid', String(invalid.includes(x))),
    );
    if (invalid.length) {
      document.getElementById('project-error').textContent = t(
        '必須項目と入力内容を確認してください',
        'Check required fields and entered values',
      );
      invalid[0].focus();
      return;
    }
    let row = projectState.rows.find((r) => r.id === projectState.editing);
    const fresh = !row;
    if (!row) row = { id: projectState.editing, owner: 'AT', name: ['', ''], client: ['', ''] };
    row.name = [name.value, name.value];
    row.client = [client.value, client.value];
    row.amount = Number(amount.value);
    row.date = date.value;
    row.status = document.getElementById('project-status').value;
    if (fresh) projectState.rows.unshift(row);
    form.closest('dialog').close();
    const id = row.id;
    document.querySelector('.projects').outerHTML = projects(projectState, t, locale, compact());
    dialogTrigger =
      document.querySelector(`[data-id="${id}"]`) ??
      document.querySelector('[data-action=new-project]') ??
      document.getElementById('main-content');
    dialogTrigger.focus();
    notify(t('案件を保存しました', 'Project saved'));
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.querySelector('.sidebar.is-open')) closeNav();
  if (event.key === 'Escape')
    document
      .querySelectorAll('.native-tooltip')
      .forEach((el) => el.setAttribute('data-dismissed', ''));
  if (
    event.target.getAttribute('role') === 'tab' &&
    ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
  ) {
    event.preventDefault();
    const i = Number(event.target.dataset.index);
    setTab(
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 2
          : (i + (event.key === 'ArrowRight' ? 1 : 2)) % 3,
    );
  }
  const menu = event.target.closest('[role=menu]');
  if (menu && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const items = [...menu.querySelectorAll('[role=menuitem]')],
      i = items.indexOf(event.target);
    items[
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (i + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length
    ].focus();
  }
});
document.addEventListener(
  'close',
  (event) => {
    if (event.target.matches('dialog') && !event.target.open) event.target.inert = true;
  },
  true,
);
document.addEventListener(
  'beforetoggle',
  (event) => {
    if (event.target.hasAttribute('popover')) event.target.inert = event.newState === 'closed';
  },
  true,
);
document.addEventListener(
  'toggle',
  (event) => {
    const popup = event.target;
    if (event.newState === 'open' && popup.hasAttribute('popover')) {
      const trigger = document.querySelector(`[popovertarget="${popup.id}"]`);
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        popup.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - popup.offsetWidth - 12))}px`;
        popup.style.top = `${Math.max(12, Math.min(rect.bottom + 8, innerHeight - popup.offsetHeight - 12))}px`;
      }
      if (popup.id === 'demo-menu') popup.querySelector('[role=menuitem]').focus();
    }
  },
  true,
);
document.addEventListener('focusin', (event) =>
  event.target.closest('.native-tooltip')?.removeAttribute('data-dismissed'),
);
document.addEventListener('pointerover', (event) =>
  event.target.closest('.native-tooltip')?.removeAttribute('data-dismissed'),
);
addEventListener('hashchange', () => {
  demoPage = 1;
  projectState = createProjectState();
  render();
  window.scrollTo(0, 0);
  document.getElementById('main-content').focus({ preventScroll: true });
  document.getElementById('main-content').classList.add('f-motion-enter');
});
render();
