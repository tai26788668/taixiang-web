import { websiteConfig } from '../config/websiteConfig'

const Footer = () => {
  const { footer } = websiteConfig

  const handleLinkClick = (href: string, external?: boolean) => {
    console.log('Footer link clicked:', href, 'external:', external)
    
    if (external || href.startsWith('http')) {
      // 外部連結 - 在新視窗開啟，使用安全參數
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }
    
    if (href.startsWith('#')) {
      // 內部錨點連結，平滑滾動
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
      return
    }
  }

  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌資訊 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">泰鄉食品</h3>
            <p className="text-gray-300 mb-4">傳統與創新口味，一口接一口</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              {footer.description}
            </p>
          </div>

          {/* 快速連結 */}
          {footer.links.map((linkGroup, groupIndex) => (
            <div key={groupIndex}>
              <h4 className="text-lg font-semibold mb-4">{linkGroup.title}</h4>
              <ul className="space-y-2">
                {linkGroup.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    {item.external || item.href.startsWith('http') ? (
                      <button
                        onClick={() => handleLinkClick(item.href, item.external)}
                        className="text-gray-300 hover:text-white transition-colors text-left flex items-center"
                      >
                        {item.label}
                        {item.external && (
                          <svg 
                            className="w-3 h-3 ml-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                            />
                          </svg>
                        )}
                      </button>
                    ) : item.href.startsWith('#') ? (
                      <button
                        onClick={() => handleLinkClick(item.href, item.external)}
                        className="text-gray-300 hover:text-white transition-colors text-left"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        className="text-gray-300 hover:text-white transition-colors"
                        target={item.external ? '_blank' : '_self'}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 聯絡資訊 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">聯絡我們</h4>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center">
                <img src="/icons/phone.svg" alt="電話" className="w-4 h-4 mr-2" />
                02-2678-8668
              </p>
              <p className="flex items-center">
                <img src="/icons/email.svg" alt="郵件" className="w-4 h-4 mr-2" />
                tai26788668@gmail.com
              </p>
              <p className="flex items-start">
                <img src="/icons/location.svg" alt="位置" className="w-4 h-4 mr-2 mt-1" />
                <span className="text-sm">239新北市鶯歌區德昌二街82號</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} 泰鄉食品. 版權所有.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer