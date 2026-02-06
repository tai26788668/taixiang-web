# 主網站需求文件

## 簡介

建立一個現代化的主網站，作為根目錄 "/" 的入口頁面，參考 Oreo 官網的設計架構，提供品牌展示、產品介紹和導航功能。

## 詞彙表

- **主網站 (Main Website)**: 位於根目錄 "/" 的品牌官方網站
- **Hero Section**: 網站頂部的主要視覺區域，包含主要訊息和行動呼籲
- **導航列 (Navigation Bar)**: 網站頂部的主要導航選單
- **產品展示區 (Product Showcase)**: 展示主要產品或服務的區域
- **頁尾 (Footer)**: 網站底部包含聯絡資訊和次要連結的區域
- **響應式設計 (Responsive Design)**: 適應不同螢幕尺寸的網頁設計
- **請假系統 (Leave System)**: 現有的員工請假管理系統，位於 "/career" 路徑

## 需求

### 需求 1

**使用者故事:** 作為網站訪客，我想要看到一個專業的主頁，以便了解公司品牌和服務。

#### 驗收標準

1. WHEN 使用者訪問根目錄 "/" THEN 系統 SHALL 顯示主網站而非重導向到 "/career"
2. WHEN 主網站載入 THEN 系統 SHALL 在 3 秒內完成初始渲染
3. WHEN 使用者查看主頁 THEN 系統 SHALL 顯示清晰的品牌識別和價值主張
4. WHEN 使用者滾動頁面 THEN 系統 SHALL 提供流暢的視覺體驗
5. WHEN 使用者在不同裝置上訪問 THEN 系統 SHALL 提供適應性的響應式佈局

### 需求 2

**使用者故事:** 作為網站訪客，我想要透過直觀的導航系統，以便快速找到我需要的資訊或服務。

#### 驗收標準

1. WHEN 使用者查看頁面頂部 THEN 系統 SHALL 顯示固定的導航列包含主要選單項目
2. WHEN 使用者點擊導航選單項目 THEN 系統 SHALL 平滑滾動到對應的頁面區域
3. WHEN 使用者點擊 "員工系統" 或類似連結 THEN 系統 SHALL 導航到 "/career" 路徑
4. WHEN 使用者滾動頁面 THEN 系統 SHALL 在導航列中高亮顯示當前區域
5. WHEN 使用者在行動裝置上訪問 THEN 系統 SHALL 提供可摺疊的漢堡選單

### 需求 3

**使用者故事:** 作為網站訪客，我想要看到吸引人的 Hero Section，以便快速理解網站的主要目的。

#### 驗收標準

1. WHEN 使用者首次載入頁面 THEN 系統 SHALL 在視窗頂部顯示全寬度的 Hero Section
2. WHEN Hero Section 顯示 THEN 系統 SHALL 包含主要標題、副標題和行動呼籲按鈕
3. WHEN 使用者查看 Hero Section THEN 系統 SHALL 顯示高品質的背景圖片或視覺元素
4. WHEN 使用者點擊行動呼籲按鈕 THEN 系統 SHALL 導航到相關的服務或資訊區域
5. WHEN Hero Section 載入 THEN 系統 SHALL 播放平滑的進入動畫效果

### 需求 4

**使用者故事:** 作為網站訪客，我想要瀏覽產品或服務展示區，以便了解公司提供的解決方案。

#### 驗收標準

1. WHEN 使用者滾動到產品區域 THEN 系統 SHALL 顯示格狀佈局的產品或服務卡片
2. WHEN 產品卡片進入視窗 THEN 系統 SHALL 觸發淡入動畫效果
3. WHEN 使用者懸停在產品卡片上 THEN 系統 SHALL 顯示互動式的視覺回饋
4. WHEN 使用者點擊產品卡片 THEN 系統 SHALL 顯示詳細資訊或導航到相關頁面
5. WHEN 產品區域顯示 THEN 系統 SHALL 包含每個項目的標題、描述和視覺圖示

### 需求 5

**使用者故事:** 作為網站訪客，我想要在頁尾找到聯絡資訊和重要連結，以便獲得更多資訊或支援。

#### 驗收標準

1. WHEN 使用者滾動到頁面底部 THEN 系統 SHALL 顯示包含多欄位資訊的頁尾
2. WHEN 頁尾顯示 THEN 系統 SHALL 包含公司聯絡資訊、社群媒體連結和法律聲明
3. WHEN 使用者點擊頁尾連結 THEN 系統 SHALL 正確導航到對應的頁面或外部網站
4. WHEN 使用者查看頁尾 THEN 系統 SHALL 顯示版權資訊和最後更新日期
5. WHEN 頁尾在行動裝置上顯示 THEN 系統 SHALL 採用堆疊式佈局以提高可讀性

### 需求 6

**使用者故事:** 作為網站管理員，我想要確保主網站與現有請假系統的整合，以便提供統一的使用者體驗。

#### 驗收標準

1. WHEN 使用者從主網站導航到請假系統 THEN 系統 SHALL 保持一致的視覺設計語言
2. WHEN 請假系統使用者想返回主網站 THEN 系統 SHALL 在請假系統中提供返回主頁的連結
3. WHEN 兩個系統之間切換 THEN 系統 SHALL 維持相同的品牌色彩和字體
4. WHEN 使用者在任一系統中 THEN 系統 SHALL 提供清晰的當前位置指示
5. WHEN 系統部署 THEN 系統 SHALL 確保主網站和請假系統都能正常運作且不互相干擾

### 需求 7

**使用者故事:** 作為網站訪客，我想要體驗現代化的互動效果和動畫，以便獲得愉悅的瀏覽體驗。

#### 驗收標準

1. WHEN 使用者滾動頁面 THEN 系統 SHALL 觸發視差滾動效果和元素動畫
2. WHEN 頁面元素進入視窗 THEN 系統 SHALL 播放淡入、滑入或縮放動畫
3. WHEN 使用者與互動元素互動 THEN 系統 SHALL 提供即時的視覺回饋
4. WHEN 動畫播放 THEN 系統 SHALL 確保流暢度達到 60fps 且不影響效能
5. WHEN 使用者偏好減少動畫 THEN 系統 SHALL 尊重系統的 "prefers-reduced-motion" 設定

### 需求 8: 關於我們 Section 擴展

**使用者故事:** 作為網站訪客，我想要在關於我們 section 中看到基礎介紹和詳細頁面，以便深入了解公司。

#### 驗收標準

1. WHEN 使用者滾動到關於我們 section THEN 系統 SHALL 顯示基礎介紹內容
2. WHEN 使用者點擊「了解更多」按鈕 THEN 系統 SHALL 平滑切換到詳細介紹頁面
3. WHEN 詳細頁面載入 THEN 系統 SHALL 顯示三張圖文卡片的網格佈局
4. WHEN 使用者在桌面裝置上查看 THEN 系統 SHALL 以三欄網格顯示圖文卡片
5. WHEN 使用者在平板裝置上查看 THEN 系統 SHALL 以兩欄網格顯示圖文卡片
6. WHEN 使用者在手機裝置上查看 THEN 系統 SHALL 以單欄堆疊顯示圖文卡片
7. WHEN 圖片載入 THEN 系統 SHALL 使用 LazyImage 組件實現延遲載入
8. WHEN 管理員需要更新圖文內容 THEN 系統 SHALL 在 websiteConfig.ts 中提供配置選項