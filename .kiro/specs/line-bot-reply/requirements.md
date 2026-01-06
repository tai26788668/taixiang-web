# LINE Bot Reply 系統需求文件

## 簡介

本系統將實作一個基於 LINE Messaging API 的 Bot，使用 Reply API 功能來回應用戶傳送的訊息。系統使用 JavaScript 開發，整合在單一程式檔案中，透過讀取 CSV 檔案提供請假記錄查詢功能。

## 詞彙表

- **LINE_Bot**: LINE 平台上的聊天機器人應用程式
- **Webhook**: LINE 平台向我們伺服器發送事件通知的機制
- **Reply_Token**: LINE 提供的一次性回覆令牌，用於回覆特定訊息
- **Channel_Access_Token**: LINE Bot 的存取令牌，用於呼叫 LINE API
- **Message_Event**: 用戶發送訊息時觸發的事件
- **Reply_API**: LINE Messaging API 中用於回覆訊息的端點
- **請假記錄_CSV**: 存放在 server/data/請假記錄.csv 的請假資料檔案

## 需求

### 需求 1: Webhook 接收與驗證

**用戶故事:** 作為系統管理員，我希望系統能安全地接收 LINE 平台的 Webhook 事件，以確保只處理來自 LINE 的合法請求。

#### 驗收標準

1. WHEN LINE 平台發送 Webhook 請求 THEN 系統 SHALL 驗證請求的簽名
2. WHEN 簽名驗證失敗 THEN 系統 SHALL 回傳 400 錯誤狀態碼
3. WHEN 簽名驗證成功 THEN 系統 SHALL 解析請求內容並處理事件
4. WHEN 接收到非 POST 請求 THEN 系統 SHALL 回傳 405 錯誤狀態碼
5. WHEN 請求內容格式錯誤 THEN 系統 SHALL 回傳 400 錯誤狀態碼

### 需求 2: 環境配置管理

**用戶故事:** 作為系統部署人員，我希望能透過 .env 檔案配置 LINE API 參數，以便在不同環境中靈活部署。

#### 驗收標準

1. WHEN 系統啟動 THEN 系統 SHALL 從 .env 檔案讀取 Channel Access Token
2. WHEN 系統啟動 THEN 系統 SHALL 從 .env 檔案讀取 Channel Secret
3. WHEN 必要的環境變數缺失 THEN 系統 SHALL 拒絕啟動並顯示錯誤訊息
4. WHEN 環境變數格式錯誤 THEN 系統 SHALL 顯示具體的錯誤說明
5. WHEN 系統運行 THEN 系統 SHALL 使用配置的埠號啟動 HTTP 伺服器

### 需求 3: 訊息內容分析與回應

**用戶故事:** 作為 LINE Bot 用戶，我希望 Bot 能理解我的訊息內容並提供相關的回應，以獲得有用的資訊。

#### 驗收標準

1. WHEN 用戶發送 "help?" THEN 系統 SHALL 回覆 "list -d -a //列出含當日以後請假 ;d當日請假;-a已簽核"
2. WHEN 用戶發送其他訊息內容 THEN 系統 SHALL 不執行任何動作
3. WHEN 訊息內容大小寫不同 THEN 系統 SHALL 正確識別並處理指令
4. WHEN 系統處理指令 THEN 系統 SHALL 呼叫對應的函數
5. WHEN 函數執行完成 THEN 系統 SHALL 使用 Reply API 回覆結果

### 需求 4: list 指令處理

**用戶故事:** 作為員工，我希望能透過 "list" 指令查詢當日以後的所有請假記錄，以便了解未來的請假安排。

#### 驗收標準

1. WHEN 用戶發送 "list" THEN 系統 SHALL 讀取 server/data/請假記錄.csv
2. WHEN 系統讀取 CSV 檔案 THEN 系統 SHALL 查詢請假日期等於或超過訊息當日的記錄
3. WHEN 找到符合條件的記錄 THEN 系統 SHALL 格式化為 "預計請假"+姓名+" "+請假日期+" "+開始時間+" "+結束時間+" "+假別+" "+簽核狀態
4. WHEN 有多筆記錄 THEN 系統 SHALL 用 ";" 分隔每筆記錄
5. WHEN CSV 檔案讀取失敗 THEN 系統 SHALL 回覆錯誤訊息

### 需求 5: list -a 指令處理

**用戶故事:** 作為員工，我希望能透過 "list -a" 指令查詢當日以後已簽核的請假記錄，以便了解確定的請假安排。

#### 驗收標準

1. WHEN 用戶發送 "list -a" THEN 系統 SHALL 讀取 server/data/請假記錄.csv
2. WHEN 系統讀取 CSV 檔案 THEN 系統 SHALL 查詢請假日期等於或超過訊息當日且簽核狀態等於"已簽核"的記錄
3. WHEN 找到符合條件的記錄 THEN 系統 SHALL 格式化為 "預計請假(已簽核)"+姓名+" "+請假日期+" "+開始時間+" "+結束時間+" "+假別
4. WHEN 有多筆記錄 THEN 系統 SHALL 用 ";" 分隔每筆記錄
5. WHEN CSV 檔案讀取失敗 THEN 系統 SHALL 回覆錯誤訊息

### 需求 6: list -d 指令處理

**用戶故事:** 作為員工，我希望能透過 "list -d" 指令查詢當日的請假記錄，以便了解今天的請假狀況。

#### 驗收標準

1. WHEN 用戶發送 "list -d" THEN 系統 SHALL 讀取 server/data/請假記錄.csv
2. WHEN 系統讀取 CSV 檔案 THEN 系統 SHALL 查詢請假日期等於訊息當日的記錄
3. WHEN 找到符合條件的記錄 THEN 系統 SHALL 格式化為 "今日請假"+姓名+" "+請假日期+" "+開始時間+" "+結束時間+" "+假別+" "+簽核狀態
4. WHEN 有多筆記錄 THEN 系統 SHALL 用 ";" 分隔每筆記錄
5. WHEN CSV 檔案讀取失敗 THEN 系統 SHALL 回覆錯誤訊息

### 需求 7: list -d -a 和 list -a -d 指令處理

**用戶故事:** 作為員工，我希望能透過 "list -d -a" 或 "list -a -d" 指令查詢當日已簽核的請假記錄，以便了解今天確定的請假狀況。

#### 驗收標準

1. WHEN 用戶發送 "list -d -a" 或 "list -a -d" THEN 系統 SHALL 讀取 server/data/請假記錄.csv
2. WHEN 系統讀取 CSV 檔案 THEN 系統 SHALL 查詢請假日期等於訊息當日且簽核狀態等於"已簽核"的記錄
3. WHEN 找到符合條件的記錄 THEN 系統 SHALL 格式化為 "今日請假(已簽核)"+姓名+" "+請假日期+" "+開始時間+" "+結束時間+" "+假別
4. WHEN 有多筆記錄 THEN 系統 SHALL 用 ";" 分隔每筆記錄
5. WHEN CSV 檔案讀取失敗 THEN 系統 SHALL 回覆錯誤訊息

### 需求 8: CSV 檔案處理

**用戶故事:** 作為系統開發者，我希望系統能正確解析 CSV 格式的請假記錄，以提供準確的查詢結果。

#### 驗收標準

1. WHEN 系統讀取 server/data/請假記錄.csv THEN 系統 SHALL 解析 CSV 格式並提取所有欄位
2. WHEN 解析請假記錄 THEN 系統 SHALL 識別姓名、假別、請假日期、開始時間、結束時間和簽核狀態欄位
3. WHEN 比較日期 THEN 系統 SHALL 使用當前系統日期作為基準
4. WHEN 格式化回覆訊息 THEN 系統 SHALL 以指定格式顯示請假資訊
5. WHEN CSV 格式錯誤 THEN 系統 SHALL 回覆錯誤訊息

### 需求 9: Reply API 整合

**用戶故事:** 作為 LINE Bot 用戶，我希望能收到系統針對我的訊息所提供的回覆，以獲得所需的資訊。

#### 驗收標準

1. WHEN 系統決定回覆訊息 THEN 系統 SHALL 使用有效的 Reply Token 呼叫 LINE Reply API
2. WHEN Reply API 呼叫成功 THEN 系統 SHALL 記錄成功狀態
3. WHEN Reply API 呼叫失敗 THEN 系統 SHALL 記錄錯誤詳情
4. WHEN Reply Token 已過期或無效 THEN 系統 SHALL 處理 API 錯誤回應
5. WHEN 回覆訊息格式 THEN 系統 SHALL 符合 LINE Messaging API 規範

### 需求 10: 程式架構要求

**用戶故事:** 作為系統維護人員，我希望程式結構簡單明確，便於部署和維護。

#### 驗收標準

1. WHEN 開發程式 THEN 系統 SHALL 使用 JavaScript 語言而非 TypeScript
2. WHEN 組織程式碼 THEN 系統 SHALL 將所有邏輯寫在單一程式檔案中
3. WHEN 配置系統 THEN 系統 SHALL 僅使用 .env 檔案儲存環境變數
4. WHEN 部署系統 THEN 系統 SHALL 不需要其他設定檔案
5. WHEN 執行程式 THEN 系統 SHALL 能獨立運行不依賴外部配置