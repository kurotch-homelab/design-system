import { button as b, field } from './utils.js';
import { demo } from './patterns.js';
export const motionPreferenceLabel = (t, reduced, system) =>
  system
    ? t('OSの設定に従い、動きを減らしています。', 'Motion is reduced by your OS setting.')
    : reduced
      ? t('このカタログでは動きを減らしています。', 'Motion is reduced in this catalog.')
      : t(
          '短い動きを使用しています。OSの設定変更も反映します。',
          'Short transitions are enabled. OS preference changes are respected.',
        );

export function motionPage(t) {
  const overlay = (drawer) => {
    const id = drawer ? 'motion-drawer' : 'motion-dialog';
    return `${b(t(drawer ? 'ドロワーを開く' : 'ダイアログを開く', drawer ? 'Open drawer' : 'Open dialog'), 'open-dialog', 'secondary', `data-dialog="${id}"`)}<dialog id="${id}" class="${drawer ? 'f-drawer' : 'f-dialog'}" aria-labelledby="${id}-title"><header class="f-between"><h2 id="${id}-title">${t(drawer ? '案件の詳細' : '内容を確認', drawer ? 'Project details' : 'Review details')}</h2>${b('×', 'close-dialog', 'ghost', `aria-label="${t('閉じる', 'Close')}"`)}</header><div class="f-dialog-content stack"><p>${t('閉じるかEscapeで戻れます。操作元にフォーカスを返します。', 'Close or press Escape to return. Focus returns to the trigger.')}</p>${field(`${id}-name`, t('案件名', 'Project name'), 'text', `value="${t('サイト刷新', 'Website renewal')}"`)}${b(t('閉じる', 'Close'), 'close-dialog')}</div></dialog>`;
  };
  const row = (n, title, timing, note, content) =>
    `<section class="motion-example"><div><span class="eyebrow">${n} / ${timing}</span><h2>${title}</h2><p>${note}</p></div><div class="motion-demo">${content}</div></section>`;
  return `<div class="eyebrow">DESIGN DECISIONS / 04</div><div class="page-heading"><div><h1>${t('動きと遷移', 'Motion & transitions')}</h1><p>${t('何が変わったかを、短く、自然に伝える。', 'Make changes easy to follow with brief, natural movement.')}</p></div></div>
  <div class="motion-preference"><label for="motion-preference">${t('動きの設定', 'Motion preference')}</label><select class="f-input" id="motion-preference"><option value="system">${t('OS設定に合わせる', 'Follow OS preference')}</option><option value="reduce">${t('動きを減らす', 'Reduce motion')}</option></select><p id="motion-preference-status" role="status"></p></div>
  <div class="motion-timing">${[
    [
      '120',
      t('反応', 'Response'),
      t('ホバー・押下・タブ・画面のフェード', 'Hover, press, tabs, and page fades'),
    ],
    [
      '180',
      t('出入り', 'Enter / exit'),
      t('ダイアログ・通知・アコーディオン', 'Dialogs, notifications, and accordions'),
    ],
    [
      '240',
      t('大きな開閉', 'Larger surfaces'),
      t('ドロワー・小画面のナビゲーション', 'Drawers and mobile navigation'),
    ],
  ]
    .map(
      ([time, title, desc]) =>
        `<div><strong>${time}<small>ms</small></strong><h2>${title}</h2><p>${desc}</p></div>`,
    )
    .join('')}</div>
  ${row('01', t('操作に反応する', 'Respond to input'), '120 ms', t('色の変化と1pxの押下。フォーカスは遅らせず、無効な操作は動かさない。', 'Use a color change and a 1px press. Focus is immediate; disabled controls stay still.'), `<div class="demo-row">${b(t('保存通知を試す', 'Try a save notification'), 'notify', 'primary')}${b(t('操作できません', 'Unavailable'), '', 'secondary', 'disabled')}</div>${demo('Switch', t)}`)}
  ${row('02', t('文脈を保って開く', 'Open in context'), '120–240 ms', t('ダイアログは8px、ポップオーバーは4px。ドロワーは右から入り、閉じる動きは短くする。', 'Dialogs move 8px, popovers 4px. Drawers enter from the right and leave more quickly.'), `<div class="demo-row">${overlay(false)}${overlay(true)}</div>${demo('Popover', t)}`)}
  ${row('03', t('情報を開閉する', 'Reveal information'), '180 ms', t('内容の高さに合わせて開閉する。固定の高さで文章を切らず、連続操作にも追従する。', 'Expand to fit the content. Keep text unclipped and respond to repeated toggles.'), demo('Accordion', t))}
  ${row('04', t('切り替わりを伝える', 'Show a change'), '120 ms', t('ページやタブの内容は短いフェード。画面全体を横に動かさず、操作を待たせない。', 'Use a short fade for pages and tabs. Keep the page in place and controls available.'), `${b(t('切り替えを再生', 'Replay transition'), 'motion-replay')}<div class="motion-page-preview" id="motion-page-preview"><strong>${t('案件の概要', 'Project overview')}</strong><p>${t('担当者と納期を確認できます。', 'Review the owner and due date.')}</p><span class="f-badge">${t('進行中', 'In progress')}</span></div>${demo('Tabs', t)}`)}
  ${row('05', t('進捗と待ち時間', 'Progress and waiting'), '180 ms / 1,400 ms', t('下の進捗はボタンを押すと25%ずつ進む見本です。Skeletonは2回だけ穏やかに変化し、静止します。', 'The demo advances 25% per click. Skeletons pulse gently twice, then stay still.'), `<div class="stack"><div class="f-between"><strong>${t('進捗の見本', 'Progress example')}</strong><output id="motion-progress-value">25%</output></div><div class="f-progress-track" id="motion-progress" role="progressbar" aria-label="${t('進捗の見本', 'Progress example')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="25"><div style="width:25%"></div></div><div class="demo-row">${b(t('25%進める', 'Advance 25%'), 'motion-progress')}${b(t('リセット', 'Reset'), 'motion-progress-reset', 'ghost')}</div>${demo('Skeleton', t)}</div>`)}
  <section class="guide-section"><h2>${t('設計と実装のルール', 'Design and implementation rules')}</h2><ul class="motion-rules"><li>${t('開始は速く、終わりは滑らかに。バネやバウンドで注意を奪わない。', 'Start promptly and settle smoothly. Avoid springs or bounces that compete for attention.')}</li><li>${t('状態・フォーカス・通知は即時に更新する。アニメーションの終了を操作の条件にしない。', 'Update state, focus, and announcements immediately. Animation completion must not gate interaction.')}</li><li>${t('動きを減らしても、内容と操作は同じ。処理中は文字でも伝える。', 'Reduced motion keeps the same content and controls. Describe loading with text too.')}</li><li>${t('基本はCSS。新しいCSSに非対応のブラウザでは、標準の開閉に戻る。', 'Use CSS as the foundation. Browsers without newer CSS keep native instant open and close behavior.')}</li></ul><div class="prop-list">${['--f-motion-fast', '--f-motion-standard', '--f-motion-deliberate', '--f-ease-standard', '--f-ease-enter', '--f-ease-exit'].map((x) => `<code>${x}</code>`).join('')}</div><p>${t('タイミングと距離はForma独自の値です。', 'Timing and distances are Forma-specific values.')} <a class="f-link" href="https://fluent2.microsoft.design/motion">Fluent 2 · Motion ↗</a></p></section>`;
}

export function dismissToast(toast, returnFocus) {
  if (!toast || toast.hasAttribute('data-leaving')) return;
  if (toast.contains(document.activeElement)) returnFocus?.focus();
  toast.inert = true;
  toast.setAttribute('aria-hidden', 'true');
  toast.dataset.leaving = '';
  const duration = parseFloat(getComputedStyle(toast).animationDuration) * 1000;
  if (!duration) {
    toast.remove();
    return;
  }
  const finish = () => {
    clearTimeout(timer);
    toast.remove();
  };
  const timer = setTimeout(finish, duration + 80);
  toast.addEventListener('animationend', finish, { once: true });
}
