# LINE Bot 今日請假通知功能

## 功能概述

此功能提供一個 HTTP endpoint，當外部程式訪問時，會自動查詢今日的請假記錄並發送通知到指定的 LINE 群組。

## Endpoint 資訊

- **路徑**: `/line/send_leave_today`
- **方法**: GET 或 POST
- **用途**: 發送今日請假通知到 LINE 群組

## 功能流程

1. **讀取請假記錄**: 從 `server/data/請假記錄.csv` 讀取所有請假記錄
2. **篩選今日記錄**: 查詢請假日期等於當日的記錄
3. **格式化訊息**: 
   - 每筆記錄格式: `姓名:xxx 開始時間:xxx 結束時間:xxx`
   - 多筆記錄用分號 `;` 連接
   - 最前面加上 `(今日請假)` 前綴
   - 如果沒有記錄，發送 `(今日請假)無`
4. **發送通知**: 使用 LINE Messaging API 的 Push Message 功能發送到群組

## 環境變數設定

在 `.env` 檔案中需要設定以下變數：

```env
# LINE Channel Access Token
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token

# LINE Channel Secret
LINE_CHANNEL_SECRET=your_channel_secret

# LINE Group ID (新增)
LINE_GROUP_ID=your_group_id
```

### 如何取得 LINE Group ID

1. 將 LINE Bot 加入目標群組
2. 在群組中發送任意訊息
3. 查看 webhook 日誌中的 `event.source.groupId`
4. 將該 ID 設定到 `LINE_GROUP_ID` 環境變數

## 使用方式

### 本地測試

1. 啟動伺服器:
```bash
cd server
npm run dev
```

2. 使用測試腳本:
```bash
node test-send-leave-today.js http://localhost:10000
```

3. 或使用 curl:
```bash
curl http://localhost:10000/line/send_leave_today
```

4. 或使用 PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:10000/line/send_leave_today"
```

### 生產環境

使用部署的 URL:

```bash
# 使用 curl
curl https://tai-xiang-backend.onrender.com/line/send_leave_today

# 使用 PowerShell
Invoke-RestMethod -Uri "https://tai-xiang-backend.onrender.com/line/send_leave_today"
```

## 回應格式

### 成功回應 (HTTP 200)

```json
{
  "success": true,
  "message": "Leave notification sent successfully",
  "recordCount": 2,
  "date": "2026-01-20",
  "processingTime": "245ms"
}
```

### 失敗回應 (HTTP 500)

```json
{
  "success": false,
  "error": "Failed to send LINE message",
  "details": "Invalid reply token"
}
```

## 訊息格式範例

### 有請假記錄

```
(今日請假)姓名:張三 開始時間:09:00 結束時間:17:00;姓名:李四 開始時間:13:00 結束時間:17:00
```

### 無請假記錄

```
(今日請假)無
```

## 自動化排程

可以使用外部排程工具定期觸發此 endpoint：

### Windows 工作排程器

1. 建立 PowerShell 腳本 `send-daily-leave.ps1`:
```powershell
Invoke-RestMethod -Uri "https://tai-xiang-backend.onrender.com/line/send_leave_today"
```

2. 在工作排程器中設定每日執行時間（例如：每天早上 8:00）

### Linux Cron Job

```bash
# 每天早上 8:00 執行
0 8 * * * curl https://tai-xiang-backend.onrender.com/line/send_leave_today
```

### 雲端排程服務

可以使用以下服務設定定期 HTTP 請求：
- **Render Cron Jobs**: 在 Render 平台設定 cron job
- **GitHub Actions**: 使用 workflow 定期觸發
- **Zapier / IFTTT**: 設定定時觸發器

## 錯誤處理

### 常見錯誤

1. **LINE_GROUP_ID not configured**
   - 原因: 未設定 `LINE_GROUP_ID` 環境變數
   - 解決: 在 `.env` 或 Render 環境變數中設定 Group ID

2. **Bot 未加入該群組或權限不足 (HTTP 403)**
   - 原因: Bot 未加入目標群組
   - 解決: 將 Bot 加入群組並確保有發送訊息權限

3. **Channel Access Token 無效 (HTTP 401)**
   - 原因: Access Token 錯誤或過期
   - 解決: 檢查並更新 `LINE_CHANNEL_ACCESS_TOKEN`

4. **CSV 檔案讀取失敗**
   - 原因: 請假記錄檔案不存在或格式錯誤
   - 解決: 確認 `server/data/請假記錄.csv` 存在且格式正確

## 日誌記錄

伺服器會記錄以下資訊：
- 請求接收時間
- 查詢日期
- 找到的記錄數量
- 格式化的訊息內容
- LINE API 呼叫結果
- 處理時間

查看日誌以監控功能運作狀況。

## 安全性考量

1. **環境變數保護**: 確保 `.env` 檔案不被提交到版本控制
2. **HTTPS**: 生產環境建議使用 HTTPS
3. **存取控制**: 可考慮添加 API Key 驗證機制
4. **速率限制**: 避免過度頻繁呼叫 LINE API

## 相關檔案

- `server/src/line-bot.js` - LINE Bot 主程式（包含新的 endpoint）
- `server/.env` - 環境變數設定
- `server/data/請假記錄.csv` - 請假記錄資料
- `test-send-leave-today.js` - 測試腳本

## 版本資訊

- **版本**: 1.0.0
- **建立日期**: 2026-01-20
- **最後更新**: 2026-01-20
