#!/usr/bin/env pwsh
<#
.SYNOPSIS
    上傳 CSV 資料檔案到 Render Persistent Disk

.DESCRIPTION
    使用 SCP 將本地的 CSV 檔案上傳到 Render 服務的 Persistent Disk

.PARAMETER ServiceId
    Render 服務 ID (例如: srv-xxxxx)

.PARAMETER Region
    Render 區域 (例如: oregon, frankfurt, singapore)

.EXAMPLE
    .\upload-to-render.ps1 -ServiceId "srv-xxxxx" -Region "oregon"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ServiceId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "oregon"
)

# 顏色輸出函數
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 標題
Write-ColorOutput "`n========================================" "Cyan"
Write-ColorOutput "  上傳資料到 Render Persistent Disk" "Cyan"
Write-ColorOutput "========================================`n" "Cyan"

# 如果沒有提供 ServiceId，提示用戶輸入
if (-not $ServiceId) {
    Write-ColorOutput "請提供你的 Render 服務資訊：`n" "Yellow"
    Write-Host "1. 前往 Render Dashboard"
    Write-Host "2. 選擇服務 'taixiang-server'"
    Write-Host "3. 點擊 'Shell' 標籤"
    Write-Host "4. 找到 SSH 命令，格式類似: ssh srv-xxxxx@ssh.oregon.render.com"
    Write-Host ""
    
    $ServiceId = Read-Host "請輸入 Service ID (例如: srv-xxxxx)"
    
    if (-not $ServiceId) {
        Write-ColorOutput "❌ 錯誤: Service ID 不能為空" "Red"
        exit 1
    }
}

# 設定變數
$SSH_HOST = "ssh.$Region.render.com"
$REMOTE_PATH = "/mnt/data"
$LOCAL_PATH = "server/data"

Write-ColorOutput "📋 配置資訊:" "Cyan"
Write-Host "  服務 ID: $ServiceId"
Write-Host "  區域: $Region"
Write-Host "  SSH 主機: $SSH_HOST"
Write-Host "  遠端路徑: $REMOTE_PATH"
Write-Host "  本地路徑: $LOCAL_PATH"
Write-Host ""

# 檢查本地檔案是否存在
$files = @(
    "請假系統個人資料.csv",
    "請假記錄.csv"
)

Write-ColorOutput "🔍 檢查本地檔案..." "Cyan"
$allFilesExist = $true

foreach ($file in $files) {
    $localFile = Join-Path $LOCAL_PATH $file
    
    if (Test-Path $localFile) {
        $fileInfo = Get-Item $localFile
        Write-ColorOutput "  ✅ $file ($($fileInfo.Length) bytes)" "Green"
    } else {
        Write-ColorOutput "  ❌ $file (不存在)" "Red"
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-ColorOutput "`n❌ 錯誤: 部分檔案不存在" "Red"
    Write-Host "請確保以下檔案存在於 $LOCAL_PATH 目錄中："
    foreach ($file in $files) {
        Write-Host "  - $file"
    }
    exit 1
}

Write-Host ""

# 確認上傳
Write-ColorOutput "⚠️  準備上傳 $($files.Count) 個檔案到 Render Persistent Disk" "Yellow"
$confirm = Read-Host "是否繼續? (y/N)"

if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-ColorOutput "❌ 已取消上傳" "Yellow"
    exit 0
}

Write-Host ""

# 上傳檔案
$successCount = 0
$failCount = 0

foreach ($file in $files) {
    Write-ColorOutput "📤 上傳: $file" "Cyan"
    
    $localFile = Join-Path $LOCAL_PATH $file
    $remoteFile = "${ServiceId}@${SSH_HOST}:${REMOTE_PATH}/${file}"
    
    # 執行 SCP 命令
    & scp -s $localFile $remoteFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "  ✅ 上傳成功`n" "Green"
        $successCount++
    } else {
        Write-ColorOutput "  ❌ 上傳失敗 (錯誤碼: $LASTEXITCODE)`n" "Red"
        $failCount++
    }
}

# 摘要
Write-ColorOutput "========================================" "Cyan"
Write-ColorOutput "  上傳摘要" "Cyan"
Write-ColorOutput "========================================" "Cyan"
Write-Host "✅ 成功: $successCount 個檔案"
Write-Host "❌ 失敗: $failCount 個檔案"
Write-Host ""

if ($failCount -eq 0) {
    Write-ColorOutput "🎉 所有檔案上傳完成！`n" "Green"
    
    Write-ColorOutput "📋 下一步操作：" "Cyan"
    Write-Host "1. 在 Render Dashboard 中打開 Shell"
    Write-Host "2. 執行以下命令驗證檔案："
    Write-Host ""
    Write-ColorOutput "   ls -la /mnt/data/" "Yellow"
    Write-ColorOutput "   head -n 5 /mnt/data/請假系統個人資料.csv" "Yellow"
    Write-ColorOutput "   head -n 5 /mnt/data/請假記錄.csv" "Yellow"
    Write-Host ""
    Write-Host "3. 重啟服務或觸發重新部署"
    Write-Host "4. 測試登入: https://taixiang-server.onrender.com/leave_system"
    Write-Host ""
    
    exit 0
} else {
    Write-ColorOutput "⚠️  部分檔案上傳失敗`n" "Yellow"
    
    Write-ColorOutput "常見問題排查：" "Cyan"
    Write-Host "1. 檢查 SSH 連線是否正常"
    Write-Host "2. 確認 Service ID 和 Region 是否正確"
    Write-Host "3. 檢查是否已設定 SSH 金鑰"
    Write-Host "4. 確認 Persistent Disk 已在 Render Dashboard 中創建"
    Write-Host ""
    Write-Host "詳細說明請參考: UPLOAD_TO_RENDER_DISK.md"
    Write-Host ""
    
    exit 1
}
