# 部署問題修復摘要

## 問題概述

### 問題 1: 前端檔案找不到 ❌
**錯誤**: `ENOENT: no such file or directory, stat '/opt/render/project/src/leave_system/dist/index.html'`

**原因**: 前端檔案沒有被複製到後端部署環境

### 問題 2: Persistent Disk 檔案未上傳 ❌
**錯誤**: CSV 檔案沒有出現在 `/mnt/data` 中

**原因**: Persistent Disk 初始化失敗或未正確設定

---

## 解決方案

### 已完成的修復

1. ✅ 創建新的 `server/deploy.sh` 統一部署腳本
   - 自動建置前端
   - 編譯後端
   - 複製前端檔案到後端 dist 目錄
   - 初始化 Persistent Disk

2. ✅ 更新 `server/package.json` 使用新的部署腳本
   - `npm run build` 現在會執行完整的部署流程

3. ✅ 改善 `force-init-disk.js` 錯誤處理
   - 自動尋找多個可能的來源路徑
   - 提供詳細的診斷資訊
   - 備份現有檔案

4. ✅ 創建 `RENDER_DEPLOYMENT_SETUP.md` 完整部署指南

---

## 立即行動步驟

### 步驟 1: 更新 Render 設定

在 Render Dashboard 中：

1. **Build Command** 改為：
   ```bash
   cd server && npm install && npm run build
   ```

2. **Start Command** 保持：
   ```bash
   cd server && npm start
   ```

3. **Root Directory** 設為：
   ```
   /
   ```
   （不要設為 `/server`，因為建置腳本需要訪問 `leave_system` 目錄）

### 步驟 2: 設定環境變數

確保以下環境變數已設定：

```
NODE_ENV=production
PORT=10000
PERSISTENT_DISK_PATH=/mnt/data
JWT_SECRET=your-secret-key
LINE_CHANNEL_ACCESS_TOKEN=your-token
LINE_CHANNEL_SECRET=your-secret
WEBSITE_URL=https://taixiang.onrender.com
```

### 步驟 3: 設定 Persistent Disk（如果需要）

1. 在 Render Dashboard 點擊 **"Disks"**
2. 點擊 **"Add Disk"**
3. 設定：
   - Name: `taixiang-data`
   - Mount Path: `/mnt/data`
   - Size: 1 GB

> ⚠️ **注意**: Render 免費方案可能不支援 Persistent Disk

### 步驟 4: 提交並部署

```bash
# 提交變更
git add .
git commit -m "修復部署問題：統一建置腳本和 Persistent Disk 初始化"
git push origin main
```

Render 會自動觸發部署。

### 步驟 5: 驗證部署

部署完成後，檢查：

1. **前端頁面**:
   ```
   https://taixiang-server.onrender.com/leave_system
   ```
   應該看到登入頁面

2. **健康檢查**:
   ```bash
   curl https://taixiang-server.onrender.com/api/health
   ```
   應該返回 JSON 回應

3. **Persistent Disk**（在 Render Shell 中）:
   ```bash
   ls -la /mnt/data
   ```
   應該看到 CSV 檔案

---

## 如果問題持續存在

### 前端檔案仍然找不到

在 Render Shell 中執行：

```bash
# 檢查前端檔案是否存在
ls -la /opt/render/project/src/server/dist/leave_system/

# 如果不存在，檢查建置日誌
# 尋找 "✅ 前端檔案複製完成" 訊息
```

**解決方案**:
- 確認 Root Directory 設為 `./`（不是 `/server`）
- 確認 Build Command 是 `cd server && npm install && npm run build`
- 手動觸發重新部署

### Persistent Disk 仍然沒有檔案

在 Render Shell 中執行：

```bash
# 檢查 Disk 是否掛載
df -h | grep /mnt/data

# 手動執行強制初始化
cd /opt/render/project/src
node force-init-disk.js

# 驗證檔案
ls -la /mnt/data/*.csv
```

**如果 Disk 未掛載**:
1. 確認 Render Dashboard 中 Disk 狀態為 "Available"
2. 確認 Mount Path 設為 `/mnt/data`
3. 確認環境變數 `PERSISTENT_DISK_PATH=/mnt/data`
4. 重新部署服務

**如果免費方案不支援 Disk**:
- 考慮升級到付費方案
- 或使用外部儲存（AWS S3、Google Cloud Storage）
- 或使用資料庫（PostgreSQL）

---

## 建置流程說明

新的 `deploy.sh` 腳本執行以下步驟：

```
1. 建置前端
   └─ cd leave_system
   └─ npm install (如果需要)
   └─ npm run build
   └─ 生成 leave_system/dist/

2. 建置後端
   └─ cd server
   └─ tsc (編譯 TypeScript)
   └─ 生成 server/dist/

3. 複製檔案
   ├─ 複製 LINE Bot: src/line-bot.js → dist/line-bot.js
   ├─ 複製資料: data/ → dist/data/
   └─ 複製前端: ../leave_system/dist/ → dist/leave_system/

4. 初始化 Persistent Disk
   └─ 執行 init-persistent-disk.js
   └─ 如果失敗，執行 force-init-disk.js
```

---

## 檔案結構

部署後的檔案結構：

```
/opt/render/project/src/
├── leave_system/
│   └── dist/              # 前端建置輸出
│       ├── index.html
│       └── assets/
├── server/
│   └── dist/              # 後端建置輸出
│       ├── index.js
│       ├── leave_system/  # 前端檔案（複製自 ../leave_system/dist）
│       │   ├── index.html
│       │   └── assets/
│       └── data/          # 資料檔案
│           ├── 請假記錄.csv
│           └── 請假系統個人資料.csv
└── /mnt/data/             # Persistent Disk
    ├── 請假記錄.csv
    └── 請假系統個人資料.csv
```

---

## 相關文件

- `RENDER_DEPLOYMENT_SETUP.md` - 完整部署指南
- `server/deploy.sh` - 統一部署腳本
- `force-init-disk.js` - 強制初始化 Persistent Disk
- `diagnose-persistent-disk.js` - 診斷腳本

---

## 聯絡資訊

如果問題持續存在，請：
1. 檢查 Render Dashboard 的完整建置日誌
2. 在 Render Shell 中執行診斷腳本
3. 聯絡 Render 支援團隊
