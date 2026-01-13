# 緊急備份下載腳本 (PowerShell)
# 使用方法: .\emergency-backup.ps1 -ServerUrl "https://your-server.com" -Action "status"

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerUrl,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet("status", "download-all", "download-leave", "download-personal")]
    [string]$Action,
    
    [string]$OutputDir = ".\backup"
)

# 設定
$UserAgent = "TaiXiang-Emergency-Backup-Tool"
$Headers = @{ "User-Agent" = $UserAgent }

# 創建輸出目錄
if ($Action -ne "status" -and !(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "📁 創建輸出目錄: $OutputDir" -ForegroundColor Green
}

# 函數：發送請求
function Invoke-BackupRequest {
    param($Url, $OutFile = $null)
    
    try {
        if ($OutFile) {
            Write-Host "📥 下載: $Url -> $OutFile" -ForegroundColor Yellow
            Invoke-WebRequest -Uri $Url -Headers $Headers -OutFile $OutFile -UseBasicParsing
            $fileSize = (Get-Item $OutFile).Length
            Write-Host "✅ 下載完成: $OutFile ($fileSize bytes)" -ForegroundColor Green
        } else {
            Write-Host "📡 請求: $Url" -ForegroundColor Yellow
            $response = Invoke-RestMethod -Uri $Url -Headers $Headers -UseBasicParsing
            return $response
        }
    } catch {
        Write-Host "❌ 錯誤: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "   HTTP 狀態碼: $statusCode" -ForegroundColor Red
        }
        throw
    }
}

# 主要邏輯
Write-Host "🚨 緊急備份工具啟動" -ForegroundColor Cyan
Write-Host "🌐 伺服器: $ServerUrl" -ForegroundColor Cyan
Write-Host "🎯 動作: $Action" -ForegroundColor Cyan
Write-Host ""

try {
    switch ($Action) {
        "status" {
            Write-Host "📋 檢查備份文件狀態..." -ForegroundColor Yellow
            $status = Invoke-BackupRequest "$ServerUrl/api/backup/status"
            
            Write-Host "✅ 備份狀態:" -ForegroundColor Green
            Write-Host "   伺服器時間: $($status.data.serverTime)" -ForegroundColor White
            Write-Host ""
            
            foreach ($file in $status.data.files) {
                $statusIcon = if ($file.exists) { "✅" } else { "❌" }
                $sizeText = if ($file.size) { "$($file.size) bytes" } else { "N/A" }
                $modifiedText = if ($file.lastModified) { $file.lastModified } else { "N/A" }
                
                Write-Host "   $statusIcon $($file.fileName)" -ForegroundColor White
                Write-Host "      大小: $sizeText" -ForegroundColor Gray
                Write-Host "      修改時間: $modifiedText" -ForegroundColor Gray
                Write-Host ""
            }
        }
        
        "download-all" {
            Write-Host "📥 下載所有備份文件..." -ForegroundColor Yellow
            
            # 先檢查狀態
            $status = Invoke-BackupRequest "$ServerUrl/api/backup/status"
            $availableFiles = $status.data.files | Where-Object { $_.exists }
            
            if ($availableFiles.Count -eq 0) {
                Write-Host "❌ 沒有可用的備份文件" -ForegroundColor Red
                return
            }
            
            # 下載請假紀錄
            $leaveFile = $availableFiles | Where-Object { $_.fileName -eq "請假紀錄.csv" }
            if ($leaveFile) {
                $timestamp = Get-Date -Format "yyyy-MM-dd"
                $outFile = Join-Path $OutputDir "leave-records-backup-$timestamp.csv"
                Invoke-BackupRequest "$ServerUrl/api/backup/emergency-download?file=leave-records" $outFile
            }
            
            # 下載個人資料
            $personalFile = $availableFiles | Where-Object { $_.fileName -eq "請假系統個人資料.csv" }
            if ($personalFile) {
                $timestamp = Get-Date -Format "yyyy-MM-dd"
                $outFile = Join-Path $OutputDir "personal-data-backup-$timestamp.csv"
                Invoke-BackupRequest "$ServerUrl/api/backup/emergency-download?file=personal-data" $outFile
            }
            
            Write-Host "🎉 所有文件下載完成！" -ForegroundColor Green
        }
        
        "download-leave" {
            Write-Host "📥 下載請假紀錄..." -ForegroundColor Yellow
            $timestamp = Get-Date -Format "yyyy-MM-dd"
            $outFile = Join-Path $OutputDir "leave-records-backup-$timestamp.csv"
            Invoke-BackupRequest "$ServerUrl/api/backup/emergency-download?file=leave-records" $outFile
        }
        
        "download-personal" {
            Write-Host "📥 下載個人資料..." -ForegroundColor Yellow
            $timestamp = Get-Date -Format "yyyy-MM-dd"
            $outFile = Join-Path $OutputDir "personal-data-backup-$timestamp.csv"
            Invoke-BackupRequest "$ServerUrl/api/backup/emergency-download?file=personal-data" $outFile
        }
    }
    
    Write-Host ""
    Write-Host "🏁 操作完成！" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "💥 操作失敗: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 使用範例
Write-Host ""
Write-Host "📖 使用範例:" -ForegroundColor Cyan
Write-Host "   檢查狀態: .\emergency-backup.ps1 -ServerUrl 'https://your-server.com' -Action 'status'" -ForegroundColor Gray
Write-Host "   下載全部: .\emergency-backup.ps1 -ServerUrl 'https://your-server.com' -Action 'download-all'" -ForegroundColor Gray
Write-Host "   下載請假: .\emergency-backup.ps1 -ServerUrl 'https://your-server.com' -Action 'download-leave'" -ForegroundColor Gray
Write-Host "   下載個資: .\emergency-backup.ps1 -ServerUrl 'https://your-server.com' -Action 'download-personal'" -ForegroundColor Gray