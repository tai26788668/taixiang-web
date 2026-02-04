# 🚀 方案 A: 分離部署 - 完整指南

## 📋 部署概述

**方案 A** 將系統分為兩個 Render 服務：
- **服務 1**: 主網站 (Static Site) - **免費**
- **服務 2**: 後端系統 (Web Service) - **$7/月**

**總成本**: $7/月

## 🏗️ 架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                    Render 部署架構                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  服務 1: 主網站 (Static Site - 免費)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  https://taixiang-website.onrender.com            │    │
│  │  ├── / (首頁)                                      │    │
│  │  ├── /#about (關於我們)                            │    │
│  │  ├── /#products (產品展示)                         │    │
│  │  └── /#contact (聯絡我們)                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  服務 2: 後端系統 (Web Service - $7/月)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  https://taixiang.onrender.com            │    │
│  │  ├── /leave_system (請假系統前端)                   │    │
│  │  ├── /api/* (後端 API)                             │    │
│  │  ├── /line/webhook (LINE Bot - 新增功能)           │    │
│  │  └── /line/health (LINE Bot 健康檢查)              │    │
│  │                                                     │    │
│  │  LINE Bot 支援指令:                                │    │
│  │  • help? (指令說明)                               │    │
│  │  • list (當日以後所有記錄)                         │    │
│  │  • list -a (當日以後已簽核記錄)                    │    │
│  │  • list -d (當日記錄)                             │    │
│  │  • list -d -a (當日已簽核記錄)                     │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 部署步驟

### 步驟 1: 準備 GitHub Repository

```bash
# 確保所有變更都已提交
git add .
git commit -m "Ready for Plan A deployment - separate services"

# 推送到 GitHub (替換為您的 repository URL)
git remote add origin https://github.com/YOUR_USERNAME/tai-xiang-website.git
git branch -M main
git push -u origin main
```

### 步驟 2: 部署主網站 (Static Site)

#### 2.1 在 Render 創建 Static Site
1. 訪問 [Render Dashboard](https://dashboard.render.com/)
2. 點擊 **"New +"** → **"Static Site"**
3. 連接您的 GitHub repository

#### 2.2 配置主網站設置
| 設置項目 | 值 |
|---------|-----|
| **Name** | `tai-xiang-website` |
| **Branch** | `main` |
| **Root Directory** | `website` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

#### 2.3 點擊 "Create Static Site"
- 建置時間約 2-3 分鐘
- 完成後會獲得 URL: `https://taixiang-website.onrender.com`

### 步驟 3: 部署後端系統 (Web Service)

#### 3.1 在 Render 創建 Web Service
1. 在 Render Dashboard 點擊 **"New +"** → **"Web Service"**
2. 連接**同一個** GitHub repository

#### 3.2 配置後端系統設置
| 設置項目 | 值 |
|---------|-----|
| **Name** | `tai-xiang-backend` |
| **Branch** | `main` |
| **Root Directory** | *(留空)* |
| **Runtime** | `Node` |
| **Build Command** | `cd leave_system && npm ci && npm run build && cd ../server && npm ci && npm run build` |
| **Start Command** | `cd server && npm start` |

**重要說明**: 
- 後端系統整合了請假系統、API 服務和 LINE Bot 功能
- 使用 server 系統作為主要服務，提供完整的後端功能
- LINE Bot 功能通過 `/line/*` 路由提供服務

#### 3.3 設置環境變量
在 "Environment" 頁籤中添加：

| 變量名 | 值 | 說明 |
|-------|-----|------|
| `NODE_ENV` | `production` | 生產環境 |
| `PORT` | `10000` | Render 預設端口 |
| `JWT_SECRET` | *(自動生成)* | 點擊 "Generate" |
| `LINE_CHANNEL_ACCESS_TOKEN` | `your_line_bot_token` | LINE Bot Token |
| `LINE_CHANNEL_SECRET` | `your_line_bot_secret` | LINE Bot Secret |

**重要**: 
- 後端系統整合了 LINE Bot 功能，使用 `LINE_CHANNEL_ACCESS_TOKEN` 和 `LINE_CHANNEL_SECRET`
- 如果您還沒有 LINE Bot Token，可以先留空，稍後設置
- LINE Bot 將在後端系統的 `/line/webhook` 端點提供服務
- 請假系統需要 `JWT_SECRET` 用於身份驗證

#### 3.4 點擊 "Create Web Service"
- 建置時間約 3-5 分鐘
- 完成後會獲得 URL: `https://taixiang.onrender.com`

## 🔧 後端配置優化 (可選)

為了更好地支援方案 A，我已經創建了專門的後端配置文件 `server/src/index-plan-a.ts`。

如果您想使用優化版本：

1. **備份原始文件**:
```bash
cd server/src
cp index.ts index-original.ts
```

2. **使用方案 A 配置**:
```bash
cp index-plan-a.ts index.ts
```

3. **重新建置和部署**:
```bash
npm run build
git add .
git commit -m "Use Plan A optimized backend configuration"
git push
```

**優化版本的改進**:
- ✅ 移除主網站服務 (由 Static Site 處理)
- ✅ 優化 CORS 設置支援跨域請求
- ✅ 根路徑自動重定向到請假系統
- ✅ 更清晰的日誌和健康檢查

## 🔗 LINE Bot 設置

**重要說明**: LINE Bot 功能已整合在後端系統中，通過 `/line/*` 路由提供服務。

### 步驟 1: 獲取 LINE Bot 憑證

1. 訪問 [LINE Developers Console](https://developers.line.biz/)
2. 創建新的 Provider (如果沒有)
3. 創建新的 Messaging API Channel
4. 獲取以下憑證：
   - **Channel Access Token**
   - **Channel Secret**

### 步驟 2: 設置環境變量

在 Render 後端服務的 Environment 設置中：
1. 設置 `LINE_CHANNEL_ACCESS_TOKEN`
2. 設置 `LINE_CHANNEL_SECRET`
3. 點擊 "Save Changes"
4. 服務會自動重新部署

### 步驟 3: 配置 Webhook URL

在 LINE Developers Console 中：
1. 進入您的 Messaging API Channel
2. 在 "Messaging API" 設定中：
   - **Webhook URL**: `https://taixiang.onrender.com/line/webhook`
   - **Use webhook**: 啟用
   - **Verify**: 點擊驗證 (應該顯示成功)

### 步驟 4: 測試 LINE Bot

1. 掃描 QR Code 加入 Bot 為好友
2. 發送 "help" 訊息測試基本功能
3. 檢查 Render 日誌確認收到請求

### LINE Bot 功能說明

當前 LINE Bot 支援以下功能：
- **help 指令**: 查詢即將開始的已審核請假記錄
- **自動格式化**: 以易讀格式顯示請假資訊
- **智能過濾**: 只顯示未來的請假記錄
- **錯誤處理**: 當系統出錯時提供友善的錯誤訊息

**注意**: 如果需要更完整的 LINE Bot 功能（支援多種查詢指令），可以參考 `line/` 目錄中的獨立實現。

## ✅ 部署驗證

### 主網站驗證
訪問 `https://taixiang-website.onrender.com` 檢查：
- [ ] 首頁正常載入
- [ ] 產品類別頁面顯示 4 個產品
- [ ] 麻粩和寸棗有紅色背景和馬浮水印
- [ ] 點擊 "探索產品口味" 按鈕
- [ ] 產品口味頁面有淡黃色背景
- [ ] 顯示 6 個口味選項
- [ ] 響應式設計在手機上正常

### 後端系統驗證
訪問 `https://taixiang.onrender.com` 檢查：
- [ ] 自動重定向到 `/leave_system`
- [ ] 請假系統正常載入
- [ ] 可以註冊/登入
- [ ] API 健康檢查: `/api/health`
- [ ] LINE Bot 健康檢查: `/line/health`

### LINE Bot 驗證
- [ ] Webhook URL 驗證成功
- [ ] 發送 "help" 訊息有回應
- [ ] 請假查詢功能正常 (顯示即將開始的已審核請假記錄)
- [ ] LINE Bot 健康檢查: `/line/health` 顯示配置正確
- [ ] LINE Bot 狀態檢查: `/line/status` 顯示服務正常

**進階測試** (如果使用獨立 LINE Bot 實現):
- [ ] 發送 "help?" 訊息顯示指令說明
- [ ] 發送 "list" 訊息顯示當日以後的請假記錄
- [ ] 發送 "list -a" 訊息顯示已簽核的請假記錄
- [ ] 發送 "list -d" 訊息顯示當日請假記錄
- [ ] 發送 "list -d -a" 訊息顯示當日已簽核請假記錄
- [ ] 大小寫不敏感 (如 "LIST" 也能正常工作)

## 💰 成本分析

### 免費額度
- **Static Site**: 完全免費
- **Web Service**: 每月 750 小時免費 (約 31 天)

### 付費方案 (超出免費額度)
- **Web Service Starter**: $7/月
  - 512MB RAM
  - 0.1 CPU
  - 無休眠
  - 自定義域名

### 總成本
- **開發/測試**: 免費 (在免費額度內)
- **生產環境**: $7/月

## 🔄 更新和維護

### 自動部署
每次推送到 `main` 分支，Render 會自動重新部署兩個服務。

### 手動重新部署
在 Render Dashboard 中：
1. 選擇服務
2. 點擊 "Manual Deploy"
3. 選擇 "Deploy latest commit"

### 監控
- 查看 Render Dashboard 的日誌
- 設置 Webhook 通知 (可選)
- 監控服務正常運行時間

## 🛠️ 故障排除

### 主網站問題
1. **建置失敗**: 檢查 `website/package.json` 和依賴
2. **頁面空白**: 檢查瀏覽器控制台錯誤
3. **圖片無法載入**: 確認圖片在 `website/public/images/`

### 後端系統問題
1. **建置失敗**: 檢查所有 `package.json` 文件
2. **請假系統 404**: 檢查 SPA 路由配置
3. **API 錯誤**: 檢查環境變量設置

### 後端系統問題
1. **建置失敗**: 檢查所有 `package.json` 文件
2. **請假系統 404**: 檢查 SPA 路由配置
3. **API 錯誤**: 檢查環境變量設置
4. **JWT 錯誤**: 確認 `JWT_SECRET` 環境變數已設置

### LINE Bot 問題
1. **Webhook 驗證失敗**: 檢查 URL 和憑證設置
2. **無回應**: 檢查 Render 日誌，確認環境變數 `CHANNEL_ACCESS_TOKEN` 和 `CHANNEL_SECRET` 正確設置
3. **權限錯誤**: 確認 Channel Access Token 正確
4. **只支援 help 指令**: 目前整合版 LINE Bot 只回應 "help" 訊息
5. **配置未完整**: 檢查 `/line/health` 端點確認配置狀態

**進階 LINE Bot 功能**: 如需完整的多指令支援，可以考慮部署 `line/` 目錄中的獨立實現。

## 📞 支援資源

- [Render 官方文檔](https://render.com/docs)
- [LINE Developers 文檔](https://developers.line.biz/en/docs/)
- [項目 GitHub Repository](https://github.com/YOUR_USERNAME/tai-xiang-website)

## 🎉 完成！

恭喜！您已經成功部署了泰鄉食品完整系統：

- 🌐 **主網站**: 展示企業形象和產品
- 👥 **請假系統**: 員工請假管理
- 🤖 **LINE Bot**: 自動回覆和查詢 (基礎版本)

**總成本**: $7/月  
**功能**: 完整企業入口網站

**升級選項**: 如需更完整的 LINE Bot 功能，可以參考 `line/` 目錄中的獨立實現，支援多種查詢指令。

---

**部署指南版本**: v2.1  
**最後更新**: 2026年1月5日  
**適用於**: 方案 A - 分離部署 (主網站 + 完整後端系統)