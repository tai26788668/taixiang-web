# 新帳號部署指南

## 📋 部署到新 Render 帳號的完整步驟

### 1. 準備工作

#### 1.1 確認新的 Domain Names
- 後端服務：`https://your-new-backend.onrender.com`
- 網站服務：`https://your-new-website.onrender.com`

#### 1.2 更新程式碼中的 Domain References
```powershell
# 執行 domain 更新腳本
.\update-domain-names.ps1 -NewBackendUrl "https://your-new-backend.onrender.com" -NewWebsiteUrl "https://your-new-website.onrender.com"
```

### 2. Render 部署設定

#### 2.1 後端服務 (Web Service)
1. **建立新的 Web Service**
   - Repository: 你的 GitHub 倉庫
   - Branch: main
   - Root Directory: (留空)
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`

2. **環境變數設定**
   ```
   NODE_ENV=production
   PORT=10000
   
   # LINE Bot 設定
   LINE_CHANNEL_ACCESS_TOKEN=你的_LINE_TOKEN
   LINE_CHANNEL_SECRET=你的_LINE_SECRET
   LINE_GROUP_ID=你的_群組_ID
   
   # Domain 設定 (重要!)
   BACKEND_URL=https://your-new-backend.onrender.com
   WEBSITE_URL=https://your-new-website.onrender.com
   
   # Email 設定
   GMAIL_USER=tai26788668@gmail.com
   GMAIL_APP_PASSWORD=你的_APP_密碼
   BACKUP_EMAIL=tai26788668@gmail.com
   
   # Persistent Disk (如果使用)
   PERSISTENT_DISK_PATH=/mnt/data
   ```

#### 2.2 網站服務 (Static Site)
1. **建立新的 Static Site**
   - Repository: 你的 GitHub 倉庫
   - Branch: main
   - Root Directory: website
   - Build Command: `npm install && npm run build`
   - Publish Directory: dist

### 3. LINE Bot 設定更新

#### 3.1 更新 Webhook URL
1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇你的 Channel
3. 在 "Messaging API" 設定中：
   - **Webhook URL**: `https://your-new-backend.onrender.com/line/webhook`
   - 點擊 "Verify" 確認連接成功

### 4. 功能測試清單

#### 4.1 基本服務測試
- [ ] 後端健康檢查：`https://your-new-backend.onrender.com/api/health`
- [ ] LINE Bot 健康檢查：`https://your-new-backend.onrender.com/line/health`
- [ ] 請假系統載入：`https://your-new-backend.onrender.com/leave_system`
- [ ] 主網站載入：`https://your-new-website.onrender.com`

#### 4.2 請假系統功能測試
- [ ] 登入功能
- [ ] 請假申請
- [ ] 請假記錄查詢
- [ ] 管理者功能
- [ ] 變更密碼

#### 4.3 LINE Bot 功能測試
- [ ] `help?` 指令
- [ ] `list` 指令
- [ ] `list -d` 指令
- [ ] `list -a` 指令
- [ ] `list -d -a` 指令
- [ ] 今日請假通知：`https://your-new-backend.onrender.com/line/send_leave_today`

#### 4.4 備份功能測試
- [ ] 緊急備份狀態：`https://your-new-backend.onrender.com/api/backup/status`
- [ ] 下載請假記錄：`https://your-new-backend.onrender.com/api/backup/emergency-download?file=leave-records`
- [ ] 下載個人資料：`https://your-new-backend.onrender.com/api/backup/emergency-download?file=personal-data`

#### 4.5 Email 功能測試
- [ ] 驗證 Gmail 設定：`https://your-new-backend.onrender.com/api/email/verify-config`
- [ ] 發送週報：`https://your-new-backend.onrender.com/api/email/send-leave-record`

### 5. 重要注意事項

#### 5.1 環境變數的重要性
- **BACKEND_URL** 和 **WEBSITE_URL** 必須正確設定
- LINE Bot 會使用這些變數來產生正確的連結
- CORS 設定也依賴這些變數

#### 5.2 資料遷移
- 如果需要遷移現有資料，請先下載備份
- 新環境啟動後，手動上傳資料到 `server/data/` 目錄

#### 5.3 Persistent Disk (如果使用付費方案)
- 確保在 Render 中建立 Persistent Disk
- 設定正確的掛載路徑：`/mnt/data`
- 執行初始化腳本：`npm run init-persistent-disk`

### 6. 故障排除

#### 6.1 常見問題
1. **CORS 錯誤**：檢查 `WEBSITE_URL` 環境變數
2. **LINE Bot 無回應**：檢查 Webhook URL 和環境變數
3. **請假系統無法載入**：檢查建置過程和靜態檔案路徑
4. **API 錯誤**：檢查 `BACKEND_URL` 環境變數

#### 6.2 除錯工具
```bash
# 檢查後端狀態
curl https://your-new-backend.onrender.com/api/health

# 檢查 LINE Bot 狀態
curl https://your-new-backend.onrender.com/line/health

# 測試備份功能
curl -H "User-Agent: TaiXiang-Emergency-Backup-Tool" \
     "https://your-new-backend.onrender.com/api/backup/status"
```

### 7. 完成後的維護

#### 7.1 定期檢查
- 每週測試主要功能
- 監控 Render 服務狀態
- 檢查 LINE Bot 回應

#### 7.2 備份策略
- 設定自動化週報發送
- 定期下載緊急備份
- 監控資料完整性

---

## 🚀 快速部署指令

```powershell
# 1. 更新 domain names
.\update-domain-names.ps1 -NewBackendUrl "https://your-new-backend.onrender.com" -NewWebsiteUrl "https://your-new-website.onrender.com"

# 2. 提交變更
git add .
git commit -m "feat: 更新 domain names 以支援新 Render 帳號部署"
git push origin main

# 3. 在 Render 中建立服務並設定環境變數
# 4. 更新 LINE Bot Webhook URL
# 5. 執行功能測試
```