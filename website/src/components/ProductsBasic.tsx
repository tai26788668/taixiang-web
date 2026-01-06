import { AnimatedElement } from './AnimatedElement'
import { websiteConfig } from '../config/websiteConfig'

interface ProductsBasicProps {
  onNavigateToFlavors: (categoryTitle?: string) => void
  isVisible: boolean
}

const ProductsBasic: React.FC<ProductsBasicProps> = ({
  onNavigateToFlavors,
  isVisible
}) => {
  const { products } = websiteConfig

  // 產品圖片映射
  const productImages: { [key: string]: string } = {
    'product-1': '/images/category_1.jpg',
    'product-2': '/images/category_2.jpg', 
    'product-3': '/images/category_3.jpg',
    'product-4': '/images/category_4.jpg'
  }

  // 檢查是否為季節限定產品（麻粩和寸棗）
  const isSeasonalProduct = (product: any) => {
    return product.category === 'traditional' && (product.title === '麻粩' || product.title === '寸棗')
  }

  return (
    <section 
      id="products" 
      className={`py-20 bg-gray-50 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isVisible}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="fade-in" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            產品類別
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {products.subtitle}
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.items.map((product, index) => (
            <AnimatedElement
              key={product.id}
              animation="slide-up"
              delay={index * 100}
              className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group h-full cursor-pointer"
            >
              <div 
                className={`p-6 h-full flex flex-col relative overflow-hidden rounded-xl ${
                  isSeasonalProduct(product) 
                    ? 'border-2' 
                    : 'bg-white'
                }`}
                style={isSeasonalProduct(product) 
                  ? { backgroundColor: '#DC143C', borderColor: '#B22222' } 
                  : { backgroundColor: 'white' }}
                onClick={() => onNavigateToFlavors(product.title)}
              >
                {/* 季節限定產品的大紅色底圖配馬浮水印 */}
                {isSeasonalProduct(product) && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* 馬浮水印 - 透明效果 */}
                    <div className="absolute bottom-4 right-4 text-8xl opacity-20 transform rotate-12 text-white">
                      🐎
                    </div>
                    <div className="absolute top-8 left-8 text-5xl opacity-15 transform -rotate-12 text-white">
                      🐎
                    </div>
                    <div className="absolute top-1/2 right-8 text-4xl opacity-10 transform rotate-45 text-white">
                      🐎
                    </div>
                    <div className="absolute bottom-1/3 left-6 text-3xl opacity-12 transform -rotate-45 text-white">
                      🐎
                    </div>
                    <div className="absolute top-1/4 left-1/2 text-6xl opacity-8 transform rotate-30 text-white">
                      🐎
                    </div>
                    {/* 大紅色漸層覆蓋 */}
                    <div className="absolute inset-0" style={{ 
                      background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.15) 0%, rgba(220, 20, 60, 0.1) 50%, rgba(178, 34, 34, 0.12) 100%)' 
                    }}></div>
                  </div>
                )}
                
                <div className="text-center flex-grow flex flex-col relative z-10">
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    <img 
                      src={productImages[product.id] || '/images/products/default-product.svg'} 
                      alt={product.title}
                      className="w-[90%] h-auto max-w-none rounded-lg object-cover shadow-md"
                      onError={(e) => {
                        // 如果圖片載入失敗，顯示預設圖片
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/products/default-product.svg';
                      }}
                    />
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 ${
                    isSeasonalProduct(product) ? 'text-white' : 'text-gray-900'
                  }`}>
                    {product.title}
                  </h3>
                  <p className={`leading-relaxed text-sm flex-grow mb-4 ${
                    isSeasonalProduct(product) ? 'text-white' : 'text-gray-600'
                  }`}>
                    {product.description}
                  </p>
                  <div className="mt-auto flex flex-col items-center gap-2">
                    {/* 季節限定標籤 */}
                    {isSeasonalProduct(product) && (
                      <div className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md border-2 border-white text-white bg-black bg-opacity-20">
                        <span>季節限定</span>
                      </div>
                    )}
                    
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      product.category === 'traditional' 
                        ? isSeasonalProduct(product)
                          ? 'bg-white text-red-800 border-2 border-white' 
                          : 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {product.category === 'traditional' ? '傳統' : '現代'}
                    </span>
                    
                    {/* 點擊提示 */}
                    <div className={`text-xs mt-2 ${
                      isSeasonalProduct(product) ? 'text-white opacity-80' : 'text-gray-500'
                    }`}>
                      點擊查看口味 →
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>

      </div>
    </section>
  )
}

export default ProductsBasic