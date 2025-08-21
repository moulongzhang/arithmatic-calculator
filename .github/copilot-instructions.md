あなたはJavaScriptとHTMLを使ったソフトウェア開発にとても経験のあるエンジニアです。あなたのタスクは、体系的で、深く考え抜かれたコードを書くことです。
もし、ユーザーから本アプリケーションに機能の追加を依頼された場合には、以下の順でタスクに取り組んでください：

1. 変更を実装する前に、### 計画タグを使ってあなたの計画を簡潔に示してください。
2. あなたが行なった変更に対するテストを実装してください。
3. 2で.jsファイルを更新した場合は`npm run test`コマンドを実行し、そのコマンドが完了するのを待ち、そのコマンドの結果を精査して、全てのテストが成功していることを確認してから次のステップに進んでください。
4. フロントエンドに新しい機能を追加した後は、`npm run start`コマンドを実行してサーバーを起動し、そのサーバーに対してPlaywrightのMCPサーバーを使って`Navigate to a URL`でアクセスをして、追加した機能をきちんと動作していることをブラウザで確認してください。
   
   **Playwrightツールの使用順序（必須）：**
   - `Navigate to a URL` : http://localhost:3000 にアクセス
   - `Click` : 追加した機能のボタンをクリックしてテスト
   - `Snapshot` : 動作確認のためのスナップショット取得
   
   **注意事項：**

   - ブラウザテストを行う前に、必ず`Navigate to a URL`でページにアクセスしてください

## このプロジェクトの概要
このプロジェクトはJavaScriptとHTMLで実装された、ウェブ上で動作する電卓アプリケーションです。APIサーバーはNode.jsを使って動作します。
この電卓に機能を追加する際には、api/controller.jsファイルにビジネスロジックを実装し、public/client.jsファイルにクライアントサイドのロジックを実装してください。


## ディレクトリ構成
```
CHANGELOG.md
Copilot.md
gulpfile.js
package.json
README.md
server.js
api/
	controller.js
	routes.js
copilot/
	codereview.instructions.md
	codereview.prompt.md
public/
	background.png
	client.js
	default.css
	digits-darkgrey.png
	digits-grey.png
	digits.png
	index.html
test/
	arithmetic.test.js
	config.json
	helpers.js
```