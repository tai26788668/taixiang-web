# Public 靜態資源目錄

這個目錄包含網站的所有靜態資源，這些檔案會被直接複製到建置輸出目錄。

## 📁 目錄結構

```
public/
├── favicon.ico              # 網站圖示
├── logo.png                 # 公司 Logo
├── og-image.jpg            # Open Graph 分享圖片
├── images/                 # 一般圖片
│   ├── hero-bg.jpg         # Hero 區域背景圖
│   ├── about-image.jpg     # 關於我們區域圖片
│   └── products/           # 產品圖片
│       ├── mapao.jpg       # 麻粩產品圖
│       ├── cunzao.jpg      # 寸棗產品圖
│       ├── soda.jpg        # 蘇打餅乾產品圖
│       └── soda-sandwich.jpg # 蘇打夾心產品圖
├── icons/                  # 圖示檔案
│   ├── phone.svg          # 電話圖示
│   ├── email.svg          # 郵件圖示
│   ├── location.svg       # 位置圖示
│   └── social/            # 社群媒體圖示
│       ├── facebook.svg
│       ├── instagram.svg
│       └── line.svg
└── assets/                # 其他資源
    ├── company-cert.pdf   # 公司證書
    └── product-catalog.pdf # 產品型錄
```

## 🖼️ 圖片使用方式

### 在組件中使用
```tsx
// 直接引用 public 目錄中的檔案
<img src="/images/products/mapao.jpg" alt="麻粩" />
<img src="/logo.png" alt="泰鄉食品" />
```

### 在 CSS 中使用
```css
.hero-bg {
  background-image: url('/images/hero-bg.jpg');
}
```

## 📋 建議的圖片規格

### Logo
- **格式**: PNG (透明背景)
- **尺寸**: 200x80px (建議)
- **用途**: Header 和 Footer

### 產品圖片
- **格式**: JPG 或 WebP
- **尺寸**: 400x300px (建議)
- **品質**: 80-90%

### Hero 背景圖
- **格式**: JPG 或 WebP
- **尺寸**: 1920x1080px (建議)
- **品質**: 70-80%

### Open Graph 圖片
- **格式**: JPG
- **尺寸**: 1200x630px (Facebook 建議)
- **用途**: 社群媒體分享

## 🎨 圖片最佳化建議

1. **使用 WebP 格式** - 更好的壓縮率
2. **提供多種尺寸** - 響應式圖片
3. **壓縮圖片** - 減少載入時間
4. **使用 alt 屬性** - 提升無障礙性

## 📝 注意事項

- 所有檔案會被複製到 `dist/` 目錄
- 檔案路徑以 `/` 開頭 (相對於網站根目錄)
- 避免使用中文檔名
- 建議使用小寫檔名和連字符