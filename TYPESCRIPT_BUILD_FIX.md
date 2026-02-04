# 🔧 TypeScript 建置錯誤修正指南

## 🚨 問題描述

在 Render 部署時遇到 TypeScript 錯誤：
```
src/services/emailService.ts(6,24): error TS7016: Could not find a declaration file for module 'nodemailer'
```

## ✅ 已修正的問題

### 1. 依賴配置修正
將 `@types/nodemailer` 從 `devDependencies` 移動到 `dependencies`：

```json
{
  "dependencies": {
    "@types/nodemailer": "^7.0.9",
    "nodemailer": "^7.0.13",
    // ... 其他依賴
  }
}
```

**原因**: Render 在生產環境建置時不會安裝 `devDependencies`，導致類型定義缺失。

### 2. Import 語句修正
修改 `server/src/services/emailService.ts` 中的 import：

```typescript
// 修正前
import nodemailer from 'nodemailer';

// 修正後
import * as nodemailer from 'nodemailer';
```

**原因**: 使用 namespace import 可以更好地處理 CommonJS 模組的類型。

## 🔍 驗證修正

### 本地測試
```bash
cd server
npm install
npm run build
npx tsc --noEmit  # 檢查類型錯誤
```

### Render 部署測試
1. 推送修正到 GitHub
2. 觸發 Render 重新部署
3. 檢查建置日誌是否有 TypeScript 錯誤

## 🛠️ 其他可能的解決方案

### 方案 1: 使用 skipLibCheck
如果問題持續，可以在 `tsconfig.json` 中啟用：
```json
{
  "compilerOptions": {
    "skipLibCheck": true  // 已啟用
  }
}
```

### 方案 2: 明確的類型聲明
如果特定模組仍有問題，可以創建類型聲明檔案：

```typescript
// server/src/types/nodemailer.d.ts
declare module 'nodemailer' {
  import * as nodemailer from 'nodemailer';
  export = nodemailer;
}
```

### 方案 3: 更新依賴版本
確保使用最新的類型定義：
```bash
npm update @types/nodemailer
```

## 📋 完整的依賴清單

確保以下類型定義都在 `dependencies` 中：

```json
{
  "dependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/cors": "^2.8.13",
    "@types/express": "^4.17.17",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/multer": "^1.4.7",
    "@types/node": "^20.5.0",
    "@types/nodemailer": "^7.0.9",
    "typescript": "^5.1.6",
    "ts-node": "^10.9.1"
  }
}
```

## 🚀 部署後驗證

部署完成後，測試 Email 功能：

```bash
# 驗證 Gmail 設定
curl https://your-backend.onrender.com/api/email/verify-config

# 測試發送郵件
curl -X POST https://your-backend.onrender.com/api/email/send-leave-record
```

## 📝 注意事項

1. **生產環境依賴**: 所有 TypeScript 相關的套件都應該在 `dependencies` 中
2. **建置順序**: 確保 TypeScript 編譯在檔案複製之前完成
3. **類型檢查**: 使用 `npx tsc --noEmit` 進行類型檢查而不產生輸出

---

**修正完成後，TypeScript 建置應該能在 Render 上正常運行！** ✅