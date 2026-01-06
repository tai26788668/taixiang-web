# 關於我們 Section 擴展設計文件

## 概述

本設計文件描述如何擴展現有的「關於我們」section，將其轉換為一個雙頁面系統：保持現有基礎內容的第一頁，以及包含三張圖文介紹的詳細第二頁。設計重點在於提供流暢的頁面切換體驗、響應式圖文展示，以及可配置的內容管理。

## 架構

### 組件架構
```
About (容器組件)
├── AboutBasic (基礎頁面)
│   ├── 現有內容 (公司簡介、統計、特色)
│   └── NavigationButton (導航到詳細頁面)
├── AboutDetail (詳細頁面)
│   ├── ImageTextGrid (圖文網格)
│   │   └── ImageTextCard × 3 (圖文卡片)
│   └── NavigationButton (返回基礎頁面)
└── PageTransition (頁面切換動畫)
```

### 狀態管理
- 使用 React useState 管理當前頁面狀態
- 頁面狀態：'basic' | 'detail'
- 動畫狀態：'idle' | 'transitioning'

## 組件和介面

### About 容器組件
```typescript
interface AboutProps {
  // 無需額外 props，從 websiteConfig 讀取配置
}

interface AboutState {
  currentPage: 'basic' | 'detail'
  isTransitioning: boolean
}
```

### AboutBasic 組件
```typescript
interface AboutBasicProps {
  onNavigateToDetail: () => void
  isVisible: boolean
}
```

### AboutDetail 組件
```typescript
interface AboutDetailProps {
  onNavigateToBasic: () => void
  isVisible: boolean
}

interface ImageTextCardData {
  id: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
}
```

### ImageTextCard 組件
```typescript
interface ImageTextCardProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  animationDelay?: number
}
```

## 資料模型

### 配置資料結構
```typescript
// 擴展現有的 WebsiteConfig 介面
interface WebsiteConfig {
  // ... 現有配置
  aboutDetail: {
    title: string
    subtitle: string
    cards: ImageTextCardData[]
  }
}
```

### 圖文卡片資料模型
```typescript
interface ImageTextCardData {
  id: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  order: number
}
```

## 正確性屬性

*屬性是應該在系統所有有效執行中保持為真的特徵或行為——本質上是關於系統應該做什麼的正式陳述。屬性作為人類可讀規範和機器可驗證正確性保證之間的橋樑。*

### 屬性 1：頁面切換一致性
*對於任何*頁面切換操作，從基礎頁面切換到詳細頁面後再切換回來，應該返回到原始的基礎頁面狀態
**驗證：需求 2.4**

### 屬性 2：響應式佈局適應性
*對於任何*螢幕寬度，圖文卡片的佈局應該根據預定義的斷點正確調整（桌面：3欄，平板：2欄，手機：1欄）
**驗證：需求 4.1, 4.2, 4.3**

### 屬性 3：圖片載入錯誤處理
*對於任何*圖片載入失敗的情況，系統應該顯示備用圖片或錯誤提示，而不是破壞整體佈局
**驗證：需求 7.4**

### 屬性 4：動畫時序一致性
*對於任何*頁面切換動畫，動畫持續時間應該在 300-500ms 範圍內，確保用戶體驗的一致性
**驗證：需求 2.5**

### 屬性 5：配置資料完整性
*對於任何*配置更新，如果圖文卡片資料缺少必要欄位（title, description, imageSrc），系統應該提供預設值或錯誤提示
**驗證：需求 5.5**

## 錯誤處理

### 圖片載入錯誤
- 使用 LazyImage 組件的內建錯誤處理
- 提供預設的佔位符圖片
- 記錄載入失敗的圖片路徑供除錯

### 配置錯誤
- TypeScript 類型檢查防止配置錯誤
- 運行時驗證關鍵配置欄位
- 提供有意義的錯誤訊息

### 動畫錯誤
- 使用 CSS transition 的 fallback 機制
- 檢測 prefers-reduced-motion 設定
- 提供無動畫的降級體驗

## 測試策略

### 單元測試
- 測試 About 組件的頁面切換邏輯
- 測試 ImageTextCard 組件的 props 渲染
- 測試配置資料的類型安全性

### 屬性測試
每個正確性屬性都將通過屬性測試進行驗證：

**屬性測試 1：頁面切換往返測試**
- 生成隨機的頁面切換序列
- 驗證最終狀態與預期一致
- **功能：about-section-expansion，屬性 1：頁面切換一致性**

**屬性測試 2：響應式佈局測試**
- 生成隨機的螢幕寬度值
- 驗證卡片佈局符合斷點規則
- **功能：about-section-expansion，屬性 2：響應式佈局適應性**

**屬性測試 3：圖片錯誤處理測試**
- 生成無效的圖片 URL
- 驗證錯誤處理機制正常運作
- **功能：about-section-expansion，屬性 3：圖片載入錯誤處理**

**屬性測試 4：動畫時序測試**
- 測試不同的動畫觸發條件
- 驗證動畫持續時間在合理範圍內
- **功能：about-section-expansion，屬性 4：動畫時序一致性**

**屬性測試 5：配置完整性測試**
- 生成各種配置資料組合
- 驗證系統對不完整資料的處理
- **功能：about-section-expansion，屬性 5：配置資料完整性**

### 整合測試
- 測試與現有 About 組件的整合
- 測試與 websiteConfig 的整合
- 測試在不同裝置上的顯示效果

### 視覺回歸測試
- 截圖測試確保視覺一致性
- 測試不同螢幕尺寸的佈局
- 測試動畫效果的視覺品質

## 效能考量

### 圖片最佳化
- 使用 LazyImage 組件實現延遲載入
- 建議圖片尺寸：1200x800px（3:2 比例）
- 支援 WebP 格式以減少檔案大小

### 動畫效能
- 使用 CSS transform 而非改變佈局屬性
- 利用 GPU 加速的 CSS 屬性
- 避免在動畫期間觸發重排

### 記憶體管理
- 適當清理事件監聽器
- 避免記憶體洩漏的閉包
- 使用 React.memo 優化重新渲染

## 無障礙設計

### 鍵盤導航
- 所有互動元素支援 Tab 鍵導航
- 提供清晰的焦點指示器
- 支援 Enter 和 Space 鍵觸發操作

### 螢幕閱讀器支援
- 適當的 ARIA 標籤和角色
- 圖片提供有意義的 alt 文字
- 頁面切換時通知螢幕閱讀器

### 色彩和對比
- 確保文字與背景有足夠對比度
- 不僅依賴顏色傳達資訊
- 支援高對比度模式