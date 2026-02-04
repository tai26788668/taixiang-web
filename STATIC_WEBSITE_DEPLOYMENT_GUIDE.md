# 靜態網頁部署指南 (Render Static Site)

## 📋 概述

泰鄉食品主網站是一個使用 React + TypeScript + Vite 建置的靜態網站，需要部署到 Render 的 Static Site 服務。

## 🏗️ 網站架構

```
website/
├── src/
│   ├── components/     # React 組件
│   ├── config/        # 網站配置
│   ├── hooks/         # 自定義 Hooks
│   └── main.tsx       # 應用程式入口
├── public/            # 靜態資源
├── package.json       # 依賴管理
├── vite.config.ts     # Vite 配置
└── tailwind.config.js # Tailwind CSS 配置
```

## 🚀 Render Static Site 部署步驟

### 1. 建立 Static Site 服務

1. **登入 Render Dashboard**
   - 前往 [render.com](https://render.com)
   - 登入你的新帳號

2. **建立新的 Static Site**
   - 點擊 "New +" 按鈕
   - 選擇 "Static Site"

3. **連接 GitHub 倉庫**
   - 選擇你的 GitHub 倉庫
   - 分支：`main`

### 2. 配置建置設定

#### 基本設定
- **Name**: `tai-xiang-website` (或你想要的名稱)
- **Root Directory**: `website`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

#### 進階設定
- **Auto-Deploy**: `Yes` (啟用自動部署)
- **Branch**: `main`

### 3. 環境變數設定 (如果需要)

目前網站不需要特殊的環境變數，但如果未來需要，可以在 "Environment" 頁面設定。

### 4. 自定義 Domain (可選)

如果你有自己的 domain：
1. 在 "Settings" → "Custom Domains" 中新增
2. 設定 DNS 記錄指向 Render

## 📁 建置流程詳解

### 本地測試建置
在部署前，建議先在本地測試建置：

```bash
# 進入網站目錄
cd website

# 安裝依賴
npm install

# 建置專案
npm run build

# 預覽建置結果
npm run preview
```

### 建置輸出
建置完成後會產生 `website/dist/` 目錄，包含：
- `index.html` - 主頁面
- `assets/` - CSS、JS、圖片等資源
- 其他靜態檔案

## 🔧 部署配置檔案

### 建議新增 `website/.nvmrc` (Node 版本)
```
18
```

### 建議新增 `website/render.yaml` (Render 配置)
```yaml
services:
  - type: web
    name: tai-xiang-website
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

## 🌐 部署後的 URL 結構

部署完成後，你的網站將可通過以下 URL 訪問：
- **Render 預設 URL**: `https://your-site-name.onrender.com`
- **自定義 Domain** (如果設定): `https://your-domain.com`

## 📋 部署檢查清單

### 部署前檢查
- [ ] 確認 `website/package.json` 中的建置腳本正確
- [ ] 本地測試 `npm run build` 成功
- [ ] 檢查 `website/src/config/websiteConfig.ts` 中的設定
- [ ] 確認所有圖片和資源檔案都在 `website/public/` 目錄中

### 部署設定檢查
- [ ] Root Directory: `website`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] Auto-Deploy: 啟用

### 部署後測試
- [ ] 網站正常載入
- [ ] 所有頁面區塊顯示正確
- [ ] 圖片和資源正常載入
- [ ] 響應式設計在不同裝置上正常
- [ ] 員工專區連結指向正確的後端 URL

## 🔄 更新和維護

### 自動部署
- 每次推送到 `main` 分支時，Render 會自動重新建置和部署
- 建置時間通常 2-5 分鐘

### 手動重新部署
1. 前往 Render Dashboard
2. 選擇你的 Static Site
3. 點擊 "Manual Deploy" → "Deploy latest commit"

### 監控部署狀態
- 在 Render Dashboard 中查看 "Events" 頁面
- 檢查建置日誌以排除問題

## 🛠️ 故障排除

### 常見問題

#### 1. 建置失敗
**症狀**: 部署時建置過程失敗
**解決方案**:
- 檢查 `package.json` 中的依賴版本
- 確認 Node.js 版本相容性
- 檢查建置日誌中的錯誤訊息

#### 2. 資源檔案 404
**症狀**: 圖片或 CSS 檔案無法載入
**解決方案**:
- 確認檔案路徑使用相對路徑
- 檢查 `website/public/` 目錄中的檔案
- 確認 Vite 配置正確

#### 3. 路由問題
**症狀**: 重新整理頁面時出現 404
**解決方案**:
- 新增 `_redirects` 檔案到 `website/public/`:
  ```
  /*    /index.html   200
  ```

#### 4. 員工專區連結錯誤
**症狀**: 點擊員工專區無法正確跳轉
**解決方案**:
- 檢查 `website/src/config/websiteConfig.ts` 中的 `backendUrl`
- 確認後端服務已正確部署

### 除錯工具

#### 檢查建置輸出
```bash
cd website
npm run build
ls -la dist/
```

#### 本地預覽
```bash
cd website
npm run preview
```

#### 檢查網站配置
```bash
# 檢查配置檔案
cat website/src/config/websiteConfig.ts
```

## 📊 效能優化

### 建置優化
- 已啟用 code splitting
- 已設定 vendor chunks
- 已啟用 sourcemap

### 快取策略
Render 會自動處理靜態資源的快取，包括：
- CSS/JS 檔案：長期快取
- HTML 檔案：短期快取
- 圖片資源：中期快取

## 🔗 相關連結

- **Render Static Sites 文檔**: https://render.com/docs/static-sites
- **Vite 部署指南**: https://vitejs.dev/guide/static-deploy.html
- **React 部署最佳實踐**: https://create-react-app.dev/docs/deployment/

---

## 🚀 快速部署指令

```bash
# 1. 測試本地建置
cd website && npm install && npm run build

# 2. 在 Render 建立 Static Site
# - Repository: 你的 GitHub 倉庫
# - Root Directory: website
# - Build Command: npm install && npm run build
# - Publish Directory: dist

# 3. 部署完成後測試
curl -I https://your-site-name.onrender.com
```

**部署完成後，你的泰鄉食品主網站就會在新的 URL 上線了！**