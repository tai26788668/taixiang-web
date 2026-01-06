# 實作計劃: 清理未使用檔案

## 概述

系統性地清理 kiro_tai 專案中不再使用的檔案，包括備份檔案、過時建置產物、臨時檔案和重複文件。

## 任務

- [x] 1. 準備和安全檢查
  - 確認 Git 狀態乾淨，所有變更已提交
  - 創建清理前的完整備份（如需要）
  - 驗證當前專案功能正常
  - _需求: 6.1, 6.2, 6.3_

- [x] 2. 清理伺服器備份檔案
  - [x] 2.1 移除伺服器配置備份檔案
    - 刪除 `server/src/index-original.ts`
    - 刪除 `server/src/index-plan-a.ts`
    - 刪除 `server/src/index-test-backup.ts`
    - 刪除 `server/src/index-unified.ts`
    - _需求: 1.1, 1.2_

  - [x] 2.2 清理對應的建置產物
    - 刪除 `server/dist/index-original.*` 檔案
    - 刪除 `server/dist/index-plan-a.*` 檔案
    - 刪除 `server/dist/index-test-backup.*` 檔案
    - 刪除 `server/dist/index-unified.*` 檔案
    - _需求: 3.1, 3.2_

  - [x] 2.3 驗證伺服器功能
    - 執行 `cd server && npm run build`
    - 確認建置成功且無錯誤
    - _需求: 1.3, 3.3_

- [x] 3. 清理網站備份檔案
  - [x] 3.1 移除網站配置備份檔案
    - 刪除 `website/src/config/websiteConfig-original.ts`
    - 刪除 `website/src/config/websiteConfig-plan-a.ts`
    - _需求: 2.1, 2.2_

  - [x] 3.2 移除組件備份檔案
    - 刪除 `website/src/components/Footer-original.tsx`
    - 刪除 `website/src/components/Footer-plan-a.tsx`
    - _需求: 2.1, 2.2_

  - [x] 3.3 驗證網站功能
    - 執行 `cd website && npm run build`
    - 確認建置成功且無錯誤
    - _需求: 2.4_

- [x] 4. 清理臨時和註解檔案
  - [x] 4.1 移除建置註解檔案
    - 刪除 `server/dist/index.js.annotated`
    - 刪除 `server/dist/詳細註解 serverdistindex.js.txt`
    - _需求: 3.1_

  - [x] 4.2 移除過時配置檔案
    - 刪除 `render-backend.yaml`
    - 刪除 `website/render.yaml`
    - _需求: 4.2_

- [x] 5. 清理參考檔案目錄
  - [x] 5.1 評估參考檔案價值
    - 檢查 `ref/build fail log file.txt` 內容
    - 檢查 `ref/F_Troubleshooting Your Deploy.txt` 內容
    - _需求: 4.1_

  - [x] 5.2 移除過時參考檔案
    - 刪除確認不再需要的參考檔案
    - 如果整個 `ref/` 目錄為空，則刪除目錄
    - _需求: 4.1_

- [x] 6. 整合重複文件
  - [x] 6.1 識別重複的文件檔案
    - 分析 `website/` 目錄中的多個 `.md` 檔案
    - 確定哪些檔案包含重複或過時資訊
    - _需求: 5.1_

  - [x] 6.2 移除重複文件
    - 刪除 `website/ABOUT_CONTENT_UPDATE_LOG.md`
    - 刪除 `website/ABOUT_SECTION_QUICK_REFERENCE.md`
    - 刪除 `website/ABOUT_SECTION_DEPLOYMENT.md`
    - 刪除 `website/BUILDING_IMAGE_INTEGRATION.md`
    - 刪除 `website/DEV_GUIDE.md`
    - 刪除 `website/FOOTER_LINK_FIX.md`
    - 刪除 `website/IMAGE_GUIDE.md`
    - 刪除 `website/VERSION_SUMMARY.md`
    - 刪除 `website/VIDEO_GUIDE.md`
    - _需求: 5.2, 5.3_

- [x] 7. 最終驗證和測試
  - [x] 7.1 執行完整建置測試
    - 執行 `.\verify-plan-a-fix.ps1` 腳本
    - 確認所有組件建置成功
    - _需求: 6.1_

  - [x] 7.2 執行功能測試
    - 執行 `.\quick-test.ps1` 進行快速測試
    - 驗證所有服務正常啟動
    - _需求: 6.2_

  - [x] 7.3 檢查專案結構
    - 確認清理後的專案結構清潔
    - 驗證沒有遺留不需要的檔案
    - _需求: 6.3_

- [x] 8. 更新文件和提交變更
  - [x] 8.1 更新專案文件
    - 更新 `PROJECT_DOCUMENTATION.md` 反映清理結果
    - 更新 `ARCHITECTURE_CLARIFICATION.md` 如需要
    - _需求: 5.3_

  - [x] 8.2 提交清理變更
    - 執行 `git add .`
    - 執行 `git commit -m "Clean up unused backup files and duplicated documentation"`
    - _需求: 6.3_

## 注意事項

- 清理過程中保持 Git 版本控制，以便必要時回滾
- 每個主要階段後都要驗證功能正常
- 重要檔案刪除前要仔細確認
- 保留核心功能檔案和當前使用的配置
- 清理完成後更新相關文件