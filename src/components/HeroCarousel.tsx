import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DonghuaCard as DonghuaType } from '@/lib/api'

interface HeroCarouselProps {
  items: DonghuaType[]
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Autoplay - 10 Seconds (Cinematic)
  useEffect(() => {
    const autoplay = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % items.length);
    }, 10000);

    return () => clearInterval(autoplay);
  }, [items.length]);

  if (!items || items.length === 0) return null

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-black font-sans">
      
      {/* Slides */}
      {items.map((item, index) => {
        const isActive = index === selectedIndex;
        
        return (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isActive 
                  ? 'opacity-100 translate-x-0 z-20' 
                  : 'opacity-0 translate-x-[20px] z-10'
            }`}
          >
            {/* Image - No Zoom, Just Clean */}
            <div className="relative w-full h-full">
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              
              {/* Premium Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end pb-24 md:pb-32 container mx-auto px-6 md:px-16">
                  <div className="max-w-4xl space-y-6">
                      {/* Subtitle / Meta */}
                      <div className="flex items-center gap-3 text-white/80 text-sm font-medium tracking-wide uppercase drop-shadow-md">
                        <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white border border-white/10">{item.status}</span>
                        <span>{item.type || 'Donghua'}</span>
                        {item.current_episode && (
                            <>
                                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                                <span className="text-white">{item.current_episode}</span>
                            </>
                        )}
                      </div>

                      {/* Title - Reduced for Elegance */}
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-xl">
                          {item.title}
                      </h2>
                      
                      {/* Action Buttons - More Compact */}
                      <div className="flex items-center gap-3 pt-2">
                          <Link to={`/detail/${item.slug}`}>
                              <Button className="rounded-full px-6 h-11 bg-white text-black hover:bg-white/90 text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl">
                                  <Play className="w-4 h-4 mr-2 fill-current" />
                                  Nonton
                              </Button>
                          </Link>
                          <Link to={`/detail/${item.slug}`}>
                            <Button className="rounded-full px-6 h-11 bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 text-sm font-medium transition-all hover:scale-105 active:scale-95">
                                Detail
                            </Button>
                          </Link>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Indicators - Apple Page Control Style */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-50">
        {items.map((_, index) => (
            <button
            key={index}
            className={`h-2 rounded-full transition-all duration-[1000ms] ${
                index === selectedIndex 
                ? 'bg-white w-8 opacity-100' 
                : 'bg-white/30 w-2 hover:bg-white/50'
            }`}
            onClick={() => setSelectedIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            />
        ))}
       </div>
    </div>
  )
}

