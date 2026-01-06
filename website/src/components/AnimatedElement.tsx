import React, { ReactNode } from 'react'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface AnimatedElementProps {
  children: ReactNode
  animation?: 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale-up' | 'bounce'
  delay?: number
  duration?: number
  className?: string
  triggerOnce?: boolean
}

export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 600,
  className = '',
  triggerOnce = true
}) => {
  const [elementRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce
  })

  const prefersReducedMotion = useReducedMotion()

  const getAnimationClasses = () => {
    if (prefersReducedMotion) {
      return 'opacity-100 transform-none'
    }

    const baseClasses = 'transition-all ease-out'
    const durationClass = `duration-[${duration}ms]`
    const delayClass = delay > 0 ? `delay-[${delay}ms]` : ''

    if (!isVisible) {
      switch (animation) {
        case 'fade-in':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0`
        case 'slide-up':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 translate-y-8`
        case 'slide-left':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 -translate-x-8`
        case 'slide-right':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 translate-x-8`
        case 'scale-up':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 scale-95`
        case 'bounce':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 scale-95`
        default:
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0`
      }
    } else {
      const visibleClasses = 'opacity-100 translate-x-0 translate-y-0 scale-100'
      return `${baseClasses} ${durationClass} ${delayClass} ${visibleClasses}`
    }
  }

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`${getAnimationClasses()} ${className}`}
      style={{
        transitionDelay: prefersReducedMotion ? '0ms' : `${delay}ms`,
        transitionDuration: prefersReducedMotion ? '0ms' : `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}