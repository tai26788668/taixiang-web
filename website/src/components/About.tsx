import { useCallback, useEffect } from 'react'
import AboutBasic from './AboutBasic'
import { AboutDetail } from './AboutDetail'
import { useImagePreloader } from '../hooks/useImagePreloader'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { websiteConfig } from '../config/websiteConfig'

const About = () => {
  const { preloadImages } = useImagePreloader()
  const prefersReducedMotion = useReducedMotion()

  // Preload images when component mounts
  useEffect(() => {
    const imagesToPreload = websiteConfig.aboutDetail.cards.map(card => card.imageSrc)
    
    preloadImages(imagesToPreload, { priority: 'low' })
      .catch((error) => {
        console.warn('Some images failed to preload:', error)
      })
  }, [preloadImages])

  // Smooth scroll to detail section
  const scrollToDetail = useCallback(() => {
    const detailSection = document.getElementById('about-detail')
    if (detailSection) {
      detailSection.scrollIntoView({ 
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      })
    }
  }, [prefersReducedMotion])

  // Smooth scroll to basic section
  const scrollToBasic = useCallback(() => {
    const basicSection = document.getElementById('about')
    if (basicSection) {
      basicSection.scrollIntoView({ 
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      })
    }
  }, [prefersReducedMotion])

  return (
    <div className="relative">
      {/* Basic About Section */}
      <AboutBasic 
        onNavigateToDetail={scrollToDetail}
        isVisible={true}
      />

      {/* Detail About Section */}
      <div className="relative">
        <AboutDetail 
          onNavigateToBasic={scrollToBasic}
          isVisible={true}
          preloadComplete={true}
        />
      </div>
    </div>
  )
}

export default About