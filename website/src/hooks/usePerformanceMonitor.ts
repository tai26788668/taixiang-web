import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  isSlowConnection: boolean
  memoryUsage?: number
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    isSlowConnection: false
  })

  useEffect(() => {
    const measurePerformance = () => {
      // 測量頁面載入時間
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.fetchStart

      // 測量渲染時間
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart

      // 檢測網路連線速度
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      const isSlowConnection = connection ? connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' : false

      // 測量記憶體使用（如果支援）
      let memoryUsage: number | undefined
      if ('memory' in performance) {
        const memory = (performance as any).memory
        memoryUsage = memory.usedJSHeapSize / 1024 / 1024 // MB
      }

      setMetrics({
        loadTime,
        renderTime,
        isSlowConnection,
        memoryUsage
      })

      // 如果載入時間超過 3 秒，發出警告
      if (loadTime > 3000) {
        console.warn(`頁面載入時間過長: ${loadTime}ms`)
      }
    }

    // 等待頁面完全載入後測量
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    return () => {
      window.removeEventListener('load', measurePerformance)
    }
  }, [])

  return metrics
}