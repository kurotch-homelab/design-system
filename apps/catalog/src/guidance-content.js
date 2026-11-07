// Forma's own decisions. References inform the principles; these are not vendor specifications.
export const references = [
  {
    title: 'Fluent 2 · Design principles',
    url: 'https://fluent2.microsoft.design/design-principles',
    note: [
      '作業への集中と、プラットフォームに自然な操作。',
      'Focus on work and interactions that feel native to the platform.',
    ],
  },
  {
    title: 'Fluent 2 · Layout',
    url: 'https://fluent2.microsoft.design/layout',
    note: [
      '近接・余白・整列による情報の関係づけ。',
      'Relationships expressed through proximity, spacing, and alignment.',
    ],
  },
  {
    title: 'Fluent 2 · Typography',
    url: 'https://fluent2.microsoft.design/typography',
    note: [
      '役割が分かる文字の階層とシステムフォント。',
      'A readable type hierarchy and native system fonts.',
    ],
  },
  {
    title: 'Fluent 2 · Accessibility',
    url: 'https://fluent2.microsoft.design/accessibility',
    note: [
      'フォーカス、拡大時の配置、コントラストの検証。',
      'Focus, zoom reflow, and contrast checks.',
    ],
  },
  {
    title: 'Material Design 3 · Foundations',
    url: 'https://m3.material.io/foundations/',
    note: [
      'トークン、操作状態、レイアウトを共通の設計ルールとして扱う考え方。',
      'Treat tokens, interaction states, and layout as shared design rules.',
    ],
  },
];

export const decisions = [
  {
    id: 'detail',
    task: ['一覧から案件の詳細を確認・編集したい', 'Inspect or edit a record from a list'],
    pick: 'Drawer',
    also: ['Dialog'],
    reason: [
      '起点の一覧を視覚的に保ち、対象を切り替えずに短い編集を完了できるため。',
      'A short edit can retain visual context from the originating list.',
    ],
    boundary: [
      '入力が長い、複数段階になる、URLで共有したい場合は独立したページにする。モーダルのDrawerでは背景を操作不可にする。',
      'Use a dedicated page for long, multi-step, or shareable tasks. A modal drawer must make its background inert.',
    ],
  },
  {
    id: 'confirm',
    task: ['取り消せない操作の前に確認したい', 'Confirm an irreversible action'],
    pick: 'Dialog',
    also: ['Button'],
    reason: [
      '対象と結果を短く説明し、その判断に集中してもらう必要があるため。',
      'The user needs to focus on a specific target and consequence.',
    ],
    boundary: [
      '通常の保存を毎回確認しない。取り消せる操作なら、完了後のUndoも検討する。',
      'Do not confirm every routine save. Consider an undo action when the operation is reversible.',
    ],
  },
  {
    id: 'view',
    task: [
      '同じ案件の概要・履歴・資料を切り替えたい',
      'Switch between overview, history, and files for one record',
    ],
    pick: 'Tabs',
    also: ['Breadcrumbs'],
    reason: [
      '対象は同じまま、関連する情報の見方を変えるため。',
      'The subject remains the same while the view changes.',
    ],
    boundary: [
      '別の作業や別の場所へ移る場合はリンクとページ遷移を使う。順番が必須の入力手順にタブを使わない。',
      'Use links and navigation for different tasks or locations. Tabs are not a sequence of required steps.',
    ],
  },
  {
    id: 'fixed',
    task: ['決められた候補から必ず1つ選びたい', 'Require one value from a fixed set'],
    pick: 'Select',
    also: ['RadioGroup'],
    reason: [
      '入力できる値を限定し、表記の揺れを防げるため。',
      'A closed set avoids unsupported or inconsistent values.',
    ],
    boundary: [
      '少数の選択肢を比較して決める場合はRadioGroup。datalistは自由入力を許すので、候補限定には使わない。',
      'Use RadioGroup for a small set that benefits from comparison. Datalist allows free text and is not a closed-set control.',
    ],
  },
  {
    id: 'suggest',
    task: ['候補を参考にしながら自由に入力したい', 'Offer suggestions while allowing free text'],
    pick: 'ComboBox',
    also: ['TextField'],
    reason: [
      '既存の値を再利用しやすくしながら、新しい値も入力できるため。',
      'Suggestions encourage reuse without preventing new values.',
    ],
    boundary: [
      'Formaの参考例は標準datalist。候補の見た目・キー操作はブラウザに従う。厳密な選択が必要ならSelect。',
      'The Forma example uses native datalist. Suggestion UI follows the browser. Use Select for strict selection.',
    ],
  },
  {
    id: 'instant',
    task: ['設定をその場でオン・オフしたい', 'Apply an on/off setting immediately'],
    pick: 'Switch',
    also: ['Checkbox'],
    reason: [
      '切り替え直後に設定が反映されることを表すため。',
      'A switch communicates that its setting takes effect immediately.',
    ],
    boundary: [
      '保存ボタンでまとめて確定するフォームにはCheckboxを使う。失敗したら元に戻し、理由を伝える。',
      'Use Checkbox in a form submitted as a whole. Revert and explain the error if an immediate change fails.',
    ],
  },
  {
    id: 'error',
    task: ['入力内容を直してもらいたい', 'Help someone correct an input'],
    pick: 'TextField',
    also: ['Alert'],
    reason: [
      '誤りがある欄の近くで、何を直すかを伝えると修正しやすいため。',
      'A message next to the field connects the correction to its cause.',
    ],
    boundary: [
      'エラーの文字を入力に関連付ける。複数のエラーには先頭の要約も使う。Toastだけで伝えない。',
      'Associate the error text with the field. Add a summary for multiple errors; do not rely on a toast alone.',
    ],
  },
  {
    id: 'done',
    task: ['保存が完了したことを短く伝えたい', 'Briefly confirm that a save completed'],
    pick: 'Toast',
    also: ['Alert'],
    reason: [
      '作業を中断せず結果を知らせられるため。',
      'A lightweight message confirms the result without interrupting the task.',
    ],
    boundary: [
      '継続して参照する注意事項にはAlert。必須の判断や入力をToastに入れない。',
      'Use Alert for information that should remain in context. Do not put required decisions or input in a toast.',
    ],
  },
  {
    id: 'waiting',
    task: ['処理の進み具合を伝えたい', 'Communicate progress during an operation'],
    pick: 'Progress',
    also: ['Skeleton'],
    reason: [
      '処理中と完了までの見通しを明示できるため。',
      'Progress communicates ongoing work and, when known, how much remains.',
    ],
    boundary: [
      '値が不明なときに架空の割合を出さない。既知の画面構造を保つ読み込みにはSkeleton。データなしはEmptyState。',
      'Do not invent percentages. Use Skeleton to reserve a known layout during loading and EmptyState when there is no data.',
    ],
  },
  {
    id: 'compare',
    task: ['複数の案件を同じ項目で比較したい', 'Compare records using the same attributes'],
    pick: 'DataTable',
    also: ['Card'],
    reason: [
      '列の整列で、金額・期限・状態の差を追いやすくするため。',
      'Aligned columns make values, dates, and statuses easy to compare.',
    ],
    boundary: [
      '説明文中心の独立した内容にはCard。重要な比較項目をアイコンだけに置き換えない。',
      'Use Card for self-contained narrative content. Do not replace important comparison fields with icons alone.',
    ],
  },
  {
    id: 'help',
    task: ['操作の短い補足を表示したい', 'Provide a short explanation of an action'],
    pick: 'Tooltip',
    also: ['Popover'],
    reason: [
      '操作の近くで、短い説明を必要なときに確認できるため。',
      'A brief hint can stay close to the action it explains.',
    ],
    boundary: [
      '必須情報は常時表示する。リンクや設定など操作を含む補助領域はPopover。',
      'Keep essential information visible. Use Popover when supporting content contains controls or links.',
    ],
  },
  {
    id: 'quantity',
    task: ['人数や金額を正確に入力したい', 'Enter an exact count or amount'],
    pick: 'NumberField',
    also: ['Slider'],
    reason: [
      '数値を直接入力し、単位・範囲・刻みを明示できるため。',
      'Direct entry supports explicit units, bounds, and increments.',
    ],
    boundary: [
      '感覚的な強さや概量の調整にはSlider。料金や人数をスライダーだけで入力させない。',
      'Use Slider for approximate levels. Do not make a slider the only way to enter prices or headcounts.',
    ],
  },
];

export const states = [
  {
    id: 'enabled',
    label: ['通常', 'Enabled'],
    meaning: ['操作可能な基本状態。', 'The control is available.'],
    behavior: ['ラベルで操作の結果を予測できる。', 'The label describes the action.'],
    applies: ['button', 'input'],
  },
  {
    id: 'hover',
    label: ['ホバー', 'Hover'],
    meaning: ['ポインターが操作対象にある。', 'A pointer is over the control.'],
    behavior: [
      '背景や境界で反応する。意味は変えない。',
      'Respond through surface or border, without changing meaning.',
    ],
    applies: ['button', 'input'],
  },
  {
    id: 'focus',
    label: ['フォーカス', 'Focus'],
    meaning: ['キーボードの現在位置。', 'The current keyboard target.'],
    behavior: [
      '2pxの外周リングを表示。ホバーと区別する。',
      'Show a 2px outer ring, distinct from hover.',
    ],
    applies: ['button', 'input'],
  },
  {
    id: 'pressed',
    label: ['押下', 'Pressed'],
    meaning: ['操作を実行しようとしている短い状態。', 'A brief state while activating an action.'],
    behavior: [
      '押している間だけ表示する。選択状態として残さない。',
      'Show only during activation, not as persistent selection.',
    ],
    applies: ['button'],
  },
  {
    id: 'selected',
    label: ['選択', 'Selected'],
    meaning: ['選択が継続している状態。', 'A choice that persists.'],
    behavior: [
      'トグルではaria-pressedを更新。フォーカスとも併存する。',
      'Update aria-pressed on a toggle. Selection can coexist with focus.',
    ],
    applies: ['button'],
  },
  {
    id: 'disabled',
    label: ['無効', 'Disabled'],
    meaning: ['現在は操作できない。', 'The action is currently unavailable.'],
    behavior: [
      'ホバーや押下に反応しない。解除条件は外側の補助文に書く。',
      'Do not react to hover or press. Explain requirements outside the disabled control.',
    ],
    applies: ['button', 'input'],
  },
  {
    id: 'loading',
    label: ['処理中', 'Loading'],
    meaning: ['要求を受け付け、完了待ち。', 'A request is in progress.'],
    behavior: [
      '重複実行を防ぐ。文言とaria-busyを使い、完了を通知する。',
      'Prevent duplicate actions. Use text and aria-busy, then announce completion.',
    ],
    applies: ['button'],
  },
  {
    id: 'error',
    label: ['エラー', 'Error'],
    meaning: ['入力の修正が必要。', 'Input needs correction.'],
    behavior: [
      'aria-invalidと関連付けた具体的な修正文を示す。',
      'Use aria-invalid and associated, actionable error text.',
    ],
    applies: ['input'],
  },
  {
    id: 'readonly',
    label: ['読み取り専用', 'Read-only'],
    meaning: ['値は確認できるが変更できない。', 'A value can be reviewed but not edited.'],
    behavior: [
      '読み取り・選択・コピーを許す。無効とは区別する。',
      'Allow review, selection, and copying; distinguish from disabled.',
    ],
    applies: ['input'],
  },
];

const rules = [
  [
    ['Button', 'IconButton', 'Link'],
    ['操作か、移動かを先に決める', 'Decide whether this is an action or navigation'],
    [
      '保存・実行にはbutton、別の場所への移動にはaを使う。',
      'Use button for actions and a for navigation.',
    ],
    [
      'アイコンだけの操作には名前を付け、主操作は文言で示す。',
      'Name icon-only actions and give primary actions visible text.',
    ],
    [
      '意味とキーボード操作を標準HTMLに任せられる。',
      'Native HTML preserves semantics and keyboard behavior.',
    ],
  ],
  [
    ['Badge', 'Avatar', 'Divider', 'Card'],
    ['情報の関係を表す', 'Express relationships'],
    [
      '状態・人物・区切り・独立した内容を、それぞれの意味に合わせて使う。',
      'Use status, identity, separators, and containers for their distinct purposes.',
    ],
    [
      '全ての情報をカードで囲わない。色や画像だけで識別させない。',
      'Avoid boxing every item into a card or relying on color and imagery alone.',
    ],
    [
      '装飾を増やさず、まとまりと重要度を読み取れる。',
      'Grouping and importance stay legible with less decoration.',
    ],
  ],
  [
    ['TextField', 'TextArea', 'SearchField'],
    ['入力の目的を常に見せる', 'Keep the input purpose visible'],
    [
      'ラベル・例・必要な補助文を入力前から提示する。',
      'Show a label, example, and relevant help before entry.',
    ],
    [
      'プレースホルダーだけをラベルにしない。検索と確定操作を混同しない。',
      'Do not use placeholders as the only labels or confuse searching with submitting.',
    ],
    [
      '入力後も目的と修正方法を確認できる。',
      'The purpose and correction path remain available after typing.',
    ],
  ],
  [
    ['NumberField', 'Slider'],
    ['精度に合う入力方法を選ぶ', 'Match input to precision'],
    [
      '正確な値はNumberField、感覚的な調整はSlider。',
      'Use NumberField for exact values and Slider for approximate adjustment.',
    ],
    [
      '単位と上下限を省かない。小さなスライダーで厳密な値を要求しない。',
      'Include units and bounds. Do not require precision from a short slider.',
    ],
    ['入力方法と作業の要求が一致する。', 'The input method matches the task.'],
  ],
  [
    ['Checkbox', 'RadioGroup', 'Switch'],
    ['選択の意味を分ける', 'Distinguish kinds of choice'],
    [
      '複数選択はCheckbox、排他的な選択はRadioGroup、即時の設定変更はSwitch。',
      'Use Checkbox for independent choices, RadioGroup for one-of-many, and Switch for immediate settings.',
    ],
    [
      '保存が必要なフォームで即時反映に見えるSwitchを使わない。',
      'Avoid an immediate-looking switch for settings that require a separate save.',
    ],
    ['選択した後に何が起こるか予測しやすい。', 'People can predict what happens after a change.'],
  ],
  [
    ['Select', 'ComboBox'],
    ['候補の制約を明確にする', 'Make choice constraints clear'],
    [
      '固定候補にはSelect、自由入力への候補提示にはdatalistのComboBox例。',
      'Use Select for a closed set and the datalist example for free-text suggestions.',
    ],
    [
      'datalistの候補以外を入力できないと思わせない。',
      'Do not imply that datalist prevents values outside its suggestions.',
    ],
    [
      '入力可能な値と見た目の期待を揃えられる。',
      'The interface communicates what values are accepted.',
    ],
  ],
  [
    ['DatePicker', 'DateRangePicker', 'FileUpload'],
    ['形式と制約を事前に示す', 'Explain format and constraints early'],
    [
      '日付の上下限やファイル形式・容量を、選ぶ前に表示する。',
      'Explain date bounds or file types and size before selection.',
    ],
    [
      'ブラウザの入力補助だけに保存時の検証を任せない。',
      'Do not rely on browser assistance as the sole validation at save time.',
    ],
    [
      '選び直しを減らし、エラーから回復しやすくする。',
      'Clear constraints reduce retries and support recovery.',
    ],
  ],
  [
    ['Tabs', 'Breadcrumbs', 'Pagination'],
    ['現在位置を失わせない', 'Keep location understandable'],
    [
      '選択中のタブ、階層、現在ページをそれぞれ明示する。',
      'Show the active view, hierarchy, and page position explicitly.',
    ],
    [
      'タブを必須の手順として使わない。ページ送りで選択状態を黙って消さない。',
      'Do not use tabs as required steps or silently clear selection during pagination.',
    ],
    [
      '情報を切り替えても作業の位置を把握できる。',
      'People retain orientation while switching information.',
    ],
  ],
  [
    ['Menu', 'Tooltip', 'Popover', 'Accordion'],
    ['必要な情報を適切な場所に置く', 'Put information where it is needed'],
    [
      '補助操作や追加説明を、関連する対象の近くで開示する。',
      'Reveal secondary actions and details near the relevant subject.',
    ],
    [
      '必須情報や主操作を折り畳み・ツールチップの中に隠さない。',
      'Do not hide essential information or primary actions in collapsed content or tooltips.',
    ],
    [
      '読み始めの負担を抑えつつ、必要な情報に到達できる。',
      'The initial view stays manageable while details remain reachable.',
    ],
  ],
  [
    ['Dialog', 'Drawer'],
    ['中断の大きさを作業に合わせる', 'Match interruption to the task'],
    [
      '短い判断にはDialog、一覧に関連した短い詳細・編集にはDrawer。',
      'Use Dialog for a short decision and Drawer for contextual detail or editing.',
    ],
    [
      '長い入力は独立ページにする。モーダルを何段も重ねない。',
      'Use a dedicated page for long forms. Avoid stacked modals.',
    ],
    [
      '起点と終点を明確にし、閉じた後に作業へ戻れる。',
      'A clear start and finish make returning to the task straightforward.',
    ],
  ],
  [
    ['Alert', 'Toast', 'Progress', 'Skeleton', 'EmptyState'],
    ['状態に合う次の行動を示す', 'Communicate the next step for the state'],
    [
      '修正が必要か、待てばよいか、追加すればよいかを言葉で示す。',
      'Explain whether to correct, wait, or add something.',
    ],
    [
      'エラーをToastだけで伝えない。未取得とデータなしを同じ表示にしない。',
      'Do not communicate errors only in a toast or confuse loading with an empty result.',
    ],
    [
      '画面の状態を推測せずに作業を続けられる。',
      'People can continue without guessing what the system is doing.',
    ],
  ],
  [
    ['DataTable'],
    ['比較に必要な軸を揃える', 'Align the dimensions needed for comparison'],
    [
      '名称は左、数値は右に揃え、同じ列で単位と日付表記を統一する。',
      'Align names left and numbers right; keep units and date formats consistent within a column.',
    ],
    [
      '狭い画面で重要な列を無言で消さない。アイコンだけの状態を並べない。',
      'Do not silently remove important columns on narrow screens or use icon-only statuses.',
    ],
    [
      '値の差を目で追え、誤読と横断的な確認の手間を減らせる。',
      'Aligned values reduce misreading and the effort of comparing rows.',
    ],
  ],
];
export const patternRules = Object.fromEntries(
  rules.flatMap(([names, title, use, avoid, why]) =>
    names.map((name) => [name, { title, use, avoid, why }]),
  ),
);
