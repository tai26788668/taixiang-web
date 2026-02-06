# 每週郵件備份設定指南

## 功能概述

此功能會在每週一自動將請假記錄 CSV 檔案寄送到指定的 email 信箱，作為定期備份。

## 設定步驟

### 步驟 1：取得 Gmail App Password

由於 Gmail 的安全性政策，不能直接使用帳號密碼，需要使用「應用程式密碼」。

1. **前往 Google 帳戶設定**
   - 訪問：https://myaccount.google.com/apppasswords
   - 登入你要用來發送郵件的 Gmail 帳號

2. **啟用兩步驟驗證**（如果尚未啟用）
   - 前往：https://myaccount.google.com/security
   - 找到「兩步驟驗證」並啟用

3. **建立應用程式密碼**
   - 回到：https://myaccount.google.com/apppasswords
   - 選擇「應用程式」：選擇「郵件」
   - 選擇「裝置」：選擇「其他（自訂名稱）」
   - 輸入名稱：`泰祥請假系統`
   - 點擊「產生」
   - **複製產生的 16 位密碼**（例如：`abcd efgh ijkl mnop`）

### 步驟 2：設定 Render 環境變數

1. **登入 Render Dashboard**
   - 前往：https://dashboard.render.com
   - 選擇你的 `tai-xiang-backend` Web Service

2. **添加環境變數**
   - 點擊 **"Environment"** 標籤
   - 點擊 **"Add Environment Variable"**

3. **添加以下變數**：

   ```
   Key: GMAIL_USER
   Value: your_gmail@gmail.com
   （填入你的 Gmail 帳號）
   ```

   ```
   Key: GMAIL_APP_PASSWORD
   Value: abcdefghijklmnop
   （填入剛才產生的 16 位密碼，移除空格）
   ```

   ```
   Key: BACKUP_EMAIL
   Value: tai26788668@gmail.com
   （收件人 email，已預設）
   ```

4. **儲存變更**
   - 點擊 **"Save Changes"**
   - Render 會自動重新部署

### 步驟 3：部署程式碼

1. **提交並推送程式碼**
   ```bash
   git add -A
   git commit -m "feat: 新增每週郵件備份功能"
   git push origin main
   ```

2. **等待部署完成**
   - Render 會自動部署（約 3-5 分鐘）

### 步驟 4：測試郵件功能

1. **驗證 Gmail 設定**
   ```bash
   curl https://taixiang-server.onrender.com/api/email/verify-config
   ```

   預期回應：
   ```json
   {
     "success": true,
     "configured": true,
     "message": "Gmail configuration is valid"
   }
   ```

2. **手動測試發送郵件**
   ```bash
   curl -X POST https://taixiang-server.onrender.com/api/email/send-leave-record
   ```

   預期回應：
   ```json
   {
     "success": true,
     "message": "Email sent successfully",
     "recipient": "tai26788668@gmail.com",
     "processingTime": "2345ms"
   }
   ```

3. **檢查收件匣**
   - 登入 tai26788668@gmail.com
   - 檢查是否收到郵件
   - 確認附件 CSV 檔案可以下載

### 步驟 5：設定每週自動發送

使用免費的排程服務 **cron-job.org**：

1. **註冊帳號**
   - 前往：https://cron-job.org
   - 註冊免費帳號

2. **建立新的 Cron Job**
   - 點擊 **"Create cronjob"**

3. **填寫設定**：
   ```
   Title: 泰祥請假系統週報
   
   URL: https://taixiang-server.onrender.com/api/email/send-leave-record
   
   Schedule:
   - Every Monday (每週一)
   - At 08:00 (早上 8 點)
   - Timezone: Asia/Taipei (台北時間)
   
   Request method: POST
   
   Notification: 
   ☑ Send notification on failure (失敗時通知)
   ```

4. **儲存並啟用**
   - 點擊 **"Create"**
   - 確認狀態為 **"Enabled"**

5. **測試執行**
   - 點擊 **"Run now"** 測試
   - 檢查執行結果和收件匣

## 郵件內容

### 主旨
```
請假記錄備份 - 2026-01-20
```

### 內文
```
親愛的管理員，

這是系統自動發送的每週請假記錄備份。

備份日期：2026-01-20
檔案名稱：leave_records.csv

請妥善保存此備份檔案。

---
泰祥食品請假系統
自動發送，請勿回覆
```

### 附件
- 檔案名稱：`請假記錄_2026-01-20.csv`
- 內容：完整的請假記錄 CSV 檔案

## API 端點

### 1. 發送請假記錄郵件

**Endpoint**: `POST /api/email/send-leave-record`

**回應**：
```json
{
  "success": true,
  "message": "Email sent successfully",
  "recipient": "tai26788668@gmail.com",
  "processingTime": "2345ms"
}
```

### 2. 驗證 Gmail 設定

**Endpoint**: `GET /api/email/verify-config`

**回應**：
```json
{
  "success": true,
  "configured": true,
  "message": "Gmail configuration is valid"
}
```

## 本地測試

### 設定本地環境變數

在 `server/.env` 中添加：
```env
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password
BACKUP_EMAIL=tai26788668@gmail.com
```

### 啟動伺服器
```bash
cd server
npm run dev
```

### 測試發送郵件
```bash
curl -X POST http://localhost:10000/api/email/send-leave-record
```

## 故障排除

### 問題 1：Gmail 認證失敗

**錯誤訊息**：
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

**解決方法**：
1. 確認已啟用兩步驟驗證
2. 確認使用的是「應用程式密碼」而非帳號密碼
3. 確認密碼沒有空格
4. 重新產生應用程式密碼

### 問題 2：找不到 CSV 檔案

**錯誤訊息**：
```
CSV file not found
```

**解決方法**：
1. 確認 `PERSISTENT_DISK_PATH` 環境變數已設定
2. 確認 Persistent Disk 已正確掛載
3. 確認 CSV 檔案已初始化到 Disk

### 問題 3：郵件未收到

**可能原因**：
1. 郵件被歸類到垃圾郵件
2. Gmail 每日發送限制（500 封/天）
3. 收件人 email 錯誤

**解決方法**：
1. 檢查垃圾郵件資料夾
2. 確認 `BACKUP_EMAIL` 環境變數正確
3. 查看伺服器日誌確認發送狀態

### 問題 4：排程未執行

**檢查項目**：
1. cron-job.org 的 Job 狀態是否為 "Enabled"
2. 查看 cron-job.org 的執行歷史
3. 確認 URL 正確
4. 確認時區設定正確

## 安全性考量

### Gmail App Password 保護
- ✅ 使用應用程式密碼而非帳號密碼
- ✅ 密碼存放在環境變數中
- ✅ 不會提交到 Git 倉庫

### Email 內容
- ✅ 不包含敏感資訊
- ✅ 使用 HTTPS 傳輸
- ✅ 附件為 CSV 格式（可用 Excel 開啟）

### 建議措施
1. 定期更換應用程式密碼
2. 監控郵件發送日誌
3. 確認收件人 email 正確
4. 定期檢查垃圾郵件設定

## 費用

### 完全免費
- ✅ Gmail 發送：免費（每日 500 封限制）
- ✅ cron-job.org：免費（每月 unlimited jobs）
- ✅ Render API：免費（包含在 Web Service 中）

### 總計
**$0/月**（完全免費）

## 替代排程服務

如果 cron-job.org 無法使用，可以考慮：

### 1. EasyCron
- 網址：https://www.easycron.com
- 免費方案：每天 1 次

### 2. GitHub Actions
- 完全免費
- 需要 GitHub 倉庫
- 設定稍微複雜

### 3. Render Cron Jobs
- 整合在 Render 平台
- 需要付費方案（$7/月起）

## 監控建議

### 每週檢查
1. 確認郵件已收到
2. 確認附件可以開啟
3. 確認資料完整性

### 每月檢查
1. 查看 cron-job.org 執行歷史
2. 確認沒有失敗記錄
3. 測試手動發送功能

## 相關文件

- [Nodemailer 官方文檔](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [cron-job.org 文檔](https://cron-job.org/en/documentation/)

---

**最後更新**: 2026-01-20
**版本**: 1.0.0
