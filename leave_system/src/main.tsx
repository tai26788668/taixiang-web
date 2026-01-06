import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n' // 初始化 i18n
import { initialize24HourTimeInputs } from './utils/timeFormat' // 初始化24小時制時間輸入

// 初始化24小時制時間輸入
initialize24HourTimeInputs();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)