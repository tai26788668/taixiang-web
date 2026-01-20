# LINE Bot 請假申請通知函數

## 功能概述

此函數用於在員工提交請假申請時，自動發送通知到指定的 LINE 群組。函數已建立完成，目前尚未整合到請假申請流程中，待未來需求時再進行整合。

## 函數資訊

### 函數名稱
`sendLeaveApplicationNotification(leaveData)`

### 位置
`server/src/line-bot.js`

### 參數

```javascript
{
  name: string,        // 員工姓名
  leaveDate: string,   // 請假日期 (YYYY-MM-DD 格式)
  startTime: string,   // 開始時間 (HH:MM 格式)
  endTime: string,     // 結束時間 (HH:MM 格式)
  leaveType: string    // 假別 (事假, 公假, 喪假, 病假, 特休, 生理假)
}
```

### 回傳值
`Promise<Object>` - LINE API 回應物件

### 訊息格式
```
(請假申請)姓名,請假日期 開始時間-結束時間 假別
```

### 範例
```
(請假申請)張三,2026-01-20 09:00-17:00 事假
```

## 使用方式

### 在 Node.js 中使用

```javascript
// 引入函數
const { sendLeaveApplicationNotification } = require('./server/src/line-bot.js');

// 準備請假資料
const leaveData = {
  name: '張三',
  leaveDate: '2026-01-20',
  startTime: '09:00',
  endTime: '17:00',
  leaveType: '事假'
};

// 發送通知
try {
  await sendLeaveApplicationNotification(leaveData);
  console.log('通知發送成功');
} catch (error) {
  console.error('通知發送失敗:', error.message);
}
```

### 在 TypeScript 中使用

由於函數位於 `.js` 檔案中，在 TypeScript 中使用時需要進行類型轉換：

```typescript
// 引入函數
const lineBot = require('./line-bot.js');
const { sendLeaveApplicationNotification } = lineBot;

// 定義類型
interface LeaveNotificationData {
  name: string;
  leaveDate: string;
  startTime: string;
  endTime: string;
  leaveType: string;
}

// 使用函數
const leaveData: LeaveNotificationData = {
  name: '張三',
  leaveDate: '2026-01-20',
  startTime: '09:00',
  endTime: '17:00',
  leaveType: '事假'
};

try {
  await sendLeaveApplicationNotification(leaveData);
  console.log('通知發送成功');
} catch (error) {
  console.error('通知發送失敗:', error);
}
```

## 測試

### 使用測試腳本

```bash
node test-leave-application-notification.js
```

測試腳本會：
1. 檢查環境變數是否正確設定
2. 使用測試資料呼叫函數
3. 顯示測試結果和 LINE API 回應

### 測試前準備

確保 `server/.env` 中已設定：
```env
LINE_CHANNEL_ACCESS_TOKEN=your_token
LINE_CHANNEL_SECRET=your_secret
LINE_GROUP_ID=your_group_id
```

## 未來整合計畫

### 整合位置
`server/src/routes/leave.ts` - POST `/api/leave/apply` endpoint

### 整合方式

在請假申請成功後，呼叫此函數發送通知：

```typescript
// 在 server/src/routes/leave.ts 中

// 引入函數
const { sendLeaveApplicationNotification } = require('../line-bot.js');

// 在 POST /api/leave/apply 路由中
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    // ... 現有的請假申請邏輯 ...
    
    const recordId = await addLeaveRecord(leaveRecord);

    // 發送 LINE 通知 (新增)
    try {
      await sendLeaveApplicationNotification({
        name: user.name,
        leaveDate: leaveDate,
        startTime: startTimeParsed.time,
        endTime: endTimeParsed.time,
        leaveType: leaveType
      });
      console.log('LINE 通知發送成功');
    } catch (lineError) {
      // 通知發送失敗不影響請假申請
      console.error('LINE 通知發送失敗:', lineError.message);
    }

    res.json({
      success: true,
      data: {
        recordId,
        leaveHours
      },
      message: '請假申請提交成功'
    });

  } catch (error) {
    // ... 錯誤處理 ...
  }
});
```

### 整合注意事項

1. **非阻塞性**: 通知發送失敗不應影響請假申請的成功
2. **錯誤處理**: 使用 try-catch 包裹通知發送邏輯
3. **日誌記錄**: 記錄通知發送的成功或失敗狀態
4. **環境變數**: 確保生產環境已設定 `LINE_GROUP_ID`

## 錯誤處理

### 常見錯誤

1. **Missing required leave data fields**
   - 原因: 傳入的資料缺少必填欄位
   - 解決: 確保所有欄位都有值

2. **LINE_GROUP_ID not configured**
   - 原因: 未設定 `LINE_GROUP_ID` 環境變數
   - 解決: 在 `.env` 或 Render 環境變數中設定

3. **Bot 未加入該群組或權限不足 (HTTP 403)**
   - 原因: Bot 未加入目標群組
   - 解決: 將 Bot 加入群組

4. **Channel Access Token 無效 (HTTP 401)**
   - 原因: Access Token 錯誤或過期
   - 解決: 檢查並更新 `LINE_CHANNEL_ACCESS_TOKEN`

## 環境變數

### 必要變數

```env
# LINE Channel Access Token
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token

# LINE Channel Secret
LINE_CHANNEL_SECRET=your_channel_secret

# LINE Group ID (用於發送通知)
LINE_GROUP_ID=your_group_id
```

### 取得 Group ID

1. 將 LINE Bot 加入目標群組
2. 在群組中發送任意訊息
3. 查看 webhook 日誌中的 `event.source.groupId`
4. 將該 ID 設定到環境變數

## 訊息範例

### 不同假別的訊息

```
(請假申請)張三,2026-01-20 09:00-17:00 事假
(請假申請)李四,2026-01-21 08:00-12:00 病假
(請假申請)王五,2026-01-22 14:00-18:00 特休
(請假申請)趙六,2026-01-23 09:00-16:30 公假
```

### 跨日請假

```
(請假申請)張三,2026-01-20 22:00-06:00 事假
```

## 日誌記錄

函數會記錄以下資訊：
- 準備發送的訊息內容
- LINE API 呼叫結果
- 錯誤詳情（如果發生）

查看伺服器日誌以監控通知發送狀況。

## 安全性考量

1. **環境變數保護**: 確保 `.env` 檔案不被提交到版本控制
2. **錯誤訊息**: 不在回應中暴露敏感資訊
3. **權限控制**: 確保只有授權的請假申請才會觸發通知

## 相關檔案

- `server/src/line-bot.js` - 函數實作
- `server/src/routes/leave.ts` - 未來整合位置
- `test-leave-application-notification.js` - 測試腳本
- `server/.env` - 環境變數設定

## 版本資訊

- **版本**: 1.0.0
- **建立日期**: 2026-01-20
- **狀態**: 已完成，待整合
- **最後更新**: 2026-01-20

## 待辦事項

- [ ] 整合到請假申請 API (`/api/leave/apply`)
- [ ] 添加單元測試
- [ ] 考慮添加通知開關（允許管理員啟用/停用通知）
- [ ] 考慮添加通知模板配置
