# Forma — Framework-independent design guidelines

ビジネス向けの、端正なデザインガイドラインです。色・文字・余白・操作の原則、35種のHTMLパターン、日英カタログ、業務画面と企業サイトの参考例を含みます。

React向けには、同じトークンとCSSに準拠した任意の35部品パッケージ **`@kurotch-homelab/forma-react`** を提供します。[導入・API](./packages/react/README.md)、[ローカルプレビュー](http://127.0.0.1:5173/react/index.html)から確認できます。

別のプロジェクトへ導入する場合は、[forma-design-systemスキル](./skills/forma-design-system/README.md)を利用できます。スキルはGitHub PackagesからReact・CSS・トークンを導入し、書体・設計/API資料・導入補助を提供します。元リポジトリのcheckoutは不要です。

スキルにパッケージの`.tgz`や配布CSS・トークンは含めません。`npm run build:skill`で導入情報を生成し、`npm run test:skill`でバージョン指定・競合保護・移行を検証します。`npm run test:skill:consumer`はテスト用レジストリから3パッケージを取得し、独立したReact/HTMLプロジェクトの画面・書体・アクセシビリティを確認します。

パッケージの取得にはGitHub Packagesの認証が必要です。[利用者向け設定](./docs/github-packages.md)、[公開手順](./docs/publishing.md)を参照してください。

**特定のフレームワーク、UIライブラリ、JSランタイムは必要ありません。** ガイドラインだけを採用することも、CSSを1枚読み込むこともできます。

## 使い方

- 設計の原則と実装時の要件：[GUIDELINES.md](./GUIDELINES.md)
- トークン：`packages/tokens/dist/tokens.css` / `tokens.json`
- 単独で使えるスタイル：`packages/styles/dist/forma.css`（トークンを同梱）
- カタログ：`apps/catalog/dist/index.html`（HTTPサーバー経由で閲覧）

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@400;500;600&amp;display=swap"
/>
<link rel="stylesheet" href="forma.css" />

<div class="forma" data-theme="light" data-density="comfortable">
  <label for="company">会社名</label>
  <input id="company" class="f-input" type="text" />
  <button class="f-button f-button--primary" type="button">保存</button>
</div>
```

CSSの読み込みにnpmは不要です。React / Vue / Svelte、サーバーテンプレート、素のHTMLなど、利用する技術を選びません。`.forma`が文字・背景・基本スタイルの適用範囲です。トークンのみを利用する場合は`tokens.css`または`tokens.json`を使います。

## ビルド・ローカル起動

Node.js 22以上が必要です。React版を含む全体のビルド・起動は次のとおりです。

```sh
npm ci
npm run dev
```

ビルド後に http://127.0.0.1:5173 で起動します。自動リロードはありません。ソース変更後は別のターミナルで`npm run build`を実行し、ブラウザを再読み込みしてください。

```sh
npm run build
npm run check
npm test
```

生成された`apps/catalog/dist`は、静的HTTPサーバーでそのまま配信できます。React版の型定義・ES ModulesにはTypeScript、Reactプレビューだけにesbuildを使います。Reactコンポーネントの使用例は`/react/index.html`です。

ガイドライン・CSS・HTMLカタログだけなら、従来どおりインストールなしで`npm run dev:guides`または`npm run build:guides`を実行できます。

## 構成と依存関係

| 対象                            | 内容                                                         | 実行時の外部依存       |
| ------------------------------- | ------------------------------------------------------------ | ---------------------- |
| ガイドライン                    | 原則、トークンの意味、HTML構造、操作・アクセシビリティの要件 | なし                   |
| `@kurotch-homelab/forma-tokens` | CSS変数とJSON                                                | なし                   |
| `@kurotch-homelab/forma-styles` | 単独配布できるCSS                                            | なし                   |
| カタログ                        | 標準HTML / CSS / JavaScriptの参考画面                        | Google Fontsの書体配信 |
| `@kurotch-homelab/forma-react`  | 型付きReactコンポーネント35種・共有CSS                       | Reactのみ（peer）      |
| Reactプレビュー                 | 実際のパッケージをimportする日英の操作例                     | React / React DOM      |
| ビルド・検証ツール              | TypeScript、型定義、esbuild、Playwright、axe                 | 開発時のみ             |

標準書体は**IBM Plex Sans JP**です。カタログはGoogle Fontsから400・500・600を`display=swap`で読み込みます。本文400、ラベル500、見出し600を使い、通常の字間は0、短い上部ラベルは0.08emに揃えています。ガイドとCSSにJavaScriptの実行時依存はありません。React版もReact以外の実行時ライブラリを要求しません。

配布CSSはIBM Plex Sans JPを先頭にしたフォント指定を持ちますが、フォントファイルや外部CSSの自動読み込みは含みません。利用先では上記の`link`を追加するか、同じ書体をセルフホストしてください。未読込・オフライン時にはシステム書体へフォールバックします。カタログは静的なES modulesで、プロダクトにそのJavaScriptを組み込む必要はありません。

書体の比較ページは`/font-study.html`です。採用したIBM Plex Sans JP、Zen Kaku Gothic New、BIZ UDPGothicと以前のシステム書体を比較できます。

## ガイドラインと参考実装の境界

カタログの「パターンの選び方」「操作状態」「良い例・避ける例」では、12の目的別選択、9種類の状態、4組の比較と判断理由を確認できます。全35パターンにも用途・避けること・理由を掲載しています。Fluent 2とMaterial Designの公式ガイドを設計上の参考としており、参考元とForma独自の判断はガイドライン末尾に記載しています。設計ガイド自体に追加パッケージは不要です。

既存カタログの35種は標準HTMLの構造とデザインの使用例で、コード表示もHTML構造例です。別パッケージのReact版は、この指針に沿った状態更新・キーボード操作・フォーカス管理を実装します。Reactプレビューのコード表示はTSXです。

- 入力・選択・開閉は可能な限り標準の`input`、`select`、`datalist`、`details`、`dialog`、`popover`を使用します。
- 日付の値は`YYYY-MM-DD`です。カレンダーの表示・言語・見た目はOSとブラウザに依存します。
- `datalist`は候補提示であり、自由入力を許可します。候補に限定する必要がある場合は`select`などを選びます。
- 独自タブ・メニュー・表の検索・通知・妥当性検証は、カタログ内の参考用JavaScriptで動きます。配布CSSにはこれらの動作は含みません。
- 実製品の状態管理、データ保存、キーボード操作、フォーカス復帰、エラー通知は利用先で実装・検証します。ガイドラインに必要な振る舞いを記載しています。

`data-theme="light|dark"`と`data-density="comfortable|compact"`で表示を指定できます。OS設定への追従、テーマの保存、業務文言の翻訳は利用側が担当します。カタログではテーマと言語の選択をlocalStorageに保存します。

```css
/* forma.cssの後に読み込む */
.forma[data-theme='light'] {
  --f-brand: #2459cf;
  --f-brand-hover: #1f4db5;
  --f-brand-pressed: #1a4096;
  --f-on-brand: #ffffff;
  --f-brand-subtle: #edf2ff;
  --f-focus: #2459cf;
}
```

ブランド色変更時は、文字色と背景色を合わせて検証してください。トークンは基本色 → 意味別 → 部品別の3層です。Web以外の環境でもJSONから意味別トークンを利用できます。

## GitHub Packagesから導入する

[レジストリと認証](./docs/github-packages.md)を設定した利用先プロジェクトで、必要なパッケージをインストールします。CSSとトークンはReactなしで利用できます。

```sh
npm install @kurotch-homelab/forma-react@0.1.2
# CSSのみ
npm install @kurotch-homelab/forma-styles@0.2.2
# トークンのみ
npm install @kurotch-homelab/forma-tokens@0.1.2
```

`forma-styles`のCSSはトークンを含む単独スタイルです。React版も共有CSSを含み、Reactのみをpeer dependencyとします。導入先のlockfileでバージョン・取得URL・integrityを保持してください。

```tsx
import { FormaProvider, Button } from '@kurotch-homelab/forma-react';
import '@kurotch-homelab/forma-react/styles.css';

<FormaProvider locale="ja" theme="system" density="comfortable" motion="system">
  <Button variant="primary" onClick={save}>
    保存
  </Button>
</FormaProvider>;
```

## 検証

Node.js標準テストでは、依存ゼロの契約、全35パターンのHTMLと判断基準、状態色のコントラスト、ファイル検証、日付範囲、検索・並べ替え、HTMLエスケープを確認します。

React版のビルド・型検査とブラウザ検証には開発依存をインストールしてください。

```sh
npm ci
npx playwright install chromium
npm run test:e2e
```

日英×ライト／ダーク、390 / 768 / 1440pxでの画面表示、全35パターンのaxe検査、案件の検索・編集、入力エラー、日付範囲、キーボード操作とフォーカス復帰を確認します。画像は`output/playwright`、失敗時のトレースは`test-results`に生成されます。

4つの設計ガイドは320 / 768 / 1440pxでも確認します。目的別の推奨表示、状態見本の切り替え、保存中のフォーカス維持、選択状態、無効ボタンのホバーもブラウザで検証します。動きについてはオーバーレイの連続開閉、通知の置き換え、OS設定の途中変更、動きを減らした状態での操作も確認します。

React版は全35部品のexport、SSRでの描画とID一意性、共有CSSとの一致、フォームの制御/非制御とreset、日付範囲、ファイル検証、タブ/メニューのキーボード操作、連続開閉のフォーカス復帰、表の検索/ソート/ページ/選択/列表示/編集を検証します。日英×ライト/ダーク、390 / 768 / 1440pxのプレビューも対象です。

`dialog`、`popover`、CSS `:has()`などを備えたモダンブラウザを対象にします。標準入力UIの違いは許容します。自動検査はアクセシビリティの完全な適合認証ではないため、採用先でも支援技術を含めて確認してください。

## 画面例

`/#guides/motion`で「動きと遷移」のガイドを開けます。操作の反応120ms、出入り180ms、大きな開閉240msのCSSを配布スタイルにも同梱しています。追加のnpmパッケージはありません。OSの動き軽減設定に従うほか、`.forma`に`data-motion="reduce"`を指定できます。カタログではガイド内の設定を保存し、動きだけを止めて同じ操作を試せます。新しいCSSに非対応のブラウザは、標準の即時開閉に戻ります。

案件管理と「stride」企業サイトは架空の参考画面です。案件の追加・編集はブラウザのメモリー内に保持し、ページ移動や再読み込みで初期化されます。バックエンド、認証、登録受付、実ファイル送信、外部ホスティングは含みません。

## ライセンス

Formaのコード、設計資料、サンプル、CSS、トークンは[MIT License](./LICENSE)です。同梱のIBM Plex Sans JPはSIL OFL 1.1です。詳細と書体の出典は[Third-party notices](./THIRD_PARTY_NOTICES.md)を参照してください。ファイルを直接コピーする場合もライセンス表示を保持してください。

## English quick start

Forma is a design guideline, not a UI framework. Read `GUIDELINES.md`, share CSS/JSON tokens, or copy the standalone `forma.css` file. No providers or external JavaScript libraries are required. The standard typeface is IBM Plex Sans JP (400/500/600), loaded from Google Fonts in the catalog. Consumer projects load or self-host the font separately; system fonts provide a fallback. The catalog is plain HTML/CSS/JavaScript and demonstrates 35 patterns; its interaction code is not part of the CSS distribution.

With Node.js 22+, run `npm ci` and `npm run dev`, then open http://127.0.0.1:5173. The optional React package is `@kurotch-homelab/forma-react`; its bilingual preview is at `/react/index.html`. Import its components and `@kurotch-homelab/forma-react/styles.css`, then wrap your application in `FormaProvider`. React is its only runtime peer dependency. Native date and datalist interfaces vary by browser and OS.

For the framework-independent guides alone, `npm run dev:guides` / `npm run build:guides` still require no installation. TypeScript builds the React package; esbuild bundles only the preview app. Browser checks use Playwright and axe; install Chromium with `npx playwright install chromium`. Use `npm run build` after edits and reload the browser.

Published packages are installed from GitHub Packages with authentication. See [registry setup](./docs/github-packages.md). The skill contains no package archives or compiled library CSS/tokens; its installer prepares pinned dependencies, then syncs assets from installed packages.
