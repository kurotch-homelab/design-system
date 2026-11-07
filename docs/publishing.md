# Formaの配布とリリース

ソース、ローカルnpmアーカイブ、自己完結型スキルを配布できます。ビルドと利用に専用レジストリや組織内サービスは必要ありません。コードと設計資料の利用条件はルートの`LICENSE`、同梱書体は`THIRD_PARTY_NOTICES.md`と`skills/forma-design-system/assets/fonts/OFL.txt`を参照してください。

## ビルドと検証

リポジトリのルートで実行します。Node.js 22以上が必要です。

```sh
npm ci
npm run pack:skill
npm run check
npm test
npm run test:skill
npx playwright install chromium
npm run test:e2e
```

`pack:skill`は共有パッケージをビルドし、スキルの資材・ライセンス・チェックサムを更新してから`output/`へnpmアーカイブを生成します。アーカイブ名とバージョンは`skills/forma-design-system/package.json`に従います。

`npm run test:skill:consumer`はリポジトリ外のReact・HTMLプロジェクトへの導入を検証します。このテストはオフラインnpmインストールを行うため、先に同じ環境で`npm ci`を実行して依存をキャッシュし、Chromiumを導入してください。

## レジストリを使わず配布する

`skills/forma-design-system`を丸ごと配布すれば、元リポジトリなしで利用できます。配布先への配置方法は[スキルのREADME](../skills/forma-design-system/README.md)を参照してください。`SKILL.md`だけでなく、`LICENSE`、`THIRD_PARTY_NOTICES.md`、`bundle.json`、`assets/`、`references/`、`scripts/`を含めます。

React・CSS・トークンを個別のnpmアーカイブとして使う場合は、ビルド後に実行します。

```sh
npm pack -w @kurotch-homelab/forma-react --pack-destination output
npm pack -w @kurotch-homelab/forma-styles --pack-destination output
npm pack -w @kurotch-homelab/forma-tokens --pack-destination output
```

利用するプロジェクトで、生成された`.tgz`のパスを`npm install`に渡します。CSSやJSONを直接コピーする場合も、対応する`LICENSE`を保持してください。フォントを再配布する場合は`OFL.txt`と出典を保持してください。

## 任意のレジストリへ公開する

このリポジトリは公開先レジストリを固定しません。公開先のURL、認証、パッケージの公開権限はメンテナーの環境で設定します。以下の`<REGISTRY_URL>`と`<SKILL_ARCHIVE>`を実際の値に置き換えてください。

```sh
npm login --registry=<REGISTRY_URL>
npm publish <SKILL_ARCHIVE> --registry=<REGISTRY_URL> --ignore-scripts --dry-run
npm publish <SKILL_ARCHIVE> --registry=<REGISTRY_URL> --ignore-scripts
```

検証したアーカイブをそのまま公開し、公開後に版とintegrityを確認します。組織固有のポータル登録、CI認証、ネットワーク要件は各組織の非公開ドキュメントで管理します。認証情報やローカルの`.npmrc`をスキルに含めないでください。

## バージョンと同梱物を更新する

公開済みの同じ`package@version`を置き換えません。ソース、配布ライセンス、同梱資材を変更したパッケージは版を更新し、Reactプレビューなどの依存指定も合わせます。スキルには内包するパッケージの版とチェックサムを`bundle.json`で固定します。

1. 対象の`package.json`のversionと、スキルの`agentSkill.snapshot`を更新する。
2. `npm install --package-lock-only --ignore-scripts`でlockfileを更新する。
3. `npm run pack:skill`でライセンスと同梱パッケージを再生成する。
4. チェック、テスト、実アーカイブの内容を確認する。

ビルドは前回のmanifestに登録されている古い同梱パッケージを、新しい版の生成後に取り除きます。公開済みのアーカイブは`output/`などの作業用保存先で別途保持してください。
