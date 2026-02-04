# 🖼️ 圖片路徑問題修正指南

## 🔍 問題診斷

如果在 `https://taixiang.onrender.com/` 上圖片無法顯示，可能的原因：

### 1. 檢查瀏覽器開發者工具
1. 按 F12 打開開發者工具
2. 切換到 "Network" 標籤
3. 重新載入頁面
4. 查看是否有 404 錯誤的圖片請求

### 2. 檢查圖片路徑
所有圖片應該使用絕對路徑，例如：
- ✅ `/images/building.jpg`
- ✅ `/icons/company_icon.jpg`
- ❌ `images/building.jpg` (缺少開頭的 `/`)
- ❌ `./images/building.jpg` (相對路徑)

## ✅ 已修正的問題

### 1. 缺少的圖片檔案
- ❌ `/movie/IMG_8099.jpg` → ✅ `/images/building.jpg`
- ❌ `/images/hero-fallback.jpg` → ✅ `/images/building.jpg`
- ❌ `/og-image.jpg` → ✅ `/images/building.jpg`

### 2. Vite 配置優化
```typescript
// website/vite.config.ts
export default defineConfig({
  base: '/', // 確保使用根路徑
  publicDir: 'public', // 確保靜態資源正確處理
  // ...其他配置
})
```

### 3. 建置驗證
```bash
cd website
npm install
npm run build
# 檢查 dist/ 目錄中是否包含所有圖片
```

## 🔧 除錯步驟

### 1. 本地測試
```bash
cd website
npm run build
npm run preview
# 訪問 http://localhost:4173 檢查圖片是否正常
```

### 2. 檢查建置輸出
```bash
ls -la website/dist/images/
ls -la website/dist/icons/
```

### 3. 檢查 Render 部署日誌
1. 前往 Render Dashboard
2. 選擇你的 Static Site
3. 查看 "Events" 和 "Logs"
4. 確認建置過程沒有錯誤

## 🚀 重新部署步驟

### 1. 推送修正到 GitHub
```bash
git add .
git commit -m "fix: 修正圖片路徑問題"
git push origin main
```

### 2. 觸發 Render 重新部署
- Render 會自動檢測到 GitHub 更新並重新部署
- 或者手動觸發：Dashboard → 你的 Static Site → "Manual Deploy"

### 3. 驗證修正
- 等待部署完成（約 3-5 分鐘）
- 訪問你的網站 URL
- 檢查所有圖片是否正常顯示

## 📋 圖片檔案清單

### 主要圖片
- `/images/building.jpg` - 公司建築外觀
- `/images/category_1.jpg` - 麻粩產品
- `/images/category_2.jpg` - 寸棗產品
- `/images/category_3.jpg` - 蘇打餅乾產品
- `/images/category_4.jpg` - 蘇打夾心產品

### 歷史圖片
- `/images/history_2.jpg` - 現代化生產線
- `/images/history_4.jpg` - 傳統工藝
- `/images/history_5.jpg` - 客製化服務

### 產品口味圖片
- `/images/flavors/category1_*.jpg` - 麻粩口味
- `/images/flavors/category2_*.jpg` - 寸棗口味
- `/images/flavors/category3_*.jpg` - 蘇打餅乾口味
- `/images/flavors/category4_*.jpg` - 蘇打夾心口味

### 圖標
- `/icons/company_icon.jpg` - 公司 Logo
- `/icons/phone.svg` - 電話圖標
- `/icons/email.svg` - 郵件圖標
- `/icons/location.svg` - 位置圖標

## 🛠️ 如果問題持續存在

### 1. 檢查 CORS 設定
確認後端服務的 CORS 設定允許靜態網站的 domain。

### 2. 檢查 CDN 快取
Render 可能有 CDN 快取，等待 5-10 分鐘讓快取更新。

### 3. 強制重新整理
在瀏覽器中按 Ctrl+F5 (Windows) 或 Cmd+Shift+R (Mac) 強制重新載入。

### 4. 檢查網路連線
確認你的網路連線正常，可以訪問其他網站。

---

**修正完成後，所有圖片都應該正常顯示！** 🎉