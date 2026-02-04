# 更新 Domain Names 腳本
# 使用方法: .\update-domain-names.ps1 -NewBackendUrl "https://your-new-backend.onrender.com" -NewWebsiteUrl "https://your-new-website.onrender.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$NewBackendUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$NewWebsiteUrl
)

# 移除 URL 末尾的斜線
$NewBackendUrl = $NewBackendUrl.TrimEnd('/')
$NewWebsiteUrl = $NewWebsiteUrl.TrimEnd('/')

# 舊的 URL
$OldBackendUrl = "https://tai-xiang-backend.onrender.com"
$OldWebsiteUrl = "https://tai-xiang-website.onrender.com"

Write-Host "開始更新 Domain Names..." -ForegroundColor Green
Write-Host "舊後端 URL: $OldBackendUrl" -ForegroundColor Yellow
Write-Host "新後端 URL: $NewBackendUrl" -ForegroundColor Green
Write-Host "舊網站 URL: $OldWebsiteUrl" -ForegroundColor Yellow
Write-Host "新網站 URL: $NewWebsiteUrl" -ForegroundColor Green

# 需要更新的文件列表
$FilesToUpdate = @(
    "website/src/config/websiteConfig.ts",
    "server/.env.example",
    "VERSION_v1.3.6_SUMMARY.md",
    "BACKUP_TOOLS_SUMMARY.md",
    "CHANGELOG.md",
    "DEPLOYMENT_CHECKLIST.md",
    "EMERGENCY_BACKUP_GUIDE.md",
    "LINE_SEND_LEAVE_TODAY.md",
    "PERSISTENT_DISK_SETUP.md",
    "PLAN_A_DEPLOYMENT_GUIDE.md",
    "PROJECT_DOCUMENTATION.md",
    "test-email-backup.js",
    "test-send-leave-today.js",
    "USAGE_GUIDE.md",
    "WEEKLY_EMAIL_BACKUP_SETUP.md"
)

$UpdatedFiles = 0

foreach ($File in $FilesToUpdate) {
    if (Test-Path $File) {
        Write-Host "更新文件: $File" -ForegroundColor Cyan
        
        # 讀取文件內容
        $Content = Get-Content $File -Raw -Encoding UTF8
        
        # 替換後端 URL
        $Content = $Content -replace [regex]::Escape($OldBackendUrl), $NewBackendUrl
        
        # 替換網站 URL
        $Content = $Content -replace [regex]::Escape($OldWebsiteUrl), $NewWebsiteUrl
        
        # 寫回文件
        $Content | Set-Content $File -Encoding UTF8 -NoNewline
        $UpdatedFiles++
    } else {
        Write-Host "文件不存在: $File" -ForegroundColor Red
    }
}

Write-Host "`n更新完成!" -ForegroundColor Green
Write-Host "已更新 $UpdatedFiles 個文件" -ForegroundColor Green

Write-Host "`n重要提醒:" -ForegroundColor Yellow
Write-Host "1. 程式碼已使用環境變數，在 Render 中設定以下環境變數:" -ForegroundColor White
Write-Host "   BACKEND_URL=$NewBackendUrl" -ForegroundColor Cyan
Write-Host "   WEBSITE_URL=$NewWebsiteUrl" -ForegroundColor Cyan
Write-Host "2. 更新 LINE Bot Webhook URL: $NewBackendUrl/line/webhook" -ForegroundColor White
Write-Host "3. 檢查所有功能是否正常運作" -ForegroundColor White
Write-Host "4. 測試請假系統和 LINE Bot 功能" -ForegroundColor White