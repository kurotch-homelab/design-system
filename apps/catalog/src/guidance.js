import { decisions, states, patternRules, references } from './guidance-content.js';
import { escapeHTML as e, button as b, badge } from './utils.js';
const pair = (value, t) => t(...value);
const link = (name) => `<a class="f-link" href="#components/${name}">${name}</a>`;
const header = (number, title, description, t) =>
  `<div class="eyebrow">Design decisions / ${number}</div><div class="page-heading"><div><h1>${title}</h1><p>${description}</p></div>${badge(t('Formaの設計指針', 'Forma guidance'), 'info')}</div>`;
export function recommendation(id, t) {
  const choice = decisions.find((d) => d.id === id) ?? decisions[0];
  return `<div class="recommendation-heading"><span class="eyebrow">${t('推奨パターン', 'Recommended pattern')}</span><h2>${choice.pick}</h2><p>${pair(choice.task, t)}</p></div><div class="recommendation-body"><h3>${t('選ぶ理由', 'Why it fits')}</h3><p>${pair(choice.reason, t)}</p><h3>${t('別の選択が適する場合', 'When to choose differently')}</h3><p>${pair(choice.boundary, t)}</p><div class="demo-row">${link(choice.pick)}<span class="muted">${t('関連', 'Related')}:</span>${choice.also.map(link).join(' · ')}</div></div>`;
}
export function selectionPage(t) {
  return `${header('01', t('パターンの選び方', 'Choosing a pattern'), t('見た目を決める前に、作業の目的と必要な振る舞いを整理する。', 'Start with the task and behavior the user needs.'), t)}<section class="guide-selector"><label for="pattern-choice">${t('やりたいこと', 'What are you trying to do?')}</label><select class="f-input" id="pattern-choice">${decisions.map((d) => `<option value="${d.id}">${pair(d.task, t)}</option>`).join('')}</select><div id="pattern-recommendation" class="recommendation" aria-live="polite" aria-atomic="true">${recommendation('detail', t)}</div></section><section class="guide-section"><div class="section-heading"><div><span class="eyebrow">Decision map</span><h2>${t('目的から、適切なパターンへ', 'From a task to the right pattern')}</h2></div></div><div class="guide-table-scroll" tabindex="0" role="region" aria-label="${t('パターンの使い分け表', 'Pattern decision table')}"><table class="guide-table"><caption class="f-sr-only">${t('目的・推奨・切り替え条件', 'Task, recommendation, and alternatives')}</caption><thead><tr><th scope="col">${t('目的', 'Task')}</th><th scope="col">${t('選ぶもの', 'Choose')}</th><th scope="col">${t('判断の境界', 'Decision boundary')}</th></tr></thead><tbody>${decisions.map((d) => `<tr><th scope="row">${pair(d.task, t)}</th><td>${link(d.pick)}</td><td>${pair(d.boundary, t)}</td></tr>`).join('')}</tbody></table></div></section>${referenceFooter(t)}`;
}

export function stateMatrix(kind, t) {
  return states
    .filter((s) => s.applies.includes(kind))
    .map((state) => {
      const label = pair(state.label, t),
        isInput = kind === 'input';
      const sample = isInput
        ? `<div class="f-field"><span class="state-label">${t('会社名', 'Company')}</span><input class="f-input" tabindex="-1" aria-label="${t('静的見本', 'Static specimen')}" value="${state.id === 'error' ? '' : t('株式会社 フォルマ', 'Forma Inc.')}" ${state.id === 'disabled' ? 'disabled' : ''} ${state.id === 'readonly' ? 'readonly' : ''} ${state.id === 'error' ? 'aria-invalid="true"' : ''} data-preview-state="${state.id}">${state.id === 'error' ? `<span class="f-error">${t('会社名を入力してください', 'Enter a company name')}</span>` : ''}</div>`
        : `<button type="button" tabindex="-1" class="f-button ${state.id === 'selected' ? 'f-toggle' : 'f-button--primary'}" data-preview-state="${state.id}" ${state.id === 'disabled' ? 'disabled' : ''} ${state.id === 'loading' ? 'aria-busy="true" aria-disabled="true"' : ''} ${state.id === 'selected' ? 'aria-pressed="true"' : ''}>${state.id === 'loading' ? t('保存中…', 'Saving…') : state.id === 'selected' ? '✓ ' + t('選択済み', 'Selected') : t('保存する', 'Save changes')}</button>`;
      return `<li class="state-specimen"><div class="state-specimen-heading"><span class="state-index">${state.id}</span><h3>${label}</h3></div><div class="state-visual" aria-hidden="true" inert>${sample}</div><p>${pair(state.meaning, t)}</p><small>${pair(state.behavior, t)}</small></li>`;
    })
    .join('');
}

export function statesPage(t) {
  return `${header('02', t('操作状態', 'Interaction states'), t('反応、現在位置、選択、結果。それぞれを混同させない。', 'Distinguish feedback, focus, selection, and outcomes.'), t)}<div class="guide-intro-note"><strong>${t('見た目と振る舞いをセットで定義する', 'Specify appearance and behavior together')}</strong><p>${t('以下は状態を固定した見本です。フォーカスやホバーの実操作は、下の操作エリアで確認できます。配色や数値はForma独自の定義です。', 'The specimens below freeze each state. Try real focus and hover in the live area below. Colors and values are Forma-specific decisions.')}</p></div><div class="guide-toolbar"><label for="state-kind">${t('見比べる対象', 'Compare states for')}</label><select id="state-kind" class="f-input"><option value="button">${t('ボタン', 'Button')}</option><option value="input">${t('入力欄', 'Input')}</option></select></div><ul id="state-matrix" class="state-matrix">${stateMatrix('button', t)}</ul><section class="guide-section"><div class="section-heading"><div><span class="eyebrow">Try it</span><h2>${t('キーボードとポインターで確かめる', 'Try the keyboard and pointer')}</h2></div></div><div class="state-lab"><div class="stack"><label for="state-live-input">${t('プロジェクト名', 'Project name')}</label><input class="f-input" id="state-live-input" value="${t('サイト刷新', 'Website renewal')}"><div class="demo-row">${b(t('保存の動作を試す', 'Try saving'), 'guide-save', 'primary', 'id="guide-save"')}${b(t('ピン留め', 'Pin'), 'guide-toggle', 'secondary', 'id="guide-toggle" aria-pressed="false"')}</div><p id="guide-live-status" role="status" class="f-help">${t('Tabで移動し、EnterまたはSpaceで操作できます。保存はデモで、外部には送信しません。', 'Navigate with Tab and activate with Enter or Space. Saving is a local demo; nothing is sent.')}</p></div><aside><h3>${t('状態は重ね合わせて考える', 'States can coexist')}</h3><p>${t('選択済みでもフォーカスは見せる。エラーの入力欄にもフォーカスリングを見せる。無効はホバー・押下より優先し、処理中は重複操作を防ぐ。', 'Keep focus visible on selected controls and invalid fields. Disabled overrides hover and press; loading prevents duplicate actions.')}</p><p>${t('無効の理由は、無効な操作そのものを触らなくても読める場所に置く。読み取り専用の値は選択・コピーできるようにする。', 'Explain unavailable actions outside the disabled control. Read-only values remain selectable and copyable.')}</p></aside></div></section><section class="guide-section"><h2>${t('状態トークン', 'State tokens')}</h2><div class="prop-list">${['--f-brand-hover', '--f-brand-pressed', '--f-surface-hover', '--f-surface-pressed', '--f-control-border', '--f-focus'].map((x) => `<code>${x}</code>`).join('')}</div><p class="muted">${t('意味別の値を変えると、ライト／ダークの見本と実際の操作部品の両方に反映されます。', 'Semantic values drive both the specimens and live controls in each theme.')}</p></section>${referenceFooter(t)}`;
}

function comparison(id, t) {
  const item = {
    hierarchy: {
      title: t('主操作を明確にする', 'Make the primary action clear'),
      why: t(
        '強調が1か所なら、次にすることを見つけやすい。破壊的な操作は区別して配置する。',
        'One point of emphasis makes the next step easier to find. Separate destructive actions.',
      ),
      good: t(
        '主操作を1つにし、他は補助的な強さにする。',
        'Give one action primary emphasis; keep alternatives secondary.',
      ),
      bad: t(
        '全ての操作を同じ強さで強調すると優先順位が分からない。',
        'Equal emphasis on every action obscures priority.',
      ),
      preview: (good) =>
        `<h4>${t('変更内容の確認', 'Review changes')}</h4><p>${t('担当者と納期を更新します。', 'Update the owner and deadline.')}</p><div class="demo-row"><span class="f-button f-button--primary">${t('変更を保存', 'Save changes')}</span><span class="f-button ${good ? '' : 'f-button--primary'}">${t('キャンセル', 'Cancel')}</span><span class="f-button ${good ? 'f-button--ghost' : 'f-button--primary'}">${t('削除', 'Delete')}</span></div>`,
    },
    spacing: {
      title: t('近いものを、意味でも近くする', 'Use proximity to express relationships'),
      why: t(
        'ラベルと値、同じ話題の項目を近づけると、区切り線を増やさずに構造が伝わる。',
        'Keeping labels, values, and related fields together communicates structure without extra lines.',
      ),
      good: t(
        '項目内8px、同じグループ内16px、グループ間32pxを基準にする。',
        'Start with 8px within a field, 16px within a group, and 32px between groups.',
      ),
      bad: t(
        'どこも同じ間隔にすると、関連する項目と別の話題の境界が曖昧になる。',
        'Uniform spacing everywhere makes relationships and boundaries ambiguous.',
      ),
      preview: (good) =>
        `<div class="spacing-example ${good ? 'spacing-example--good' : 'spacing-example--bad'}"><div><strong>${t('連絡先', 'Contact')}</strong><span>${t('担当者', 'Owner')} / Aoi Tanaka</span><span>${t('メール', 'Email')} / aoi@example.test</span></div><div><strong>${t('請求情報', 'Billing')}</strong><span>${t('請求サイクル', 'Billing cycle')} / ${t('月次', 'Monthly')}</span></div></div>`,
    },
    form: {
      title: t('何を直すかを、入力欄のそばに', 'Keep corrections close to the field'),
      why: t(
        '目的と修正方法が残ることで、入力後やエラー発生後も迷わず作業を続けられる。',
        'Persistent labels and clear corrections support recovery after entry and errors.',
      ),
      good: t(
        'ラベルを残し、エラーの原因と修正例を具体的に書く。',
        'Keep the label and provide a specific cause and correction.',
      ),
      bad: t(
        'ラベルが消えるプレースホルダーと、「エラーです」だけのメッセージでは直し方が分からない。',
        'A disappearing placeholder and “Error” do not explain how to recover.',
      ),
      preview: (good) =>
        `<div class="f-field">${good ? `<span>${t('連絡用メールアドレス', 'Contact email')}</span>` : ''}<span class="f-input" data-preview-state="error">aoi.example.test</span><span class="f-error">${good ? t('「@」を含む形式で入力してください。例：aoi@example.test', 'Include “@”, for example aoi@example.test.') : t('エラーです', 'Error')}</span></div>`,
    },
    table: {
      title: t('数値の桁と単位を揃える', 'Align values and units'),
      why: t(
        '縦方向の比較ができると、金額の差を少ない視線移動で読み取れる。',
        'Vertical alignment makes differences visible with less eye movement.',
      ),
      good: t(
        '数値は右揃え・等幅数字。同じ列では通貨と桁区切りを統一する。',
        'Right-align tabular figures and use consistent currency and grouping.',
      ),
      bad: t(
        '中央揃え、単位の混在、桁区切りの揺れは比較を遅くする。',
        'Centered values and inconsistent units and grouping slow comparison.',
      ),
      preview: (good) =>
        `<table class="comparison-table ${good ? 'numeric-good' : 'numeric-bad'}"><thead><tr><th>${t('案件', 'Project')}</th><th>${t('金額', 'Value')}</th></tr></thead><tbody>${['A', 'B', 'C'].map((x, i) => `<tr><td>${x}</td><td>${(good ? ['¥240,000', '¥12,000', '¥1,800,000'] : ['240000 JPY', '¥12,000', '1.8m'])[i]}</td></tr>`).join('')}</tbody></table>`,
    },
  }[id];
  return `<section class="guide-section comparison-section"><div class="section-heading"><div><span class="eyebrow">${id}</span><h2>${item.title}</h2></div></div><div class="comparison-grid">${[true, false].map((good) => `<figure class="comparison ${good ? 'comparison--good' : 'comparison--avoid'}"><div class="comparison-marker">${good ? '✓' : '×'} ${good ? t('良い例', 'Recommended') : t('避ける例', 'Avoid')}</div><div class="comparison-visual" aria-hidden="true" inert>${item.preview(good)}</div><figcaption>${good ? item.good : item.bad}</figcaption></figure>`).join('')}</div><p class="comparison-why"><strong>${t('判断の理由', 'Why')} — </strong>${item.why}</p></section>`;
}
export function examplesPage(t) {
  return `${header('03', t('良い例・避ける例', 'Examples & rationale'), t('見た目の違いを、使いやすさの理由に結びつける。', 'Connect visual decisions to usability.'), t)}<p class="guide-intro-note">${t('以下は比較用の静的な見本です。避ける例には意図的な問題が含まれます。製品へコピーする場合は良い例の指針を使ってください。', 'These are static comparisons. Avoid examples contain intentional problems; use the recommended guidance in products.')}</p>${['hierarchy', 'spacing', 'form', 'table'].map((id) => comparison(id, t)).join('')}${referenceFooter(t)}`;
}

export function componentGuidance(name, t) {
  const rule = patternRules[name];
  if (!rule) return '';
  const related = decisions.filter((d) => d.pick === name || d.also.includes(name));
  return `<section class="guide-section component-guidance"><div class="section-heading"><div><span class="eyebrow">Design rationale</span><h2>${pair(rule.title, t)}</h2></div></div><dl class="rule-list"><div><dt>${t('使うとき', 'Use when')}</dt><dd>${pair(rule.use, t)}</dd></div><div><dt>${t('避けること', 'Avoid')}</dt><dd>${pair(rule.avoid, t)}</dd></div><div><dt>${t('判断の理由', 'Rationale')}</dt><dd>${pair(rule.why, t)}</dd></div></dl><div class="guide-related"><a class="f-link" href="#guides/selection">${t('他のパターンとの使い分け', 'Compare pattern choices')} →</a><a class="f-link" href="#guides/states">${t('共通の操作状態', 'Shared interaction states')} →</a></div>${related.length ? `<p class="muted">${t('関連する目的', 'Related tasks')}: ${related.map((d) => pair(d.task, t)).join(' / ')}</p>` : ''}</section>`;
}
export function referenceFooter(t) {
  return `<aside class="reference-notes"><h2>${t('参考にした考え方', 'Reference principles')}</h2><p>${t('Fluent 2の作業への集中・情報階層と、Material Designの体系化を参考にしています。ここに示す選択基準・色・数値はForma独自の設計判断です。ライブラリへの依存や、両システムへの適合を意味しません。', 'Fluent 2 informs focus and hierarchy; Material Design informs systematic foundations. Choices, colors, and values here are Forma decisions, not dependencies or claims of conformance.')}</p><ul>${references.map((r) => `<li><a class="f-link" href="${r.url}">${r.title} ↗</a><span>${pair(r.note, t)}</span></li>`).join('')}</ul></aside>`;
}
