# Persistent Disk 配置驗證

## ✅ 確認清單

### 1. 環境變數設定

在 Render Dashboard 的 Environment Variables 中確認：

```
PERSISTENT_DISK_PATH=/mnt/data
```

**重要**: 
- 路徑必須是 `/mnt/data`（不是 `./mnt/data` 或其他）
- 不要有多餘的空格或引號

### 2. Persistent Disk 掛載

在 Render Dashboard 的 Disks 設定中確認：

- **Name**: `taixiang-data`（或任何名稱）
- **Mount Path**: `/mnt/data`
- **Size**: 1 GB（或更大）
- **Status**: Available

### 3. 程式碼中的路徑

所有程式碼都已正確配置使用 `/mnt/data`：

#### TypeScript 服務
- ✅ `server/src/services/personalDataService.ts`
  ```typescript
  if (process.env.PERSISTENT_DISK_PATH) {
    const persistentPath = path.join(process.env.PERSISTENT_DISK_PATH, '請假系統個人資料.csv');
    // 預設: /mnt/data/請假系統個人資料.csv
  }
  ```

- ✅ `server/src/services/leaveRecordService.ts`
  ```typescript
  if (process.env.PERSISTENT_DISK_PATH) {
    const persistentPath = path.join(process.env.PERSISTENT_DISK_PATH, '請假記錄.csv');
    // 預設: /mnt/data/請假記錄.csv
  }
  ```

- ✅ `server/src/routes/email.ts`
  ```typescript
  const csvFilePath = process.env.PERSISTENT_DISK_PATH
    ? path.join(process.env.PERSISTENT_DISK_PATH, '請假記錄.csv')
    : path.join(__dirname, '../../data/請假記錄.csv');
  ```

#### 初始化腳本
- ✅ `server/src/scripts/init-persistent-disk.ts`
  ```typescript
  const PERSISTENT_DISK_PATH = process.env.PERSISTENT_DISK_PATH || '/mnt/data';
  ```

- ✅ `force-init-disk.js`
  ```javascript
  const PERSISTENT_DISK_PATH = process.env.PERSISTENT_DISK_PATH || '/mnt/data';
  ```

### 4. 回退機制

如果 Persistent Disk 不可用，系統會自動回退到本地 `dist/data` 目錄：

```typescript
// 優先使用 Persistent Disk
if (process.env.PERSISTENT_DISK_PATH) {
  const persistentPath = path.join(process.env.PERSISTENT_DISK_PATH, '檔案.csv');
  if (fs.existsSync(persistentPath)) {
    return persistentPath; // 使用 Persistent Disk
  }
}

// 回退到本地 data 目錄
return path.join(__dirname, '../../data/檔案.csv');
```

## 🔍 驗證步驟

### 在 Render Shell 中執行：

```bash
# 1. 檢查環境變數
echo $PERSISTENT_DISK_PATH
# 應該輸出: /mnt/data

# 2. 檢查 Disk 是否掛載
df -h | grep /mnt/data
# 應該看到掛載資訊

# 3. 檢查目錄權限
ls -la /mnt/data
# 應該看到目錄內容

# 4. 檢查 CSV 檔案
ls -la /mnt/data/*.csv
# 應該看到兩個 CSV 檔案

# 5. 測試檔案讀取
head -n 5 /mnt/data/請假系統個人資料.csv
# 應該看到 CSV 內容
```

### 如果檔案不存在：

```bash
# 執行強制初始化
cd /opt/render/project/src
node force-init-disk.js

# 驗證結果
ls -la /mnt/data/*.csv
```

## 📊 路徑優先順序

系統會按以下順序尋找資料檔案：

1. **Persistent Disk** (如果 `PERSISTENT_DISK_PATH` 已設定且檔案存在)
   - `/mnt/data/請假系統個人資料.csv`
   - `/mnt/data/請假記錄.csv`

2. **本地 dist/data** (回退選項)
   - `/opt/render/project/src/server/dist/data/請假系統個人資料.csv`
   - `/opt/render/project/src/server/dist/data/請假記錄.csv`

3. **本地 data** (開發環境)
   - `/opt/render/project/src/server/data/請假系統個人資料.csv`
   - `/opt/render/project/src/server/data/請假記錄.csv`

## ⚠️ 常見問題

### 問題 1: 環境變數設定錯誤

❌ 錯誤設定：
```
PERSISTENT_DISK_PATH=./mnt/data
PERSISTENT_DISK_PATH="./mnt/data"
PERSISTENT_DISK_PATH = /mnt/data
```

✅ 正確設定：
```
PERSISTENT_DISK_PATH=/mnt/data
```

### 問題 2: Disk 未掛載

檢查 Render Dashboard:
- Disk 狀態必須是 "Available"
- Mount Path 必須是 `/mnt/data`
- 服務必須重新部署才能生效

### 問題 3: 檔案權限問題

在 Shell 中執行：
```bash
# 檢查權限
ls -la /mnt/data

# 如果需要，修改權限
chmod 644 /mnt/data/*.csv
```

## ✅ 確認配置正確

所有路徑都已正確配置為 `/mnt/data`，系統會：

1. ✅ 優先使用 Persistent Disk (`/mnt/data`)
2. ✅ 如果 Disk 不可用，自動回退到本地 `dist/data`
3. ✅ 在啟動時顯示使用的檔案路徑
4. ✅ 提供詳細的錯誤訊息和診斷資訊

現在可以安全部署！
