# Render 部署診斷腳本
param(
    [Parameter(Mandatory=$true)]
    [string]$RenderUrl
)

Write-Host "🔍 診斷 Render 部署狀況" -ForegroundColor Cyan
Write-Host "🌐 目標 URL: $RenderUrl" -ForegroundColor Cyan
Write-Host ""

# 測試基本連接
Write-Host "1️⃣ 測試基本連接..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $RenderUrl -Method HEAD -TimeoutSec 30
    Write-Host "✅ 基本連接成功 - HTTP $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ 基本連接失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   可能原因:" -ForegroundColor Yellow
    Write-Host "   - URL 不正確" -ForegroundColor Gray
    Write-Host "   - 服務未運行" -ForegroundColor Gray
    Write-Host "   - 網路問題" -ForegroundColor Gray
    return
}

Write-Host ""

# 測試根路徑
Write-Host "2️⃣ 測試根路徑 (/)..." -ForegroundColor Yellow
try {
    $rootResponse = Invoke-RestMethod -Uri "$RenderUrl/" -TimeoutSec 30
    Write-Host "✅ 根路徑可訪問" -ForegroundColor Green
} catch {
    Write-Host "❌ 根路徑失敗: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 測試 API 健康檢查
Write-Host "3️⃣ 測試 API 健康檢查 (/api/health)..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$RenderUrl/api/health" -TimeoutSec 30
    Write-Host "✅ API 健康檢查成功" -ForegroundColor Green
    Write-Host "   服務: $($healthResponse.services)" -ForegroundColor Gray
    Write-Host "   環境: $($healthResponse.environment)" -ForegroundColor Gray
    Write-Host "   時間: $($healthResponse.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API 健康檢查失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   可能原因:" -ForegroundColor Yellow
    Write-Host "   - 後端服務未啟動" -ForegroundColor Gray
    Write-Host "   - API 路由配置問題" -ForegroundColor Gray
}

Write-Host ""

# 測試備份 API
Write-Host "4️⃣ 測試備份 API (/api/backup/status)..." -ForegroundColor Yellow
try {
    $headers = @{ "User-Agent" = "TaiXiang-Emergency-Backup-Tool" }
    $backupResponse = Invoke-RestMethod -Uri "$RenderUrl/api/backup/status" -Headers $headers -TimeoutSec 30
    Write-Host "✅ 備份 API 可用" -ForegroundColor Green
    Write-Host "   可用文件: $($backupResponse.data.files.Count)" -ForegroundColor Gray
    Write-Host "   伺服器時間: $($backupResponse.data.serverTime)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "❌ 備份 API 不存在 (404)" -ForegroundColor Red
        Write-Host "   可能原因:" -ForegroundColor Yellow
        Write-Host "   - 最新版本未部署到 Render" -ForegroundColor Gray
        Write-Host "   - 備份路由未正確配置" -ForegroundColor Gray
    } elseif ($statusCode -eq 403) {
        Write-Host "❌ 備份 API 拒絕存取 (403)" -ForegroundColor Red
        Write-Host "   可能原因:" -ForegroundColor Yellow
        Write-Host "   - User-Agent 驗證失敗" -ForegroundColor Gray
    } else {
        Write-Host "❌ 備份 API 失敗: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 測試無效 User-Agent (應該被拒絕)
Write-Host "5️⃣ 測試安全機制 (無效 User-Agent)..." -ForegroundColor Yellow
try {
    $invalidHeaders = @{ "User-Agent" = "Invalid-Agent" }
    $invalidResponse = Invoke-RestMethod -Uri "$RenderUrl/api/backup/status" -Headers $invalidHeaders -TimeoutSec 30
    Write-Host "❌ 安全機制失效 - 應該拒絕無效 User-Agent" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 403) {
        Write-Host "✅ 安全機制正常 - 正確拒絕無效 User-Agent" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "⚠️ API 不存在，無法測試安全機制" -ForegroundColor Yellow
    } else {
        Write-Host "❓ 未預期的回應: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🏁 診斷完成" -ForegroundColor Cyan

# 建議
Write-Host ""
Write-Host "💡 建議解決方案:" -ForegroundColor Cyan
Write-Host "1. 確認 Render 應用 URL 是否正確" -ForegroundColor White
Write-Host "2. 檢查 Render 部署日誌是否有錯誤" -ForegroundColor White
Write-Host "3. 確認最新版本 (v1.3.5) 已部署到 Render" -ForegroundColor White
Write-Host "4. 檢查 Render 應用是否處於睡眠狀態" -ForegroundColor White
Write-Host "5. 嘗試手動觸發 Render 重新部署" -ForegroundColor White