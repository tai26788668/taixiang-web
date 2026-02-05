# Render 部署設定指南

## 問題診斷

### 問題 1: 前端檔案找不到
**錯誤訊息**: `ENOENT: no such file or directory, stat '/opt/render/project/src/leave_system/dist/index.html'`

**原因**: 前端檔案 (`leave_system/dist`) 沒有被複製到後端部署環境中

**解決方案**: 使用新的 `deploy.sh` 腳本，它會：
1. 先建置前端 (`leave_system`)
2. 再建置後端 (`server`)
3. 將前端檔案複製到後端的 `dist` 目錄

### 問題 2: Persistent Disk 檔案未上傳
**錯誤訊息**: CSV 檔案沒有出現在 `/mnt/data` 中

**原因**: 
- Render 免費方案可能沒有 Persistent Disk 功能
- 環境變數未正確設定
- 初始化腳本執行失敗

**解決方案**: 按照下方步驟正確設定 Persistent Disk

---

## Render Dashboard 設定步驟

### 1. 建立 Persistent Disk（如果需要）

1. 進入 Render Dashboard
2. 選擇你的 Web Service (`taixiang-server`)
3. 點擊左側選單的 **"Disks"**
4. 點擊 **"Add Disk"**
5. 設定：
   - **Name**: `taixiang-data`
   - **Mount Path**: `/mnt/data`
   - **Size**: 1 GB（免費方案可能不支援）
6. 儲存設定

> ⚠️ **注意**: Render 免費方案可能不支援 Persistent Disk。如果無法創建，請考慮升級到付費方案。

### 2. 設定環境變數

在 Render Dashboard 中設定以下環境變數：

```
NODE_ENV=production
PORT=10000
PERSISTENT_DISK_PATH=/mnt/data
JWT_SECRET=your-secret-key-here
LINE_CHANNEL_ACCESS_TOKEN=your-line-token
LINE_CHANNEL_SECRET=your-line-secret
WEBSITE_URL=https://taixiang.onrender.com
```

### 3. 設定建置命令

在 Render Dashboard 的 **"Settings"** 中：

**Build Command**:
```bash
cd server && npm install && npm run build
```

**Start Command**:
```bash
cd server && npm start
```

### 4. 設定根目錄

在 **"Settings"** 中找到 **"Root Directory"**，設定為：
```
./
```

（使用 `./` 表示根目錄，因為建置腳本需要訪問 `leave_system` 和 `server` 兩個目錄）

---

## 部署流程

### 自動部署

1. 推送代碼到 GitHub
2. Render 會自動觸發部署
3. 建置腳本會：
   - 安裝前端依賴
   - 建置前端
   - 編譯後端 TypeScript
   - 複製前端檔案到後端 dist 目錄
   - 初始化 Persistent Disk（如果設定了）

### 手動部署

在 Render Dashboard 中：
1. 點擊 **"Manual Deploy"**
2. 選擇 **"Deploy latest commit"**
3. 等待部署完成

---

## 驗證部署

### 1. 檢查建置日誌

在 Render Dashboard 的 **"Logs"** 中查看建置過程：

```
🚀 泰鄉食品後端部署腳本
============================================================

📦 步驟 1: 建置前端...
------------------------------------------------------------
📥 安裝前端依賴...
🔨 建置前端...
✅ 前端建置完成

📦 步驟 2: 建置後端...
------------------------------------------------------------
🔨 編譯 TypeScript...
✅ TypeScript 編譯完成

📦 步驟 3: 複製必要檔案...
------------------------------------------------------------
📋 複製 LINE Bot 檔案...
✅ LINE Bot 檔案複製完成
📋 複製資料檔案...
✅ 資料檔案複製完成
📋 複製前端檔案...
✅ 前端檔案複製完成
   檔案數量: 15

📦 步驟 4: 初始化 Persistent Disk...
------------------------------------------------------------
🔧 執行 Persistent Disk 初始化...

============================================================
🎉 部署建置完成！
============================================================
```

### 2. 測試端點

部署完成後，測試以下端點：

#### 健康檢查
```bash
curl https://taixiang-server.onrender.com/api/health
```

預期回應：
```json
{
  "success": true,
  "message": "泰鄉食品後端系統運行正常 (方案 A)",
  "services": {
    "leaveSystem": "請假系統",
    "api": "後端 API",
    "lineBot": "LINE Bot Reply System"
  },
  "endpoints": {
    "leaveSystem": "/leave_system",
    "apiHealth": "/api/health",
    "lineBotHealth": "/line/health",
    "lineBotWebhook": "/line/webhook"
  }
}
```

#### 請假系統前端
在瀏覽器中訪問：
```
https://taixiang-server.onrender.com/leave_system
```

應該看到請假系統的登入頁面。

#### LINE Bot 健康檢查
```bash
curl https://taixiang-server.onrender.com/line/health
```

### 3. 檢查 Persistent Disk

在 Render Dashboard 的 **"Shell"** 中執行：

```bash
# 檢查 Persistent Disk 是否掛載
ls -la /mnt/data

# 檢查 CSV 檔案
ls -la /mnt/data/*.csv

# 查看檔案內容（前 5 行）
head -n 5 /mnt/data/請假記錄.csv
```

如果檔案不存在，手動執行初始化：

```bash
cd /opt/render/project/src/server
node ../force-init-disk.js
```

---

## 常見問題

### Q1: 前端頁面顯示 404 或 502

**檢查**:
1. 建置日誌中是否有 "✅ 前端檔案複製完成"
2. 在 Shell 中執行: `ls -la /opt/render/project/src/server/dist/leave_system/`
3. 確認 `index.html` 存在

**解決**:
- 如果檔案不存在，重新部署
- 檢查 `deploy.sh` 是否有執行權限

### Q2: Persistent Disk 初始化失敗

**檢查**:
1. 環境變數 `PERSISTENT_DISK_PATH` 是否設定為 `/mnt/data`
2. Disk 是否已在 Render Dashboard 中創建
3. Mount Path 是否正確設定為 `/mnt/data`

**解決**:
- 在 Shell 中手動執行: `node ../force-init-disk.js`
- 或手動複製檔案:
  ```bash
  cp /opt/render/project/src/server/data/*.csv /mnt/data/
  ```

### Q3: TypeScript 編譯錯誤

**錯誤**: `Could not find a declaration file for module 'express'`

**解決**: 已修復，`@types/*` 套件已移到 `dependencies` 中

### Q4: 免費方案沒有 Persistent Disk

**解決方案**:
1. **選項 A**: 升級到付費方案（推薦）
2. **選項 B**: 使用外部儲存（如 AWS S3、Google Cloud Storage）
3. **選項 C**: 使用資料庫（如 PostgreSQL）儲存資料

---

## 檔案結構

部署後的檔案結構：

```
/opt/render/project/src/
├── leave_system/          # 前端原始碼
│   ├── dist/             # 前端建置輸出（建置時生成）
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   └── ...
├── server/               # 後端原始碼
│   ├── dist/            # 後端建置輸出
│   │   ├── index.js
│   │   ├── leave_system/  # 前端檔案（從 ../leave_system/dist 複製）
│   │   │   ├── index.html
│   │   │   └── ...
│   │   ├── data/         # 資料檔案
│   │   │   ├── 請假記錄.csv
│   │   │   └── 請假系統個人資料.csv
│   │   └── ...
│   └── ...
└── /mnt/data/           # Persistent Disk（如果設定了）
    ├── 請假記錄.csv
    └── 請假系統個人資料.csv
```

---

## 相關文件

- `server/deploy.sh` - 統一部署腳本
- `server/build.sh` - 舊的建置腳本（已棄用）
- `force-init-disk.js` - 強制初始化 Persistent Disk
- `manual-init-disk.js` - 手動初始化腳本
- `diagnose-persistent-disk.js` - 診斷腳本

---

## 聯絡支援

如果問題持續存在：
1. 檢查 Render Dashboard 的完整日誌
2. 在 Shell 中執行診斷腳本: `node ../diagnose-persistent-disk.js`
3. 聯絡 Render 支援團隊
