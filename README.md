# 元宝シミュレータ

## Overview（アプリの概要）

元宝のシミュレータです

## Use（いますぐ使う）

[元宝シミュレータ（Github Pages）](https://fuyoneko.github.io/genpo_simulator/)

|形式|URL|
|:--|:--|
|URL| https://fuyoneko.github.io/genpo_simulator/ |

## License（ライセンス）

- ソースコード  
MIT License

※ アプリ中の画像リソースはMITの対象外とし、元画像の著作権及び利用規約に従います

----------------------------------------

# 開発する

## 推奨開発環境

|項目|環境名|
|:--|:--|
|IDE|VSCode|
|Language|Node v14|
|OS|Windows|

## 開発環境の構築

gitで本プロジェクトをcloneした後、`package.json`のあるディレクトリで以下のコマンドを実施します。

```
npm install
```

## 開発用サーバで検証する

`package.json`のあるディレクトリで以下のコマンドを実施します。

```
npm run serve
```

サーバが立ち上がるため、表示されているurlをブラウザで開きます。

## ビルド、Github pages環境にデプロイする

`package.json`のあるディレクトリで以下のコマンドを実施します。

```
npm run github_build
```

`docs`以下のファイルが更新されるため、そのままpushします。

## ビルド、S3などの独自環境にデプロイする

`package.json`のあるディレクトリで以下のコマンドを実施します。

```
npm run build
```

`dist`以下に作成されたファイルを、自身の環境にアップロードします。

## 動作検証時のブラウザ

以下の環境で動作確認を取っています。

対象ブラウザ：Chrome、iPhone（Safari）

ブラウザの最小幅：375px（iPhone12 mini、やや古いiPhoneの横幅サイズ）

