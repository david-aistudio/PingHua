"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Star, Share2, Heart } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DonghuaDetail } from '@/lib/api';
import { favorites } from '@/lib/favorites';
import { Button } from '@/components/ui/button';

interface DetailContentProps {
  donghua: DonghuaDetail;
  slug: string;
}

export function DetailContent({ donghua, slug }: DetailContentProps) {
  const [visibleEpisodes, setVisibleEpisodes] = useState(20);
  const [isFavorite, setIsFavorite] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Check favorite status on mount
  useEffect(() => {
    setIsFavorite(favorites.has(slug));
  }, [slug]);

  const toggleFavorite = () => {
    if (isFavorite) {
      favorites.remove(slug);
      setIsFavorite(false);
      toast.success('Dihapus dari Favorit');
    } else {
      favorites.add({
        slug: slug,
        title: donghua.title,
        poster: donghua.poster,
        status: donghua.status,
        url: `/detail/${slug}`
      });
      setIsFavorite(true);
      
      toast.success('Berhasil Disimpan!', {
        description: donghua.title,
        action: {
          label: 'Lihat',
          onClick: () => console.log('Undo'),
        },
      });
    }
  };

  const loadMoreEpisodes = useCallback(() => {
    if (donghua?.episodes_list && visibleEpisodes < donghua.episodes_list.length) {
      setVisibleEpisodes(prev => Math.min(prev + 20, donghua.episodes_list.length));
    }
  }, [donghua, visibleEpisodes]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMoreEpisodes();
      },
      { threshold: 0.1 }
    );
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
  }, [loadMoreEpisodes]);

  return (
    <div className="min-h-screen pb-24 bg-background text-foreground animate-fade-in">
      {/* Elegant Hero Section */}
      <div className="relative w-full overflow-hidden pt-12">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />

        <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                {/* Poster */}
                <div className="w-full md:w-[280px] flex-shrink-0">
                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[2/3]">
                        <img src={donghua.poster} alt={donghua.title} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="text-primary">{donghua.status}</span>
                        <span>•</span>
                        <span>{donghua.type}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-white">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            {donghua.rating || 'N/A'}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                        {donghua.title}
                    </h1>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        {donghua.genres?.map((genre, i) => (
                            <Link key={i} href={`/genre/${genre.slug}`} className="text-gray-400 hover:text-white transition-colors border-b border-white/0 hover:border-white">
                                {genre.name}
                            </Link>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        {donghua.episodes_list && donghua.episodes_list.length > 0 && (
                            <Link href={`/episode/${donghua.episodes_list[0].slug}`}>
                                <Button className="rounded-full px-8 h-12 bg-white text-black hover:bg-gray-200 font-bold">
                                    <Play className="w-5 h-5 mr-2 fill-current" /> Nonton
                                </Button>
                            </Link>
                        )}
                        <Button variant="outline" className="rounded-full px-6 h-12 border-white/20 hover:bg-white/10" onClick={toggleFavorite}>
                            <Heart className={`w-5 h-5 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                            {isFavorite ? 'Saved' : 'Save'}
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full w-12 h-12 border-white/20 hover:bg-white/10" onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Link disalin!');
                        }}>
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Synopsis */}
                    <div className="pt-8 border-t border-white/10">
                        <h3 className="text-lg font-bold mb-3">Sinopsis</h3>
                        <p className="text-gray-400 leading-relaxed text-base max-w-4xl">{donghua.synopsis}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                        {[
                            { label: 'Studio', value: donghua.studio },
                            { label: 'Rilis', value: donghua.released },
                            { label: 'Eps', value: donghua.episodes_count },
                            { label: 'Negara', value: donghua.country },
                        ].map((item, i) => (
                            item.value ? (
                                <div key={i}>
                                    <span className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{item.label}</span>
                                    <span className="text-sm font-medium text-white">{item.value}</span>
                                </div>
                            ) : null
                        ))}
                    </div>
                </div>
            </div>

            {/* Episodes List */}
            {donghua.episodes_list && donghua.episodes_list.length > 0 && (
                <div className="mt-20">
                    <h2 className="text-2xl font-bold mb-8">Daftar Episode</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {donghua.episodes_list.slice(0, visibleEpisodes).map((episode, index) => (
                            <Link key={index} href={`/episode/${episode.slug}`}>
                                <Button variant="outline" className="w-full h-12 border-white/20 hover:border-primary hover:text-primary transition-all">
                                    Ep {donghua.episodes_list!.length - index}
                                </Button>
                            </Link>
                        ))}
                    </div>
                    <div ref={observerTarget} className="h-10 mt-4" />
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
