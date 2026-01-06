import { useCallback } from 'react'
import ProductsBasic from './ProductsBasic'
import { ProductsFlavors } from './ProductsFlavors'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useState } from 'react'

const Products = () => {
  const [currentView, setCurrentView] = useState<'basic' | 'flavors'>('basic')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const prefersReducedMotion = useReducedMotion()

  // 切換到特定類別的口味頁面
  const navigateToFlavors = useCallback((categoryTitle?: string) => {
    if (categoryTitle) {
      setSelectedCategory(categoryTitle)
    }
    setCurrentView('flavors')
    
    // 平滑滾動到口味區域
    setTimeout(() => {
      const flavorsSection = document.getElementById('products-flavors')
      if (flavorsSection) {
        flavorsSection.scrollIntoView({ 
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        })
      }
    }, 100)
  }, [prefersReducedMotion])

  // 切換回基礎頁面
  const navigateToBasic = useCallback(() => {
    setCurrentView('basic')
    setSelectedCategory('')
    
    // 平滑滾動到產品區域
    setTimeout(() => {
      const productsSection = document.getElementById('products')
      if (productsSection) {
        productsSection.scrollIntoView({ 
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        })
      }
    }, 100)
  }, [prefersReducedMotion])

  return (
    <div className="relative">
      {/* 基礎產品頁面 */}
      <ProductsBasic 
        onNavigateToFlavors={navigateToFlavors}
        isVisible={currentView === 'basic'}
      />

      {/* 產品口味頁面 */}
      <div className="relative">
        <ProductsFlavors 
          onNavigateToBasic={navigateToBasic}
          selectedCategory={selectedCategory}
          isVisible={currentView === 'flavors'}
        />
      </div>
    </div>
  )
}

export default Products