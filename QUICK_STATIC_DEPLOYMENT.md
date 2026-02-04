# 🚀 靜態網頁快速部署指南

## 📋 部署步驟 (5 分鐘完成)

### 1. 在 Render 建立 Static Site
1. 前往 [render.com](https://render.com) 並登入
2. 點擊 "New +" → "Static Site"
3. 選擇你的 GitHub 倉庫

### 2. 設定建置參數
```
Name: tai-xiang-website
Root Directory: website
Build Command: npm install && npm run build
Publish Directory: dist
Auto-Deploy: Yes
Branch: main
```

### 3. 點擊 "Create Static Site"
- 建置時間約 3-5 分鐘
- 完成後會獲得 URL: `https://your-site-name.onrender.com`

## ✅ 部署完成檢查

### 測試網站功能
- [ ] 主頁正常載入
- [ ] 所有區塊顯示正確 (Hero, Products, About, Contact)
- [ ] 圖片正常顯示
- [ ] 員工專區連結正確 (應指向後端服務)
- [ ] 響應式設計正常

### 檢查連結
- [ ] 員工專區連結：應指向 `https://your-backend-url.onrender.com/leave_system`
- [ ] 所有內部錨點連結正常工作

## 🔧 如果需要更新 Domain

如果後端 URL 改變，需要更新 `website/src/config/websiteConfig.ts`:

```typescript
// 更新這兩個地方
{ label: '員工專區', href: 'https://your-new-backend.onrender.com/leave_system', external: true }

deployment: {
  plan: 'A',
  backendUrl: 'https://your-new-backend.onrender.com'
}
```

然後推送到 GitHub，Render 會自動重新部署。

## 📱 預期結果

部署完成後，你將擁有：
- ✅ 完整的泰鄉食品企業網站
- ✅ 響應式設計 (手機、平板、桌面)
- ✅ 產品展示頁面
- ✅ 公司介紹和聯絡資訊
- ✅ 員工專區入口連結
- ✅ 自動部署 (推送程式碼即自動更新)

---

**就這麼簡單！你的企業網站就上線了！** 🎉