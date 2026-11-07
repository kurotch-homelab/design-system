export const groups = [
  ['基本・表示', 'Foundations & display'],
  ['入力', 'Inputs'],
  ['移動・開閉', 'Navigation & overlays'],
  ['状態・データ', 'Feedback & data'],
];
export const docs = [
  {
    name: 'Button',
    group: 0,
    description: ['次の行動を、明確に。', 'Make the next action clear.'],
    note: [
      '主操作は1つに絞り、動詞でラベルを付けます。',
      'Use one primary action and a descriptive verb.',
    ],
  },
  {
    name: 'IconButton',
    group: 0,
    description: ['限られたスペースに、明確な操作を。', 'Compact actions with clear meaning.'],
    note: [
      'labelで操作の意味を必ず指定します。',
      'Always provide an accessible label describing the action.',
    ],
  },
  {
    name: 'Link',
    group: 0,
    description: ['情報のつながりを示す。', 'Connect related information.'],
    note: [
      '遷移先が分かる文言を使い、操作にはButtonを使います。',
      'Describe the destination; use Button for actions.',
    ],
  },
  {
    name: 'Badge',
    group: 0,
    description: ['状態を、ひと目で伝える。', 'Communicate status at a glance.'],
    note: ['色だけに頼らず、状態を文字でも表します。', 'Pair color with explicit status text.'],
  },
  {
    name: 'Avatar',
    group: 0,
    description: ['人とチームを識別する。', 'Identify people and teams.'],
    note: [
      'altまたはaria-labelに名前を設定し、画像なしでも識別可能にします。',
      'Provide a name through alt or aria-label for identification without an image.',
    ],
  },
  {
    name: 'Divider',
    group: 0,
    description: ['関連する情報の境界を整える。', 'Separate related groups.'],
    note: [
      '余白だけでは区別しにくい境界に使います。',
      'Use when spacing alone cannot convey grouping.',
    ],
  },
  {
    name: 'Card',
    group: 0,
    description: ['独立した内容をまとめる。', 'Group a self-contained piece of content.'],
    note: [
      '単なる装飾として増やさず、見出しで内容を示します。',
      'Use for meaningful groups and include a heading.',
    ],
  },
  {
    name: 'TextField',
    group: 1,
    description: ['迷わず入力できる基本形。', 'A dependable text input.'],
    note: [
      'プレースホルダーでラベルを代替せず、エラーに修正方法を添えます。',
      'Keep a visible label and explain how to fix errors.',
    ],
  },
  {
    name: 'TextArea',
    group: 1,
    description: ['説明や備考を、十分な広さで。', 'Room for details and context.'],
    note: [
      '長文入力に使い、必要な情報を補助文で示します。',
      'Use for longer input and explain expected content.',
    ],
  },
  {
    name: 'NumberField',
    group: 1,
    description: ['数値を安全に調整する。', 'Adjust numeric values precisely.'],
    note: [
      '単位をラベルに含め、許容範囲を設定します。',
      'Include units in the label and set appropriate bounds.',
    ],
  },
  {
    name: 'SearchField',
    group: 1,
    description: ['探す行動をすぐに始める。', 'Find what matters quickly.'],
    note: ['検索対象が伝わるラベルを付けます。', 'Name the scope of the search.'],
  },
  {
    name: 'Checkbox',
    group: 1,
    description: ['複数の選択肢を独立して選ぶ。', 'Choose independent options.'],
    note: [
      'ラベルをクリックしても切り替えられ、Spaceキーで操作できます。',
      'Use explicit labels; Space toggles the selection.',
    ],
  },
  {
    name: 'RadioGroup',
    group: 1,
    description: ['候補から1つを選ぶ。', 'Choose one option from a set.'],
    note: [
      '少数の排他的な選択に使います。矢印キーで移動できます。',
      'Use for mutually exclusive choices; navigate with arrow keys.',
    ],
  },
  {
    name: 'Switch',
    group: 1,
    description: ['設定をその場で切り替える。', 'Toggle an immediate setting.'],
    note: ['有効時の状態をラベルで表します。', 'Label the enabled state clearly.'],
  },
  {
    name: 'Select',
    group: 1,
    description: ['まとまった候補から選ぶ。', 'Select from a known set.'],
    note: [
      '候補が多い場合はComboBoxを検討します。',
      'Use ComboBox when users need to search a long list.',
    ],
  },
  {
    name: 'ComboBox',
    group: 1,
    description: ['候補を絞り込みながら選ぶ。', 'Search and select an option.'],
    note: [
      '入力で絞り込み、矢印とEnterで選択できます。',
      'Type to filter; use arrows and Enter to select.',
    ],
  },
  {
    name: 'DatePicker',
    group: 1,
    description: ['日付を入力・選択する。', 'Enter or pick a calendar date.'],
    note: [
      '時刻を含まない日付を扱い、入力とカレンダーの両方を提供します。',
      'Use date-only values with both typed input and a calendar.',
    ],
  },
  {
    name: 'DateRangePicker',
    group: 1,
    description: ['開始日と終了日を選ぶ。', 'Select a start and end date.'],
    note: [
      '開始日と終了日をセットで扱い、逆転した範囲はエラーにします。',
      'Keep dates together and reject reversed ranges.',
    ],
  },
  {
    name: 'Slider',
    group: 1,
    description: ['連続値を直感的に調整する。', 'Adjust a value along a range.'],
    note: [
      '正確な数値入力が必要ならNumberFieldを使います。',
      'Prefer NumberField when exact entry matters.',
    ],
  },
  {
    name: 'FileUpload',
    group: 1,
    description: ['ファイルを選び、内容を確認する。', 'Select and review local files.'],
    note: [
      '許容する種類とサイズを示します。この部品は送信を行いません。',
      'Explain allowed types and size. This component does not upload files.',
    ],
  },
  {
    name: 'Tabs',
    group: 2,
    description: ['関連する情報を切り替える。', 'Switch between related views.'],
    note: [
      '同じ文脈の情報に使い、矢印キーで移動できます。',
      'Keep content in one context; navigate with arrow keys.',
    ],
  },
  {
    name: 'Breadcrumbs',
    group: 2,
    description: ['今いる場所を示す。', 'Show the current location.'],
    note: [
      '現在のページを最後に置き、リンクにはしません。',
      'Place the current page last without a link.',
    ],
  },
  {
    name: 'Pagination',
    group: 2,
    description: ['一覧を区切って読み進める。', 'Move through a collection.'],
    note: [
      '現在位置と総ページ数を示し、端の操作は無効にします。',
      'Show the current and total pages; disable boundary actions.',
    ],
  },
  {
    name: 'Menu',
    group: 2,
    description: ['補助的な操作をまとめる。', 'Group secondary actions.'],
    note: [
      '主操作は隠さず、項目には具体的な動詞を使います。',
      'Keep primary actions visible and use specific action labels.',
    ],
  },
  {
    name: 'Tooltip',
    group: 2,
    description: ['短い補足を、必要なときに。', 'Offer concise contextual hints.'],
    note: [
      '必須情報を隠さず、トリガーはフォーカス可能にします。',
      'Do not hide essential information; use a focusable trigger.',
    ],
  },
  {
    name: 'Popover',
    group: 2,
    description: ['その場で補助情報を確認する。', 'Show contextual supporting content.'],
    note: [
      '短い設定や補助情報に使い、Escapeで閉じられます。',
      'Use for short contextual tasks; Escape dismisses it.',
    ],
  },
  {
    name: 'Dialog',
    group: 2,
    description: ['集中して判断・操作する。', 'Focus on a decision or task.'],
    note: [
      '見出しを付け、閉じた後は起点へフォーカスを戻します。',
      'Provide a title and restore focus to the trigger on close.',
    ],
  },
  {
    name: 'Drawer',
    group: 2,
    description: ['文脈を保ったまま詳細を見る。', 'View details alongside the current context.'],
    note: [
      '一覧の詳細や編集に使い、閉じる操作を常に見せます。',
      'Use for detail or editing; keep the close action visible.',
    ],
  },
  {
    name: 'Accordion',
    group: 2,
    description: ['詳細を必要に応じて開く。', 'Reveal details on demand.'],
    note: [
      '見出しで内容を予測できるようにします。',
      'Make each heading describe the hidden content.',
    ],
  },
  {
    name: 'Alert',
    group: 3,
    description: ['重要な情報を画面内で伝える。', 'Surface important inline feedback.'],
    note: [
      '緊急度に応じて色を選び、対処方法を明示します。',
      'Match tone to urgency and explain the next step.',
    ],
  },
  {
    name: 'Toast',
    group: 3,
    description: ['操作の結果を簡潔に伝える。', 'Confirm the result of an action.'],
    note: [
      '補助的な完了通知に使います。明示的に閉じるまで表示します。',
      'Use for noncritical feedback; remains until dismissed.',
    ],
  },
  {
    name: 'Progress',
    group: 3,
    description: ['処理の進み具合を示す。', 'Show progress toward completion.'],
    note: [
      '処理内容をラベルで伝え、進捗不明時は不定状態にします。',
      'Name the operation; use indeterminate when progress is unknown.',
    ],
  },
  {
    name: 'Skeleton',
    group: 3,
    description: ['読み込み中の領域を保つ。', 'Reserve space while content loads.'],
    note: [
      '装飾として読み上げから除外します。読み込み状態は別途通知します。',
      'Hidden from assistive technology; announce loading separately.',
    ],
  },
  {
    name: 'EmptyState',
    group: 3,
    description: ['情報がない理由と次の行動を示す。', 'Explain an empty view and the next step.'],
    note: [
      '初回利用と検索結果なしを区別します。',
      'Distinguish a first-use state from no search results.',
    ],
  },
  {
    name: 'DataTable',
    group: 3,
    description: ['情報を比較し、必要な操作へ。', 'Compare records and take action.'],
    note: [
      '列見出しを明確にし、行IDは安定した一意の値を使います。',
      'Use clear headers and stable unique row IDs.',
    ],
  },
];
