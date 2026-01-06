import { useState } from 'react'
import { useScrollSpy } from '../hooks/useScrollSpy'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // 使用 ScrollSpy 追蹤當前區域
  const activeSection = useScrollSpy({
    sectionIds: ['home', 'about', 'products', 'contact'],
    offset: 100
  })

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  const getNavItemClass = (sectionId: string) => {
    const baseClass = "transition-colors duration-200"
    const activeClass = "text-blue-600 font-semibold"
    const inactiveClass = "text-gray-600 hover:text-blue-600"
    
    return `${baseClass} ${activeSection === sectionId ? activeClass : inactiveClass}`
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img src="/icons/company_icon.jpg" alt="泰鄉食品" className="h-10 w-auto mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">泰鄉食品</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('home')} className={getNavItemClass('home')}>首頁</button>
            <button onClick={() => scrollToSection('about')} className={getNavItemClass('about')}>關於我們</button>
            <button onClick={() => scrollToSection('products')} className={getNavItemClass('products')}>產品介紹</button>
            <button onClick={() => scrollToSection('contact')} className={getNavItemClass('contact')}>聯絡我們</button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection('home')} className={getNavItemClass('home') + " text-left"}>首頁</button>
              <button onClick={() => scrollToSection('about')} className={getNavItemClass('about') + " text-left"}>關於我們</button>
              <button onClick={() => scrollToSection('products')} className={getNavItemClass('products') + " text-left"}>產品介紹</button>
              <button onClick={() => scrollToSection('contact')} className={getNavItemClass('contact') + " text-left"}>聯絡我們</button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header