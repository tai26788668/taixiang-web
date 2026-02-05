# 🚀 快速修復指南

## 問題 1: 前端頁面 404/502 錯誤

### 症狀
訪問 `https://taixiang-server.onrender.com/leave_system` 出現：
- 502 Bad Gateway
- 404 Not Found
- `ENOENT: no such file or directory, stat '.../leave_system/dist/index.html'`

### 快速修復
```bash
# 1. 確認 Render 設定
Build Command: cd server && npm install && npm run build
Start Command: cd server && npm start
Root Directory: /

# 2. 提交並部署
git add .
git commit -m "修復部署問題"
git push origin main

# 3. 等待部署完成，檢查日誌中是否有：
# ✅ 前端建置完成
# ✅ 前端檔案複製完成
```

### 驗證
```bash
# 在瀏覽器訪問
https://taixiang-server.onrender.com/leave_system

# 應該看到登入頁面
```

---

## 問題 2: Persistent Disk 沒有檔案

### 症狀
CSV 檔案沒有出現在 `/mnt/data` 中

### 快速修復

#### 選項 A: 自動修復（推薦）
```bash
# 在 Render Shell 中執行
cd /opt/render/project/src
node force-init-disk.js
```

#### 選項 B: 手動複製
```bash
# 在 Render Shell 中執行
cp /opt/render/project/src/server/data/*.csv /mnt/data/
ls -la /mnt/data/
```

### 驗證
```bash
# 檢查檔案
ls -la /mnt/data/*.csv

# 應該看到：
# 請假記錄.csv
# 請假系統個人資料.csv
```

---

## 問題 3: 免費方案沒有 Persistent Disk

### 症狀
無法在 Render Dashboard 創建 Disk

### 解決方案

#### 選項 A: 升級方案（推薦）
升級到 Render 付費方案以使用 Persistent Disk

#### 選項 B: 使用本地儲存
修改代碼使用 `server/data` 目錄（不推薦，重啟會遺失資料）

#### 選項 C: 使用外部儲存
- AWS S3
- Google Cloud Storage
- PostgreSQL 資料庫

---

## 環境變數檢查清單

在 Render Dashboard 確認以下環境變數：

```
✅ NODE_ENV=production
✅ PORT=10000
✅ PERSISTENT_DISK_PATH=/mnt/data
✅ JWT_SECRET=your-secret-key
✅ LINE_CHANNEL_ACCESS_TOKEN=your-token
✅ LINE_CHANNEL_SECRET=your-secret
✅ WEBSITE_URL=https://taixiang.onrender.com
```

---

## 快速測試命令

### 測試健康檢查
```bash
curl https://taixiang-server.onrender.com/api/health
```

### 測試前端
在瀏覽器訪問：
```
https://taixiang-server.onrender.com/leave_system
```

### 測試 LINE Bot
```bash
curl https://taixiang-server.onrender.com/line/health
```

---

## 需要更多幫助？

查看詳細文檔：
- `RENDER_DEPLOYMENT_SETUP.md` - 完整部署指南
- `DEPLOYMENT_FIX_SUMMARY.md` - 問題修復摘要
- `PERSISTENT_DISK_SETUP.md` - Persistent Disk 設定
