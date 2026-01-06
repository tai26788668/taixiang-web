import Header from './components/Header'
import Hero from './components/Hero'
import Products from './components/Products'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { SEOHead } from './components/SEOHead'
import { PerformanceMonitor } from './components/PerformanceMonitor'
import { websiteConfig } from './config/websiteConfig'

function App() {
  return (
    <>
      <SEOHead
        title={`${websiteConfig.site.name} - ${websiteConfig.site.description}`}
        description={websiteConfig.site.description}
        keywords={websiteConfig.site.keywords.join(', ')}
      />
      <PerformanceMonitor />
      
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <About />
          <Products />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App