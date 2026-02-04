# LINE 群組 ID 獲取指南

## 🎯 目的
獲取 LINE 群組的 Group ID，用於設定 `LINE_GROUP_ID` 環境變數，讓系統能夠發送今日請假通知到正確的群組。

## 📋 步驟

### 1. 確保 LINE Bot 已加入群組
- 確認你的 LINE Bot 已經被邀請並加入目標群組
- Bot 必須有發送訊息的權限

### 2. 檢查 Group ID 檢測端點
訪問以下 URL 來確認檢測端點正常運作：
```
https://your-backend-url.onrender.com/line/group-info
```

### 3. 在群組中發送訊息
在 LINE 群組中發送任何訊息，例如：
- `help?`
- `list`
- 或任何文字訊息

### 4. 檢查伺服器日誌
在 Render 的 Logs 中查看輸出，尋找類似以下的訊息：

```
📍 事件來源資訊:
   類型: group
   用戶 ID: U1234567890abcdef...
🎯 群組 ID: C1234567890abcdef1234567890abcdef12
💡 請將此 Group ID 設定到環境變數 LINE_GROUP_ID: C1234567890abcdef1234567890abcdef12
```

### 5. 設定環境變數
將獲取到的 Group ID 設定到 Render 的環境變數中：

1. 前往 Render Dashboard
2. 選擇你的後端服務
3. 點擊 "Environment"
4. 新增或更新環境變數：
   ```
   LINE_GROUP_ID=C1234567890abcdef1234567890abcdef12
   ```
5. 點擊 "Save Changes"

### 6. 驗證設定
設定完成後，可以測試今日請假通知功能：
```bash
curl https://your-backend-url.onrender.com/line/send_leave_today
```

## 🔍 除錯資訊

### 如果沒有看到 Group ID
1. **檢查 Bot 權限**：確保 Bot 有接收訊息的權限
2. **檢查 Webhook URL**：確認 LINE Developers Console 中的 Webhook URL 正確
3. **檢查環境變數**：確認 `LINE_CHANNEL_ACCESS_TOKEN` 和 `LINE_CHANNEL_SECRET` 已正確設定

### 常見的 Group ID 格式
- 群組 ID 通常以 `C` 開頭
- 長度約 33 個字元
- 例如：`C1234567890abcdef1234567890abcdef12`

### 其他來源類型
- **私人訊息**：會顯示 `👤 私人訊息來自用戶: U...`
- **聊天室**：會顯示 `🏠 聊天室 ID: R...`

## 📝 注意事項

1. **隱私保護**：Group ID 是敏感資訊，請妥善保管
2. **權限確認**：確保 Bot 有在群組中發送訊息的權限
3. **測試環境**：建議先在測試群組中進行測試
4. **日誌監控**：定期檢查日誌以確保功能正常運作

## 🚀 完成後的功能

設定完成後，系統將能夠：
- 自動發送今日請假通知到指定群組
- 支援外部程式觸發通知（如排程任務）
- 提供完整的請假記錄查詢功能

---

**需要協助？** 檢查伺服器日誌或聯繫系統管理員。