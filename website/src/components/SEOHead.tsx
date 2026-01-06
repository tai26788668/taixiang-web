import { useEffect } from 'react'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonicalUrl?: string
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = '泰鄉食品 - 傳統餅乾製作專家',
  description = '泰鄉食品專注於傳統餅乾製作，提供麻粩、寸棗、蘇打餅乾等優質產品。堅持使用天然食材，傳承三十年製餅工藝。',
  keywords = '泰鄉食品,餅乾,麻粩,寸棗,蘇打餅乾,傳統製餅,天然食材,台灣餅乾,節慶伴手禮',
  ogImage = '/og-image.jpg',
  canonicalUrl = window.location.href
}) => {
  useEffect(() => {
    // 更新頁面標題
    document.title = title

    // 更新或創建 meta 標籤
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let meta = document.querySelector(selector) as HTMLMetaElement
      
      if (!meta) {
        meta = document.createElement('meta')
        if (property) {
          meta.setAttribute('property', name)
        } else {
          meta.setAttribute('name', name)
        }
        document.head.appendChild(meta)
      }
      
      meta.setAttribute('content', content)
    }

    // 基本 SEO 標籤
    updateMetaTag('description', description)
    updateMetaTag('keywords', keywords)
    updateMetaTag('author', '泰鄉食品')
    updateMetaTag('robots', 'index, follow')
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0')

    // Open Graph 標籤
    updateMetaTag('og:title', title, true)
    updateMetaTag('og:description', description, true)
    updateMetaTag('og:image', ogImage, true)
    updateMetaTag('og:url', canonicalUrl, true)
    updateMetaTag('og:type', 'website', true)
    updateMetaTag('og:site_name', '泰鄉食品', true)
    updateMetaTag('og:locale', 'zh_TW', true)

    // Twitter Card 標籤
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', ogImage)

    // 結構化資料 (JSON-LD)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "泰鄉食品",
      "description": description,
      "url": canonicalUrl,
      "logo": "/icons/company_icon.jpg",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "02-2678-8668",
        "contactType": "customer service",
        "email": "tai26788668@gmail.com"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "德昌二街82號",
        "addressLocality": "鶯歌區",
        "addressRegion": "新北市",
        "postalCode": "239",
        "addressCountry": "TW"
      },
      "sameAs": [
        canonicalUrl
      ]
    }

    // 更新或創建結構化資料
    let jsonLd = document.querySelector('script[type="application/ld+json"]')
    if (!jsonLd) {
      jsonLd = document.createElement('script')
      jsonLd.setAttribute('type', 'application/ld+json')
      document.head.appendChild(jsonLd)
    }
    jsonLd.textContent = JSON.stringify(structuredData)

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

  }, [title, description, keywords, ogImage, canonicalUrl])

  return null
}