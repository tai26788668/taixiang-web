import { useState, useEffect } from 'react'

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string
  downlink?: number
  effectiveType?: string
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown'
  })

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      let isSlowConnection = false
      let connectionType = 'unknown'
      let downlink: number | undefined
      let effectiveType: string | undefined

      if (connection) {
        effectiveType = connection.effectiveType
        downlink = connection.downlink
        connectionType = connection.type || 'unknown'
        
        // 判斷是否為慢速連線
        isSlowConnection = effectiveType === 'slow-2g' || 
                          effectiveType === '2g' || 
                          (downlink !== undefined && downlink < 1)
      }

      setNetworkStatus({
        isOnline: navigator.onLine,
        isSlowConnection,
        connectionType,
        downlink,
        effectiveType
      })
    }

    // 初始檢查
    updateNetworkStatus()

    // 監聽網路狀態變化
    const handleOnline = () => updateNetworkStatus()
    const handleOffline = () => updateNetworkStatus()
    const handleConnectionChange = () => updateNetworkStatus()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 監聽連線變化（如果支援）
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  return networkStatus
}