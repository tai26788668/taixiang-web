import React, { useState, useRef, useEffect } from 'react'
import { LazyImage } from './LazyImage'
import { AnimatedElement } from './AnimatedElement'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface ImageTextCardProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  animationDelay?: number
  maxLength?: number // Maximum characters to show before truncation
}

export const ImageTextCard: React.FC<ImageTextCardProps> = ({
  title,
  description,
  imageSrc,
  imageAlt,
  animationDelay = 0,
  maxLength = 150 // Default truncation length
}) => {
  const prefersReducedMotion = useReducedMotion()
  const [isExpanded, setIsExpanded] = useState(false)
  const [shouldTruncate, setShouldTruncate] = useState(false)
  const contentRef = useRef<HTMLParagraphElement>(null)

  // Check if content needs truncation and set responsive max length
  useEffect(() => {
    const getResponsiveMaxLength = () => {
      if (typeof window === 'undefined') return maxLength
      
      const width = window.innerWidth
      if (width >= 1024) { // lg breakpoint
        return maxLength * 1.5 // Allow more text on larger screens
      } else if (width >= 768) { // md breakpoint
        return maxLength * 1.2 // Slightly more text on medium screens
      }
      return maxLength // Use default on small screens
    }

    const responsiveMaxLength = getResponsiveMaxLength()
    
    if (description.length > responsiveMaxLength) {
      setShouldTruncate(true)
    }

    // Update on window resize
    const handleResize = () => {
      const newMaxLength = getResponsiveMaxLength()
      setShouldTruncate(description.length > newMaxLength)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [description, maxLength])

  // Get truncated text with responsive length
  const getTruncatedText = () => {
    if (!shouldTruncate || isExpanded) {
      return description
    }
    
    // Get responsive max length
    const getResponsiveMaxLength = () => {
      if (typeof window === 'undefined') return maxLength
      
      const width = window.innerWidth
      if (width >= 1024) {
        return maxLength * 1.5
      } else if (width >= 768) {
        return maxLength * 1.2
      }
      return maxLength
    }

    const responsiveMaxLength = getResponsiveMaxLength()
    
    // Find the last complete word within responsive max length
    const truncated = description.substring(0, responsiveMaxLength)
    const lastSpaceIndex = truncated.lastIndexOf(' ')
    
    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + '...'
    }
    
    return truncated + '...'
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Get transition classes based on motion preference
  const getTransitionClass = (baseClass: string) => {
    if (prefersReducedMotion) {
      return baseClass.replace(/duration-\d+/, 'duration-0')
    }
    return baseClass
  }

  const getHoverClass = (baseClass: string) => {
    if (prefersReducedMotion) {
      return baseClass.replace(/scale-\d+/, 'scale-100')
    }
    return baseClass
  }

  return (
    <AnimatedElement
      animation="fade-in"
      delay={animationDelay}
      duration={prefersReducedMotion ? 0 : 600}
      className="group"
    >
      <article 
        className={`bg-white rounded-lg shadow-md overflow-hidden focus-within:shadow-xl focus-within:scale-105 ${getTransitionClass('transition-all duration-300')} ${getHoverClass('hover:shadow-xl hover:scale-105')}`}
        role="article"
        aria-labelledby={`card-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <LazyImage
            src={imageSrc}
            alt={imageAlt}
            className={`w-full h-full ${getTransitionClass('transition-transform duration-300')} ${getHoverClass('group-hover:scale-110')}`}
            onError={(error) => {
              console.warn(`Failed to load image for card "${title}":`, error)
            }}
            onLoad={() => {
              console.log(`Successfully loaded image for card "${title}":`, imageSrc)
            }}
          />
          
          {/* Overlay for better text readability on hover */}
          <div className={`absolute inset-0 bg-black bg-opacity-0 ${getTransitionClass('transition-opacity duration-300')} ${
            prefersReducedMotion ? '' : 'group-hover:bg-opacity-10'
          }`} />
        </div>

        {/* Content Container */}
        <div className="p-6 space-y-4">
          <h3 
            id={`card-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className={`text-xl font-bold text-gray-900 leading-tight ${getTransitionClass('transition-colors duration-300')} ${
              prefersReducedMotion ? '' : 'group-hover:text-blue-600'
            }`}
          >
            {title}
          </h3>
          
          <div className="space-y-3">
            <p 
              ref={contentRef}
              className={`text-gray-600 leading-relaxed text-sm md:text-base ${getTransitionClass('transition-all duration-300')}`}
              style={{
                overflow: 'hidden',
                transition: prefersReducedMotion ? 'none' : 'max-height 0.3s ease-in-out'
              }}
            >
              {getTruncatedText()}
            </p>
            
            {shouldTruncate && (
              <button
                onClick={toggleExpanded}
                className={`text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm ${getTransitionClass('transition-colors duration-200')}`}
                aria-expanded={isExpanded}
                aria-controls={`card-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
                type="button"
              >
                {isExpanded ? '收合' : '展開更多'}
                <span className="ml-1" aria-hidden="true">
                  {isExpanded ? '↑' : '↓'}
                </span>
              </button>
            )}
          </div>
        </div>
      </article>
    </AnimatedElement>
  )
}