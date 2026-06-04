# Lingomate

Lingomate は Edge / Chrome 向けのサイドパネル型多言語翻訳拡張機能です。入力テキストの言語を Language Detector API で自動判定し、Translator API で翻訳します。

## 構成

- `src/manifest.json`: Manifest V3 の拡張機能定義
- `src/service-worker.js`: ツールバー操作からサイドパネルを開く処理
- `src/sidepanel.html`: サイドパネル UI
- `src/sidepanel.css`: サイドパネルのスタイル
- `src/sidepanel.js`: 言語判定、翻訳、対象言語の並び替え

HTML / CSS / JavaScript のみで作っているため、コンパイルやトランスパイルは不要です。

## ローカルで読み込む

1. Chrome では `chrome://extensions`、Edge では `edge://extensions` を開きます。
2. デベロッパーモードを有効にします。
3. 「パッケージ化されていない拡張機能を読み込む」から、このリポジトリの `src` フォルダーを選択します。
4. Lingomate の拡張機能アイコンを押すとサイドパネルが開きます。

## 動作条件

Language Detector API と Translator API が利用できるブラウザ環境が必要です。未対応のブラウザでは、サイドパネル上に API が利用できないことを表示します。
