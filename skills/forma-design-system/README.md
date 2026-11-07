# Forma導入スキル

このフォルダを丸ごと移すだけで使えるスキルです。Formaの元リポジトリやローカルカタログを必要としません。

npmアーカイブのパッケージ名は`@kurotch-homelab/forma-design-system-skill`です。リポジトリのこのフォルダをコピーするか、配布アーカイブを展開して使用できます。専用のレジストリやポータルは必要ありません。

パッケージ自体にnpm依存やinstall/postinstallスクリプトはありません。Node.js標準機能のみで動作します。Reactのpeer dependencyは内包するアプリ導入用パッケージの契約であり、このスキルをインストールする際の依存ではありません。

## 利用する

`forma-design-system`フォルダを、利用環境のスキル保存先へ置きます。

| エージェント | ユーザー単位の配置先 |
| --- | --- |
| Codex | `~/.agents/skills/forma-design-system/` |
| Claude Code | `~/.claude/skills/forma-design-system/` |

`~`は利用者のホームディレクトリです。npmアーカイブを展開した場合、`package/`の中身を配置先へコピーします。`SKILL.md`、`LICENSE`、`THIRD_PARTY_NOTICES.md`、assets・references・scripts・bundle.jsonを一緒に配置してください。すでに同名スキルがある場合は、変更を確認してから入れ替えます。

対象プロジェクトを開いたチャットで、例えば次のように依頼します。

> $forma-design-system このプロジェクトにFormaを導入して。既存の画面と処理を保ちながら、案件一覧と編集フォームを適用例にして。

React以外の場合：

> $forma-design-system このVueプロジェクトに、CSSとトークンだけでFormaを適用して。

スキルはプロジェクトを調べ、必要な資材をコピーしてから既存のエントリーや画面へ組み込みます。既存ファイルと競合するときは、上書きせず差分を扱います。

## 内容

コード・設計資料・CSS・トークン・サンプルは同梱の[MIT License](./LICENSE)です。IBM Plex Sans JPにはSIL OFL 1.1が適用されます。[Third-party notices](./THIRD_PARTY_NOTICES.md)も保持してください。インストーラーは導入先の資材ディレクトリと`vendor/forma/`へライセンスを配置します。

- `SKILL.md`: エージェント向けの導入手順とデザイン原則
- `references/`: 設計指針、導入方法、React API、35種のHTML構造例
- `assets/packages/`: `@kurotch-homelab/forma-react`・`forma-styles`・`forma-tokens`の配布物
- `assets/styles/`: 単独CSSとCSS/JSONトークン
- `assets/fonts/`: IBM Plex Sans JPの400/500/600、ローカルCSS、SIL OFL 1.1と出典
- `assets/examples/`: React/Next.js用の境界と画面例、素のHTMLの操作例
- `scripts/forma.mjs`: 調査・導入計画・資材導入・整合性確認（Node.js標準機能のみ）
- `bundle.json`: 同梱バージョンと全ファイルのSHA-256

## スキル単体を確認する

```sh
node "/path/to/forma-design-system/scripts/forma.mjs" self-check
```

自動導入補助にはNode.js 22以上を使用します。Node.jsのない環境でもCSS・JSON・フォントは単独の資材として利用できます。React版には既存プロジェクトのReact環境が必要です。一般のプロジェクト依存のインストールには、そのプロジェクトのレジストリまたはキャッシュを使用します。Formaの配布物と書体はこのフォルダに同梱しているため、取得のための外部通信は不要です。

フォントを再配布する場合は同梱のOFL.txtを保ってください。導入後のアプリはスキルの絶対パスを参照せず、アプリ内へコピーした資材と相対パスのパッケージを使います。ZIPだけを共有するときも、このフォルダ構造を保って展開してください。
