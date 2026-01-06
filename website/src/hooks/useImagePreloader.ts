import { useState, useCallback } from 'react'

interface PreloadOptions {
  priority?: 'high' | 'low'
  timeout?: number
}

interface PreloadState {
  loaded: Set<string>
  loading: Set<string>
  errors: Set<string>
}

export const useImagePreloader = () => {
  const [state, setState] = useState<PreloadState>({
    loaded: new Set(),
    loading: new Set(),
    errors: new Set()
  })

  const preloadImage = useCallback((src: string, options: PreloadOptions = {}) => {
    const { priority = 'low', timeout = 10000 } = options

    // Skip if already loaded or loading
    if (state.loaded.has(src) || state.loading.has(src)) {
      return Promise.resolve()
    }

    // Add to loading set
    setState(prev => ({
      ...prev,
      loading: new Set([...prev.loading, src])
    }))

    return new Promise<void>((resolve, reject) => {
      const img = new Image()
      
      // Set priority hint if supported
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = priority
      }

      // Set up timeout
      const timeoutId = setTimeout(() => {
        setState(prev => ({
          ...prev,
          loading: new Set([...prev.loading].filter(url => url !== src)),
          errors: new Set([...prev.errors, src])
        }))
        reject(new Error(`Image preload timeout: ${src}`))
      }, timeout)

      img.onload = () => {
        clearTimeout(timeoutId)
        setState(prev => ({
          ...prev,
          loading: new Set([...prev.loading].filter(url => url !== src)),
          loaded: new Set([...prev.loaded, src])
        }))
        resolve()
      }

      img.onerror = () => {
        clearTimeout(timeoutId)
        setState(prev => ({
          ...prev,
          loading: new Set([...prev.loading].filter(url => url !== src)),
          errors: new Set([...prev.errors, src])
        }))
        reject(new Error(`Failed to preload image: ${src}`))
      }

      img.src = src
    })
  }, [state.loaded, state.loading])

  const preloadImages = useCallback(async (
    urls: string[], 
    options: PreloadOptions = {},
    maxConcurrent = 3
  ) => {
    const results: Array<{ url: string; success: boolean; error?: Error }> = []
    
    // Process images in batches to avoid overwhelming the browser
    for (let i = 0; i < urls.length; i += maxConcurrent) {
      const batch = urls.slice(i, i + maxConcurrent)
      const batchPromises = batch.map(async (url) => {
        try {
          await preloadImage(url, options)
          return { url, success: true }
        } catch (error) {
          return { url, success: false, error: error as Error }
        }
      })
      
      const batchResults = await Promise.allSettled(batchPromises)
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({ 
            url: 'unknown', 
            success: false, 
            error: new Error('Batch processing failed') 
          })
        }
      })
    }
    
    return results
  }, [preloadImage])

  const isLoaded = useCallback((src: string) => state.loaded.has(src), [state.loaded])
  const isLoading = useCallback((src: string) => state.loading.has(src), [state.loading])
  const hasError = useCallback((src: string) => state.errors.has(src), [state.errors])

  const getLoadingProgress = useCallback(() => {
    const total = state.loaded.size + state.loading.size + state.errors.size
    if (total === 0) return 0
    return (state.loaded.size / total) * 100
  }, [state])

  return {
    preloadImage,
    preloadImages,
    isLoaded,
    isLoading,
    hasError,
    getLoadingProgress,
    loadedCount: state.loaded.size,
    loadingCount: state.loading.size,
    errorCount: state.errors.size
  }
}