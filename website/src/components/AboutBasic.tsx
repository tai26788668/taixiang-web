import { AnimatedElement } from './AnimatedElement'
import { websiteConfig } from '../config/websiteConfig'

interface AboutBasicProps {
  onNavigateToDetail: () => void
  isVisible: boolean
}

const AboutBasic = ({ isVisible }: AboutBasicProps) => {
  const { about } = websiteConfig

  if (!isVisible) return null

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="fade-in" className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {about.title}
          </h2>
          <p className="text-xl text-gray-600">
            {about.subtitle}
          </p>
        </AnimatedElement>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <AnimatedElement animation="slide-left">
            <div className="space-y-6">
              {about.description.map((paragraph, index) => (
                <p key={index} className="text-lg text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-8">
              {about.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedElement>

          <div className="space-y-6">
            {/* Building Image */}
            <AnimatedElement animation="slide-right">
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img 
                  src="/images/building.jpg" 
                  alt="泰鄉食品工廠建築外觀" 
                  className="w-full h-64 object-cover"
                />
              </div>
            </AnimatedElement>

            {/* Features */}
            <AnimatedElement animation="slide-right" className="grid grid-cols-1 gap-6">
              {about.features.map((feature, index) => (
                <div key={index} className={`bg-gradient-to-r ${feature.gradient} p-6 rounded-xl`}>
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{feature.icon}</span>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              ))}
            </AnimatedElement>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutBasic