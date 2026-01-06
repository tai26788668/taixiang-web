# 泰鄉食品企業入口網站 - 完整專案文件

## 📋 專案概述

泰鄉食品企業入口網站是一個整合的企業入口網站，包含主網站和員工請假管理系統。採用統一伺服器架構，提供一致的開發和生產環境。

## 🏗️ 系統架構

### 方案 A: 分離部署架構 (當前)
本專案採用**分離部署架構**，將系統分為兩個獨立服務：

#### 🌐 服務 1: 主網站 (Static Site - 免費)
- **主網站**: `https://tai-xiang-website.onrender.com/`
- **功能**: 企業形象展示、產品介紹、聯絡資訊

#### 🤖 服務 2: LINE Bot 系統 (Web Service - $7/月)
- **LINE Bot Webhook**: `https://tai-xiang-backend.onrender.com/line/webhook`
- **健康檢查**: `https://tai-xiang-backend.onrender.com/line/health`
- **功能**: 完整的請假記錄查詢系統

#### 🔒 Port 配置
- **開發環境**: 
  - 主網站開發: Port **5173** (Vite 開發伺服器)
  - LINE Bot 開發: Port **10000** (獨立 Node.js 服務)
- **生產環境**: 
  - 主網站: Render Static Site 服務
  - LINE Bot: Render Web Service (Port 10000)

#### 服務分離優勢
- 主網站免費託管 (Static Site)
- LINE Bot 獨立運行，功能完整
- 降低總體成本 ($7/月 vs 更高的統一服務成本)
- 更好的可擴展性和維護性

## 📁 專案結構

```
kiro_tai/
├── website/                    # 主網站 (Static Site)
│   ├── src/
│   │   ├── components/         # React 組件
│   │   ├── config/             # 網站配置
│   │   └── styles/             # 樣式文件
│   ├── public/                 # 靜態資源
│   ├── dist/                   # 建置輸出
│   ├── ABOUT_SECTION_GUIDE.md  # 關於我們功能指南
│   ├── ABOUT_CONTENT_MANAGEMENT.md # 內容管理指南
│   └── package.json
├── server/                     # 後端系統 (Web Service)
│   ├── src/
│   │   ├── routes/             # API 路由
│   │   │   └── lineBot.ts      # 整合版 LINE Bot
│   │   ├── services/           # 業務邏輯
│   │   ├── middleware/         # 中介軟體
│   │   └── index.ts            # Plan A 配置
│   ├── data/                   # 請假記錄資料
│   │   └── 請假記錄.csv        # LINE Bot 讀取的請假資料
│   ├── dist/                   # 建置輸出
│   └── logs/                   # 日誌檔案
├── leave_system/               # 請假系統前端
│   ├── src/
│   └── dist/                   # 建置輸出
├── line/                       # 獨立版 LINE Bot (可選)
│   ├── line-bot.js             # 完整功能實作
│   ├── package.json
│   └── .env                    # 環境變數配置
├── .kiro/                      # Kiro IDE 設定和規格文件
│   └── specs/                  # 功能規格文件
└── 部署相關檔案
    ├── PLAN_A_DEPLOYMENT_GUIDE.md
    ├── ARCHITECTURE_CLARIFICATION.md
    ├── quick-test.ps1
    ├── start-production-test.ps1
    └── verify-plan-a-fix.ps1
```

## 🚀 快速開始

### 1. 安裝所有依賴套件
```bash
# 主網站
cd website && npm install

# LINE Bot 系統
cd ../line && npm install
```

### 2. 設定 LINE Bot 環境變數
```powershell
# 編輯 line/.env 檔案
CHANNEL_ACCESS_TOKEN=your_actual_token
CHANNEL_SECRET=your_actual_secret
PORT=10000
```

### 3. 啟動開發環境

#### 開發主網站
```bash
cd website
npm run dev
# 訪問: http://localhost:5173
```

#### 開發 LINE Bot

**方案 1: 整合版 LINE Bot (推薦用於生產環境)**
```bash
cd server
npm run dev
# LINE Bot 整合在後端系統中
# 訪問: http://localhost:10000/line/health
# Webhook: http://localhost:10000/line/webhook
```

**方案 2: 獨立版 LINE Bot (完整功能)**
```bash
cd line
npm start
# 獨立運行的 LINE Bot 服務
# 訪問: http://localhost:10000/line/health
# Webhook: http://localhost:10000/line/webhook
```

**功能比較:**
- **整合版**: 基礎功能，支援 "help" 指令查詢請假記錄
- **獨立版**: 完整功能，支援多種查詢指令 (help?, list, list -a, list -d, list -d -a)

### 4. 檢查服務狀態
- **主網站**: http://localhost:5173
- **後端系統**: http://localhost:10000
- **請假系統**: http://localhost:10000/leave_system
- **LINE Bot 健康檢查**: http://localhost:10000/line/health
- **LINE Bot Webhook**: http://localhost:10000/line/webhook
- **API 健康檢查**: http://localhost:10000/api/health

### 5. 生產部署
參考 `PLAN_A_DEPLOYMENT_GUIDE.md` 完整部署指南

## 🏢 功能特色

### 主網站 (/)
- 🏢 泰鄉食品企業入口頁面
- 🍪 產品展示 (麻粩、寸棗、蘇打餅乾、蘇打夾心)
- 📖 雙頁面關於我們 section (基礎頁面 + 詳細頁面)
- 🖼️ 響應式圖文卡片展示系統
- 🎨 響應式設計和動畫效果
- 📱 跨裝置相容性
- 🚀 高效能載入和 SEO 最佳化

### 員工請假管理系統 (/career)
- 🔐 使用者身份驗證和授權
- 📝 請假申請表單（支援跨日請假）
- 📊 請假記錄查詢和統計
- 👨‍💼 管理者審核功能
- 🌐 多語言支援 (繁體中文/英文/印尼文)
- 📱 響應式設計
- ⏰ 智慧請假時數計算

### LINE Bot 請假查詢系統

**🔧 架構說明:**
- **整合版** (生產環境推薦): 整合在後端系統中，提供基礎查詢功能
- **獨立版** (完整功能): 獨立運行的服務，支援完整指令集

**📋 整合版功能 (server/src/routes/lineBot.ts):**
- 🤖 LINE Messaging API 整合
- 📋 支援 `help` 指令查詢即將開始的已審核請假記錄
- 🔒 簽名驗證和錯誤處理
- 📊 健康檢查端點

**📋 獨立版功能 (line/line-bot.js):**
- 🤖 LINE Messaging API 整合
- 📋 支援 5 種查詢指令：
  - `help?` - 顯示指令說明
  - `list` - 查詢當日以後所有請假記錄
  - `list -a` - 查詢當日以後已簽核請假記錄
  - `list -d` - 查詢當日請假記錄
  - `list -d -a` / `list -a -d` - 查詢當日已簽核請假記錄
- 🔍 智慧日期篩選和格式化回覆
- 🔒 完整的簽名驗證和錯誤處理
- 🔒 安全的 Webhook 簽章驗證
- 📊 健康檢查和監控
- 💬 智能訊息解析 (大小寫不敏感)
- 📁 直接讀取 CSV 資料檔案

## 🔧 技術堆疊

### 前端
- **React 18** + **TypeScript**
- **Vite** - 建置工具
- **Tailwind CSS** - 樣式框架
- **React Router** - 路由管理
- **i18next** - 多語言支援

### 後端
- **Node.js** + **Express.js** (LINE Bot 系統)
- **JavaScript** - 簡化部署和維護
- **CSV Parser** - 資料處理
- **LINE Messaging API** - 原生 HTTPS 請求
- **Crypto** - 簽章驗證
- **獨立部署** - 單一檔案架構

## 📋 可用腳本

### 開發環境
```bash
# 主網站開發
cd website && npm run dev     # 啟動主網站開發伺服器 (http://localhost:5173)

# LINE Bot 開發
cd line && npm start          # 啟動 LINE Bot 系統 (http://localhost:10000)
cd line && npm run dev        # 同上，開發模式
```

### 生產環境
```bash
# 部署到 Render
# 參考 PLAN_A_DEPLOYMENT_GUIDE.md 完整指南

# 本地生產測試
cd website && npm run build && npm run preview  # 主網站
cd line && npm start                             # LINE Bot
```

### 建置和測試
```bash
cd website && npm run build  # 建置主網站
cd line && npm test          # 測試 LINE Bot (目前無測試)
```

## 🚀 部署指南

### 開發環境
```bash
# 1. 安裝相依套件
cd website && npm install
cd ../line && npm install

# 2. 設定 LINE Bot 環境變數 (line/.env)
CHANNEL_ACCESS_TOKEN=your_token
CHANNEL_SECRET=your_secret
PORT=10000

# 3. 啟動服務
cd website && npm run dev     # 主網站 (http://localhost:5173)
cd line && npm start          # LINE Bot (http://localhost:10000)
```

### 生產環境 (Render)
參考 `PLAN_A_DEPLOYMENT_GUIDE.md` 完整部署指南：

1. **主網站**: 部署為 Render Static Site (免費)
2. **LINE Bot**: 部署為 Render Web Service ($7/月)

#### 環境變數設定
```env
# LINE Bot 服務
CHANNEL_ACCESS_TOKEN=your_production_token
CHANNEL_SECRET=your_production_secret
PORT=10000
NODE_ENV=production
```

#### 生產環境要求
- GitHub Repository
- LINE Developers 帳號和 Bot 設定
- Render 帳號

## 🔒 安全性

- JWT 身份驗證
- CORS 保護
- 輸入驗證
- 自動登出機制
- 安全標頭配置
- 靜態檔案快取策略

## 🛠️ 開發指南

### 網站內容編輯
1. 編輯 `website/src/config/website.config.ts`
2. 重新建置: `cd website && npm run build`
3. 重新整理瀏覽器查看變化

#### 關於我們 Section 管理
- **基礎頁面**: 公司簡介、統計數據、核心特色
- **詳細頁面**: 圖文卡片深度介紹
- **圖片管理**: 支援 SVG/PNG/JPG/WebP 格式
- **響應式佈局**: 桌面 3 欄、平板 2 欄、手機 1 欄
- **詳細指南**: 參考 `website/ABOUT_SECTION_GUIDE.md`

### 分離部署架構優點
- ✅ 主網站免費託管 (Static Site)
- ✅ LINE Bot 獨立運行，功能完整
- ✅ 降低總體成本 ($7/月)
- ✅ 更好的可擴展性和維護性
- ✅ 簡化的開發和部署流程

### LINE Bot 開發規範
- **環境變數**: 使用 `CHANNEL_ACCESS_TOKEN` 和 `CHANNEL_SECRET`
- **端口配置**: 開發環境 10000，生產環境由 Render 自動分配
- **資料存取**: 直接讀取 `server/data/請假記錄.csv`
- **單一檔案**: 所有邏輯整合在 `line-bot.js` 中

### Port 管理規範 (已廢棄)
- 舊的統一 Port 80 架構已被分離部署架構取代
- 現在使用標準的開發端口配置

## 🐛 故障排除

### LINE Bot 開發問題
```bash
# 檢查環境變數設定
cd line
cat .env

# 檢查 CSV 資料檔案
ls -la ../server/data/請假記錄.csv

# 測試 LINE Bot 健康檢查
curl http://localhost:10000/line/health
```

### 主網站開發問題
```bash
# 清除建置快取
cd website
rm -rf dist node_modules
npm install
npm run build
```

### 權限問題 (已不適用)
舊的 Port 80 權限問題已解決，現在使用標準開發端口。

### 中文字符編碼問題
- 確保所有文件使用 UTF-8 編碼
- CSV 檔案損壞時需要重建
- 前端和後端都已配置正確的編碼處理

### 網站配置不生效
- 確認 `website.config.ts` 修改後有重新建置
- 檢查組件是否正確接收配置 props
- 清除瀏覽器快取

## � 重要修修正記錄

### 1. 路由問題修復
- 修正請假系統路徑配置
- 解決 `Cannot GET /career` 錯誤

### 2. 中文字符編碼問題
- 修復 CSV 檔案編碼問題
- 恢復用戶中文姓名顯示

### 3. 用戶假別時數更新
- 修正管理者編輯功能
- 支援假別時數正確更新

### 4. 網站配置顯示
- 修正配置系統連接
- 確保 `website.config.ts` 正確生效

### 5. 關於我們 Section 擴展
- 實作雙頁面關於我們系統
- 新增響應式圖文卡片展示
- 整合動畫效果和無障礙支援
- 提供完整的內容管理系統

### 6. LINE Bot 系統重建 (最新)
- **問題**: 原有的 LINE Bot 整合方式複雜，功能有限
- **解決方案**: 重建為獨立的 LINE Bot 系統
- **新功能**: 
  - 支援 5 種完整查詢指令 (help?, list, list -a, list -d, list -d -a)
  - 智能訊息解析 (大小寫不敏感)
  - 直接讀取 CSV 資料檔案
  - 結構化回覆格式
  - 完整的錯誤處理和日誌記錄
- **部署方式**: 獨立的 Render Web Service
- **修復檔案**: `line/line-bot.js`, `line/package.json`, `line/.env`
- **測試結果**: 所有核心功能測試通過，系統準備就緒

### 7. 專案清理 (v1.1.2)
- **清理內容**: 移除所有備份檔案、過時建置產物、臨時檔案和重複文件
- **清理檔案**: 
  - 伺服器備份: `index-original.ts`, `index-plan-a.ts`, `index-unified.ts`, `index-test-backup.ts`
  - 網站備份: `websiteConfig-original.ts`, `Footer-original.tsx` 等
  - 建置產物: 對應的 `.js`, `.d.ts`, `.map` 檔案
  - 配置檔案: `render-backend.yaml`, `website/render.yaml`
  - 參考檔案: `ref/` 目錄及其內容
  - 重複文件: 9 個過時的 `.md` 指南檔案
- **結果**: 專案結構更加清潔，維護更容易

## 📖 關於我們 Section 擴展文件

### 功能文件
- **使用指南**: `website/ABOUT_SECTION_GUIDE.md`
  - 功能概述和特色說明
  - 配置管理和自定義指南
  - 故障排除和效能最佳化

- **內容管理**: `website/ABOUT_CONTENT_MANAGEMENT.md`
  - 內容結構和管理流程
  - 圖片資源管理規範
  - 內容撰寫和 SEO 指南

- **部署指南**: `website/ABOUT_SECTION_DEPLOYMENT.md`
  - 完整的部署檢查清單
  - 跨瀏覽器和裝置測試
  - 效能和安全性檢查

### 技術規格
- **需求文件**: `.kiro/specs/about-section-expansion/requirements.md`
- **設計文件**: `.kiro/specs/about-section-expansion/design.md`
- **實作任務**: `.kiro/specs/about-section-expansion/tasks.md`

## 🔄 架構演進

### 分離部署架構 (目前)
```
服務 1: 主網站 (Render Static Site - 免費)
├── https://tai-xiang-website.onrender.com/
└── 企業形象展示、產品介紹

服務 2: LINE Bot 系統 (Render Web Service - $7/月)
├── https://tai-xiang-backend.onrender.com/line/webhook
├── https://tai-xiang-backend.onrender.com/line/health
└── 完整的請假記錄查詢功能
```

### 優點
- 主網站免費託管
- LINE Bot 功能完整獨立
- 總成本僅 $7/月
- 更好的可擴展性和維護性

### 舊架構 (已廢棄)
```
Port 80: Express 統一伺服器
├── / (主網站靜態檔案)
├── /career (請假系統靜態檔案)
└── /api (後端 API)
```

## 📄 授權

此專案僅供學習和開發使用。

---

## 📞 技術支援

如有問題，請參考：
- 主網站規格：`.kiro/specs/main-website/`
- 請假系統規格：`.kiro/specs/employee-leave-system/`
- 關於我們擴展：`.kiro/specs/about-section-expansion/`
- 關於我們使用指南：`website/ABOUT_SECTION_GUIDE.md`
- 或查看相關的修正記錄文件

**最後更新**: 2026年1月5日 - 專案清理完成，移除所有未使用檔案