# 🚀 後端 Render 部署指南 (Web Service)

## 📋 概述

泰鄉食品後端系統是一個 Node.js + TypeScript + Express 應用程式，整合了：
- 請假系統 API
- LINE Bot 功能
- 緊急備份系統
- 郵件通知功能
- 靜態檔案服務

## 🏗️ 後端架構

```
server/
├── src/
│   ├── index.ts           # 主應用程式入口
│   ├── line-bot.js        # LINE Bot 處理邏輯
│   ├── routes/            # API 路由
│   ├── middleware/        # 中介軟體
│   ├── services/          # 業務邏輯服務
│   └── utils/             # 工具函數
├── data/                  # CSV 資料檔案
├── dist/                  # 建置輸出目錄
├── package.json           # 依賴管理
└── tsconfig.json          # TypeScript 配置
```

## 🚀 Render Web Service 部署步驟

### 1. 建立 Web Service

1. **登入 Render Dashboard**
   - 前往 [render.com](https://render.com)
   - 登入你的帳號

2. **建立新的 Web Service**
   - 點擊 "New +" 按鈕
   - 選擇 "Web Service"

3. **連接 GitHub 倉庫**
   - 選擇你的 GitHub 倉庫
   - 分支：`main`

### 2. 配置建置設定

#### 基本設定
- **Name**: `tai-xiang-backend` (或你想要的名稱)
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

#### 進階設定
- **Auto-Deploy**: `Yes` (啟用自動部署)
- **Branch**: `main`
- **Node Version**: `18` (會自動檢測)

### 3. 環境變數設定 (重要!)

在 "Environment" 頁面設定以下環境變數：

#### 基本設定
```bash
NODE_ENV=production
PORT=10000
```

#### LINE Bot 設定
```bash
LINE_CHANNEL_ACCESS_TOKEN=你的_LINE_ACCESS_TOKEN
LINE_CHANNEL_SECRET=你的_LINE_CHANNEL_SECRET
LINE_GROUP_ID=你的_群組_ID
```

#### Domain 設定 (重要!)
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

#### Persistent Disk (如果使用付費方案)
```bash
PERSISTENT_DISK_PATH=/mnt/data
```

### 4. 部署方案選擇

#### 免費方案 (Starter)
- **費用**: $0/月
- **限制**: 
  - 服務會在無活動時休眠
  - 無 Persistent Disk
  - 資料會在重啟時重置

#### 付費方案 (Starter+)
- **費用**: $7/月
- **優勢**:
  - 服務不會休眠
  - 可使用 Persistent Disk
  - 更好的效能和穩定性

## 📁 建置流程詳解

### 本地測試建置
在部署前，建議先在本地測試：

```bash
# 進入後端目錄
cd server

# 安裝依賴
npm install

# 建置專案
npm run build

# 檢查建置輸出
ls -la dist/

# 本地測試啟動
npm start
```

### 建置過程說明
1. **TypeScript 編譯**: `tsc` 將 TypeScript 編譯為 JavaScript
2. **檔案複製**: 複製 `line-bot.js` 和 `data/` 目錄到 `dist/`
3. **依賴安裝**: 安裝生產環境依賴
4. **初始化腳本**: 執行 Persistent Disk 初始化 (如果適用)

## 🌐 部署後的 URL 結構

部署完成後，你的後端服務將提供以下端點：

### 主要服務
- **健康檢查**: `https://your-backend.onrender.com/api/health`
- **請假系統**: `https://your-backend.onrender.com/leave_system`
- **根路徑**: `https://your-backend.onrender.com/` (重定向到請假系統)

### API 端點
- **認證 API**: `/api/auth/*`
- **請假 API**: `/api/leave/*`
- **管理 API**: `/api/admin/*`
- **備份 API**: `/api/backup/*`
- **郵件 API**: `/api/email/*`

### LINE Bot 端點
- **Webhook**: `/line/webhook`
- **健康檢查**: `/line/health`
- **群組資訊**: `/line/group-info`
- **今日請假通知**: `/line/send_leave_today`

## 📋 部署檢查清單

### 部署前檢查
- [ ] 確認 `server/package.json` 中的腳本正確
- [ ] 本地測試 `npm run build` 成功
- [ ] 本地測試 `npm start` 正常啟動
- [ ] 準備好所有環境變數值
- [ ] 確認 LINE Bot Token 和 Secret 正確

### 部署設定檢查
- [ ] Root Directory: `server`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] 所有環境變數已設定
- [ ] Auto-Deploy: 啟用

### 部署後測試
- [ ] 健康檢查端點正常: `/api/health`
- [ ] LINE Bot 健康檢查正常: `/line/health`
- [ ] 請假系統載入正常: `/leave_system`
- [ ] API 端點回應正常
- [ ] LINE Bot Webhook 設定正確

## 🔧 LINE Bot Webhook 設定

部署完成後，需要更新 LINE Developers Console：

1. **前往 LINE Developers Console**
   - 網址: https://developers.line.biz/console/

2. **選擇你的 Channel**
   - 找到你的 Messaging API Channel

3. **更新 Webhook URL**
   - 在 "Messaging API" 設定中
   - **Webhook URL**: `https://your-backend.onrender.com/line/webhook`
   - 點擊 "Verify" 確認連接成功
   - 確保 "Use webhook" 已啟用

## 🔄 更新和維護

### 自動部署
- 每次推送到 `main` 分支時，Render 會自動重新建置和部署
- 建置時間通常 3-8 分鐘

### 手動重新部署
1. 前往 Render Dashboard
2. 選擇你的 Web Service
3. 點擊 "Manual Deploy" → "Deploy latest commit"

### 監控部署狀態
- 在 Render Dashboard 中查看 "Events" 頁面
- 檢查建置和部署日誌
- 監控服務健康狀態

## 🛠️ 故障排除

### 常見問題

#### 1. 建置失敗
**症狀**: 部署時建置過程失敗
**解決方案**:
- 檢查 `package.json` 中的建置腳本
- 確認 TypeScript 配置正確
- 檢查建置日誌中的錯誤訊息
- 確認所有依賴都在 `dependencies` 中

#### 2. 服務啟動失敗
**症狀**: 建置成功但服務無法啟動
**解決方案**:
- 檢查環境變數是否正確設定
- 確認 `PORT` 環境變數設為 `10000`
- 檢查啟動日誌中的錯誤訊息

#### 3. LINE Bot 無回應
**症狀**: LINE Bot 不回應訊息
**解決方案**:
- 檢查 Webhook URL 是否正確
- 確認 LINE Token 和 Secret 正確
- 檢查 `/line/health` 端點狀態
- 查看服務日誌中的錯誤訊息

#### 4. CORS 錯誤
**症狀**: 前端無法連接到後端 API
**解決方案**:
- 確認 `WEBSITE_URL` 環境變數正確
- 檢查 CORS 設定是否包含前端 domain
- 確認前端和後端都已正確部署

#### 5. 資料遺失
**症狀**: 請假記錄在重啟後消失
**解決方案**:
- 升級到付費方案並使用 Persistent Disk
- 或考慮遷移到 PostgreSQL 資料庫
- 定期使用備份 API 下載資料

### 除錯工具

#### 檢查服務狀態
```bash
# 健康檢查
curl https://your-backend.onrender.com/api/health

# LINE Bot 健康檢查
curl https://your-backend.onrender.com/line/health

# 測試備份 API
curl -H "User-Agent: TaiXiang-Emergency-Backup-Tool" \
     "https://your-backend.onrender.com/api/backup/status"
```

#### 檢查建置輸出
```bash
# 本地測試建置
cd server
npm run build
ls -la dist/
```

#### 檢查環境變數
在 Render Dashboard 的 "Environment" 頁面確認所有變數都已設定。

## 📊 效能優化

### 建置優化
- 使用 TypeScript 編譯優化
- 排除測試檔案和開發依賴
- 啟用 source maps 便於除錯

### 運行時優化
- 使用 Express 靜態檔案快取
- 實作 CORS 白名單
- 使用適當的 HTTP 標頭

### 監控建議
- 定期檢查服務健康狀態
- 監控 API 回應時間
- 追蹤錯誤日誌和異常

## 🔗 相關連結

- **Render Web Services 文檔**: https://render.com/docs/web-services
- **Node.js 部署指南**: https://render.com/docs/deploy-node-express-app
- **環境變數管理**: https://render.com/docs/environment-variables

---

## 🚀 快速部署指令

```bash
# 1. 測試本地建置
cd server && npm install && npm run build && npm start

# 2. 在 Render 建立 Web Service
# - Repository: 你的 GitHub 倉庫
# - Root Directory: server
# - Build Command: npm install && npm run build
# - Start Command: npm start

# 3. 設定環境變數 (見上方清單)

# 4. 更新 LINE Bot Webhook URL
# https://your-backend.onrender.com/line/webhook

# 5. 測試部署
curl https://your-backend.onrender.com/api/health
```

**部署完成後，你的泰鄉食品後端系統就會在新的 URL 上線了！** 🎉