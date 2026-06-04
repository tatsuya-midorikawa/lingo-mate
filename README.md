# lingo-mate

語学学習のおともとなるツール集です。次の 2 つが含まれます。

- **フラッシュカード & クイズ Web アプリ** — `index.html` をブラウザで開くだけで動く、ビルド不要の単語学習アプリ。
- **サイドパネル翻訳拡張** — Edge / Chrome 向けの翻訳拡張機能。

---

## フラッシュカード & クイズ Web アプリ

フラッシュカードとクイズで単語を覚えるシンプルな Web アプリです。

### 特長

- **ビルド不要**: HTML / CSS / JavaScript だけで動作します。Node.js や TypeScript などのコンパイル・トランスパイルは一切必要ありません。
- **フラッシュカード**: 単語をクリック（またはスペース／Enter キー）でめくり、意味と例文を確認できます。前後の移動・シャッフルにも対応。
- **クイズ**: 4択クイズで理解度をチェックし、最後にスコアを表示します。

### 使い方

`index.html` をブラウザで開くだけです。

- ファイルをダブルクリックして開く、または
- 任意の静的サーバーで配信する（例: `python3 -m http.server`）

ビルドステップやパッケージのインストールは不要です。

### 単語の追加・編集

`js/data.js` の配列に `{ word, meaning, example }` 形式のオブジェクトを追加・編集してください。

\`\`\`js
window.LINGO_MATE_WORDS = [
  { word: "apple", meaning: "りんご", example: "I eat an apple every morning." },
  // ここに追加
];
\`\`\`

### ファイル構成

\`\`\`
index.html      エントリーポイント
css/styles.css  スタイル
js/data.js      単語データ
js/app.js       アプリのロジック
\`\`\`

---

## サイドパネル翻訳拡張

Language Detector API と Translator API を使った Edge / Chrome 向けのサイドパネル翻訳拡張です。

### 仕様

- サイドパネルに翻訳ツールを表示
- 入力言語は Language Detector API で自動判定
- 翻訳は Translator API を利用
- 翻訳先言語の選択肢は次の順序で表示
  1. 英語 (\`en\`)
  2. \`navigator.languages\` で取得した言語（対応言語のみ・重複除外）
  3. その他の対応言語

### ローカルでの確認

\`\`\`bash
npm test
\`\`\`

Chrome / Edge の拡張機能管理画面で本ディレクトリを読み込み、サイドパネルを開いて確認してください。
