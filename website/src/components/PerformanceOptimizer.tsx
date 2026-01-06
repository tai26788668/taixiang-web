import React, { useEffect, useState } from 'react'
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface PerformanceOptimizerProps {
  children: React.ReactNode
  enableOptimizations?: boolean
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  enableOptimizations = true
}) => {
  const metrics = usePerformanceMonitor()
  const prefersReducedMotion = useReducedMotion()
  const [isSlowDevice, setIsSlowDevice] = useState(false)

  useEffect(() => {
    if (!enableOptimizations) return

    // Detect slow devices based on performance metrics
    const detectSlowDevice = () => {
      const isSlowConnection = metrics.isSlowConnection
      const isSlowMemory = metrics.memoryUsage && metrics.memoryUsage > 100 // > 100MB
      const isSlowLoad = metrics.loadTime > 5000 // > 5 seconds
      
      return isSlowConnection || isSlowMemory || isSlowLoad
    }

    setIsSlowDevice(detectSlowDevice())
  }, [metrics, enableOptimizations])

  useEffect(() => {
    if (!enableOptimizations) return

    const documentElement = document.documentElement

    // Apply performance optimizations based on device capabilities
    if (isSlowDevice) {
      documentElement.classList.add('slow-connection')
      
      // Reduce animation quality
      const style = document.createElement('style')
      style.textContent = `
        * {
          animation-duration: 0.1s !important;
          transition-duration: 0.1s !important;
        }
      `
      document.head.appendChild(style)
      
      return () => {
        document.head.removeChild(style)
      }
    } else {
      documentElement.classList.remove('slow-connection')
    }

    // Apply reduced motion preferences
    if (prefersReducedMotion) {
      documentElement.classList.add('reduce-motion')
    } else {
      documentElement.classList.remove('reduce-motion')
    }
  }, [isSlowDevice, prefersReducedMotion, enableOptimizations])

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      // Force garbage collection if available (development only)
      if (import.meta.env.DEV && 'gc' in window) {
        (window as any).gc()
      }
    }
  }, [])

  return (
    <div 
      className={`performance-optimized ${isSlowDevice ? 'slow-device' : ''} ${prefersReducedMotion ? 'reduced-motion' : ''}`}
      data-performance-metrics={JSON.stringify({
        loadTime: metrics.loadTime,
        renderTime: metrics.renderTime,
        memoryUsage: metrics.memoryUsage,
        isSlowConnection: metrics.isSlowConnection,
        isSlowDevice,
        prefersReducedMotion
      })}
    >
      {children}
    </div>
  )
}

// Performance monitoring hook for debugging
export const usePerformanceDebug = () => {
  const metrics = usePerformanceMonitor()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.group('Performance Metrics')
      console.log('Load Time:', metrics.loadTime + 'ms')
      console.log('Render Time:', metrics.renderTime + 'ms')
      console.log('Memory Usage:', metrics.memoryUsage ? metrics.memoryUsage.toFixed(2) + 'MB' : 'N/A')
      console.log('Slow Connection:', metrics.isSlowConnection)
      console.log('Prefers Reduced Motion:', prefersReducedMotion)
      console.groupEnd()
    }
  }, [metrics, prefersReducedMotion])

  return { metrics, prefersReducedMotion }
}