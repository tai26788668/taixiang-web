# 圖片最佳化指南

## 🎯 建議規格

### 關於我們詳細頁面圖片
- **尺寸**: 1200x800px (3:2 比例)
- **格式**: JPG (照片) 或 WebP (更好的壓縮)
- **品質**: 80-90%
- **檔案大小**: < 500KB

## 🛠️ 最佳化工具

### 線上工具
1. **TinyPNG** (https://tinypng.com/)
   - 支援 PNG 和 JPG
   - 自動最佳化
   - 保持視覺品質

2. **Squoosh** (https://squoosh.app/)
   - Google 開發
   - 支援多種格式
   - 即時預覽效果

### 命令列工具
```bash
# 安裝 imagemagick (Windows)
choco install imagemagick

# 調整尺寸並最佳化
magick input.jpg -resize 1200x800^ -gravity center -extent 1200x800 -quality 85 output.jpg

# 轉換為 WebP
magick input.jpg -resize 1200x800^ -gravity center -extent 1200x800 -quality 85 output.webp
```

## 📋 檢查清單

### 替換 SVG 佔位符時：
- [ ] 圖片尺寸為 1200x800px
- [ ] 檔案大小 < 500KB  
- [ ] 圖片清晰且對比度良好
- [ ] 更新 websiteConfig.ts 中的檔案副檔名
- [ ] 更新 alt 文字以符合實際內容
- [ ] 測試在不同裝置上的顯示效果
- [ ] 確認 LazyImage 組件正常載入

### 無障礙檢查：
- [ ] Alt 文字描述性且有意義
- [ ] 圖片內容清晰可辨識
- [ ] 色彩對比度符合 WCAG 標準
- [ ] 支援螢幕閱讀器

## 🔄 批次處理腳本

如果需要處理多張圖片，可以使用以下 PowerShell 腳本：

```powershell
# optimize-about-images.ps1
$images = @(
    "heritage-craftsmanship",
    "natural-ingredients", 
    "quality-innovation"
)

foreach ($image in $images) {
    $input = "$image.jpg"
    $output = "$image-optimized.jpg"
    
    if (Test-Path $input) {
        magick $input -resize 1200x800^ -gravity center -extent 1200x800 -quality 85 $output
        Write-Host "Optimized: $output"
    }
}
```

## 📱 響應式圖片

考慮為不同裝置提供不同尺寸：

```html
<!-- 在 HTML 中使用 srcset -->
<img 
  src="/images/heritage-craftsmanship.jpg"
  srcset="
    /images/heritage-craftsmanship-400.jpg 400w,
    /images/heritage-craftsmanship-800.jpg 800w,
    /images/heritage-craftsmanship-1200.jpg 1200w
  "
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="傳統製餅工藝師傅正在製作餅乾"
/>
```

## 🎨 圖片內容建議

### 拍攝技巧
1. **光線**: 使用自然光或柔和的人工光
2. **構圖**: 遵循三分法則
3. **背景**: 保持簡潔，突出主體
4. **角度**: 多角度拍攝，選擇最佳視角

### 後製處理
1. **色彩調整**: 確保色彩自然真實
2. **銳化**: 適度銳化提升清晰度
3. **裁切**: 符合 3:2 比例要求
4. **壓縮**: 平衡檔案大小與品質