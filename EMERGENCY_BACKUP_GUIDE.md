# 緊急備份 API 使用指南

## 概述
當系統管理員帳號密碼遺失時，可以使用此緊急備份 API 下載重要的 CSV 資料文件。

## 安全機制
- **User-Agent 驗證**：需要特定的 User-Agent 標頭
- **行為記錄**：所有下載行為都會被記錄
- **IP 追蹤**：記錄請求來源 IP
- **文件限制**：只能下載指定的 CSV 文件

## API 端點

### 1. 檢查備份文件狀態
```
GET /api/backup/status
```

**必要標頭：**
```
User-Agent: TaiXiang-Emergency-Backup-Tool
```

**回應範例：**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "fileName": "請假紀錄.csv",
        "exists": true,
        "size": 1024,
        "lastModified": "2026-01-11T10:30:00.000Z"
      },
      {
        "fileName": "請假系統個人資料.csv", 
        "exists": true,
        "size": 512,
        "lastModified": "2026-01-11T09:15:00.000Z"
      }
    ],
    "serverTime": "2026-01-11T11:00:00.000Z"
  },
  "message": "備份文件狀態"
}
```

### 2. 下載備份文件
```
GET /api/backup/emergency-download?file={file-type}
```

**必要標頭：**
```
User-Agent: TaiXiang-Emergency-Backup-Tool
```

**參數：**
- `file=leave-records` - 下載請假紀錄
- `file=personal-data` - 下載個人資料

**不帶參數時會返回可用文件列表：**
```
GET /api/backup/emergency-download
```

## 使用範例

### 使用 curl 命令

1. **檢查文件狀態：**
```bash
# 本地測試
curl -H "User-Agent: TaiXiang-Emergency-Backup-Tool" \
     "http://localhost:10000/api/backup/status"

# Render 部署 (請替換為實際 URL)
curl -H "User-Agent: TaiXiang-Emergency-Backup-Tool" \
     "https://your-render-app.onrender.com/api/backup/status"
```

2. **下載請假紀錄：**
```bash
# 本地測試
curl -H "User-Agent: TaiXiang-Emergency-Backup-Tool" \
     -o "leave-records-backup.csv" \
     "http://localhost:10000/api/backup/emergency-download?file=leave-records"

# Render 部署 (請替換為實際 URL)
curl -H "User-Agent: TaiXiang-Emergency-Backup-Tool" \
     -o "leave-records-backup.csv" \
     "https://your-render-app.onrender.com/api/backup/emergency-download?file=leave-records"
```

3. **下載個人資料：**
```bash
# 本地測試
curl -H "User-Agent: TaiXiang-Emergency-Backup-Tool" \
     -o "personal-data-backup.csv" \
     "http://localhost:10000/api/backup/emergency-download?file=personal-data"

# Render 部署 (請替換為實際 URL)
curl -H "User-Agent: TaiXiang-Emergency-Backup-Tool" \
     -o "personal-data-backup.csv" \
     "https://your-render-app.onrender.com/api/backup/emergency-download?file=personal-data"
```

### 使用 PowerShell (Windows)

1. **檢查文件狀態：**
```powershell
# 本地測試
$headers = @{ "User-Agent" = "TaiXiang-Emergency-Backup-Tool" }
Invoke-RestMethod -Uri "http://localhost:10000/api/backup/status" -Headers $headers

# Render 部署 (請替換為實際 URL)
$headers = @{ "User-Agent" = "TaiXiang-Emergency-Backup-Tool" }
Invoke-RestMethod -Uri "https://your-render-app.onrender.com/api/backup/status" -Headers $headers
```

2. **下載請假紀錄：**
```powershell
# 本地測試
$headers = @{ "User-Agent" = "TaiXiang-Emergency-Backup-Tool" }
Invoke-WebRequest -Uri "http://localhost:10000/api/backup/emergency-download?file=leave-records" -Headers $headers -OutFile "leave-records-backup.csv"

# Render 部署 (請替換為實際 URL)
$headers = @{ "User-Agent" = "TaiXiang-Emergency-Backup-Tool" }
Invoke-WebRequest -Uri "https://your-render-app.onrender.com/api/backup/emergency-download?file=leave-records" -Headers $headers -OutFile "leave-records-backup.csv"
```

3. **下載個人資料：**
```powershell
# 本地測試
$headers = @{ "User-Agent" = "TaiXiang-Emergency-Backup-Tool" }
Invoke-WebRequest -Uri "http://localhost:10000/api/backup/emergency-download?file=personal-data" -Headers $headers -OutFile "personal-data-backup.csv"

# Render 部署 (請替換為實際 URL)
$headers = @{ "User-Agent" = "TaiXiang-Emergency-Backup-Tool" }
Invoke-WebRequest -Uri "https://your-render-app.onrender.com/api/backup/emergency-download?file=personal-data" -Headers $headers -OutFile "personal-data-backup.csv"
```

## 部署環境說明

### 本地開發環境
- **URL**: `http://localhost:10000`
- **用途**: 開發和測試

### Render 雲端部署
- **URL**: `https://your-render-app.onrender.com` (請替換為實際的 Render 應用 URL)
- **用途**: 生產環境
- **注意**: 
  - 確保 Render 應用已正確部署並運行
  - 使用 HTTPS 協議
  - 替換 URL 中的 `your-render-app` 為實際的應用名稱

### 跨平台兼容性
- ✅ **Windows PowerShell**: 完全支援，無論本地或雲端部署
- ✅ **Linux/Mac Bash**: 完全支援
- ✅ **任何支援 HTTP 請求的工具**: curl, wget, Postman 等

## 安全注意事項

1. **保護 User-Agent**：不要在公開場所暴露特定的 User-Agent 字串
2. **定期檢查日誌**：監控 `/api/backup/` 端點的存取記錄
3. **網路安全**：確保在安全的網路環境下使用
4. **及時恢復**：下載備份後應盡快恢復正常的帳號密碼存取

## 錯誤處理

### 常見錯誤回應：

**未授權存取 (403)：**
```json
{
  "success": false,
  "error": "UNAUTHORIZED", 
  "message": "未授權的存取"
}
```

**文件不存在 (404)：**
```json
{
  "success": false,
  "error": "FILE_NOT_FOUND",
  "message": "文件 請假紀錄.csv 不存在"
}
```

**無效文件類型 (400)：**
```json
{
  "success": false,
  "error": "INVALID_FILE_TYPE",
  "message": "無效的文件類型。使用 leave-records 或 personal-data"
}
```

## 日誌記錄

所有備份 API 的使用都會在伺服器日誌中記錄：
- 請求時間
- 來源 IP 位址
- 下載的文件名稱
- 文件大小

範例日誌：
```
[BACKUP] 緊急下載請求 - 時間: 2026-01-11T11:00:00.000Z, IP: 192.168.1.100
[BACKUP] 下載文件: 請假紀錄.csv, 大小: 1024 bytes
[BACKUP] 文件下載完成: 請假紀錄.csv
```

## 建議的使用流程

1. 首先使用 `/api/backup/status` 檢查文件是否存在
2. 確認文件大小和最後修改時間是否合理
3. 使用 `/api/backup/emergency-download` 下載所需文件
4. 驗證下載的文件內容是否完整
5. 將文件保存到安全位置
6. 盡快恢復正常的系統存取權限

---

**重要提醒：此 API 僅供緊急情況使用，請妥善保管存取方式！**