# 泰鄉食品企業入口網站 v0.4.0

> 🚀 生產部署就緒版本 - 完整的企業數位化解決方案

一個整合的企業入口網站，包含主網站、員工請假管理系統和 LINE Bot 客服功能。

## ✨ 版本亮點 (v0.4.0)

- 🏗️ **方案 A 分離部署**: 主網站免費 + 後端 $7/月
- ⚡ **快速測試工具**: 組件級重建和生產環境測試
- 🔗 **跨域問題解決**: 員工專區安全連結
- 🧹 **腳本優化**: 移除冗餘，保留核心功能
- 📚 **完整文檔**: 使用指南和部署手冊

## 🎯 系統架構

```
主網站 (Static Site - 免費)     後端系統 (Web Service - $7/月)
├── 公司介紹                   ├── 請假系統前端
├── 關於我們 (雙頁面)           ├── 後端 API
├── 產品展示 (雙頁面)           └── LINE Bot
└── 聯絡我們
```

## 📚 完整文件

**請參閱 [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) 獲取完整的專案文件**

### 📖 核心文檔
- 🚀 [使用指南](./USAGE_GUIDE.md) - 日常開發和測試流程
- 🌐 [部署指南](./PLAN_A_DEPLOYMENT_GUIDE.md) - Render 部署完整步驟
- 📋 [版本記錄](./CHANGELOG.md) - 詳細更新歷史
- 📊 [版本摘要](./VERSION_v0.4.0_SUMMARY.md) - v0.4.0 完整說明

### 🔧 About Section 文檔
- 📖 [使用指南](./website/ABOUT_SECTION_GUIDE.md) - 功能概述和配置管理
- 📝 [內容管理](./website/ABOUT_CONTENT_MANAGEMENT.md) - 內容更新和圖片管理
- 🚀 [部署指南](./website/ABOUT_SECTION_DEPLOYMENT.md) - 完整部署檢查清單
- ⚡ [快速參考](./website/ABOUT_SECTION_QUICK_REFERENCE.md) - 常用操作速查

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 建置網站
```bash
cd website
npm install
npm run build
```

### 3. 啟動開發環境
```bash
# 使用 PowerShell 腳本 (推薦)
.\start-dev.ps1
```

### 4. 訪問應用程式
- **主網站**: http://localhost:3001
- **請假系統**: http://localhost:3001/career

## 🏗️ 統一架構

本專案採用**統一伺服器架構**：

- **開發環境**: Port **3001**
- **生產環境**: Port **80** (需管理員權限)

## 📋 主要功能

### 主網站 (/)
- 🍪 泰鄉食品產品展示
- 📖 雙頁面關於我們 section (基礎頁面 + 詳細頁面)
- 🖼️ 響應式圖文卡片展示
- 🎨 響應式設計與動畫效果
- 📱 跨裝置相容

### 員工請假系統 (/career)
- 🔐 身份驗證
- 📝 請假申請
- 👨‍💼 管理者功能
- 🌐 多語言支援

## 🔧 技術堆疊

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **後端**: Node.js + Express.js + TypeScript
- **資料**: CSV 檔案處理

## 📄 授權

此專案僅供學習和開發使用。