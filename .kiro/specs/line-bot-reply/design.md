# LINE Bot Reply 系統設計文件

## 概述

本系統是一個基於 LINE Messaging API 的聊天機器人，專門用於查詢請假記錄。系統採用 JavaScript 開發，整合在單一檔案中，透過 Webhook 接收 LINE 訊息並使用 Reply API 回應用戶查詢。

## 架構

### 系統架構圖

```
LINE Platform → Webhook → Node.js Server → CSV Reader → Reply API → LINE Platform
```

### 核心組件

1. **Webhook Handler**: 接收並驗證 LINE 平台的 HTTP 請求
2. **Message Parser**: 解析用戶訊息並識別指令
3. **CSV Reader**: 讀取和解析請假記錄檔案
4. **Date Filter**: 根據指令篩選符合條件的記錄
5. **Response Formatter**: 格式化回覆訊息
6. **LINE API Client**: 呼叫 LINE Reply API

## 組件和介面

### 主要函數介面

#### 1. webhookHandler(req, res)
```javascript
// 處理 LINE Webhook 請求
// 輸入: HTTP Request, HTTP Response
// 輸出: HTTP 狀態碼和回應
```

#### 2. verifySignature(body, signature)
```javascript
// 驗證 LINE 請求簽名
// 輸入: 請求內容, X-Line-Signature
// 輸出: boolean (驗證結果)
```

#### 3. parseMessage(messageText)
```javascript
// 解析用戶訊息並識別指令
// 輸入: 訊息文字
// 輸出: 指令類型 ('help', 'list', 'list-a', 'list-d', 'list-da', 'unknown')
```

#### 4. readLeaveRecords()
```javascript
// 讀取 CSV 檔案
// 輸入: 無
// 輸出: Array of Objects (請假記錄)
```

#### 5. filterRecordsByDate(records, filterType, targetDate)
```javascript
// 根據日期和類型篩選記錄
// 輸入: 記錄陣列, 篩選類型, 目標日期
// 輸出: 篩選後的記錄陣列
```

#### 6. formatResponse(records, responseType)
```javascript
// 格式化回覆訊息
// 輸入: 記錄陣列, 回應類型
// 輸出: 格式化的字串
```

#### 7. replyToLine(replyToken, message)
```javascript
// 呼叫 LINE Reply API
// 輸入: Reply Token, 訊息內容
// 輸出: Promise (API 回應)
```

### 資料模型

#### LeaveRecord 物件結構
```javascript
{
  name: String,        // 姓名
  leaveType: String,   // 假別
  leaveDate: String,   // 請假日期 (YYYY-MM-DD)
  startTime: String,   // 開始時間 (HH:MM)
  endTime: String,     // 結束時間 (HH:MM)
  status: String       // 簽核狀態 ("已簽核" 或其他)
}
```

#### LINE Webhook Event 結構
```javascript
{
  type: "message",
  message: {
    type: "text",
    text: String
  },
  replyToken: String,
  source: {
    userId: String
  }
}
```

## 正確性屬性

*正確性屬性是系統必須滿足的特性或行為，這些屬性作為系統正確性的正式規範，可以透過屬性基礎測試來驗證。*

### 屬性 1: 訊息解析一致性
*對於任何* 有效的指令字串，parseMessage 函數應該始終回傳相同的指令類型，不受大小寫影響
**驗證需求: 需求 3.3**

### 屬性 2: 日期篩選正確性
*對於任何* 請假記錄集合和給定日期，filterRecordsByDate 函數應該只回傳符合指定日期條件的記錄
**驗證需求: 需求 4.2, 5.2, 6.2, 7.2**

### 屬性 3: CSV 解析完整性
*對於任何* 格式正確的 CSV 檔案，readLeaveRecords 函數應該解析出所有記錄，且每個記錄包含所有必要欄位
**驗證需求: 需求 8.1, 8.2**

### 屬性 4: 回覆格式一致性
*對於任何* 記錄集合和回應類型，formatResponse 函數應該產生符合指定格式的字串，多筆記錄用 ";" 分隔
**驗證需求: 需求 4.3, 5.3, 6.3, 7.3**

### 屬性 5: LINE API 回應正確性
*對於任何* 有效的 Reply Token 和訊息，replyToLine 函數應該成功呼叫 LINE API 並回傳成功狀態
**驗證需求: 需求 9.1, 9.2**

## 錯誤處理

### 錯誤類型和處理策略

1. **簽名驗證失敗**
   - 回傳 HTTP 400 狀態碼
   - 記錄安全警告

2. **CSV 檔案讀取錯誤**
   - 回覆 "查詢失敗，請稍後再試"
   - 記錄檔案錯誤詳情

3. **LINE API 呼叫失敗**
   - 記錄 API 錯誤回應
   - 不中斷系統運行

4. **日期解析錯誤**
   - 使用當前日期作為預設值
   - 記錄解析警告

5. **未知指令**
   - 不執行任何動作
   - 記錄未知指令內容

## 測試策略

### 單元測試
- 測試每個函數的基本功能
- 驗證錯誤處理邏輯
- 測試邊界條件

### 屬性基礎測試
- 使用隨機生成的測試資料
- 驗證系統的正確性屬性
- 每個屬性測試至少 100 次迭代

### 整合測試
- 測試 LINE Webhook 整合
- 驗證 CSV 檔案讀取
- 測試完整的訊息處理流程

### 測試配置
- 屬性測試最少 100 次迭代
- 每個屬性測試標記格式: **Feature: line-bot-reply, Property {number}: {property_text}**
- 單元測試專注於具體範例和邊界情況
- 屬性測試驗證通用正確性屬性

## 部署考量

### 環境變數
- `LINE_CHANNEL_ACCESS_TOKEN`: LINE Bot 存取令牌
- `LINE_CHANNEL_SECRET`: LINE Bot 頻道密鑰
- `PORT`: HTTP 伺服器埠號 (預設: 10000，與生產環境一致)

### 檔案結構
```
/
├── line/
│   ├── line-bot.js          # 主程式檔案
│   └── .env                 # 環境變數配置
└── server/data/
    └── 請假記錄.csv          # 請假記錄資料
```

### LINE Bot Webhook 設定
- **Webhook URL**: `https://your-domain.com/line/webhook`
- **HTTP Method**: POST
- **Content-Type**: application/json

### 系統需求
- Node.js 14+ 
- 可存取 server/data/請假記錄.csv 檔案
- 網路連線以呼叫 LINE API
- 與現有 server 系統整合，使用相同埠號 (10000)

## 安全考量

1. **請求驗證**: 所有 Webhook 請求必須通過簽名驗證
2. **環境變數保護**: 敏感資訊存放在 .env 檔案中
3. **錯誤資訊**: 避免在回應中洩露系統內部資訊
4. **輸入驗證**: 驗證所有用戶輸入和 API 回應格式