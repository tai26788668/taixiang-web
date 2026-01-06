import { useState, useRef, useEffect } from 'react'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { useResponsive } from '../hooks/useResponsive'

interface VideoHeroProps {
  videoSrc: string
  posterSrc?: string
  fallbackImageSrc?: string
  title: string
  subtitle: string
  ctaText: string
  onCtaClick: () => void
}

export const VideoHero: React.FC<VideoHeroProps> = ({
  videoSrc,
  posterSrc,
  fallbackImageSrc,
  title,
  subtitle,
  ctaText,
  onCtaClick
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const networkStatus = useNetworkStatus()
  const { isDesktop, isMobile } = useResponsive()

  // 決定是否嘗試顯示影片：網路正常時都嘗試播放
  const shouldTryVideo = networkStatus.isOnline && !videoError
  
  // 決定是否顯示靜態圖片：影片載入失敗或網路問題時
  const shouldShowImage = videoError || !networkStatus.isOnline

  // 除錯資訊
  useEffect(() => {
    console.log('VideoHero Debug:', {
      isDesktop,
      isMobile,
      isOnline: networkStatus.isOnline,
      isSlowConnection: networkStatus.isSlowConnection,
      videoError,
      shouldTryVideo,
      shouldShowImage
    })
  }, [isDesktop, isMobile, networkStatus, videoError, shouldTryVideo, shouldShowImage])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldTryVideo) return

    const handleLoadedData = () => {
      setVideoLoaded(true)
      // 嘗試自動播放 (靜音)
      video.play().catch((error) => {
        console.log('自動播放被阻止或失敗:', error)
        // 如果是手機端且自動播放失敗，不算作錯誤
        if (isMobile) {
          console.log('手機端自動播放失敗是正常的，影片仍可手動播放')
        }
      })
    }

    const handleError = (error: Event) => {
      console.warn('影片載入失敗，使用備用圖片:', error)
      setVideoError(true)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [shouldTryVideo, isMobile])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* 影片背景 - 網路正常時嘗試播放 */}
      {shouldTryVideo ? (
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc}
          >
            <source src={videoSrc} type="video/mp4" />
            您的瀏覽器不支援影片播放。
          </video>
          
          {/* 影片載入中的佔位符 */}
          {!videoLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      ) : shouldShowImage && (posterSrc || fallbackImageSrc) ? (
        /* 靜態圖片背景 - 影片無法播放時的 fallback */
        <div className="absolute inset-0">
          <img
            src={posterSrc || fallbackImageSrc}
            alt="泰鄉食品背景"
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.warn('背景圖片載入失敗，使用漸層背景')
              setImageLoaded(true)
            }}
          />
          
          {/* 圖片載入中的佔位符 */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      ) : (
        /* 備用背景 - 使用原來的漸層和圖案 */
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
          {/* 背景圖案 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
        </div>
      )}

      {/* 影片控制按鈕 - 影片載入時顯示 */}
      {shouldTryVideo && videoLoaded && (
        <div className={`absolute top-4 right-4 flex space-x-2 transition-opacity duration-300 ${
          showControls || isMobile ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={togglePlayPause}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label={isPlaying ? '暫停影片' : '播放影片'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <button
            onClick={toggleMute}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="切換音效"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.828 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.828l3.555-3.793A1 1 0 019.383 3.076zM8 5.04L5.707 7.293A1 1 0 005 8H3v4h2a1 1 0 01.707.293L8 14.96V5.04z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* 遮罩層 */}
      <div className="absolute inset-0 bg-black/30" />

      {/* 內容區域 */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
            {title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto drop-shadow-md">
            {subtitle}
          </p>
          <button
            onClick={onCtaClick}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {ctaText}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </div>

      {/* 狀態提示 */}
      {shouldShowImage && (
        <div className="absolute bottom-4 left-4 bg-amber-500/90 text-white px-3 py-2 rounded-lg text-sm">
          影片無法播放，使用靜態背景圖片
        </div>
      )}
      
      {networkStatus.isSlowConnection && shouldTryVideo && (
        <div className="absolute bottom-4 left-4 bg-blue-500/90 text-white px-3 py-2 rounded-lg text-sm">
          慢速連線：影片可能載入較慢
        </div>
      )}

      {/* 浮動元素 */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-16 h-16 bg-white/10 rounded-full"></div>
      </div>
      <div className="absolute bottom-20 right-10 animate-float">
        <div className="w-12 h-12 bg-white/10 rounded-full"></div>
      </div>
    </section>
  )
}