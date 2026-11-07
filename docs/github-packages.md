# GitHub PackagesからFormaを使う

配布先は`https://npm.pkg.github.com`です。必要なパッケージだけを選びます。

| パッケージ | バージョン | 用途 |
| --- | --- | --- |
| `@kurotch-homelab/forma-react` | `0.1.2` | React部品・型定義・CSS |
| `@kurotch-homelab/forma-styles` | `0.2.2` | フレームワーク非依存CSS |
| `@kurotch-homelab/forma-tokens` | `0.1.2` | CSS変数・JSONトークン |

## 認証と設定

GitHub Packagesのnpmレジストリは公開パッケージの取得にも認証が必要です。利用者のpersonal access token (classic)に`read:packages`を付け、必要に応じて組織のSSO認証も行ってください。[GitHub公式手順](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)

利用するアプリのworkspaceルートで、既存の`.npmrc`に次の設定を追加します。同じscopeが別レジストリに設定されていたら、ほかの依存への影響を確認してから変更してください。

```ini
@kurotch-homelab:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

実際のトークンは`NODE_AUTH_TOKEN`環境変数やCIのsecretで渡します。トークンの値をファイルやコミットへ保存しないでください。既存のnpmログイン認証を使う場合、認証行を重複設定する必要はありません。Yarn Berryの設定例は[スキルの導入資料](../skills/forma-design-system/references/INTEGRATION.md)にあります。

## インストール

```sh
npm install @kurotch-homelab/forma-react@0.1.2
# または、CSSだけ
npm install @kurotch-homelab/forma-styles@0.2.2
# または、トークンだけ
npm install @kurotch-homelab/forma-tokens@0.1.2
```

Reactは`@kurotch-homelab/forma-react/styles.css`、CSS用のバンドラーでは`@kurotch-homelab/forma-styles`を読み込みます。トークンは`@kurotch-homelab/forma-tokens/css`、`@kurotch-homelab/forma-tokens/json`から利用できます。lockfileの取得URLとintegrityを確認し、コミットしてください。

HTMLなど静的ファイルを配信する場合は、インストールしたパッケージの`dist/`と`LICENSE`から必要な資材を配信先へコピーします。スキルの`sync`コマンドでも配置できます。React本体とReact DOMは利用アプリの依存として管理します。

ライブラリの開発用checkoutではworkspace内のパッケージを使うため、`npm ci`とビルドにGitHub Packagesの認証は不要です。
