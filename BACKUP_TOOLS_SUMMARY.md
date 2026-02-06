# 🚨 緊急備份工具保存清單

## 📋 重要資訊記錄

### 🔑 關鍵資訊
- **User-Agent**: `TaiXiang-Emergency-Backup-Tool`
- **API 端點**: `/api/backup/emergency-download`
- **狀態檢查**: `/api/backup/status`

### 🌐 部署 URL
- **本地測試**: `http://localhost:10000`
- **Render 部署**: `https://taixiang-server.onrender.com` (後端 API 服務)

## 🛠️ 可用工具

### 1. PowerShell 腳本 (Windows)
**文件**: `emergency-backup.ps1`
**使用方法**:
```powershell
# 檢查狀態
.\emergency-backup.ps1 -ServerUrl "https://taixiang-server.onrender.com" -Action "status"

# 下載所有文件
.\emergency-backup.ps1 -ServerUrl "https://taixiang-server.onrender.com" -Action "download-all"
```

### 2. 直接 PowerShell 命令
```powershell
# 檢查狀態
$headers = @{ "User-Agent" = "TaiXiang-Emergency-Backup-Tool" }
Invoke-RestMethod -Uri "https://taixiang-server.onrender.com/api/backup/status" -Headers $headers

# 下載請假記錄
$headers = @{ "User-Agent" = "TaiXiang-Emergency-Backup-Tool" };
Invoke-WebRequest -Uri "https://taixiang-server.onrender.com/api/backup/emergency-download?file=leave-records" -Headers $headers -OutFile "c:\leave-records-backup.csv"

# 下載個人資料
$headers = @{ "User-Agent" = "TaiXiang-Emergency-Backup-Tool" }
Invoke-WebRequest -Uri "https://taixiang-server.onrender.com/api/backup/emergency-download?file=personal-data" -Headers $headers -OutFile "personal-data-backup.csv"
```

### 3. Bash 腳本 (Linux/Mac)
**文件**: `emergency-backup.sh`
**使用方法**:
```bash
./emergency-backup.sh https://taixiang-server.onrender.com status
./emergency-backup.sh https://taixiang-server.onrender.com download-all
```

## ✅ 測試結果
- ✅ API 端點正常運作
- ✅ User-Agent 驗證有效
- ✅ 文件狀態檢查功能正常
- ✅ 下載功能可用 (需要文件存在)
- ✅ 安全機制正常 (拒絕無效 User-Agent)

## 📝 使用注意事項
1. 確保使用正確的 User-Agent 標頭
2. 替換 URL 為實際的 Render 後端部署地址 (`https://taixiang-server.onrender.com`)
3. 定期測試確保 API 可用性
4. 保存此文件到安全位置

---
**建立時間**: 2026-01-12
**測試狀態**: ✅ 已驗證