# 上傳檔案到 Render Persistent Disk

## 方法 1: 使用 SCP (推薦)

### 前置準備

1. **設定 SSH 連線**
   - 前往 Render Dashboard
   - 選擇你的服務 (`taixiang-server`)
   - 點擊 **"Shell"** 標籤
   - 找到 SSH 連線指令，格式類似：
     ```bash
     ssh srv-xxxxx@ssh.oregon.render.com
     ```

2. **記錄你的服務資訊**
   - Service ID: `srv-xxxxx`
   - Region: `oregon` (或其他區域)
   - 完整 SSH 主機: `ssh.oregon.render.com`

### 上傳 CSV 檔案

#### Windows PowerShell

```powershell
# 1. 上傳個人資料檔案
scp -s "server/data/請假系統個人資料.csv" srv-xxxxx@ssh.oregon.render.com:/mnt/data/請假系統個人資料.csv

# 2. 上傳請假記錄檔案
scp -s "server/data/請假記錄.csv" srv-xxxxx@ssh.oregon.render.com:/mnt/data/請假記錄.csv
```

#### Linux / macOS

```bash
# 1. 上傳個人資料檔案
scp -s server/data/請假系統個人資料.csv srv-xxxxx@ssh.oregon.render.com:/mnt/data/請假系統個人資料.csv

# 2. 上傳請假記錄檔案
scp -s server/data/請假記錄.csv srv-xxxxx@ssh.oregon.render.com:/mnt/data/請假記錄.csv
```

### 驗證上傳

上傳完成後，在 Render Shell 中執行：

```bash
# 檢查檔案是否存在
ls -la /mnt/data/

# 查看檔案內容（前 5 行）
head -n 5 /mnt/data/請假系統個人資料.csv
head -n 5 /mnt/data/請假記錄.csv

# 檢查檔案大小
du -h /mnt/data/*.csv
```

預期輸出：
```
-rw-r--r-- 1 render render  XXX /mnt/data/請假系統個人資料.csv
-rw-r--r-- 1 render render  XXX /mnt/data/請假記錄.csv
```

---

## 方法 2: 使用 Render Shell 手動創建

如果 SCP 不可用，可以在 Render Shell 中手動創建檔案：

### 步驟 1: 連接到 Render Shell

在 Render Dashboard 中點擊 **"Shell"** 按鈕

### 步驟 2: 創建個人資料檔案

```bash
cat > /mnt/data/請假系統個人資料.csv << 'EOF'
工號,密碼,姓名,權限,年度特休,年度病假,年度生理假,年度事假
SS01,SS01,張三,admin,112,240,24,112
SS02,SS02,李四,employee,112,240,24,112
EOF
```

### 步驟 3: 創建請假記錄檔案

```bash
cat > /mnt/data/請假記錄.csv << 'EOF'
記錄ID,工號,姓名,假別,請假日期,開始時間,結束時間,請假時數,請假事由,簽核狀態,簽核時間,簽核備註
EOF
```

### 步驟 4: 驗證檔案

```bash
ls -la /mnt/data/
cat /mnt/data/請假系統個人資料.csv
```

---

## 方法 3: 使用 Render API (進階)

### 創建上傳腳本

創建 `upload-to-render.ps1`:

```powershell
# 設定你的 Render 服務資訊
$SERVICE_ID = "srv-xxxxx"
$REGION = "oregon"
$SSH_HOST = "ssh.$REGION.render.com"

# 上傳檔案
Write-Host "📤 上傳個人資料檔案..."
scp -s "server/data/請假系統個人資料.csv" "${SERVICE_ID}@${SSH_HOST}:/mnt/data/請假系統個人資料.csv"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 個人資料檔案上傳成功"
} else {
    Write-Host "❌ 個人資料檔案上傳失敗"
    exit 1
}

Write-Host "📤 上傳請假記錄檔案..."
scp -s "server/data/請假記錄.csv" "${SERVICE_ID}@${SSH_HOST}:/mnt/data/請假記錄.csv"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 請假記錄檔案上傳成功"
} else {
    Write-Host "❌ 請假記錄檔案上傳失敗"
    exit 1
}

Write-Host ""
Write-Host "🎉 所有檔案上傳完成！"
Write-Host ""
Write-Host "請在 Render Shell 中執行以下命令驗證："
Write-Host "  ls -la /mnt/data/"
```

執行：
```powershell
.\upload-to-render.ps1
```

---

## 常見問題

### Q1: SCP 命令找不到

**Windows**:
- 確保使用 PowerShell 或 Windows Terminal
- Windows 10/11 內建 OpenSSH，應該可以直接使用
- 如果不行，安裝 [Git for Windows](https://git-scm.com/download/win) 或 [PuTTY](https://www.putty.org/)

**macOS/Linux**:
- SCP 應該已預裝
- 如果沒有，安裝 OpenSSH: `sudo apt-get install openssh-client`

### Q2: Permission denied (publickey)

需要設定 SSH 金鑰：

1. 在 Render Dashboard 中找到 **"SSH Public Key"** 設定
2. 生成 SSH 金鑰（如果還沒有）:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
3. 將公鑰 (`~/.ssh/id_ed25519.pub`) 添加到 Render

### Q3: 檔案上傳後系統仍然無法讀取

檢查檔案權限：
```bash
# 在 Render Shell 中執行
chmod 644 /mnt/data/*.csv
ls -la /mnt/data/
```

檢查檔案編碼：
```bash
file /mnt/data/請假系統個人資料.csv
```

應該顯示 `UTF-8 Unicode text`

### Q4: 如何下載 Persistent Disk 中的檔案？

```bash
# 下載到本地
scp -s srv-xxxxx@ssh.oregon.render.com:/mnt/data/請假系統個人資料.csv ./backup/

# 下載整個目錄
scp -s -r srv-xxxxx@ssh.oregon.render.com:/mnt/data/ ./backup/
```

---

## 完整操作流程

### 1. 準備本地檔案

確保 `server/data/` 目錄中有正確的 CSV 檔案：

```bash
# 檢查本地檔案
ls -la server/data/

# 應該看到：
# 請假系統個人資料.csv
# 請假記錄.csv
```

### 2. 獲取 Render SSH 資訊

在 Render Dashboard 中：
- 服務名稱: `taixiang-server`
- Shell 標籤中找到 SSH 命令
- 記錄 Service ID 和 Region

### 3. 上傳檔案

```bash
# 替換 srv-xxxxx 為你的實際 Service ID
# 替換 oregon 為你的實際 Region

scp -s server/data/請假系統個人資料.csv srv-xxxxx@ssh.oregon.render.com:/mnt/data/請假系統個人資料.csv
scp -s server/data/請假記錄.csv srv-xxxxx@ssh.oregon.render.com:/mnt/data/請假記錄.csv
```

### 4. 驗證

在 Render Shell 中：
```bash
ls -la /mnt/data/
head -n 5 /mnt/data/請假系統個人資料.csv
```

### 5. 重啟服務

上傳完成後，在 Render Dashboard 中：
- 點擊 **"Manual Deploy"**
- 選擇 **"Clear build cache & deploy"**
- 或直接重啟服務

### 6. 測試登入

訪問 `https://taixiang-server.onrender.com/leave_system`
使用測試帳號登入：
- 工號: `SS01`
- 密碼: `SS01`

---

## 自動化腳本

創建 `sync-data-to-render.ps1` 用於定期同步：

```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceId,
    
    [Parameter(Mandatory=$true)]
    [string]$Region
)

$SSH_HOST = "ssh.$Region.render.com"
$REMOTE_PATH = "/mnt/data"
$LOCAL_PATH = "server/data"

Write-Host "🔄 同步資料到 Render Persistent Disk"
Write-Host "服務: $ServiceId"
Write-Host "區域: $Region"
Write-Host ""

$files = @(
    "請假系統個人資料.csv",
    "請假記錄.csv"
)

foreach ($file in $files) {
    Write-Host "📤 上傳: $file"
    $localFile = Join-Path $LOCAL_PATH $file
    $remoteFile = "${ServiceId}@${SSH_HOST}:${REMOTE_PATH}/${file}"
    
    scp -s $localFile $remoteFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ 成功"
    } else {
        Write-Host "  ❌ 失敗"
    }
}

Write-Host ""
Write-Host "🎉 同步完成！"
```

使用方式：
```powershell
.\sync-data-to-render.ps1 -ServiceId "srv-xxxxx" -Region "oregon"
```

---

## 相關文檔

- `PERSISTENT_DISK_SETUP.md` - Persistent Disk 設定指南
- `force-init-disk.js` - 自動初始化腳本
- `check-data-files.js` - 檔案位置檢查腳本
- `RENDER_DEPLOYMENT_SETUP.md` - 完整部署指南
