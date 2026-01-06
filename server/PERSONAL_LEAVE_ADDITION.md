# 年度事假欄位新增記錄

## 📅 更新日期
2024年12月23日

## 🎯 更新目標
在請假系統的個人資料中新增「年度事假」欄位，支援事假額度管理。

## 📝 具體變更

### 1. CSV 資料檔案更新
**檔案**: `server/data/請假系統個人資料.csv`

**變更內容**:
- 新增「年度事假」欄位到標題行
- 為所有現有用戶設定預設年度事假額度：56 小時 (7 天)

**新的 CSV 結構**:
```
工號,密碼,姓名,權限,年度特休,年度病假,年度生理假,年度事假
```

### 2. 類型定義更新

#### 後端類型 (`server/src/types/index.ts`)
```typescript
export interface PersonalData {
  employeeId: string;    // 工號
  password: string;      // 密碼
  name: string;          // 姓名
  permission: 'employee' | 'admin'; // 權限
  annualLeave: number;   // 年度特休
  sickLeave: number;     // 年度病假
  menstrualLeave: number; // 年度生理假
  personalLeave: number; // 年度事假 (新增)
}
```

#### 前端類型 (`leave_system/src/types/index.ts`)
```typescript
export interface PersonalData {
  employeeId: string;    // 工號
  password: string;      // 密碼
  name: string;          // 姓名
  permission: 'employee' | 'admin'; // 權限
  annualLeave: number;   // 年度特休
  sickLeave: number;     // 年度病假
  menstrualLeave: number; // 年度生理假
  personalLeave: number; // 年度事假 (新增)
}
```

### 3. 後端服務更新

#### 個人資料服務 (`server/src/services/personalDataService.ts`)
- 更新 `PERSONAL_DATA_HEADERS` 包含年度事假欄位
- 更新 `REQUIRED_FIELDS` 包含年度事假驗證
- 修改 `getAllPersonalData()` 解析年度事假數值
- 更新 `updatePersonalData()` 支援年度事假更新

#### 用戶路由 (`server/src/routes/users.ts`)
- 新增用戶時包含 `personalLeave` 預設值 (7.0 天)
- 更新用戶時支援 `personalLeave` 欄位修改

### 4. 前端界面更新

#### 用戶管理組件 (`leave_system/src/components/admin/UserManagement.tsx`)
- 新增「年度事假」欄位到用戶列表表格
- 更新新增用戶表單包含年度事假輸入
- 修改編輯用戶對話框支援年度事假編輯
- 調整網格佈局為 4 欄以容納新欄位

## 🎨 界面變更

### 用戶列表表格
新增「年度事假」欄位，顯示格式：`{personalLeave} 天`

### 編輯/新增用戶對話框
- 年度假期額度區塊改為 4 欄佈局
- 新增「年度事假 (天)」輸入欄位
- 預設值：7.0 天
- 支援 0.5 天為單位的調整

## 📊 預設值設定

### 新用戶預設值
- **年度特休**: 14.0 天
- **年度病假**: 30.0 天  
- **年度生理假**: 3.0 天
- **年度事假**: 7.0 天 (新增)

### 現有用戶更新
所有現有用戶的年度事假額度統一設定為 56 小時 (7 天)

## 🔧 技術實作細節

### CSV 解析邏輯
```typescript
// 轉換為PersonalData格式
return rawData.map(record => ({
  employeeId: record['工號'],
  password: record['密碼'],
  name: record['姓名'],
  permission: record['權限'] as 'employee' | 'admin',
  annualLeave: parseFloat(record['年度特休']) || 0,
  sickLeave: parseFloat(record['年度病假']) || 0,
  menstrualLeave: parseFloat(record['年度生理假']) || 0,
  personalLeave: parseFloat(record['年度事假']) || 0  // 新增
}));
```

### 用戶更新邏輯
```typescript
if (updates.personalLeave !== undefined) {
  allData[index].personalLeave = updates.personalLeave;
}
```

### 前端表單處理
```typescript
// 新增用戶預設值
personalLeave: 7.0

// 編輯表單輸入
<input
  type="number"
  step="0.5"
  min="0"
  value={editingUser.personalLeave || 0}
  onChange={(e) => setEditingUser({ 
    ...editingUser, 
    personalLeave: parseFloat(e.target.value) || 0 
  })}
/>
```

## ✅ 測試檢查清單

### 後端測試
- [x] CSV 檔案正確解析年度事假欄位
- [x] 新增用戶包含年度事假預設值
- [x] 更新用戶支援年度事假修改
- [x] TypeScript 編譯無錯誤
- [x] 伺服器建置成功

### 前端測試
- [x] 用戶列表顯示年度事假欄位
- [x] 新增用戶表單包含年度事假輸入
- [x] 編輯用戶支援年度事假修改
- [x] 界面佈局正確調整
- [x] TypeScript 編譯無錯誤
- [x] 前端建置成功

### 整合測試
- [ ] 完整的新增用戶流程測試
- [ ] 完整的編輯用戶流程測試
- [ ] 年度事假數值正確儲存和讀取
- [ ] 跨瀏覽器相容性測試

## 🔄 向後相容性

### 現有資料處理
- 所有現有用戶自動獲得 7 天年度事假額度
- 舊版本的 CSV 檔案需要手動添加年度事假欄位
- 系統會為缺少 personalLeave 欄位的記錄提供預設值 0

### API 相容性
- 新的 API 回應包含 personalLeave 欄位
- 舊版前端可能不會顯示此欄位，但不會造成錯誤
- 建議同時更新前後端以獲得完整功能

## 📋 後續工作

### 功能增強
- [ ] 在請假申請中支援事假類型選擇
- [ ] 在請假記錄中顯示事假統計
- [ ] 在個人假期餘額中顯示事假剩餘
- [ ] 添加事假相關的多語言支援

### 資料遷移
- [ ] 為現有請假記錄中的事假類型進行分類
- [ ] 建立事假使用統計報表
- [ ] 設定事假額度的年度重置機制

---

**更新負責人**: Kiro AI Assistant  
**版本**: v1.0  
**最後更新**: 2024年12月23日