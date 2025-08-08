# 食材リミット (Shokuzai Limit) — MVP

静的1ファイル（`index.html`）のMVPです。**GitHub Pages** でホスティングできます。

## 公開URL（完成形）
`https://tokuyusou.github.io/shokuzai-limit/`

## デプロイ手順（GitHub UIのみ）
1. GitHubで新規リポジトリ **`shokuzai-limit`** を作成（Public）。
2. このリポジトリに `index.html` と `README.md` をアップロードして **Commit changes**。
3. リポジトリの **Settings → Pages** を開き、
   - **Branch**: `main`
   - **Folder**: `/ (root)` を選択して **Save**。
4. 数十秒後に上のURLで公開されます（HTTPS）。

## 使い方
- 左で在庫を登録（カメラ → 撮影→OCRで期限取り込み可）。
- 右の「レシピを生成」で、期限が近いものを優先したレシピを提示。
- 「▶️ 読み上げ」で音声ガイド。料理後は「作った！」で在庫が自動減算・買い物リスト作成。
- 在庫は `localStorage` に保存。JSONエクスポート/インポート可能。

## 注意
- カメラは **HTTPS** でのみ動作します（GitHub PagesはOK）。
- ブラウザの権限ダイアログでカメラを許可してください。
