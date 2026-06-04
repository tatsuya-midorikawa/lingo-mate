# lingo-mate

Language Detector API と Translator API を使った Edge / Chrome 向けのサイドパネル翻訳拡張です。

## 仕様

- サイドパネルに翻訳ツールを表示
- 入力言語は Language Detector API で自動判定
- 翻訳は Translator API を利用
- 翻訳先言語の選択肢は次の順序で表示
  1. 英語 (`en`)
  2. `navigator.languages` で取得した言語（対応言語のみ・重複除外）
  3. その他の対応言語

## ローカルでの確認

```bash
npm test
```

Chrome / Edge の拡張機能管理画面で本ディレクトリを読み込み、サイドパネルを開いて確認してください。
