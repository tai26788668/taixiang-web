# LINE Bot Reply 系統實作計畫

## 概述

將設計轉換為一系列程式碼生成任務，以增量方式實作 LINE Bot Reply 系統。每個任務都建立在前一個任務的基礎上，最終整合成完整的系統。

## 任務

- [x] 1. 建立專案結構和環境配置
  - 在 `server/src/` 目錄下建立 `line-bot.js` 主程式檔案（JavaScript 格式）
  - 確認 `server/.env` 檔案包含必要的 LINE Bot 環境變數（CHANNEL_ACCESS_TOKEN, CHANNEL_SECRET）
  - 確認 `server/package.json` 包含必要的依賴項（@line/bot-sdk, csv-parser）
  - _需求: 需求 2, 需求 10_

- [ ]* 1.1 撰寫專案設定單元測試
  - 測試環境變數載入功能
  - 測試必要變數缺失時的錯誤處理
  - _需求: 需求 2_

- [x] 2. 實作基礎 HTTP 伺服器和 Webhook 處理
  - [x] 2.1 建立 Express HTTP 伺服器
    - 在 `line-bot.js` 中設定基本的 Express 應用程式
    - 配置 JSON 解析中介軟體
    - 設定埠號為 10000 (與生產環境一致)
    - _需求: 需求 1, 需求 2_

  - [x] 2.2 實作 Webhook 端點
    - 建立 `/line/webhook` POST 路由
    - 實作基本的請求接收和回應
    - 加入請求日誌記錄
    - _需求: 需求 1_

  - [ ]* 2.3 撰寫 HTTP 伺服器單元測試
    - 測試伺服器啟動功能
    - 測試 Webhook 端點基本回應
    - _需求: 需求 1_

- [x] 3. 實作 LINE 簽名驗證
  - [x] 3.1 建立簽名驗證函數
    - 實作 `verifySignature(body, signature)` 函數
    - 使用 HMAC-SHA256 演算法驗證請求
    - 處理驗證失敗的情況
    - _需求: 需求 1_

  - [ ]* 3.2 撰寫簽名驗證屬性測試
    - **屬性 5: LINE API 回應正確性**
    - **驗證需求: 需求 1.1, 1.2**

- [x] 4. 實作訊息解析和指令識別
  - [x] 4.1 建立訊息解析函數
    - 實作 `parseMessage(messageText)` 函數
    - 識別 5 種指令類型: help, list, list-a, list-d, list-da
    - 處理大小寫不敏感的指令識別
    - _需求: 需求 3_

  - [ ]* 4.2 撰寫訊息解析屬性測試
    - **屬性 1: 訊息解析一致性**
    - **驗證需求: 需求 3.3**

- [x] 5. 實作 CSV 檔案讀取和解析
  - [x] 5.1 建立 CSV 讀取函數
    - 實作 `readLeaveRecords()` 函數
    - 讀取 `server/data/請假記錄.csv` 檔案
    - 解析 CSV 格式並建立 LeaveRecord 物件陣列
    - 處理檔案讀取錯誤
    - _需求: 需求 8_

  - [ ]* 5.2 撰寫 CSV 解析屬性測試
    - **屬性 3: CSV 解析完整性**
    - **驗證需求: 需求 8.1, 8.2**

- [x] 6. 實作日期篩選功能
  - [x] 6.1 建立日期篩選函數
    - 實作 `filterRecordsByDate(records, filterType, targetDate)` 函數
    - 支援 4 種篩選類型: future, future-approved, today, today-approved
    - 正確比較日期字串
    - _需求: 需求 4, 5, 6, 7_

  - [ ]* 6.2 撰寫日期篩選屬性測試
    - **屬性 2: 日期篩選正確性**
    - **驗證需求: 需求 4.2, 5.2, 6.2, 7.2**

- [x] 7. 實作回覆訊息格式化
  - [x] 7.1 建立回覆格式化函數
    - 實作 `formatResponse(records, responseType)` 函數
    - 支援 5 種回應格式: help, future, future-approved, today, today-approved
    - 正確格式化記錄資訊並用 ";" 分隔
    - _需求: 需求 3, 4, 5, 6, 7_

  - [ ]* 7.2 撰寫回覆格式化屬性測試
    - **屬性 4: 回覆格式一致性**
    - **驗證需求: 需求 4.3, 5.3, 6.3, 7.3**

- [x] 8. 實作 LINE Reply API 整合
  - [x] 8.1 建立 LINE API 客戶端函數
    - 實作 `replyToLine(replyToken, message)` 函數
    - 使用 Channel Access Token 呼叫 LINE Reply API
    - 處理 API 呼叫錯誤和回應
    - _需求: 需求 9_

  - [ ]* 8.2 撰寫 LINE API 整合單元測試
    - 測試 API 呼叫成功情況
    - 測試 API 呼叫失敗處理
    - _需求: 需求 9_

- [x] 9. 整合所有組件並完成主要邏輯
  - [x] 9.1 完成 Webhook 處理邏輯
    - 整合簽名驗證、訊息解析、資料查詢和回覆功能
    - 實作完整的訊息處理流程
    - 加入錯誤處理和日誌記錄
    - _需求: 需求 1, 3, 4, 5, 6, 7, 8, 9_

  - [x] 9.2 加入健康檢查端點
    - 實作 `/line/health` GET 路由
    - 回傳系統狀態和配置資訊
    - _需求: 需求 2_

- [x] 10. 整合 LINE Bot 到主伺服器
  - [x] 10.1 更新 server/src/index.ts
    - 在主伺服器中引入 `line-bot.js` 的路由
    - 將 LINE Bot 的路由掛載到 `/line` 路徑
    - 確保與現有路由不衝突
    - _需求: 需求 2, 需求 10_

- [ ]* 11. 撰寫整合測試
  - 測試完整的 Webhook 處理流程
  - 驗證所有指令的端到端功能
  - 測試錯誤處理情況
  - _需求: 所有需求_

- [x] 12. 最終檢查點 - 確保所有功能正常運作
  - 確保所有核心功能運作正常，詢問用戶是否有問題

## 注意事項

- 標記 `*` 的任務為可選，可跳過以加快 MVP 開發
- 每個任務都參考特定需求以確保可追溯性
- 檢查點確保增量驗證
- 屬性測試驗證通用正確性屬性
- 單元測試驗證特定範例和邊界情況