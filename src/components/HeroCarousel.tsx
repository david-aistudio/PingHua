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

  // Autoplay - 30 Seconds
  useEffect(() => {
    const autoplay = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % items.length);
    }, 30000);

    return () => clearInterval(autoplay);
  }, [items.length]);

  if (!items || items.length === 0) return null

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden bg-black group">
      
      {/* Branding Logo Overlay */}
      <div className="absolute top-6 left-6 md:top-8 md:left-12 z-50">
        <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tighter drop-shadow-sm">
          PingHua
        </h1>
      </div>

      {/* Stacked Slides for Hybrid Transition */}
      {items.map((item, index) => {
        const isActive = index === selectedIndex;
        
        return (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-out ${
                isActive 
                  ? 'opacity-100 translate-x-0 scale-100 z-10' 
                  : 'opacity-0 -translate-x-[5%] scale-105 z-0'
            }`}
          >
            {/* Image Container */}
            <div className="relative w-full h-full">
                              <img
                                src={item.poster}
                                alt={item.title}
                                className={`w-full h-full object-cover transition-transform duration-[30000ms] ease-linear ${
                                    isActive ? 'scale-110' : 'scale-100'
                                }`}
                              />              {/* Cinematic Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80" />
              
              {/* Content Area */}
              <div className="absolute inset-0 flex flex-col justify-end items-start p-6 md:p-12 lg:p-20 pb-16 md:pb-24">
                  <div className={`space-y-6 md:space-y-8 transition-all duration-700 delay-300 ${
                      isActive ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                  }`}>
                      <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs md:text-sm font-semibold text-white tracking-wide">
                          {item.status}
                      </span>
                      <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white line-clamp-2 max-w-5xl tracking-tight leading-tight">
                          {item.title}
                      </h2>
                      
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pt-2">
                          <Link to={`/detail/${item.slug}`}>
                              <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 px-8 py-7 text-lg font-bold shadow-xl transition-transform hover:scale-105 active:scale-95">
                                  <Play className="w-6 h-6 mr-2 fill-current" />
                                  WATCH NOW
                              </Button>
                          </Link>
                          <div className="flex items-center gap-4 text-white/80 font-medium">
                              {item.genres && item.genres[0] && (
                                  <span className="backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full border border-white/10">
                                      {item.genres[0].name}
                                  </span>
                              )}
                              {item.type && (
                                  <span className="backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full border border-white/10">
                                      {item.type}
                                  </span>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Pagination Dots */}
      <div className="absolute bottom-10 right-10 md:bottom-20 md:right-20 flex gap-3 z-50">
        {items.map((_, index) => (
            <button
            key={index}
            className={`h-1.5 rounded-full transition-all duration-700 ${
                index === selectedIndex ? 'bg-white w-12 opacity-100' : 'bg-white/30 w-6 hover:bg-white/60'
            }`}
            onClick={() => setSelectedIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            />
        ))}
       </div>
    </div>
  )
}
