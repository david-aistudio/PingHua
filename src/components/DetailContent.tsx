"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Star, Share2, Heart, Info, Clock, Monitor, List } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DonghuaDetail } from '@/lib/api';
import { favorites } from '@/lib/favorites';
import { Button } from '@/components/ui/button';
import { optimizeImage } from '@/lib/image-optimizer';
import { cn } from '@/lib/utils';

interface DetailContentProps {
  donghua: DonghuaDetail;
  slug: string;
}

export function DetailContent({ donghua, slug }: DetailContentProps) {
  const [visibleEpisodes, setVisibleEpisodes] = useState(24);
  const [isFavorite, setIsFavorite] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const optimizedPoster = optimizeImage(donghua.poster, 600);

  useEffect(() => {
    setIsFavorite(favorites.has(slug));
  }, [slug]);

  const toggleFavorite = () => {
    if (isFavorite) {
      favorites.remove(slug);
      setIsFavorite(false);
      toast.success('Removed from Favorites');
    } else {
      favorites.add({
        slug: slug,
        title: donghua.title,
        poster: donghua.poster,
        status: donghua.status,
        url: `/detail/${slug}`
      });
      setIsFavorite(true);
      toast.success('Added to Favorites!');
    }
  };

  const loadMoreEpisodes = useCallback(() => {
    if (donghua?.episodes_list && visibleEpisodes < donghua.episodes_list.length) {
      setVisibleEpisodes(prev => Math.min(prev + 24, donghua.episodes_list.length));
    }
  }, [donghua, visibleEpisodes]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMoreEpisodes(); },
      { threshold: 0.1 }
    );
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
  }, [loadMoreEpisodes]);

  return (
    <div className="min-h-screen pb-32 bg-background selection:bg-primary/30">
      {/* HERO SECTION */}
      <div className="relative w-full overflow-hidden bg-white border-b border-black/5 pb-12 md:pb-20 pt-10 md:pt-16">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-14">
                {/* Poster */}
                <div className="w-full md:w-[300px] lg:w-[340px] shrink-0">
                    <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-soft border border-black/5 transition-transform duration-500 hover:scale-[1.02]">
                        <img src={optimizedPoster} alt="" aria-hidden="true" className="w-full h-full object-cover" />
                        <div className="absolute top-4 right-4 bg-primary text-black px-3 py-1 rounded-xl text-[10px] font-bold shadow-lg">
                            {donghua.status}
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="bg-orange-50 text-primary-dark px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">Series Module</span>
                            <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                                <Star className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />
                                {donghua.rating || '8.5'}
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">{donghua.title}</h1>
                        <div className="flex flex-wrap gap-2">
                            {donghua.genres?.map((genre, i) => (
                                <Link key={i} href={`/genre/${genre.slug}`} aria-label={`Genre: ${genre.name}`} className="bg-secondary/50 hover:bg-white hover:shadow-soft px-4 py-1.5 rounded-xl text-xs font-medium text-muted-foreground transition-all border border-transparent hover:border-black/5">
                                    {genre.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                        {donghua.episodes_list && donghua.episodes_list.length > 0 && (
                            <Link href={`/episode/${donghua.episodes_list[0].slug}`} aria-label={`Mulai menonton ${donghua.title}`}>
                                <Button className="h-12 px-8 rounded-full bg-primary hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-primary/10">
                                    <Play className="w-4 h-4 mr-2 fill-current" aria-hidden="true" /> START WATCHING
                                </Button>
                            </Link>
                        )}
                        <Button 
                            variant="outline" 
                            className={cn(
                                "h-12 px-6 rounded-full border-black/5 bg-white shadow-soft transition-all font-bold text-xs",
                                isFavorite ? "text-red-600 border-red-100 bg-red-50" : "text-foreground"
                            )} 
                            onClick={toggleFavorite}
                            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                            <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-current")} aria-hidden="true" />
                            {isFavorite ? 'SAVED' : 'FAVORITE'}
                        </Button>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-black/5">
                        <div className="flex items-center gap-2 text-foreground font-black text-[11px] uppercase tracking-[0.2em]">
                            <Info className="w-4 h-4 text-primary" aria-hidden="true" /> Storyline
                        </div>
                        <div className="space-y-4">
                            {/* SMART BILINGUAL SYNOPSIS RENDERING */}
                            {(() => {
                                const text = donghua.synopsis || "";
                                // Deteksi pemisah umum di Animexin (biasanya double newline atau keyword English)
                                const parts = text.split(/(?=Synopsis:|\n\nAbout|\n\nStory)/i);
                                
                                return parts.map((part, i) => {
                                    const isEnglish = /Synopsis:|About:|Story:|Previously:|Summary:/i.test(part) || i > 0;
                                    
                                    return (
                                        <p key={i} className={cn(
                                            "leading-relaxed font-medium transition-all",
                                            isEnglish 
                                                ? "text-muted-foreground/60 italic text-xs md:text-sm border-l-2 border-black/5 pl-4" 
                                                : "text-muted-foreground text-sm md:text-base"
                                        )}>
                                            {part.replace(/Synopsis:|About:|Story:/i, '').trim()}
                                        </p>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                        {[
                            { label: 'Studio', value: donghua.studio, icon: Monitor },
                            { label: 'Released', value: donghua.released, icon: Clock },
                            { label: 'Total Eps', value: donghua.episodes_count, icon: List },
                            { label: 'Status', value: donghua.status, icon: Info },
                        ].map((item, i) => (
                            item.value ? (
                                <div key={i} className="space-y-0.5">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                                        <item.icon className="w-3 h-3 text-primary-dark" aria-hidden="true" /> {item.label}
                                    </span>
                                    <span className="text-sm font-semibold text-foreground block">{item.value}</span>
                                </div>
                            ) : null
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* EPISODES LIST AREA */}
      <div className="container mx-auto px-4 md:px-8 mt-12">
        {donghua.episodes_list && donghua.episodes_list.length > 0 && (
            <div className="space-y-8" aria-labelledby="episodes-heading">
                <div className="flex items-center justify-between">
                    <h2 id="episodes-heading" className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <div className="w-1 h-5 bg-primary rounded-full" aria-hidden="true" /> Daftar Episode
                    </h2>
                    <span className="text-[11px] font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
                        Total: {donghua.episodes_list.length} Units
                    </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3" role="list">
                    {donghua.episodes_list.slice(0, visibleEpisodes).map((episode, index) => (
                        <Link key={index} href={`/episode/${episode.slug}`} role="listitem" aria-label={`Nonton Episode ${donghua.episodes_list!.length - index}`}>
                            <Button variant="outline" className="w-full h-12 rounded-xl border-black/5 bg-white shadow-soft hover:border-primary hover:text-primary transition-all font-bold text-xs" tabIndex={-1}>
                                {donghua.episodes_list!.length - index}
                            </Button>
                        </Link>
                    ))}
                </div>
                <div ref={observerTarget} className="h-10" aria-hidden="true" />
            </div>
        )}
      </div>
    </div>
  );
}