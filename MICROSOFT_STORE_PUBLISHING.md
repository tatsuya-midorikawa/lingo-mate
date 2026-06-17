# Microsoft Store / Microsoft Edge Add-ons 公開手順

このプロジェクトは `manifest.json` を持つ Manifest V3 のブラウザー拡張機能です。そのため、一般的な Windows アプリとして Microsoft Store に直接出すのではなく、Microsoft Partner Center から **Microsoft Edge Add-ons** に公開するのが基本ルートです。

Microsoft のドキュメントでは Partner Center 内の文脈で `store` と書かれていても、Edge 拡張の場合は Microsoft Edge Add-ons のストア掲載を指します。ユーザーは Microsoft Edge Add-ons から Lingomate を検索・インストールします。

## 目標

- Lingomate を Microsoft Edge 向け拡張機能として公開する。
- Partner Center で開発者登録、パッケージアップロード、ストア掲載情報、プライバシー情報、審査メモを入力する。
- 審査に通りやすいよう、申請前チェックと説明文を整える。

## このリポジトリの前提

- 拡張機能のルートは `src` フォルダーです。
- `src/manifest.json` は Manifest V3 です。
- ビルド工程はありません。HTML / CSS / JavaScript をそのまま ZIP 化します。
- 現在のバージョンは `0.1.0` です。
- 権限は `sidePanel` のみです。
- 外部サーバー通信、アナリティクス、アカウント機能、永続ストレージは現状ありません。
- 翻訳はブラウザーが提供する Language Detector API / Translator API に依存します。未対応ブラウザーでは、サイドパネル上に API が利用できないことを表示する実装です。

## 公開先の整理

### 推奨: Microsoft Edge Add-ons

Lingomate は Edge 拡張なので、公開先は Microsoft Edge Add-ons です。

- 管理画面: Microsoft Partner Center
- 公開先: Microsoft Edge Add-ons
- パッケージ形式: 拡張機能ルートを ZIP 化した `.zip`
- ユーザーのインストール先: Microsoft Edge の拡張ストア

### 非推奨: Microsoft Store の Windows アプリ枠

Microsoft Store に Windows アプリとして掲載したい場合、このリポジトリの拡張機能をそのまま提出することはできません。別途、PWA、MSIX、Windows アプリなどとして再パッケージする必要があります。

この手順書では、現在のコードを最大限そのまま使える **Microsoft Edge Add-ons 公開** を扱います。

## 全体フロー

1. Microsoft アカウントを用意する。
2. Partner Center で Microsoft Edge program に開発者登録する。
3. ローカルで Edge 拡張として動作確認する。
4. manifest、アイコン、説明文、プライバシー情報を整える。
5. `src` の中身を ZIP 化する。
6. Partner Center で新しい拡張機能を作成する。
7. ZIP パッケージをアップロードする。
8. Availability、Properties、Privacy、Store listings を入力する。
9. 審査メモを入力して Publish する。
10. 審査結果を確認し、必要なら修正して再申請する。

## 1. 開発者アカウントを準備する

### 必要なアカウント

Microsoft Edge Add-ons に公開するには、Partner Center の Microsoft Edge program へ登録します。登録には Microsoft アカウント、いわゆる MSA が必要です。

注意点:

- Microsoft Edge 拡張の登録に手数料はありません。
- 職場または学校アカウントだけでは登録できない場合があります。Microsoft アカウントを Primary Owner にする必要があります。
- GitHub アカウントでサインインすると、Microsoft アカウントが作成または関連付けされる場合があります。
- 個人で出すなら Individual、法人名義で出すなら Company を選びます。
- Account country/region と Account type は登録後に変更できない項目です。慎重に選びます。
- Company アカウントは確認に数日から数週間かかることがあります。

### 登録手順

1. Partner Center の Microsoft Edge 開発者ダッシュボードにアクセスします。
   - https://partner.microsoft.com/dashboard/microsoftedge/public/login
2. Microsoft アカウントでサインインします。
3. Microsoft Edge Developer Account Registration が表示されたら、以下を入力します。
   - Account country/region
   - Account type: Individual または Company
   - Publisher display name / Company name
   - Contact info
   - Company approver: Company の場合のみ
4. Microsoft Store App Developer Agreement を確認し、同意します。
5. `Finish` を押します。
6. 登録完了メール、または確認ステータスを確認します。

## 2. 申請前にローカル動作確認する

Microsoft Edge で以下を確認します。

1. `edge://extensions` を開きます。
2. Developer mode を有効にします。
3. `Load unpacked` からこのリポジトリの `src` フォルダーを選びます。
4. ツールバーの Lingomate アイコンを押します。
5. サイドパネルが開くことを確認します。
6. 入力欄に翻訳したいテキストを入れます。
7. 入力言語が自動検出されるか、手動選択できることを確認します。
8. 翻訳先を選び、`翻訳` ボタンで翻訳できることを確認します。
9. `結果をコピー` ボタンで翻訳結果をコピーできることを確認します。
10. Translator API / Language Detector API が利用できない環境では、未対応メッセージが表示されることを確認します。

審査では安定版 Edge で確認される可能性があります。Built-in AI API が審査環境で未対応でも、拡張が壊れずに未対応状態を表示できることが重要です。

## 3. manifest を確認する

`src/manifest.json` の値は、ストア掲載の一部に反映されます。特に `name` と `description` は Partner Center 側で読み取り専用として扱われることがあります。変更したい場合は manifest を修正し、ZIP を作り直して再アップロードします。

現在の主な値:

```json
{
  "manifest_version": 3,
  "name": "Lingomate",
  "description": "A side panel translator that detects or lets you choose the input language and translates with built-in browser AI APIs.",
  "version": "0.1.0",
  "permissions": ["sidePanel"]
}
```

申請前チェック:

- `name` は公開名として問題ないか。
- `description` は短い説明として自然か。
- `version` は今回公開するバージョンとして正しいか。
- 不要な `permissions` や `host_permissions` が入っていないか。
- `icons` の参照先がすべて存在するか。
- リモートコードを読み込んでいないか。
- 外部 CDN の script を使っていないか。

### 日本語掲載にしたい場合

現在の manifest は英語の `description` です。日本語の短い説明で掲載したい場合は、公開前に次のどちらかを選びます。

#### 方法 A: manifest の description を日本語にする

対象ユーザーが日本語中心で、多言語 manifest が不要なら一番簡単です。

例:

```json
"description": "入力言語を自動判定または手動選択し、ブラウザー内蔵 AI API で翻訳するサイドパネル拡張です。"
```

#### 方法 B: `_locales` で多言語化する

英語と日本語の両方で掲載したい場合は、Chrome/Edge 拡張の i18n 形式にします。

必要な作業:

- `manifest.json` に `default_locale` を追加する。
- `name` と `description` を `__MSG_...__` 形式にする。
- `src/_locales/en/messages.json` と `src/_locales/ja/messages.json` を追加する。

例:

```json
{
  "manifest_version": 3,
  "default_locale": "en",
  "name": "__MSG_extensionName__",
  "description": "__MSG_extensionDescription__"
}
```

Partner Center で複数言語が表示されない場合、manifest がハードコード文字列のままになっていることが原因になりやすいです。

## 4. ストア掲載素材を用意する

Partner Center の Store listings で、言語ごとに掲載素材を入力・アップロードします。

### 必須または強く推奨される素材

| 項目 | 必須 | 推奨・制約 |
| --- | --- | --- |
| Extension name | 少なくとも 1 言語で必須 | manifest の `name` 由来 |
| Short description | 少なくとも 1 言語で必須 | manifest の `description` 由来。変更するには manifest を更新して再アップロード |
| Description | 各言語で必須 | 250 文字以上 10,000 文字以下 |
| Extension logo | 各言語で必須 | 1:1、推奨 300 x 300、最小 128 x 128 |
| Screenshots | 任意だが強く推奨 | 最大 6 枚。640 x 480 または 1280 x 800 |
| Small promotional tile | 任意 | 440 x 280 |
| Large promotional tile | 任意 | 1400 x 560 の PNG |
| YouTube video URL | 任意 | 広告をオフにすることが推奨 |
| Search terms | 任意 | 最大 7 個、合計 21 語まで。各検索語は 30 文字以内 |

### Lingomate で用意する素材案

- Extension logo: `src/icons/icon-128.png` を使えます。ただし推奨は 300 x 300 なので、可能なら高解像度版を作成します。
- Screenshot 1: サイドパネルを開いた初期状態。
- Screenshot 2: 入力言語を自動検出し、翻訳先を選んだ状態。
- Screenshot 3: 翻訳結果が表示された状態。
- Screenshot 4: Built-in AI API 未対応時のメッセージ。必要に応じて。

スクリーンショットは指定サイズと完全一致している必要があります。macOS のスクリーンショットをそのまま使うとサイズが合わないことがあるため、提出前に 1280 x 800 または 640 x 480 にトリミングします。

## 5. ストア説明文を準備する

### 短い説明の例

manifest の `description` に入れる場合は、短く、機能がすぐ分かる文にします。

日本語例:

```text
入力言語を自動判定または手動選択し、ブラウザー内蔵 AI API で翻訳するサイドパネル拡張です。
```

英語例:

```text
A side panel translator that detects or lets you choose the input language and translates with built-in browser AI APIs.
```

### 詳細説明の例

Store listings の `Description` は 250 文字以上必要です。以下は日本語掲載用のたたき台です。実際の公開前に、対応 API の状況や機能に合わせて必ず見直してください。

```text
Lingomate は、Microsoft Edge のサイドパネルで使えるシンプルな多言語翻訳拡張機能です。翻訳したいテキストを入力すると、対応環境では Language Detector API により入力言語を自動判定し、Translator API により選択した言語へ翻訳します。自動判定が利用できない環境でも、入力言語を手動で選択して翻訳できるように設計しています。

翻訳画面はサイドパネル内に表示されるため、閲覧中のページを開いたままテキストの確認と翻訳を行えます。入力文字数、検出された言語、翻訳先候補、翻訳結果のコピー操作をひとつの画面にまとめ、日常的な文章確認や多言語コミュニケーションをすばやく行えるようにしています。

この拡張機能は、ブラウザーが提供する Built-in AI API を使用します。対応していないブラウザー環境では、必要な API が利用できないことを画面上に表示します。拡張機能自身はユーザーアカウント、独自サーバー、広告、アナリティクスを使用しません。
```

### 検索語の例

日本語:

```text
翻訳, translator, language, AI, side panel, Japanese, multilingual
```

英語:

```text
translator, translation, language, side panel, Japanese, multilingual, AI
```

Partner Center の制約に合わせ、最大 7 個以内にします。

## 6. プライバシーポリシーを準備する

Partner Center では、拡張機能が個人情報をアクセス、収集、送信するかを申告します。個人情報を扱うと申告する場合、Privacy policy URL が必須です。

Lingomate は現状、独自サーバーやアナリティクスへ送信するコードを持っていません。ただし、ユーザーが入力する翻訳対象テキストには個人情報が含まれる可能性があります。審査とユーザーへの説明を安定させるため、公開アクセス可能なプライバシーポリシー URL を用意しておくことを推奨します。

### プライバシーポリシーに書くべき内容

- 拡張機能の名前。
- 提供する機能。
- ユーザーが入力するテキストの扱い。
- 拡張機能の開発者が収集するデータの有無。
- 外部サーバー送信の有無。
- アナリティクス、広告、トラッキングの有無。
- ブラウザー提供 API を使うこと。
- 問い合わせ先。
- 改定日。

### Lingomate 用の文案例

法律文書ではないため、公開前に必要に応じて専門家に確認してください。

```text
Lingomate Privacy Policy

Lingomate is a Microsoft Edge extension that provides text translation in the browser side panel.

Lingomate processes text entered by the user to detect the source language and translate it using browser-provided Language Detector API and Translator API features when they are available. The extension developer does not operate a server for translation, does not require a user account, and does not intentionally collect, store, sell, or share the text entered by users.

Lingomate does not include advertising, analytics, or tracking code. The extension currently requests only the sidePanel permission to display its user interface in the Microsoft Edge side panel.

If browser-provided AI features download models or process data according to the browser's own implementation, that behavior is governed by the browser provider's terms and privacy documentation.

For privacy questions, contact: [your support email]
Last updated: [date]
```

公開方法の例:

- GitHub Pages で `privacy.html` または `privacy.md` を公開する。
- 自分の Web サイトに固定ページとして公開する。
- Notion などでも URL は作れますが、長期的に安定する自分のドメインまたは GitHub Pages が無難です。

## 7. ZIP パッケージを作成する

Partner Center にアップロードする ZIP は、`manifest.json` が ZIP のルートにある必要があります。`src` フォルダー自体を ZIP に入れて、ZIP 内が `src/manifest.json` になる形は避けます。

リポジトリルートで実行する例:

```zsh
mkdir -p dist
rm -f dist/lingomate-edge-addons-v0.1.0.zip
(cd src && zip -r ../dist/lingomate-edge-addons-v0.1.0.zip . -x '*.DS_Store')
unzip -l dist/lingomate-edge-addons-v0.1.0.zip
```

`unzip -l` の結果で、次のように見えていれば正しいです。

```text
manifest.json
service-worker.js
sidepanel.html
sidepanel.css
sidepanel.js
icons/icon-16.png
icons/icon-32.png
icons/icon-48.png
icons/icon-128.png
icons/icon.svg
```

避けるべき ZIP 構造:

```text
src/manifest.json
src/service-worker.js
...
```

## 8. Partner Center で新しい拡張機能を作成する

1. Partner Center の Microsoft Edge ダッシュボードを開きます。
   - https://partner.microsoft.com/dashboard/microsoftedge/public/login
2. `Create new extension` を選びます。
3. `Upload package (.zip file)` 画面で ZIP ファイルをアップロードします。
4. Partner Center の検証が完了するまで待ちます。
5. エラーが出た場合は、内容を確認して manifest または ZIP 構造を修正します。
6. 問題がなければ `Continue` します。

アップロード時にエラーになりやすい点:

- ZIP のルートに `manifest.json` がない。
- manifest の JSON が不正。
- manifest の `version` が不正。
- 参照しているアイコンファイルが存在しない。
- Manifest V3 でリモートコードを読み込んでいる。
- 不要または過剰な権限を要求している。

## 9. Availability を入力する

Availability では、公開範囲と対象マーケットを決めます。

### Visibility

- `Public`: Microsoft Edge Add-ons の検索・カテゴリ・URL から誰でも見つけられます。通常はこちらです。
- `Hidden`: 検索やカテゴリには出ず、URL を知っているユーザーだけがアクセスできます。限定テストや特定顧客向けに使います。

一般公開したい場合は `Public` を選びます。

### Markets

最初は全マーケットで公開するか、対応・サポートできる国や地域に絞るかを選びます。

Lingomate は多言語翻訳ツールなので全マーケット公開と相性はよいですが、サポート言語、プライバシーポリシー、問い合わせ対応の言語を考えて決めます。

## 10. Properties を入力する

Properties では、拡張機能のカテゴリやサポート情報を入力します。

入力項目の例:

| 項目 | Lingomate の入力例 |
| --- | --- |
| Category | Productivity または Tools 系のカテゴリ |
| Website | プロジェクトサイト、GitHub Pages、紹介ページなど |
| Support contact detail | サポートページ URL またはメールアドレス |
| Mature content | 通常は該当なし。翻訳対象にユーザーが何を入れるかではなく、拡張自体が成人向けコンテンツを含むかで判断 |

古い UI では Privacy policy requirements と Privacy policy URL が Properties に表示される場合があります。新しい UI では Privacy ページに分かれている場合があります。

## 11. Privacy を入力する

Partner Center の Privacy ページでは、単一目的、権限の正当化、リモートコード、データ利用、プライバシーポリシーを入力します。

### Single Purpose Description の例

```text
Lingomate provides a side-panel translator for text entered by the user. It detects or lets the user choose the source language and translates the text to the selected target language using browser-provided built-in AI APIs when available.
```

日本語で入力できる欄なら、次のようにしても構いません。

```text
Lingomate は、ユーザーが入力したテキストを Microsoft Edge のサイドパネル上で翻訳する拡張機能です。対応環境ではブラウザー提供の Language Detector API と Translator API を使い、入力言語の自動判定または手動選択に基づいて翻訳します。
```

### Permission justification の例

現在の権限は `sidePanel` のみです。

```text
The sidePanel permission is required to display Lingomate's translator interface in the Microsoft Edge side panel when the user clicks the extension action. The extension does not request access to browsing history, page content, tabs, or host permissions.
```

### Remote code

Manifest V3 ではリモートコードの実行は許可されません。現状の Lingomate は外部 CDN やリモート script を読み込んでいないため、次の選択が基本です。

```text
No, I am not using remote code.
```

申請前に確認すること:

- `sidepanel.html` に外部 script URL がない。
- `sidepanel.js` が `eval` やリモート script 読み込みをしていない。
- 外部 CDN の JavaScript を使っていない。

### Data usage

現状コードに基づく説明方針:

- アカウント登録なし。
- 広告なし。
- アナリティクスなし。
- 独自サーバー送信なし。
- ユーザー入力テキストを翻訳処理に使う。
- ブラウザー提供の Built-in AI API を使う。

Partner Center のチェック項目は実際の UI に従い、拡張機能の実装とプライバシーポリシーの内容が矛盾しないように入力します。将来、外部翻訳 API、ログ送信、クラッシュ収集、利用状況分析などを追加した場合は、必ずここを更新します。

### Privacy policy URL

公開済みの URL を入力します。URL は審査担当者とユーザーがログインなしで閲覧できる必要があります。

## 12. Store listings を入力する

Store listings では、言語ごとに詳細情報を入力します。

1. `Store listings` を開きます。
2. 対象言語の `Edit details` を押します。
3. Description を入力します。
4. Extension logo をアップロードします。
5. 必要に応じて screenshots、promotional tile、YouTube video URL、search terms を入力します。
6. `Save draft` します。
7. すべての必須項目が Complete になるまで修正します。

注意点:

- Description は 250 文字以上必要です。
- Extension logo は言語ごとに必須です。
- スクリーンショットは任意ですが、審査担当者とユーザーが機能を理解しやすくなるため用意することを推奨します。
- 複数言語を追加した場合、各言語で Description と logo が必要です。
- Partner Center の AI 生成機能を使う場合も、最終文面は必ず自分で検証します。

## 13. 審査メモを入力して Publish する

すべての項目が Complete になったら、`Publish` から Submit your extension 画面へ進みます。`Notes for certification` には、審査担当者が迷わずテストできる情報を書きます。

### Lingomate 用の審査メモ例

```text
Lingomate is a side-panel translator extension for Microsoft Edge.

No account or login is required.

How to test:
1. Install the extension.
2. Click the Lingomate toolbar icon.
3. Confirm that the Lingomate side panel opens.
4. Enter text in the input field, such as "Hello, how are you?".
5. If Language Detector API is available, confirm that the source language is detected. If it is not available, manually choose the input language.
6. Choose a target language.
7. Click the "翻訳" button.
8. Confirm that the translated text appears in the result field.
9. Click the copy button to confirm that the result can be copied.

Expected behavior in unsupported environments:
If the browser does not support Translator API or Language Detector API, the side panel displays an unsupported API message. This is expected behavior and the extension should remain usable enough to explain the requirement to the user.

Permissions:
The extension requests only the sidePanel permission. This permission is used to display the translator UI in the Microsoft Edge side panel.

Remote code:
The extension does not load or execute remotely hosted code.
```

メモを書いたら `Publish` を押します。審査は最大 7 営業日程度かかる場合があります。通過すると Partner Center の状態が `In the Store` になり、Microsoft Edge Add-ons に掲載されます。

## 14. 審査落ちした場合の対応

審査で戻された場合は、Partner Center の理由を読み、原因ごとに対応します。

よくある修正:

- manifest の説明と実際の機能が合っていない。
- ストア説明が短い、曖昧、または誤解を招く。
- Privacy の申告とプライバシーポリシーが矛盾している。
- 権限の正当化が不足している。
- API 未対応環境で壊れる。
- ZIP 構造が誤っている。
- アイコンやスクリーンショットのサイズが合っていない。
- リモートコードまたは外部 script の扱いがポリシーに合っていない。

修正後の流れ:

1. コード、manifest、素材、説明文を修正します。
2. `manifest.json` の `version` を必要に応じて更新します。
3. ZIP を作り直します。
4. Partner Center に再アップロードします。
5. 指摘に対する対応内容を審査メモに追記します。
6. 再申請します。

## 15. 公開後のアップデート手順

新しいバージョンを公開する場合も、基本は同じです。

1. 変更内容を実装します。
2. Edge でローカル動作確認します。
3. `src/manifest.json` の `version` を上げます。
   - 例: `0.1.0` から `0.1.1`
4. ZIP を作成します。
5. Partner Center の既存拡張機能ページで新しい package をアップロードします。
6. Store listing や Privacy に変更があれば更新します。
7. 審査メモに変更内容を書きます。
8. Publish します。

アップデートでも審査があります。特に権限追加、データ送信追加、外部 API 追加、UI や説明文の大幅変更がある場合は、審査メモで明確に説明します。

## 16. Lingomate の公開前チェックリスト

### コード

- [ ] `src` を Edge の `Load unpacked` で読み込める。
- [ ] ツールバーアイコンからサイドパネルが開く。
- [ ] 入力言語の自動検出が動く、または未対応時に手動選択へ誘導できる。
- [ ] 翻訳が動く。
- [ ] 結果コピーが動く。
- [ ] Built-in AI API 未対応時に画面が壊れない。
- [ ] DevTools console に致命的なエラーが出ていない。
- [ ] 外部 script、`eval`、不要なネットワーク通信がない。

### manifest

- [ ] `name` が公開名として適切。
- [ ] `description` が短い説明として適切。
- [ ] `version` が今回のリリース番号になっている。
- [ ] 不要な権限がない。
- [ ] アイコン参照が正しい。
- [ ] 日本語・英語の掲載方針が決まっている。

### 素材

- [ ] Extension logo を用意した。
- [ ] スクリーンショットを 1280 x 800 または 640 x 480 で用意した。
- [ ] 必要なら promotional tile を用意した。
- [ ] ストア詳細説明を 250 文字以上で用意した。
- [ ] 検索語を 7 個以内で用意した。

### 法務・サポート

- [ ] Publisher display name を決めた。
- [ ] サポート用メールアドレスまたは URL を用意した。
- [ ] Privacy policy URL を用意した。
- [ ] Privacy の申告内容とプライバシーポリシーが一致している。
- [ ] Microsoft Store App Developer Agreement を確認した。

### パッケージ

- [ ] ZIP のルートに `manifest.json` がある。
- [ ] ZIP に `.DS_Store` や不要ファイルが入っていない。
- [ ] ZIP に `.git`、作業メモ、秘密情報が入っていない。
- [ ] `unzip -l` で中身を確認した。

### Partner Center

- [ ] Developer account の登録が完了している。
- [ ] Package upload が成功した。
- [ ] Availability を入力した。
- [ ] Properties を入力した。
- [ ] Privacy を入力した。
- [ ] Store listings が Complete になっている。
- [ ] Notes for certification を入力した。
- [ ] Publish した。

## 17. 参考リンク

- Publish a Microsoft Edge extension: https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension
- Register as a Microsoft Edge extension developer: https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account
- Microsoft Edge Add-ons: https://microsoftedge.microsoft.com
- Partner Center for Microsoft Edge extensions: https://partner.microsoft.com/dashboard/microsoftedge/public/login
- Microsoft Edge Add-ons developer policies: https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies
