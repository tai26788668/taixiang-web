import React, { useState, useEffect, useCallback } from 'react'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface LazyImageProps {
  src: string
  alt: string
  placeholder?: string
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjY2NjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Loading...</text></svg>',
  className = '',
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [elementRef, isVisible] = useIntersectionObserver({
    threshold: 0.01, // Reduced threshold for earlier triggering
    triggerOnce: true,
    rootMargin: '50px' // Start loading when image is 50px away from viewport
  })
  
  const prefersReducedMotion = useReducedMotion()

  const loadImage = useCallback(() => {
    console.log('Loading image:', src)
    const img = new Image()
    
    img.onload = () => {
      console.log('Image loaded successfully:', src)
      setImageSrc(src)
      setImageStatus('loaded')
      onLoad?.()
    }
    
    img.onerror = (e) => {
      console.error('Image load failed:', src, e)
      const error = new Error(`Failed to load image: ${src}`)
      setImageStatus('error')
      onError?.(error)
    }
    
    img.src = src
  }, [src, onLoad, onError])

  useEffect(() => {
    if (isVisible && imageStatus === 'loading') {
      loadImage()
    }
    
    // Fallback: If image hasn't loaded after 2 seconds and is still loading, try again
    const fallbackTimer = setTimeout(() => {
      if (imageStatus === 'loading') {
        console.log('Fallback: Attempting to load image after timeout:', src)
        loadImage()
      }
    }, 2000)
    
    // Additional fallback: Try to load immediately if element is already visible
    const immediateTimer = setTimeout(() => {
      if (imageStatus === 'loading') {
        const element = elementRef.current
        if (element) {
          const rect = element.getBoundingClientRect()
          const isInViewport = rect.top < window.innerHeight && rect.bottom > 0
          if (isInViewport) {
            console.log('Immediate load: Image is in viewport, loading now:', src)
            loadImage()
          }
        }
      }
    }, 100)
    
    return () => {
      clearTimeout(fallbackTimer)
      clearTimeout(immediateTimer)
    }
  }, [isVisible, imageStatus, loadImage, src])

  const getErrorPlaceholder = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjEiLz48dGV4dCB4PSI1MCIgeT0iNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+圖片載入</text><text x="50" y="55" font-family="Arial, sans-serif" font-size="10" fill="#999" text-anchor="middle">失敗</text><text x="50" y="70" font-family="Arial, sans-serif" font-size="8" fill="#bbb" text-anchor="middle">點擊重試</text></svg>'
  }

  const handleRetryClick = useCallback(() => {
    if (imageStatus === 'error') {
      console.log('Retrying image load:', src)
      setImageStatus('loading')
      setImageSrc(placeholder)
      loadImage()
    }
  }, [imageStatus, src, placeholder, loadImage])

  const getTransitionClass = () => {
    if (prefersReducedMotion) {
      return ''
    }
    return 'transition-all duration-300 ease-in-out'
  }

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>} 
      className={`relative overflow-hidden ${className}`}
    >
      <img
        src={imageStatus === 'error' ? getErrorPlaceholder() : imageSrc}
        alt={alt}
        className={`w-full h-full object-cover ${getTransitionClass()} ${
          imageStatus === 'loaded' ? 'opacity-100' : 'opacity-70'
        }`}
        loading="lazy"
        onClick={imageStatus === 'error' ? handleRetryClick : undefined}
        style={{ cursor: imageStatus === 'error' ? 'pointer' : 'default' }}
      />
      
      {/* Loading State */}
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
          {!prefersReducedMotion && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          )}
          <div className="text-xs text-gray-500 text-center">載入中...</div>
        </div>
      )}
      
      {/* Error State */}
      {imageStatus === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500 text-sm">
          <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-center">
            <div>圖片載入失敗</div>
            <div className="text-xs text-gray-400 mt-1">{src}</div>
            <button 
              onClick={handleRetryClick}
              className="mt-1 text-blue-600 hover:text-blue-800 text-xs underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            >
              點擊重試
            </button>
          </div>
        </div>
      )}
    </div>
  )
}