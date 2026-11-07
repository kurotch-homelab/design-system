# Formaパッケージの公開

React・CSS・トークンと導入スキル本体はGitHub Packages（`https://npm.pkg.github.com`）へ公開します。各package.jsonの`repository`はこのリポジトリに関連付け、`publishConfig.registry`で公開先を固定します。利用手順は[GitHub PackagesからFormaを使う](github-packages.md)を参照してください。

## 公開フロー

1. 変更したパッケージのversionと、プレビューの依存指定を更新する。
2. `npm install --package-lock-only --ignore-scripts`でlockfileを生成する。
3. `npm run build:skill`で、スキルの固定バージョンとチェックサムを更新する。
4. 次の検証を行い、変更をmainへ取り込む。
5. GitHub Actionsの「Publish Forma packages」をmainに対して実行する。

```sh
npm ci
npm run build
npm run build:skill
npm run check
npm test
npm run test:skill
npx playwright install chromium
npm run test:skill:consumer
```

このworkflowはGitHubホストランナーと、そのリポジトリの`GITHUB_TOKEN`（`packages: write`）を使います。ビルド・テスト後に4パッケージを公開し、公開されたintegrityを照合します。さらに、GitHub Packagesから独立したReact・HTML・トークン用プロジェクトへ実際にインストールし、スキルの再取得・展開・自己検証も行います。

```sh
gh workflow run publish-packages.yml --ref main
```

GitHub Packagesではパッケージの公開範囲をリポジトリとは別に管理します。初回公開後にPackages設定で公開範囲とアクセス権を確認してください。取得には公開パッケージでも認証が必要です。[公式仕様](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)

## ローカルから公開する場合

GitHub Packagesへ書き込み可能な既存のnpm認証、または`write:packages`を持つpersonal access token (classic)を環境から設定したうえで実行します。

```sh
npm run build
npm run publish:packages
```

`publish:packages`は`output/packages/`へアーカイブを生成して公開します。既存の同じ版はintegrityが一致する場合のみ再利用します。内容が異なる場合は停止するため、必ずversionを上げてください。スキル内にパッケージアーカイブを生成することはありません。

## スキルの配布

スキル自体は`skills/forma-design-system/`のフォルダをコピーするか、`npm run pack:skill`でアーカイブ化できます。スキルには設計資料・サンプル・フォント・導入補助を含め、React/CSS/トークンの実装はGitHub Packagesから取得します。元リポジトリへの依存はありません。

`@kurotch-homelab/forma-design-system-skill`も同じworkflowでGitHub Packagesへ公開します。スキルを変更したらversionを上げ、`build:skill`でチェックサムを再生成してください。agent-skillsは公開済みのスキルをnpm生成のlockfileで選択し、取得先とintegrityを検証してポータルへ取り込みます。登録・更新はagent-skills側のPRでレビューします。認証情報や組織固有の設定を配布物へ含めないでください。ソースはMIT、同梱フォントはSIL OFL 1.1です。

## 検証モード

- `test:skill`：依存準備、取得前の停止、資材配置、競合保護、旧file:依存からの移行を検証。
- `test:skill:consumer`：テスト時だけ生成したパッケージをローカルのnpmレジストリで配信し、独立プロジェクトへの取得・画面動作を検証。
- `test:skill:consumer:github`：公開済みGitHub Packagesを取得して同じ検証を実行。`NODE_AUTH_TOKEN`とパッケージ読み取り権限が必要。

ブラウザ検証ではローカル配信以外のリクエストを拒否し、フォント、ライト/ダーク、reduced motion、390/768/1440px、axe、入力とフォーカス復帰を確認します。
