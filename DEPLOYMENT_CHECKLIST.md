# 🚀 部署前檢查清單

## ✅ 部署準備檢查

### 1. 程式碼準備
- [x] 所有不必要的檔案已刪除
- [x] 建置腳本已修正 (跨平台相容)
- [x] 環境變數名稱已統一
- [x] LINE Bot 功能已整合到後端系統

### 2. 建置測試
```bash
# 測試 website 建置
cd website && npm install && npm run build

# 測試 leave_system 建置  
cd leave_system && npm install && npm run build

# 測試 server 建置
cd server && npm install && npm run build
```

### 3. 環境變數檢查
確保以下環境變數在 Render 中正確設置：
- `NODE_ENV=production`
- `PORT=10000`
- `JWT_SECRET` (自動生成)
- `LINE_CHANNEL_ACCESS_TOKEN` (從 LINE Developers Console 獲取)
- `LINE_CHANNEL_SECRET` (從 LINE Developers Console 獲取)

### 4. 部署配置
- **主網站 (Static Site)**:
  - Root Directory: `website`
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`

- **後端系統 (Web Service)**:
  - Root Directory: *(留空)*
  - Build Command: `cd leave_system && npm ci && npm run build && cd ../server && npm ci && npm run build`
  - Start Command: `cd server && npm start`

### 5. LINE Bot 設置
- Webhook URL: `https://taixiang-server.onrender.com/line/webhook`
- 支援指令: `help?`, `list`, `list -a`, `list -d`, `list -d -a`

## 🧹 已清理的檔案

### 刪除的不必要檔案：
- ❌ `VERSION_TAG_*.md` (8個版本標記檔案)
- ❌ `VERSION_v*.md` (4個版本摘要檔案)  
- ❌ `quick-test.ps1` (測試腳本)
- ❌ `ARCHITECTURE_CLARIFICATION.md` (已整合到部署指南)
- ❌ `website/public/movie/IMG_8101.MOV` (大型影片檔案)
- ❌ `website/public/movie/IMG_8099.JPG` (大型圖片檔案)
- ❌ `website/public/movie/Untitled.prproj` (Premiere Pro 專案檔)

### 修正的問題：
- ✅ 建置腳本跨平台相容性 (`copy` → 跨平台命令)
- ✅ 環境變數名稱統一 (`CHANNEL_*` → `LINE_CHANNEL_*`)
- ✅ 部署指南建置命令修正
- ✅ .gitignore 更新以排除不需要的檔案

## 📊 專案大小優化

清理前後對比：
- 刪除了 12+ 個不必要的檔案
- 移除了大型媒體檔案 (>50MB)
- 優化了建置流程
- 統一了配置標準

## 🎯 部署就緒狀態

✅ **主網站**: 準備部署到 Render Static Site  
✅ **後端系統**: 準備部署到 Render Web Service  
✅ **LINE Bot**: 已整合到後端系統  
✅ **建置腳本**: 跨平台相容  
✅ **環境配置**: 標準化完成  

**總成本**: $7/月 (僅後端系統收費)

---

**檢查清單版本**: v1.0  
**最後更新**: 2026年1月6日  
**適用於**: 方案 A - 分離部署