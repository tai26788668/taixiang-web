import { AnimatedElement } from './AnimatedElement'

const OnlineProducts = () => {
  const onlineProducts = [
    {
      id: 'online-1',
      title: '線上訂購系統',
      description: '24小時線上訂購，方便快速下單購買我們的精選產品',
      icon: '🛒',
      link: '#order',
      status: 'available'
    },
    {
      id: 'online-2', 
      title: '客製化服務',
      description: '提供個人化包裝設計，滿足您的特殊需求和節慶用途',
      icon: '🎨',
      link: '#customize',
      status: 'available'
    },
    {
      id: 'online-3',
      title: '批發詢價',
      description: '大量採購優惠價格，歡迎企業客戶和經銷商洽詢',
      icon: '📦',
      link: '#wholesale',
      status: 'available'
    },
    {
      id: 'online-4',
      title: '會員專區',
      description: '註冊會員享有專屬優惠、積點回饋和優先購買權',
      icon: '👑',
      link: '#member',
      status: 'coming-soon'
    }
  ]

  return (
    <section id="online-products" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="fade-in" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            線上產品服務
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            透過數位化服務，為您提供更便利的購買體驗
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {onlineProducts.map((product, index) => (
            <AnimatedElement
              key={product.id}
              animation="slide-up"
              delay={index * 150}
              className="relative"
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 group h-full flex flex-col">
                <div className="text-center flex-grow">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {product.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {product.description}
                  </p>
                </div>
                
                <div className="mt-auto">
                  {product.status === 'available' ? (
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                      了解更多
                    </button>
                  ) : (
                    <div className="w-full text-center">
                      <span className="inline-block px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                        即將推出
                      </span>
                    </div>
                  )}
                </div>

                {product.status === 'coming-soon' && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                      NEW
                    </span>
                  </div>
                )}
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OnlineProducts