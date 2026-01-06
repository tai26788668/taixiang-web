import { useEffect } from 'react'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

export const PerformanceMonitor: React.FC = () => {
  const performanceMetrics = usePerformanceMonitor()
  const networkStatus = useNetworkStatus()

  useEffect(() => {
    // 在開發環境中顯示效能資訊
    if (import.meta.env.DEV) {
      console.group('🚀 網站效能監控')
      console.log('載入時間:', performanceMetrics.loadTime, 'ms')
      console.log('渲染時間:', performanceMetrics.renderTime, 'ms')
      console.log('記憶體使用:', performanceMetrics.memoryUsage, 'MB')
      console.log('網路狀態:', networkStatus.isOnline ? '線上' : '離線')
      console.log('連線類型:', networkStatus.effectiveType || '未知')
      console.log('慢速連線:', networkStatus.isSlowConnection ? '是' : '否')
      console.groupEnd()
    }

    // 如果載入時間過長，顯示優化建議
    if (performanceMetrics.loadTime > 3000) {
      console.warn('⚠️ 頁面載入時間超過 3 秒，建議優化')
    }

    // 如果是慢速連線，可以觸發優化模式
    if (networkStatus.isSlowConnection) {
      console.info('📶 檢測到慢速連線，啟用優化模式')
      // 可以在這裡觸發圖片品質降低、動畫簡化等優化
      document.body.classList.add('slow-connection')
    }

    // 監控記憶體使用
    if (performanceMetrics.memoryUsage && performanceMetrics.memoryUsage > 100) {
      console.warn('🧠 記憶體使用量較高:', performanceMetrics.memoryUsage, 'MB')
    }

  }, [performanceMetrics, networkStatus])

  // 離線狀態提示
  useEffect(() => {
    if (!networkStatus.isOnline) {
      // 可以顯示離線提示
      console.warn('📡 網路連線中斷')
    }
  }, [networkStatus.isOnline])

  return null
}