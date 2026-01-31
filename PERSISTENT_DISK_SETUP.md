# Persistent Disk 設定指南

## 概述

此指南說明如何在 Render 上設定 Persistent Disk，以永久保存請假系統的 CSV 資料。

## 為什麼需要 Persistent Disk？

Render 的 Web Service 使用 **ephemeral（臨時）檔案系統**：
- ❌ 每次部署時會重置
- ❌ 服務重啟時會重置
- ❌ 所有運行時寫入的資料都會遺失

使用 Persistent Disk 後：
- ✅ 資料永久保存
- ✅ 部署時不會遺失
- ✅ 服務重啟時不會遺失

## 費用

- **1 GB Disk**: $1/月
- **10 GB Disk**: $10/月

對於請假系統，1 GB 已經足夠使用。

## 設定步驟

### 步驟 1：在 Render Dashboard 創建 Persistent Disk

1. **登入 Render Dashboard**
   - 前往 https://dashboard.render.com
   - 選擇你的 `tai-xiang-backend` Web Service

2. **創建 Disk**
   - 點擊左側選單的 **"Disks"** 標籤
   - 點擊 **"Add Disk"** 按鈕

3. **填寫設定**
   ```
   Name: tai-xiang-data
   Mount Path: /mnt/data
   Size: 1 GB
   ```

4. **創建並等待**
   - 點擊 **"Create"**
   - 等待 1-2 分鐘直到狀態變為 "Available"

### 步驟 2：設定環境變數

1. **在 Render Dashboard 中**
   - 進入你的 Web Service
   - 點擊 **"Environment"** 標籤
   - 點擊 **"Add Environment Variable"**

2. **添加變數**
   ```
   Key: PERSISTENT_DISK_PATH
   Value: /mnt/data
   ```

3. **儲存**
   - 點擊 **"Save Changes"**

### 步驟 3：部署程式碼

1. **提交並推送程式碼**
   ```bash
   git add -A
   git commit -m "feat: 新增 Persistent Disk 支援"
   git push origin main
   ```

2. **Render 會自動部署**
   - 等待部署完成（約 3-5 分鐘）
   - 查看部署日誌確認初始化成功

3. **檢查初始化日誌**
   在部署日誌中應該看到：
   ```
   ============================================================
   Persistent Disk 初始化
   ============================================================
   Disk 路徑: /mnt/data
   來源路徑: /app/server/data
   
   ✅ Persistent Disk 已掛載
   
   ✅ 複製成功: 請假記錄.csv
   ✅ 複製成功: 請假系統個人資料.csv
   
   ============================================================
   初始化完成
   複製: 2 個檔案
   跳過: 0 個檔案
   ============================================================
   ```

### 步驟 4：驗證功能

1. **測試請假申請**
   - 登入請假系統
   - 提交一筆新的請假申請
   - 記錄 ID（例如：R006）

2. **等待隔天**
   - 隔天再次登入系統
   - 確認昨天的請假記錄仍然存在

3. **測試部署**
   - 進行一次小的程式碼修改並部署
   - 確認資料沒有遺失

## 檔案結構

### 本地開發環境
```
server/
├── data/                    ← 本地開發使用
│   ├── 請假記錄.csv
│   └── 請假系統個人資料.csv
└── src/
    └── scripts/
        └── init-persistent-disk.ts
```

### Render 生產環境
```
/app/server/
├── data/                    ← 初始資料（唯讀）
│   ├── 請假記錄.csv
│   └── 請假系統個人資料.csv
└── dist/

/mnt/data/                   ← Persistent Disk（讀寫）
├── 請假記錄.csv
└── 請假系統個人資料.csv
```

## 程式碼變更說明

### 1. 服務層修改

**leaveRecordService.ts**:
```typescript
const LEAVE_RECORD_FILE = process.env.NODE_ENV === 'test' 
  ? path.join(__dirname, '../../test-data/請假記錄.csv')
  : process.env.PERSISTENT_DISK_PATH 
    ? path.join(process.env.PERSISTENT_DISK_PATH, '請假記錄.csv')
    : path.join(__dirname, '../../data/請假記錄.csv');
```

**personalDataService.ts**:
```typescript
const PERSONAL_DATA_FILE = process.env.NODE_ENV === 'test' 
  ? path.join(__dirname, '../../test-data/請假系統個人資料.csv')
  : process.env.PERSISTENT_DISK_PATH 
    ? path.join(process.env.PERSISTENT_DISK_PATH, '請假系統個人資料.csv')
    : path.join(__dirname, '../../data/請假系統個人資料.csv');
```

### 2. 初始化腳本

**init-persistent-disk.ts**:
- 在首次部署時執行
- 將初始 CSV 資料複製到 Persistent Disk
- 如果檔案已存在則跳過（不會覆蓋現有資料）

### 3. package.json

新增腳本：
```json
{
  "scripts": {
    "init-disk": "ts-node src/scripts/init-persistent-disk.ts",
    "postbuild": "npm run init-disk || echo 'Skipping disk initialization'"
  }
}
```

## 本地開發

本地開發時不需要設定 `PERSISTENT_DISK_PATH`，系統會自動使用 `./data` 目錄。

```bash
# 本地開發
cd server
npm run dev
```

## 故障排除

### 問題 1：初始化失敗

**錯誤訊息**:
```
❌ Persistent Disk 不存在: /mnt/data
```

**解決方法**:
1. 確認 Render Dashboard 中已創建 Disk
2. 確認 Mount Path 設定為 `/mnt/data`
3. 確認 Disk 狀態為 "Available"
4. 重新部署服務

### 問題 2：檔案權限錯誤

**錯誤訊息**:
```
EACCES: permission denied
```

**解決方法**:
1. Render 會自動處理權限
2. 如果仍有問題，聯繫 Render 支援

### 問題 3：資料仍然遺失

**可能原因**:
1. 環境變數 `PERSISTENT_DISK_PATH` 未設定
2. Disk 未正確掛載
3. 程式碼未正確部署

**檢查步驟**:
1. 查看 Render Dashboard 的 Environment 標籤
2. 確認 `PERSISTENT_DISK_PATH=/mnt/data`
3. 查看部署日誌確認初始化成功
4. 重新部署服務

## 備份建議

雖然 Persistent Disk 會永久保存資料，但仍建議定期備份：

### 方法 1：使用緊急備份 API

```bash
# 下載請假記錄
curl -H "User-Agent: TaiXiang-Emergency-Backup-Tool" \
     -o "backup-$(date +%Y%m%d).csv" \
     "https://tai-xiang-backend.onrender.com/api/backup/emergency-download?file=leave-records"
```

### 方法 2：設定定時備份

使用 GitHub Actions 或其他 CI/CD 工具定期執行備份腳本。

## 監控

建議監控以下指標：

1. **Disk 使用量**
   - 在 Render Dashboard 查看
   - 接近 1GB 時考慮升級

2. **檔案完整性**
   - 定期檢查 CSV 檔案格式
   - 使用 `/api/backup/status` 檢查

3. **寫入錯誤**
   - 查看伺服器日誌
   - 監控錯誤率

## 成本估算

| 項目 | 費用 |
|------|------|
| Web Service (免費方案) | $0/月 |
| Persistent Disk (1GB) | $1/月 |
| **總計** | **$1/月** |

## 升級路徑

如果未來需要更好的效能或功能：

1. **增加 Disk 容量**
   - 在 Render Dashboard 調整大小
   - 費用按比例增加

2. **遷移到 PostgreSQL**
   - 更好的效能和查詢能力
   - 免費方案：$0/月（需定期續期）
   - 付費方案：$7/月

## 相關文件

- [Render Persistent Disks 官方文檔](https://render.com/docs/disks)
- [緊急備份指南](./EMERGENCY_BACKUP_GUIDE.md)
- [版本 v1.3.6 更新摘要](./VERSION_v1.3.6_SUMMARY.md)

## 支援

如有問題，請：
1. 查看 Render 部署日誌
2. 檢查本文檔的故障排除章節
3. 聯繫 Render 支援團隊

---

**最後更新**: 2026-01-20
**版本**: 1.0.0
