"use client";

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Play, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DonghuaCard as DonghuaType } from '@/lib/api'
import { optimizeImage } from '@/lib/image-optimizer';

interface HeroCarouselProps {
  items: DonghuaType[]
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const autoplay = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % items.length);
    }, 12000); // 12 Seconds for better readability
    return () => clearInterval(autoplay);
  }, [items.length]);

  if (!items || items.length === 0) return null

  return (
    <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-background">
        {/* MASKING LAYER: This physically fades the entire container bottom */}
        <div className="absolute inset-0 z-[20] pointer-events-none" 
             style={{ 
                background: 'linear-gradient(to bottom, transparent 70%, #FAF9F6 100%)' 
             }} 
        />
        
        {/* SLIDES */}
        {items.map((item, index) => {
            const isActive = index === selectedIndex;
            const optimizedPoster = optimizeImage(item.poster, 1280);
            
            return (
            <div 
                key={index}
                className={`absolute inset-0 w-full h-full transition-all duration-[1500ms] ease-in-out ${
                    isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                }`}
            >
                <div className="relative w-full h-full">
                <img
                    src={optimizedPoster}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
                
                {/* Visual Overlays for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-[25]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent md:w-1/2 z-[25]" />

                {/* CONTENT AREA */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-20 md:pb-32 md:justify-center md:items-start z-30">
                    <div className="max-w-2xl space-y-5 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="bg-primary/20 backdrop-blur-md border border-primary/20 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em]">
                                {item.status}
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-2xl">
                            {item.title}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            <Link href={`/detail/${item.slug}`}>
                                <Button className="h-14 px-10 rounded-full bg-primary hover:bg-amber-400 text-black font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-2xl">
                                    <Play className="w-5 h-5 mr-2 fill-current" />
                                    WATCH NOW
                                </Button>
                            </Link>
                            <Link href={`/detail/${item.slug}`}>
                                <Button variant="outline" className="h-14 px-8 rounded-full bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white hover:text-black font-bold text-sm transition-all hover:scale-105 active:scale-95">
                                    DETAILS
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            );
        })}
        
        {/* INDICATORS */}
        <div className="absolute bottom-12 right-8 md:right-20 flex flex-col gap-2 z-50">
            {items.map((_, index) => (
                <button
                key={index}
                className={`w-1 transition-all duration-500 rounded-full ${
                    index === selectedIndex ? 'bg-primary h-12' : 'bg-white/30 h-4 hover:bg-white/60'
                }`}
                onClick={() => setSelectedIndex(index)}
                />
            ))}
        </div>
    </div>
  )
}
