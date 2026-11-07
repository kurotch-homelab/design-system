# Forma導入スキル

React・CSS・トークンをGitHub Packagesから取得して、任意のプロジェクトへFormaを導入します。スキルにパッケージアーカイブや配布CSS・JSONは含めません。設計資料、操作例、IBM Plex Sans JP、導入補助スクリプトを提供します。

## スキルを配置する

このフォルダを丸ごと保存先へコピーします。元リポジトリを利用先に配置する必要はありません。

| エージェント | ユーザー単位の配置先 |
| --- | --- |
| Codex | `~/.agents/skills/forma-design-system/` |
| Claude Code | `~/.claude/skills/forma-design-system/` |

npmアーカイブのパッケージ名は`@kurotch-homelab/forma-design-system-skill`です。展開した場合は`package/`の中身を配置します。既存の同名スキルを変更していたら、その差分を保って更新してください。

スキル本体もGitHub Packagesで配布します。認証後に`npm pack @kurotch-homelab/forma-design-system-skill --registry=https://npm.pkg.github.com --ignore-scripts`で取得できます。組織のagent-skillsポータルは、レビュー済みの版を取得・検証して配布します。

## 利用する

> $forma-design-system このプロジェクトにFormaを導入して。既存の画面と処理を保ちながら、案件一覧と編集フォームを適用例にして。

React以外にはCSSモード、設計ツールやネイティブアプリにはトークンモードを選べます。必要なパッケージと固定バージョンは`bundle.json`に記録します。

GitHub Packagesのnpm取得には公開パッケージでも認証が必要です。`read:packages`権限付きpersonal access token (classic)を環境変数や既存のnpm認証で利用します。設定方法は[INTEGRATION.md](references/INTEGRATION.md)を参照してください。

導入は`install`で依存を準備し、利用先のパッケージマネージャーで取得してから`sync`、`verify`を実行します。HTML/CSSモードもパッケージの取得にNode.jsとパッケージマネージャーを使いますが、配布CSSにJavaScriptの実行時依存はありません。

## 内容

- `SKILL.md`: エージェントの導入手順とデザイン原則
- `references/`: 設計指針、認証・導入方法、React API、HTML構造例
- `assets/fonts/`: IBM Plex Sans JPの400/500/600、ローカルCSS、OFLと出典
- `assets/examples/`: React/Next.js、HTMLの操作例
- `scripts/forma.mjs`: 調査・依存準備・取得済み資材の配置・検証（Node.js 22以上）
- `bundle.json`: GitHub Packagesの固定バージョンとスキル内ファイルのSHA-256

`self-check`はローカルの整合性を確認します。レジストリの接続確認やパッケージマネージャーの実行、認証情報の保存は行いません。

```sh
node "/path/to/forma-design-system/scripts/forma.mjs" self-check
```

旧スキルが管理していた`file:`依存は、`install`で通常のバージョン指定へ移行できます。古い資材は自動削除しないため、利用先で不要になったファイルを確認して整理してください。

コードと設計資料は[MIT License](LICENSE)、フォントはSIL OFL 1.1です。[Third-party notices](THIRD_PARTY_NOTICES.md)を保持してください。導入後の画面とローカルフォントの表示に、GitHubやGoogleへの通信は不要です。
