# 呉市外国人人口ダッシュボード（Web API版）

呉市オープンデータAPIを使用して、外国人人口を可視化するダッシュボードです。

## 🚀 ローカルでの使い方

1. `python -m http.server 8000` または `python3 -m http.server 8000` を実行
2. ブラウザで `http://localhost:8000/` にアクセス
3. アクセストークンを入力
4. 集計月を選択
5. 「データ取得」ボタンをクリック

**注意**：内部でWeb APIからデータを取得するため、ブラウザのセキュリティ上の理由でサーバの起動が必要です。

**ポイント**：ブラウザのセキュリティを回避するため、Google Chromeなどの拡張機能を一時的に使用できます。
- **拡張機能例**: [Moesif CORS Changer](https://chromewebstore.google.com/detail/moesif-origincors-changer/digfbfaphojjndkpccljibejjbppifbc?hl=ja&pli=1)
- 拡張機能で「Enable CORS」を有効にしている場合は、ブラウザでindex.htmlを直接開いてもAPIが利用できます

## ✨ 機能

- **サマリーカード**: 外国人総人口、総人口、外国人割合、国籍数を表示
- **国籍別構成比**: 外国人の国籍別構成をドーナッツグラフで表示
- **年代別人口**: 外国人の年代別人口分布を棒グラフで表示
- **地域別分布**: 外国人の地域別分布を横棒グラフで表示
- **詳細テーブル**: 全データを表形式で表示
- **リアルタイムデータ**: APIから最新データを自動取得

## 🛠️ 技術スタック

- HTML5
- CSS3
- JavaScript (ES6+)
- [Chart.js](https://www.chartjs.org/) v4.4.0
- Python（ローカルサーバ用）

## 📡 API仕様

- **ベースURL**: `https://api.expolis.cloud/opendata/t/kure/v1`
- **エンドポイント**: `/foreign-population?year_month=YYYY-MM`
- **認証**: `ecp-api-token` ヘッダーにアクセストークンを設定
- **ドキュメント**: https://api.expolis.cloud/docs/opendata/t/kure

## ブラウザ対応

- Chrome（推奨）
- Firefox
- Safari
- Edge

## トラブルシュート

### OSError: [Errno 48] Address already in use
`python3 -m http.server 8000` の実行時にこのエラーが出た場合、ポート番号を変更してください。

```bash
python3 -m http.server 8001  # ポートを8001に変更
```

その後、ブラウザのアクセス先も変更してください：`http://localhost:8001/`

### APIが応答しない場合
- アクセストークンが正しいか確認
- 集計月が正しい形式（YYYY-MM）か確認
- ネットワーク接続を確認
- ブラウザコンソールでエラーメッセージを確認

