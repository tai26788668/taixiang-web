import { useState, useCallback, useRef, useEffect } from 'react'

interface LoadingState {
  isLoading: boolean
  error: Error | null
  progress: number
}

interface LoadingOptions {
  timeout?: number
  retryCount?: number
  retryDelay?: number
}

export const useLoadingState = (options: LoadingOptions = {}) => {
  const { timeout = 30000, retryCount = 3, retryDelay = 1000 } = options
  
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    progress: 0
  })
  
  const retryCountRef = useRef(0)
  const timeoutRef = useRef<number>()
  const abortControllerRef = useRef<AbortController>()

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }))
  }, [])

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress: Math.max(0, Math.min(100, progress)) }))
  }, [])

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, progress: 0 })
    retryCountRef.current = 0
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const executeWithLoading = useCallback(async <T>(
    operation: (signal?: AbortSignal) => Promise<T>,
    onProgress?: (progress: number) => void
  ): Promise<T> => {
    reset()
    setLoading(true)
    
    const attemptOperation = async (): Promise<T> => {
      abortControllerRef.current = new AbortController()
      
      // Set up timeout
      timeoutRef.current = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        setError(new Error(`Operation timed out after ${timeout}ms`))
      }, timeout)

      try {
        // Progress simulation for operations without built-in progress
        let progressInterval: number | undefined
        if (onProgress) {
          let currentProgress = 0
          progressInterval = setInterval(() => {
            currentProgress += Math.random() * 10
            if (currentProgress < 90) {
              setProgress(currentProgress)
              onProgress(currentProgress)
            }
          }, 100)
        }

        const result = await operation(abortControllerRef.current.signal)
        
        if (progressInterval) {
          clearInterval(progressInterval)
        }
        
        setProgress(100)
        if (onProgress) onProgress(100)
        
        clearTimeout(timeoutRef.current!)
        setLoading(false)
        return result
        
      } catch (error) {
        clearTimeout(timeoutRef.current!)
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Operation was cancelled')
        }
        
        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++
          setError(new Error(`Attempt ${retryCountRef.current} failed, retrying...`))
          
          await new Promise(resolve => setTimeout(resolve, retryDelay))
          return attemptOperation()
        }
        
        setError(error as Error)
        setLoading(false)
        throw error
      }
    }

    return attemptOperation()
  }, [timeout, retryCount, retryDelay, reset, setLoading, setError, setProgress])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    setLoading,
    setError,
    setProgress,
    reset,
    executeWithLoading,
    retryCount: retryCountRef.current
  }
}