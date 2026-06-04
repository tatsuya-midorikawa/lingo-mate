# lingo-mate

語学学習のおとも 🗣️ — フラッシュカードとクイズで単語を覚えるシンプルな Web アプリです。

## 特長

- **ビルド不要**: HTML / CSS / JavaScript だけで動作します。Node.js や TypeScript などのコンパイル・トランスパイルは一切必要ありません。
- **フラッシュカード**: 単語をクリック（またはスペース／Enter キー）でめくり、意味と例文を確認できます。前後の移動・シャッフルにも対応。
- **クイズ**: 4択クイズで理解度をチェックし、最後にスコアを表示します。

## 使い方

`index.html` をブラウザで開くだけです。

- ファイルをダブルクリックして開く、または
- 任意の静的サーバーで配信する（例: `python3 -m http.server`）

ビルドステップやパッケージのインストールは不要です。

## 単語の追加・編集

`js/data.js` の配列に `{ word, meaning, example }` 形式のオブジェクトを追加・編集してください。

```js
window.LINGO_MATE_WORDS = [
  { word: "apple", meaning: "りんご", example: "I eat an apple every morning." },
  // ここに追加
];
```

## ファイル構成

```
index.html      エントリーポイント
css/styles.css  スタイル
js/data.js      単語データ
js/app.js       アプリのロジック
```