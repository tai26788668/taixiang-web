# 🚀 泰鄉食品系統使用指南 (方案 A - 分離部署)

## 📋 可用腳本

### **本地開發**

#### 1. 主網站開發
```powershell
cd website
npm run dev
# 訪問: http://localhost:5173
```

#### 2. LINE Bot 開發
```powershell
cd line
npm start
# 訪問: http://localhost:10000
```

#### 3. 快速測試
```powershell
# 建置主網站
cd website && npm run build

# 測試 LINE Bot
cd line && npm start
```

### **部署到 Render**

#### 1. 部署前驗證
```powershell
# 檢查主網站建置
cd website && npm run build

# 檢查 LINE Bot 配置
cd line && cat .env
```

#### 2. 部署指南
參考 `PLAN_A_DEPLOYMENT_GUIDE.md` 完整部署步驟

## 🌐 **服務端點**

### **本地開發**
- **主網站**: http://localhost:5173
- **LINE Bot 健康檢查**: http://localhost:10000/line/health
- **LINE Bot Webhook**: http://localhost:10000/line/webhook

### **生產環境 (Render)**
- **主網站**: https://taixiang-website.onrender.com
- **LINE Bot Webhook**: https://taixiang.onrender.com/line/webhook
- **LINE Bot 健康檢查**: https://taixiang.onrender.com/line/health

## 🔄 **開發工作流程**

### **日常開發**
1. 編輯程式碼 (website/src/, line/)
2. 測試主網站: `cd website && npm run dev`
3. 測試 LINE Bot: `cd line && npm start`
4. 重複步驟 1-3

### **功能測試**
1. 建置主網站: `cd website && npm run build`
2. 測試 LINE Bot: `cd line && npm start`
3. 在瀏覽器中測試所有功能

### **部署流程**
1. 確認程式碼無誤
2. 提交程式碼: `git add . && git commit -m "..." && git push`
3. Render 自動部署
4. 測試生產環境

## 📁 **重要檔案**

- `PLAN_A_DEPLOYMENT_GUIDE.md` - 完整部署指南
- `PROJECT_DOCUMENTATION.md` - 專案文檔
- `CHANGELOG.md` - 版本更新記錄
- `line/.env` - LINE Bot 環境變數配置

## ⚠️ **注意事項**

1. **環境變數**: LINE Bot 需要設定 `LINE_CHANNEL_ACCESS_TOKEN` 和 `LINE_CHANNEL_SECRET`
2. **資料檔案**: 確保 `server/data/請假記錄.csv` 檔案存在
3. **建置時間**: 首次建置可能需要 1-2 分鐘
4. **端口配置**: 主網站開發端口 5173，LINE Bot 開發端口 10000

## 🆘 **故障排除**

### **LINE Bot 問題**
```powershell
# 檢查環境變數
cd line && cat .env

# 檢查資料檔案
ls ../server/data/請假記錄.csv

# 測試健康檢查
curl http://localhost:10000/line/health
```

### **主網站問題**
```powershell
# 清理並重新安裝
cd website
rm -rf node_modules dist
npm install
npm run build
```

### **部署問題**
- 確認 GitHub repository 最新
- 檢查 Render 建置日誌
- 驗證環境變數設定正確

---

**版本**: v2.0 (分離部署架構)  
**最後更新**: 2026年1月5日