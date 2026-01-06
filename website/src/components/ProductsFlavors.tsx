import React from 'react'
import { AnimatedElement } from './AnimatedElement'
import { websiteConfig } from '../config/websiteConfig'
import { useReducedMotion } from '../hooks/useReducedMotion'

interface ProductsFlavorsProps {
  onNavigateToBasic: () => void
  selectedCategory: string
  isVisible: boolean
}

export const ProductsFlavors: React.FC<ProductsFlavorsProps> = ({
  onNavigateToBasic,
  selectedCategory,
  isVisible
}) => {
  const { productsFlavors } = websiteConfig
  const prefersReducedMotion = useReducedMotion()

  // 根據選擇的類別過濾口味
  const filteredFlavors = selectedCategory 
    ? productsFlavors.items.filter(flavor => flavor.category === selectedCategory)
    : productsFlavors.items

  // 獲取過渡效果類別
  const getTransitionClass = (baseClass: string) => {
    if (prefersReducedMotion) {
      return baseClass.replace(/duration-\d+/, 'duration-0')
    }
    return baseClass
  }

  return (
    <section 
      id="products-flavors"
      className={`py-20 bg-gradient-to-br from-yellow-50 to-yellow-100 ${getTransitionClass('transition-opacity duration-500')} ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
      }`}
      style={{
        display: isVisible ? 'block' : 'none'
      }}
      aria-hidden={!isVisible}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 手機友好的返回按鈕 */}
        <div className="mb-8">
          <button
            onClick={onNavigateToBasic}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 text-lg font-medium py-2 px-4 rounded-lg hover:bg-white hover:shadow-md"
          >
            <span className="mr-2 text-xl">←</span>
            返回產品類別
          </button>
        </div>

        {/* 標題區域 */}
        <AnimatedElement animation="fade-in" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {selectedCategory ? `${selectedCategory} 口味` : productsFlavors.title}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {selectedCategory 
              ? `探索 ${selectedCategory} 的多種口味選擇` 
              : productsFlavors.subtitle
            }
          </p>
          {/* 顯示口味數量 */}
          <div className="inline-block bg-white px-4 py-2 rounded-full shadow-md">
            <span className="text-sm text-gray-600">
              共 {filteredFlavors.length} 種口味
            </span>
          </div>
        </AnimatedElement>

        {/* 口味網格 - 手機友好設計 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredFlavors.map((flavor, index) => (
            <AnimatedElement
              key={flavor.id}
              animation="slide-up"
              delay={prefersReducedMotion ? 0 : index * 100}
              className="group"
            >
              <div 
                className={`bg-white rounded-xl shadow-lg hover:shadow-xl ${getTransitionClass('transition-all duration-300')} transform hover:-translate-y-2 p-4 md:p-6 h-full flex flex-col relative overflow-hidden border-2`}
                style={{ borderColor: flavor.color }}
              >
                {/* 顏色裝飾條 */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: flavor.color }}
                />
                
                <div className="text-center flex-grow flex flex-col">
                  {/* 圖片區域 */}
                  <div className={`mb-4 ${getTransitionClass('transition-transform duration-300')} group-hover:scale-105 flex justify-center`}>
                    <img 
                      src={flavor.icon}
                      alt={flavor.title}
                      className="w-[90%] h-auto max-w-none rounded-lg object-cover shadow-md"
                      onError={(e) => {
                        // 如果圖片載入失敗，顯示預設圖片或文字
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'w-[90%] h-32 rounded-lg shadow-md flex items-center justify-center text-2xl font-bold text-white';
                        fallbackDiv.style.backgroundColor = flavor.color;
                        fallbackDiv.textContent = flavor.title.charAt(0);
                        target.parentElement!.appendChild(fallbackDiv);
                      }}
                    />
                  </div>

                  {/* 標題 */}
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                    {flavor.title}
                  </h3>

                  {/* 描述 */}
                  <p className="text-gray-600 leading-relaxed text-sm flex-grow mb-4">
                    {flavor.description}
                  </p>

                  {/* 包裝方式 */}
                  <div className="mb-4">
                    <span className="text-gray-700 text-sm font-medium bg-gray-50 px-3 py-1 rounded-full">
                      包裝方式: {flavor.package}
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>

        {/* 如果沒有找到口味 */}
        {filteredFlavors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              暫無 {selectedCategory} 的口味資訊
            </div>
            <button
              onClick={onNavigateToBasic}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              返回產品類別
            </button>
          </div>
        )}

        {/* 底部導航 - 手機友好設計 */}
        {filteredFlavors.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={onNavigateToBasic}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl text-lg"
            >
              ← 返回產品類別
            </button>
          </div>
        )}
      </div>
    </section>
  )
}