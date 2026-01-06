# 主網站設計文件

## 概述

主網站是一個現代化的單頁應用程式 (SPA)，位於根目錄 "/"，提供品牌展示、產品介紹和導航功能。設計參考 Oreo 官網架構，採用響應式設計，支援現代瀏覽器，並與現有的請假系統 (/career) 無縫整合。

## 架構

### 技術棧
- **前端框架**: React 18 + TypeScript
- **建置工具**: Vite
- **樣式**: Tailwind CSS + CSS Modules
- **動畫**: Framer Motion
- **路由**: React Router (與現有請假系統共享)
- **狀態管理**: React Context + Hooks
- **測試**: Vitest + React Testing Library + Fast-check

### 目錄結構
```
website/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Footer.tsx
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ProductSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   └── ContactSection.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── AnimatedElement.tsx
│   │   └── common/
│   │       ├── ScrollToTop.tsx
│   │       └── LazyImage.tsx
│   ├── hooks/
│   │   ├── useScrollSpy.ts
│   │   ├── useIntersectionObserver.ts
│   │   └── useResponsive.ts
│   ├── utils/
│   │   ├── animations.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── animations.css
│   └── assets/
│       ├── images/
│       └── icons/
```

## 組件和介面

### 核心組件

#### 1. MainWebsite (根組件)
```typescript
interface MainWebsiteProps {
  className?: string;
}

const MainWebsite: React.FC<MainWebsiteProps> = ({ className }) => {
  return (
    <div className={`main-website ${className}`}>
      <Header />
      <main>
        <HeroSection />
        <ProductSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};
```

#### 2. Header & Navigation
```typescript
interface NavigationItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  requiresAuth?: boolean; // 標記需要登入的連結
}

interface HeaderProps {
  navigationItems: NavigationItem[];
  currentSection?: string;
}

const Header: React.FC<HeaderProps> = ({ navigationItems, currentSection }) => {
  // 固定導航列，支援平滑滾動和高亮顯示
  // "員工專區" 連結導向 "/career"，需要登入驗證
};
```

#### 3. HeroSection
```typescript
interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaAction: () => void;
  backgroundImage?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaText,
  ctaAction,
  backgroundImage
}) => {
  // 全寬度 Hero 區域，包含動畫效果
};
```

#### 4. ProductSection
```typescript
interface Product {
  id: string;
  title: string;
  description: string;
  icon: string;
  link?: string;
}

interface ProductSectionProps {
  products: Product[];
  title: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({ products, title }) => {
  // 格狀佈局的產品展示，支援懸停效果和動畫
};
```

### 自定義 Hooks

#### useScrollSpy
```typescript
interface UseScrollSpyOptions {
  sectionIds: string[];
  offset?: number;
}

const useScrollSpy = ({ sectionIds, offset = 0 }: UseScrollSpyOptions) => {
  // 追蹤當前可見的頁面區域
  return currentSection;
};
```

#### useIntersectionObserver
```typescript
interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
}

const useIntersectionObserver = (options: UseIntersectionObserverOptions) => {
  // 監控元素進入視窗，觸發動畫
  return { ref, isIntersecting };
};
```

## 資料模型

### 網站配置
```typescript
interface WebsiteConfig {
  brand: {
    name: string;
    logo: string;
    tagline: string;
  };
  navigation: NavigationItem[];
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    backgroundImage: string;
  };
  products: Product[];
  contact: {
    email: string;
    phone: string;
    address: string;
    socialMedia: SocialMediaLink[];
  };
  employeePortal: {
    label: "員工專區";
    href: "/career";
    description: "員工請假管理系統 (需要登入)";
  };
}

interface SocialMediaLink {
  platform: string;
  url: string;
  icon: string;
}
```

### 動畫配置
```typescript
interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  respectReducedMotion: boolean;
}

interface ScrollAnimationConfig extends AnimationConfig {
  triggerOffset: number;
  once: boolean;
}
```

## 正確性屬性

*屬性是一個特徵或行為，應該在系統的所有有效執行中保持為真 - 本質上是關於系統應該做什麼的正式陳述。屬性作為人類可讀規格和機器可驗證正確性保證之間的橋樑。*

### 屬性 1: 頁面載入效能
*對於任何* 網路條件下的頁面載入，初始渲染時間應該在 3 秒內完成
**驗證: 需求 1.2**

### 屬性 2: 響應式佈局適應性
*對於任何* 螢幕尺寸 (320px 到 2560px 寬度)，所有頁面元素應該正確顯示且不出現水平滾動條
**驗證: 需求 1.5**

### 屬性 3: 導航滾動行為
*對於任何* 導航選單項目的點擊，頁面應該平滑滾動到對應區域且導航狀態正確更新
**驗證: 需求 2.2, 2.4**

### 屬性 4: 產品卡片互動一致性
*對於任何* 產品卡片，懸停和點擊事件應該提供一致的視覺回饋和功能行為
**驗證: 需求 4.3, 4.4**

### 屬性 5: 產品內容完整性
*對於任何* 顯示的產品卡片，應該包含標題、描述和視覺圖示這三個必要元素
**驗證: 需求 4.5**

### 屬性 6: 頁尾連結功能性
*對於任何* 頁尾中的連結，點擊應該正確導航到目標頁面或外部網站
**驗證: 需求 5.3**

### 屬性 7: 系統位置指示和訪問控制
*對於任何* 使用者在主網站或請假系統中的位置，應該有清晰的當前位置指示，且"員工專區"連結應該正確導向需要登入的 /career 系統
**驗證: 需求 6.4, 2.3**

### 屬性 8: 滾動動畫觸發
*對於任何* 頁面滾動行為，相關的視差效果和元素動畫應該正確觸發
**驗證: 需求 7.1**

### 屬性 9: 元素進入動畫
*對於任何* 進入視窗的頁面元素，應該播放適當的淡入、滑入或縮放動畫
**驗證: 需求 7.2**

### 屬性 10: 互動視覺回饋
*對於任何* 使用者與互動元素的互動，應該提供即時且一致的視覺回饋
**驗證: 需求 7.3**

### 屬性 11: 動畫效能保證
*對於任何* 播放的動畫，應該維持 60fps 的流暢度且不顯著影響頁面效能
**驗證: 需求 7.4**

## 錯誤處理

### 圖片載入失敗
- 提供預設佔位圖片
- 實作 lazy loading 和錯誤重試機制
- 顯示適當的錯誤訊息

### 動畫效能問題
- 監控動畫效能指標
- 在低效能裝置上自動降級動畫
- 尊重使用者的 `prefers-reduced-motion` 設定

### 網路連線問題
- 實作離線檢測
- 提供網路狀態指示
- 快取關鍵資源

### 瀏覽器相容性
- 提供 polyfills 支援舊版瀏覽器
- 漸進式增強設計
- 優雅降級處理

### 訪問控制
- "員工專區" 連結導向 "/career" 路徑
- 請假系統 (/career) 的所有頁面都需要登入驗證
- 未登入使用者訪問 /career 會被重導向到登入頁面
- 主網站 (/) 為公開訪問，不需要登入

## 測試策略

### 單元測試
- 測試所有 React 組件的渲染和互動
- 測試自定義 hooks 的邏輯
- 測試工具函數和常數

### 屬性測試
- 使用 Fast-check 生成隨機測試資料
- 測試響應式設計在各種螢幕尺寸下的行為
- 測試動畫和互動的一致性
- 測試效能屬性和載入時間

### 整合測試
- 測試主網站與請假系統的整合
- 測試路由和導航功能
- 測試完整的使用者流程

### 視覺回歸測試
- 截圖比較測試
- 跨瀏覽器視覺一致性測試
- 響應式設計視覺驗證

### 效能測試
- 頁面載入時間測試
- 動畫效能測試
- 記憶體使用量監控
- Core Web Vitals 指標測試