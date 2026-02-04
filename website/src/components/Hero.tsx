import { VideoHero } from './VideoHero'

const Hero = () => {
  const scrollToAbout = () => {
    const element = document.getElementById('about')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <VideoHero
      videoSrc="/movie/IMG_8101.mp4"
      posterSrc="/images/building.jpg"
      fallbackImageSrc="/images/building.jpg"
      title="歡迎來到泰鄉蘇打餅的世界"
      subtitle="天然食材，美味無限"
      ctaText="了解更多"
      onCtaClick={scrollToAbout}
    />
  )
}

export default Hero