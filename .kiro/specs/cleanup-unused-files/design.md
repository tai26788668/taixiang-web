# 清理未使用檔案 - 設計文件

## 概述

本設計文件描述如何系統性地清理 kiro_tai 專案中不再使用的檔案，包括備份檔案、過時的建置產物、臨時檔案和重複文件。清理過程將分階段進行，確保不會影響專案的正常運作。

## 架構

### 清理策略

```
清理階段:
1. 識別階段 - 掃描並分類未使用檔案
2. 驗證階段 - 確認檔案確實未被使用
3. 備份階段 - 創建安全備份（如需要）
4. 清理階段 - 安全移除檔案
5. 驗證階段 - 確認專案功能正常
```

### 檔案分類

#### 1. 伺服器備份檔案
- `server/src/index-original.ts` - 原始配置備份
- `server/src/index-plan-a.ts` - Plan A 配置備份
- `server/src/index-test-backup.ts` - 測試備份
- `server/src/index-unified.ts` - 統一配置備份

#### 2. 網站備份檔案
- `website/src/config/websiteConfig-original.ts` - 原始網站配置
- `website/src/config/websiteConfig-plan-a.ts` - Plan A 網站配置
- `website/src/components/Footer-original.tsx` - 原始頁尾組件
- `website/src/components/Footer-plan-a.tsx` - Plan A 頁尾組件

#### 3. 建置產物
- `server/dist/index-*.js` 及相關 `.d.ts`, `.map` 檔案
- `server/dist/index.js.annotated` - 註解檔案
- `server/dist/詳細註解 serverdistindex.js.txt` - 中文註解檔案

#### 4. 配置和參考檔案
- `render-backend.yaml` - 舊的 Render 配置
- `website/render.yaml` - 網站 Render 配置
- `ref/` 目錄中的參考檔案

#### 5. 重複文件
- `website/` 目錄中的多個指南檔案
- 版本摘要檔案的整合

## 組件和介面

### 清理腳本設計

```typescript
interface CleanupTask {
  name: string;
  description: string;
  files: string[];
  safetyCheck: () => boolean;
  execute: () => Promise<void>;
}

interface CleanupPlan {
  tasks: CleanupTask[];
  backupRequired: boolean;
  verificationSteps: string[];
}
```

### 安全檢查機制

1. **依賴檢查**: 確認檔案未被其他檔案引用
2. **功能測試**: 清理前後執行基本功能測試
3. **Git 狀態**: 確保在 Git 版本控制下進行清理

## 資料模型

### 檔案清理清單

```yaml
server_backups:
  - server/src/index-original.ts
  - server/src/index-plan-a.ts
  - server/src/index-test-backup.ts
  - server/src/index-unified.ts

website_backups:
  - website/src/config/websiteConfig-original.ts
  - website/src/config/websiteConfig-plan-a.ts
  - website/src/components/Footer-original.tsx
  - website/src/components/Footer-plan-a.tsx

build_artifacts:
  - server/dist/index-original.*
  - server/dist/index-plan-a.*
  - server/dist/index-test-backup.*
  - server/dist/index-unified.*
  - server/dist/index.js.annotated
  - server/dist/詳細註解 serverdistindex.js.txt

config_files:
  - render-backend.yaml
  - website/render.yaml

reference_files:
  - ref/build fail log file.txt
  - ref/F_Troubleshooting Your Deploy.txt

documentation_consolidation:
  keep:
    - website/ABOUT_SECTION_GUIDE.md
    - website/ABOUT_CONTENT_MANAGEMENT.md
  remove:
    - website/ABOUT_CONTENT_UPDATE_LOG.md
    - website/ABOUT_SECTION_QUICK_REFERENCE.md
    - website/ABOUT_SECTION_DEPLOYMENT.md
    - website/BUILDING_IMAGE_INTEGRATION.md
    - website/DEV_GUIDE.md
    - website/FOOTER_LINK_FIX.md
    - website/IMAGE_GUIDE.md
    - website/VERSION_SUMMARY.md
    - website/VIDEO_GUIDE.md
```

## 正確性屬性

*正確性屬性是應該在所有有效執行中保持為真的特徵或行為，本質上是關於系統應該做什麼的正式陳述。*

### 屬性 1: 檔案清理完整性
*對於任何* 標記為清理的檔案，清理後該檔案應該不存在於檔案系統中
**驗證: 需求 1.1, 2.1, 3.1, 4.1**

### 屬性 2: 核心檔案保護
*對於任何* 核心功能檔案，清理過程應該保持該檔案不被修改或刪除
**驗證: 需求 1.2, 2.3, 3.2**

### 屬性 3: 功能完整性
*對於任何* 清理操作，執行前後的系統功能應該保持一致
**驗證: 需求 6.1, 6.2, 6.3**

### 屬性 4: 建置一致性
*對於任何* 清理後的專案，重新建置應該產生相同的功能結果
**驗證: 需求 3.3, 6.1**

## 錯誤處理

### 錯誤情況
1. **檔案被鎖定**: 無法刪除正在使用的檔案
2. **權限不足**: 沒有刪除檔案的權限
3. **依賴檢查失敗**: 發現檔案仍被其他檔案引用
4. **功能測試失敗**: 清理後系統功能異常

### 錯誤恢復
1. **回滾機制**: 從 Git 恢復意外刪除的檔案
2. **分階段清理**: 逐步清理，每階段後驗證
3. **手動確認**: 重要檔案清理前需要手動確認

## 測試策略

### 單元測試
- 檔案存在性檢查函數
- 依賴關係分析函數
- 安全檢查機制

### 整合測試
- 完整清理流程測試
- 建置流程驗證
- 功能回歸測試

### 手動測試
- 清理前後功能對比
- 部署流程驗證
- 文件完整性檢查