import React from 'react'
import { AnimatedElement } from './AnimatedElement'
import { ImageTextCard } from './ImageTextCard'
import { websiteConfig } from '../config/websiteConfig'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface AboutDetailProps {
  onNavigateToBasic: () => void
  isVisible: boolean
  preloadComplete?: boolean
}

export const AboutDetail: React.FC<AboutDetailProps> = ({
  isVisible,
  preloadComplete = true
}) => {
  const { aboutDetail } = websiteConfig
  const prefersReducedMotion = useReducedMotion()

  // Sort cards by order to ensure consistent display
  const sortedCards = [...aboutDetail.cards].sort((a, b) => a.order - b.order)

  // Get transition classes based on motion preference
  const getTransitionClass = (baseClass: string) => {
    if (prefersReducedMotion) {
      return baseClass.replace(/duration-\d+/, 'duration-0')
    }
    return baseClass
  }

  return (
    <section 
      id="about-detail"
      className={`py-20 bg-gradient-to-br from-gray-50 to-white ${getTransitionClass('transition-opacity duration-500')} ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isVisible}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <AnimatedElement animation="fade-in" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {aboutDetail.title}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {aboutDetail.subtitle}
          </p>
        </AnimatedElement>

        {/* Loading indicator for images if not preloaded */}
        {!preloadComplete && !prefersReducedMotion && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">載入圖片中...</span>
            </div>
          </div>
        )}

        {/* Image-Text Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {sortedCards.map((card, index) => (
            <div key={card.id} className="flex">
              <ImageTextCard
                title={card.title}
                description={card.description}
                imageSrc={card.imageSrc}
                imageAlt={card.imageAlt}
                animationDelay={prefersReducedMotion ? 0 : index * 200} // Staggered animation effect
                maxLength={200} // Allow longer text for detailed articles
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}