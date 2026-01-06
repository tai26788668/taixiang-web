import { useState, useEffect } from 'react'

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

// Animation configuration based on user preference
export const getAnimationConfig = (prefersReducedMotion: boolean) => ({
  duration: prefersReducedMotion ? 0 : 300,
  delay: prefersReducedMotion ? 0 : undefined,
  easing: prefersReducedMotion ? 'linear' : 'ease-in-out',
  scale: prefersReducedMotion ? 1 : undefined,
  opacity: prefersReducedMotion ? 1 : undefined
})

// CSS class helper for reduced motion
export const getMotionClass = (prefersReducedMotion: boolean, normalClass: string, reducedClass?: string) => {
  return prefersReducedMotion ? (reducedClass || '') : normalClass
}