# 🚀 後端快速部署指南 (5 分鐘完成)

## 📋 部署步驟

### 1. 在 Render 建立 Web Service
1. 前往 [render.com](https://render.com) 並登入
2. 點擊 "New +" → "Web Service"
3. 選擇你的 GitHub 倉庫

### 2. 設定建置參數
```
Name: tai-xiang-backend
Root Directory: server
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Auto-Deploy: Yes
Branch: main
```

### 3. 設定環境變數 (重要!)

#### 必要設定
```bash
NODE_ENV=production
PORT=10000
```

#### LINE Bot 設定
```bash
LINE_CHANNEL_ACCESS_TOKEN=你的_TOKEN
LINE_CHANNEL_SECRET=你的_SECRET
LINE_GROUP_ID=你的_群組_ID
```

#### Domain 設定 (關鍵!)
```bash
BACKEND_URL=https://your-backend-name.onrender.com
WEBSITE_URL=https://your-website-name.onrender.com
```

#### Email 設定
```bash
GMAIL_USER=tai26788668@gmail.com
GMAIL_APP_PASSWORD=你的_APP_密碼
BACKUP_EMAIL=tai26788668@gmail.com
```

### 4. 點擊 "Create Web Service"
- 建置時間約 5-8 分鐘
- 完成後會獲得 URL: `https://your-backend-name.onrender.com`

## ✅ 部署完成檢查

### 基本服務測試
- [ ] 健康檢查：`https://your-backend.onrender.com/api/health`
- [ ] 請假系統：`https://your-backend.onrender.com/leave_system`
- [ ] LINE Bot 健康檢查：`https://your-backend.onrender.com/line/health`

### LINE Bot 設定
1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇你的 Channel → Messaging API
3. 設定 Webhook URL: `https://your-backend.onrender.com/line/webhook`
4. 點擊 "Verify" 確認連接成功

### 功能測試
- [ ] 登入請假系統
- [ ] 在 LINE 群組發送 `help?` 測試 Bot
- [ ] 測試備份 API: `curl -H "User-Agent: TaiXiang-Emergency-Backup-Tool" "https://your-backend.onrender.com/api/backup/status"`

## 🔧 如果遇到問題

### 建置失敗
1. 檢查 Render 的建置日誌
2. 確認 `server/package.json` 中的腳本正確
3. 本地測試：`cd server && npm install && npm run build`

### 服務無法啟動
1. 檢查環境變數是否都已設定
2. 確認 `PORT=10000`
3. 檢查啟動日誌中的錯誤訊息

### LINE Bot 無回應
1. 確認 Webhook URL 正確
2. 檢查 LINE Token 和 Secret
3. 測試 `/line/health` 端點

## 📱 預期結果

部署完成後，你將擁有：
- ✅ 完整的請假系統後端 API
- ✅ LINE Bot 自動回覆功能
- ✅ 緊急備份系統
- ✅ 郵件通知功能
- ✅ 靜態檔案服務 (請假系統前端)
- ✅ 自動部署 (推送程式碼即自動更新)

## 🌐 主要端點

### 用戶端點
- **請假系統**: `/leave_system`
- **API 健康檢查**: `/api/health`

### LINE Bot 端點
- **Webhook**: `/line/webhook`
- **健康檢查**: `/line/health`
- **今日請假通知**: `/line/send_leave_today`

### 管理端點
- **緊急備份狀態**: `/api/backup/status`
- **下載備份**: `/api/backup/emergency-download?file=leave-records`
- **郵件測試**: `/api/email/verify-config`

---

**就這麼簡單！你的後端系統就上線了！** 🎉

**下一步**: 部署靜態網站並確保兩個服務能正確通訊。