import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  ComboBox,
  DataTable,
  DatePicker,
  DateRangePicker,
  Dialog,
  Divider,
  Drawer,
  EmptyState,
  FileUpload,
  FormaProvider,
  IconButton,
  Link,
  Menu,
  NumberField,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  SearchField,
  Select,
  Skeleton,
  Slider,
  Switch,
  Tabs,
  TextArea,
  TextField,
  Toast,
  Tooltip,
  useForma,
} from '@kurotch-homelab/forma-react';
import type { DataColumn, Density, Locale, Motion, Theme } from '@kurotch-homelab/forma-react';
import type { ReactNode } from 'react';

const names = [
  'Button',
  'IconButton',
  'Link',
  'Badge',
  'Avatar',
  'Divider',
  'Card',
  'TextField',
  'TextArea',
  'NumberField',
  'SearchField',
  'Checkbox',
  'RadioGroup',
  'Switch',
  'Select',
  'ComboBox',
  'DatePicker',
  'DateRangePicker',
  'Slider',
  'FileUpload',
  'Tabs',
  'Breadcrumbs',
  'Pagination',
  'Menu',
  'Tooltip',
  'Popover',
  'Dialog',
  'Drawer',
  'Accordion',
  'Alert',
  'Toast',
  'Progress',
  'Skeleton',
  'EmptyState',
  'DataTable',
] as const;
type Name = (typeof names)[number];
const api: Record<Name, string> = {
  Button: 'variant · size · loading · disabled · onClick · ref',
  IconButton: 'label · variant · size · loading · ref',
  Link: 'href · target · rel · ref',
  Badge: 'tone · children',
  Avatar: 'name · src · size',
  Divider: 'className · style',
  Card: 'children · className · ref',
  TextField: 'label · value / defaultValue · onValueChange · error · description · ref',
  TextArea: 'label · value / defaultValue · onValueChange · rows · ref',
  NumberField: 'label · value: number | null · onValueChange · min · max · step',
  SearchField: 'label · value / defaultValue · onValueChange · ref',
  Checkbox: 'label · checked / defaultChecked · onCheckedChange · indeterminate · ref',
  RadioGroup: 'label · options · value / defaultValue · onValueChange · name',
  Switch: 'label · checked / defaultChecked · onCheckedChange · ref',
  Select: 'label · options · value / defaultValue · onValueChange · ref',
  ComboBox: 'label · options · value / defaultValue · onValueChange · ref',
  DatePicker: 'label · value: YYYY-MM-DD · min · max · onValueChange',
  DateRangePicker: 'label · value: { start, end } · onValueChange · required · error',
  Slider: 'label · value / defaultValue · min · max · step · onValueChange',
  FileUpload: 'label · accept · maxBytes · maxFiles · value · onValueChange · onReject',
  Tabs: 'label · items · value / defaultValue · onValueChange',
  Breadcrumbs: 'items: { label, href? }[] · label',
  Pagination: 'total · pageSize · page / defaultPage · onPageChange',
  Menu: 'label · items · onAction · open / defaultOpen · onOpenChange',
  Tooltip: 'content · children: focusable element',
  Popover: 'label · children · open / defaultOpen · onOpenChange',
  Dialog: 'title · trigger · open / defaultOpen · onOpenChange · footer · ref',
  Drawer: 'title · trigger · open / defaultOpen · onOpenChange · footer · ref',
  Accordion: 'items · value / defaultValue · onValueChange · multiple',
  Alert: 'title · tone · role · children',
  Toast: 'open / defaultOpen · onOpenChange · children',
  Progress: 'label · value · max · showValue',
  Skeleton: 'width · height · style',
  EmptyState: 'title · description · icon · action',
  DataTable:
    'rows · columns · getRowId · query · filter · sort · page · selectedKeys · visibleColumns',
};
const snippets: Record<Name, string> = {
  Button: '<Button variant="primary" onClick={save}>Save</Button>',
  IconButton: '<IconButton label="Settings">⚙</IconButton>',
  Link: '<Link href="/projects">Projects</Link>',
  Badge: '<Badge tone="success">Active</Badge>',
  Avatar: '<Avatar name="Yamada" size={40} />',
  Divider: '<Divider />',
  Card: '<Card><h3>Project details</h3><p>Review before saving.</p></Card>',
  TextField: '<TextField label="Name" value={name}\n  onValueChange={setName} error={error} />',
  TextArea: '<TextArea label="Notes" defaultValue="" rows={4} />',
  NumberField:
    '<NumberField label="Budget" min={0} step={1000}\n  value={budget} onValueChange={setBudget} />',
  SearchField: '<SearchField label="Search" value={query} onValueChange={setQuery} />',
  Checkbox: '<Checkbox label="Email updates" defaultChecked />',
  RadioGroup: '<RadioGroup label="Plan" options={plans}\n  defaultValue="standard" name="plan" />',
  Switch: '<Switch label="Auto-save" checked={enabled}\n  onCheckedChange={setEnabled} />',
  Select: '<Select label="Team" options={teams} defaultValue="design" />',
  ComboBox: '<ComboBox label="Team" options={teams} />',
  DatePicker: '<DatePicker label="Due date" defaultValue="2026-11-20" />',
  DateRangePicker:
    '<DateRangePicker label="Period" value={range}\n  onValueChange={setRange} name="period" required />',
  Slider: '<Slider label="Volume" defaultValue={50} min={0} max={100} />',
  FileUpload:
    '<FileUpload label="Attachments" accept=".pdf"\n  maxBytes={5 * 1024 * 1024} onValueChange={setFiles} />',
  Tabs: '<Tabs label="Project sections" items={tabs} defaultValue="overview" />',
  Breadcrumbs: '<Breadcrumbs items={[{ label: "Home", href: "/" },\n  { label: "Projects" }]} />',
  Pagination: '<Pagination total={120} pageSize={10}\n  page={page} onPageChange={setPage} />',
  Menu: '<Menu label="Actions" items={actions} onAction={handleAction} />',
  Tooltip:
    '<Tooltip content="Display settings">\n  <IconButton label="Display settings">⚙</IconButton>\n</Tooltip>',
  Popover:
    '<Popover label="Display settings">\n  <Checkbox label="Show completed" defaultChecked />\n</Popover>',
  Dialog:
    '<Dialog title="Edit project" open={open} onOpenChange={setOpen}\n  trigger="Edit" footer={<Button onClick={save}>Save</Button>}>\n  <TextField label="Name" value={name} onValueChange={setName} />\n</Dialog>',
  Drawer:
    '<Drawer title="Project details" trigger="Details">\n  <p>Supporting details without losing context.</p>\n</Drawer>',
  Accordion: '<Accordion items={questions} multiple={false} />',
  Alert: '<Alert tone="info" title="Changes are local">No server connection.</Alert>',
  Toast: '<Toast open={saved} onOpenChange={setSaved}>Changes saved</Toast>',
  Progress: '<Progress label="Import" value={progress} />',
  Skeleton:
    '<div role="group" aria-busy="true" aria-label="Loading">\n  <Skeleton width="60%" height={20} />\n</div>',
  EmptyState:
    '<EmptyState title="No projects" description="Start with a new project."\n  action={<Button onClick={createProject}>New project</Button>} />',
  DataTable:
    'type Project = { id: string; name: string; budget: number };\nconst columns: DataColumn<Project>[] = [\n  { key: "name", header: "Project", accessor: row => row.name },\n  { key: "budget", header: "Budget", accessor: row => row.budget, align: "right" },\n];\n<DataTable label="Projects" rows={projects} columns={columns}\n  getRowId={row => row.id} selectable pageSize={10} />',
};
function Code({ code }: { code: string }) {
  const { t } = useForma();
  const [copied, setCopied] = useState(false);
  return (
    <div className="react-code">
      <div className="react-row">
        <span>TSX</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? t('コピーしました', 'Copied') : t('コピー', 'Copy')}
        </Button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
function FieldExample() {
  const { t } = useForma();
  const [name, setName] = useState('');
  const [submitted, submit] = useState(false);
  return (
    <form
      className="react-stack"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit(true);
      }}
      onReset={() => {
        setName('');
        submit(false);
      }}
    >
      <TextField
        name="name"
        label={t('案件名', 'Project name')}
        required
        value={name}
        onValueChange={setName}
        description={t('一覧で識別できる名前を入力します。', 'Use a name your team can identify.')}
        error={
          submitted && !name.trim()
            ? t('案件名を入力してください。', 'Enter a project name.')
            : undefined
        }
      />
      <TextField
        name="team"
        label={t('所属チーム（非制御）', 'Team (uncontrolled)')}
        defaultValue="Design"
      />
      <div className="react-row">
        <Button type="submit" variant="primary">
          {t('入力を確認', 'Validate')}
        </Button>
        <Button type="reset">{t('リセット', 'Reset')}</Button>
      </div>
      {submitted && name.trim() && (
        <Alert tone="success">{t('入力内容を確認しました。', 'The values are valid.')}</Alert>
      )}
    </form>
  );
}
interface Project {
  id: string;
  name: string;
  amount: number;
  status: 'active' | 'done';
}
function TableExample() {
  const { t, locale } = useForma();
  const [rows, setRows] = useState<Project[]>(
    Array.from({ length: 24 }, (_, i) => ({
      id: String(i + 1),
      name: `Project ${String(i + 1).padStart(2, '0')}`,
      amount: ((i % 7) + 1) * 120000,
      status: i % 3 ? 'active' : 'done',
    })),
  );
  const [status, setStatus] = useState('all'),
    [editing, setEditing] = useState<Project | null>(null),
    [open, setOpen] = useState(false),
    [saved, setSaved] = useState(false);
  const columns: DataColumn<Project>[] = [
    {
      key: 'name',
      header: t('案件名', 'Project'),
      accessor: (row) => row.name,
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditing({ ...row });
            setOpen(true);
          }}
        >
          {row.name}
        </Button>
      ),
    },
    {
      key: 'amount',
      header: t('予算', 'Budget'),
      accessor: (row) => row.amount,
      align: 'right',
      render: (row) =>
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'JPY',
          maximumFractionDigits: 0,
        }).format(row.amount),
    },
    {
      key: 'status',
      header: t('ステータス', 'Status'),
      accessor: (row) => (row.status === 'active' ? t('進行中', 'Active') : t('完了', 'Completed')),
      render: (row) => (
        <Badge tone={row.status === 'active' ? 'info' : 'success'}>
          {row.status === 'active' ? t('進行中', 'Active') : t('完了', 'Completed')}
        </Badge>
      ),
    },
  ];
  return (
    <div className="react-table-example">
      <DataTable
        label={t('案件一覧', 'Projects')}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        getRowLabel={(row) => row.name}
        selectable
        pageSize={5}
        filter={(row) => status === 'all' || row.status === status}
        toolbar={
          <Select
            label={t('ステータスで絞り込み', 'Filter by status')}
            value={status}
            onValueChange={setStatus}
            options={[
              { value: 'all', label: t('すべて', 'All') },
              { value: 'active', label: t('進行中', 'Active') },
              { value: 'done', label: t('完了', 'Completed') },
            ]}
          />
        }
      />
      <Dialog title={t('案件を編集', 'Edit project')} open={open} onOpenChange={setOpen}>
        {editing && (
          <form
            className="react-stack"
            onSubmit={(event) => {
              event.preventDefault();
              setRows(rows.map((row) => (row.id === editing.id ? editing : row)));
              setOpen(false);
              setSaved(true);
            }}
          >
            <TextField
              label={t('案件名', 'Project name')}
              value={editing.name}
              onValueChange={(name) => setEditing({ ...editing, name })}
              required
            />
            <NumberField
              label={t('予算', 'Budget')}
              min={0}
              value={editing.amount}
              onValueChange={(amount) => setEditing({ ...editing, amount: amount ?? 0 })}
            />
            <Button type="submit" variant="primary">
              {t('保存', 'Save')}
            </Button>
          </form>
        )}
      </Dialog>
      <Toast open={saved} onOpenChange={setSaved}>
        {t('変更を保存しました', 'Changes saved')}
      </Toast>
    </div>
  );
}
function Sample({ name }: { name: Name }) {
  const { t } = useForma();
  const [count, setCount] = useState(0),
    [busy, setBusy] = useState(false),
    [open, setOpen] = useState(false),
    [progress, setProgress] = useState(35);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const teams = [
    { value: 'design', label: t('デザイン', 'Design') },
    { value: 'engineering', label: t('開発', 'Engineering') },
    { value: 'operations', label: t('運用', 'Operations') },
  ];
  const samples: Record<Name, ReactNode> = {
    Button: (
      <div className="react-row">
        <Button
          variant="primary"
          loading={busy}
          onClick={() => {
            setBusy(true);
            timer.current = setTimeout(() => {
              setBusy(false);
              setCount((n) => n + 1);
            }, 700);
          }}
        >
          {busy ? t('保存中', 'Saving') : t('保存', 'Save')}
        </Button>
        <Button>{t('キャンセル', 'Cancel')}</Button>
        <Button disabled>{t('無効', 'Disabled')}</Button>
        <span role="status">{count ? t(`${count}回保存`, `Saved ${count} times`) : ''}</span>
      </div>
    ),
    IconButton: (
      <IconButton
        label={t('表示設定', 'Display settings')}
        aria-pressed={!!count}
        onClick={() => setCount(count ? 0 : 1)}
      >
        ⚙
      </IconButton>
    ),
    Link: (
      <Link href="/#guides/motion">
        {t('動きのガイドラインを読む', 'Read the motion guidelines')}
      </Link>
    ),
    Badge: (
      <div className="react-row">
        <Badge>{t('下書き', 'Draft')}</Badge>
        <Badge tone="info">{t('進行中', 'Active')}</Badge>
        <Badge tone="success">{t('完了', 'Completed')}</Badge>
        <Badge tone="warning">{t('要確認', 'Review')}</Badge>
        <Badge tone="danger">{t('エラー', 'Error')}</Badge>
      </div>
    ),
    Avatar: (
      <div className="react-row">
        <Avatar name={t('山田 太郎', 'Taro Yamada')} />
        <Avatar name="Design" size={44} />
        <span>
          {t(
            '名前から代替表示を生成します。',
            'A name supplies the accessible label and fallback.',
          )}
        </span>
      </div>
    ),
    Divider: (
      <div>
        {t('案件の概要', 'Project overview')}
        <Divider />
        {t('関連する情報', 'Related information')}
      </div>
    ),
    Card: (
      <Card>
        <strong>{t('レビューの準備', 'Ready for review')}</strong>
        <p>
          {t('担当者と期日を確認して共有します。', 'Check the owner and due date before sharing.')}
        </p>
        <Button onClick={() => setCount((n) => n + 1)}>{t('内容を確認', 'Review details')}</Button>
        <span role="status">{count ? t('確認しました', 'Reviewed') : ''}</span>
      </Card>
    ),
    TextField: <FieldExample />,
    TextArea: (
      <TextArea
        label={t('補足事項', 'Notes')}
        placeholder={t('引き継ぎたい情報を入力', 'Add context for your team')}
      />
    ),
    NumberField: (
      <NumberField
        label={t('予算（円）', 'Budget (JPY)')}
        defaultValue={120000}
        min={0}
        step={1000}
      />
    ),
    SearchField: (
      <SearchField
        label={t('案件を検索', 'Search projects')}
        description={t(
          '入力はこのフィールド内で保持されます。表の検索はDataTableを参照。',
          'Input stays in this field. See DataTable for filtering.',
        )}
      />
    ),
    Checkbox: (
      <div className="react-stack">
        <Checkbox label={t('更新通知を受け取る', 'Receive updates')} defaultChecked />
        <Checkbox label={t('管理者のみ変更可能', 'Administrator only')} disabled />
      </div>
    ),
    RadioGroup: (
      <RadioGroup
        label={t('担当チーム', 'Responsible team')}
        options={teams}
        defaultValue="design"
        name="sample-team"
      />
    ),
    Switch: <Switch label={t('自動保存', 'Auto-save')} defaultChecked />,
    Select: <Select label={t('チーム', 'Team')} options={teams} defaultValue="design" />,
    ComboBox: (
      <ComboBox
        label={t('チームを入力・選択', 'Enter or choose a team')}
        options={teams}
        description={t(
          '候補にない値も入力できます。',
          'Free text is allowed; suggestions use the browser UI.',
        )}
      />
    ),
    DatePicker: (
      <DatePicker
        label={t('期限', 'Due date')}
        defaultValue="2026-11-20"
        description={t(
          '値はYYYY-MM-DD。カレンダー表示はブラウザ・OSに従います。',
          'Values use YYYY-MM-DD. Calendar presentation follows the browser and OS.',
        )}
      />
    ),
    DateRangePicker: (
      <DateRangePicker
        label={t('実施期間', 'Project period')}
        defaultValue={{ start: '2026-11-10', end: '2026-11-20' }}
        name="period"
      />
    ),
    Slider: <Slider label={t('表示倍率', 'Zoom level')} defaultValue={50} min={0} max={100} />,
    FileUpload: (
      <FileUpload
        label={t('添付ファイル', 'Attachments')}
        accept=".pdf"
        maxBytes={5 * 1024 * 1024}
        maxFiles={3}
        multiple
        description={t(
          'PDF、各5MB以下、3件まで。選択のみで送信しません。',
          'PDF only, up to 5 MB each, 3 files. Local selection only.',
        )}
      />
    ),
    Tabs: (
      <Tabs
        label={t('案件の詳細', 'Project sections')}
        items={[
          {
            id: 'overview',
            label: t('概要', 'Overview'),
            content: t('進行状況と担当者を確認できます。', 'Review progress and ownership.'),
          },
          {
            id: 'activity',
            label: t('履歴', 'Activity'),
            content: t('最近の変更を確認できます。', 'Review recent changes.'),
          },
          { id: 'locked', label: t('準備中', 'Unavailable'), content: '', disabled: true },
        ]}
      />
    ),
    Breadcrumbs: (
      <Breadcrumbs
        items={[
          { label: 'Forma', href: '/' },
          { label: 'React', href: '#top' },
          { label: t('コンポーネント', 'Components') },
        ]}
      />
    ),
    Pagination: <Pagination total={120} pageSize={10} />,
    Menu: (
      <div className="react-row">
        <Menu
          label={t('操作', 'Actions')}
          items={[
            { id: 'duplicate', label: t('複製', 'Duplicate') },
            { id: 'archive', label: t('アーカイブ', 'Archive') },
            { id: 'delete', label: t('削除（権限なし）', 'Delete (restricted)'), disabled: true },
          ]}
          onAction={() => setCount((n) => n + 1)}
        />
        <span role="status">{count ? t(`${count}回実行`, `${count} actions run`) : ''}</span>
      </div>
    ),
    Tooltip: (
      <Tooltip content={t('列や表示密度を調整', 'Adjust columns and density')}>
        <IconButton label={t('表示設定', 'Display settings')}>⚙</IconButton>
      </Tooltip>
    ),
    Popover: (
      <Popover label={t('表示設定', 'Display settings')}>
        <div className="react-stack">
          <Checkbox label={t('完了した案件も表示', 'Include completed projects')} defaultChecked />
          <Switch label={t('コンパクトな行', 'Compact rows')} />
        </div>
      </Popover>
    ),
    Dialog: (
      <Dialog
        title={t('案件の設定', 'Project settings')}
        trigger={t('ダイアログを開く', 'Open dialog')}
        description={t('保存せず閉じることもできます。', 'You can close without saving.')}
      >
        <TextField label={t('案件名', 'Project name')} defaultValue="Design system" />
      </Dialog>
    ),
    Drawer: (
      <Drawer
        title={t('案件の詳細', 'Project details')}
        trigger={t('ドロワーを開く', 'Open drawer')}
      >
        <div className="react-stack">
          <Badge tone="info">{t('進行中', 'Active')}</Badge>
          <TextArea label={t('メモ', 'Notes')} />
          <p>{t('Escapeキーで元の操作へ戻れます。', 'Press Escape to return to the trigger.')}</p>
        </div>
      </Drawer>
    ),
    Accordion: (
      <Accordion
        items={[
          {
            id: 'dependencies',
            title: t('外部依存はありますか？', 'What are the runtime dependencies?'),
            content: t(
              'Reactのみです。CSSとトークンは同梱しています。',
              'React only. CSS and design tokens are included.',
            ),
          },
          {
            id: 'motion',
            title: t('動きを減らせますか？', 'Can motion be reduced?'),
            content: t(
              'OS設定、またはProviderのmotion="reduce"で切り替えられます。',
              'Use your OS setting or motion="reduce" on FormaProvider.',
            ),
          },
        ]}
      />
    ),
    Alert: (
      <Alert title={t('ローカルで操作できます', 'Try everything locally')} tone="info">
        {t(
          'このサンプルはサーバーにデータを送信しません。',
          'This example does not submit data to a server.',
        )}
      </Alert>
    ),
    Toast: (
      <>
        <Button onClick={() => setOpen(true)}>
          {t('保存通知を表示', 'Show saved notification')}
        </Button>
        <Toast open={open} onOpenChange={setOpen}>
          {t('変更を保存しました', 'Changes saved')}
        </Toast>
      </>
    ),
    Progress: (
      <div className="react-stack">
        <Progress label={t('処理の進捗', 'Processing progress')} value={progress} />
        <Button onClick={() => setProgress(progress >= 100 ? 0 : Math.min(100, progress + 15))}>
          {t('進捗を更新', 'Update progress')}
        </Button>
      </div>
    ),
    Skeleton: (
      <div
        role="group"
        aria-busy="true"
        aria-label={t('読み込み中', 'Loading')}
        className="react-stack"
      >
        <Skeleton width="40%" height={20} />
        <Skeleton />
        <Skeleton width="75%" />
      </div>
    ),
    EmptyState: (
      <EmptyState
        title={
          count
            ? t('案件を追加しました', 'Project added')
            : t('案件がありません', 'No projects yet')
        }
        description={t('最初の案件から始めましょう。', 'Start by adding your first project.')}
        icon="+"
        action={
          <Button variant="primary" onClick={() => setCount(1)}>
            {t('案件を追加', 'Add project')}
          </Button>
        }
      />
    ),
    DataTable: <TableExample />,
  };
  return samples[name];
}
function Content() {
  const { t } = useForma();
  const [query, setQuery] = useState('');
  const visible = names.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <>
      <nav className="react-mobile-nav" aria-label={t('コンポーネントへ移動', 'Jump to component')}>
        <Select
          label={t('コンポーネントへ移動', 'Jump to component')}
          options={names.map((name) => ({ value: name, label: name }))}
          onValueChange={(name) => {
            location.hash = name;
          }}
        />
      </nav>
      <div className="react-layout">
        <aside className="react-nav">
          <SearchField
            label={t('コンポーネントを検索', 'Search components')}
            value={query}
            onValueChange={setQuery}
          />
          <nav aria-label={t('Reactコンポーネント', 'React components')}>
            {visible.map((name) => (
              <a key={name} href={`#${name}`}>
                {name}
              </a>
            ))}
          </nav>
        </aside>
        <main className="react-main" id="main" tabIndex={-1}>
          <section className="react-intro" id="top">
            <span className="react-eyebrow">FORMA / REACT</span>
            <h1>{t('共通のデザインを、Reactで。', 'The same design. Ready for React.')}</h1>
            <p>
              {t(
                '35のコンポーネント。Formaの文字・余白・色・動きをそのままに、状態と操作をReactから扱えます。',
                '35 components with Forma’s typography, spacing, color, and motion. Manage state and interactions directly from React.',
              )}
            </p>
            <div className="react-row">
              <Badge tone="info">@kurotch-homelab/forma-react</Badge>
              <Badge>TypeScript</Badge>
              <Badge>{t('実行時依存：Reactのみ', 'Runtime: React only')}</Badge>
            </div>
            <Code
              code={
                'import { FormaProvider, Button } from "@kurotch-homelab/forma-react";\nimport "@kurotch-homelab/forma-react/styles.css";\n\n<FormaProvider locale="ja" theme="system" density="comfortable">\n  <Button variant="primary" onClick={save}>Save</Button>\n</FormaProvider>'
              }
            />
          </section>
          {visible.map((name, index) => (
            <section className="react-section" key={name} id={name} data-component={name}>
              <div className="react-section-header">
                <h2>{name}</h2>
                <small>{String(index + 1).padStart(2, '0')} / 35</small>
              </div>
              <div className="react-sample">
                <Sample name={name} />
              </div>
              <p className="react-api">{api[name]}</p>
              <details>
                <summary>{t('使用例を見る', 'View usage')}</summary>
                <Code code={snippets[name]} />
              </details>
              <p>
                <Link href={`/#components/${name}`}>
                  {t('使い分け・アクセシビリティの指針', 'Usage & accessibility guidelines')} ↗
                </Link>
              </p>
            </section>
          ))}
          {!visible.length && (
            <EmptyState title={t('該当するコンポーネントがありません', 'No matching components')} />
          )}
        </main>
      </div>
    </>
  );
}
function read<T extends string>(key: string, options: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key) as T;
    return options.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
function App() {
  const [locale, setLocale] = useState<Locale>(() => read('forma-locale', ['ja', 'en'], 'ja'));
  const [theme, setTheme] = useState<Theme>(() =>
    read('forma-theme', ['light', 'dark', 'system'], 'system'),
  );
  const [density, setDensity] = useState<Density>('comfortable');
  const [motion, setMotion] = useState<Motion>(() =>
    read('forma-motion', ['system', 'reduce'], 'system'),
  );
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem('forma-locale', locale);
      localStorage.setItem('forma-theme', theme);
      localStorage.setItem('forma-motion', motion);
    } catch {
      /* Storage is optional. */
    }
  }, [locale, theme, motion]);
  const t = (ja: string, en: string) => (locale === 'ja' ? ja : en);
  return (
    <FormaProvider
      locale={locale}
      theme={theme}
      density={density}
      motion={motion}
      className="react-app"
    >
      <header className="react-header">
        <a href="#main" className="react-skip">
          {t('本文へ移動', 'Skip to content')}
        </a>
        <a className="react-brand" href="/">
          forma<span>.</span> / React
        </a>
        <div className="react-controls">
          <Select
            label={t('言語', 'Language')}
            value={locale}
            onValueChange={(value) => setLocale(value as Locale)}
            options={[
              { value: 'ja', label: '日本語' },
              { value: 'en', label: 'English' },
            ]}
          />
          <Select
            label={t('テーマ', 'Theme')}
            value={theme}
            onValueChange={(value) => setTheme(value as Theme)}
            options={[
              { value: 'system', label: t('OS設定', 'System') },
              { value: 'light', label: t('ライト', 'Light') },
              { value: 'dark', label: t('ダーク', 'Dark') },
            ]}
          />
          <Select
            label={t('密度', 'Density')}
            value={density}
            onValueChange={(value) => setDensity(value as Density)}
            options={[
              { value: 'comfortable', label: t('標準', 'Default') },
              { value: 'compact', label: t('コンパクト', 'Compact') },
            ]}
          />
          <Select
            label={t('動き', 'Motion')}
            value={motion}
            onValueChange={(value) => setMotion(value as Motion)}
            options={[
              { value: 'system', label: t('OS設定', 'System') },
              { value: 'reduce', label: t('減らす', 'Reduce') },
            ]}
          />
        </div>
      </header>
      <Content />
    </FormaProvider>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
