import { useState, useEffect } from 'react'

interface UseScrollSpyOptions {
  sectionIds: string[]
  offset?: number
}

export const useScrollSpy = ({ sectionIds, offset = 100 }: UseScrollSpyOptions) => {
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset

      // 找到當前最接近的區域
      let currentSection = ''
      
      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId)
        if (element) {
          const { offsetTop, offsetHeight } = element
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = sectionId
            break
          }
        }
      }

      // 如果沒有找到精確匹配，找最近的上方區域
      if (!currentSection) {
        for (let i = sectionIds.length - 1; i >= 0; i--) {
          const element = document.getElementById(sectionIds[i])
          if (element && scrollPosition >= element.offsetTop) {
            currentSection = sectionIds[i]
            break
          }
        }
      }

      setActiveSection(currentSection)
    }

    // 初始檢查
    handleScroll()

    // 添加滾動監聽器
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [sectionIds, offset])

  return activeSection
}