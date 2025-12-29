"use client";

import { useEffect, useState } from 'react';
import { Play, X, Clock } from 'lucide-react';
import Link from 'next/link';
import { history, HistoryItem } from '@/lib/history';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ContinueWatching = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Get history on mount
    setItems(history.get().slice(0, 4)); // Show last 4 items
  }, []);

  const handleRemove = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = history.get().filter(i => i.slug !== slug);
    localStorage.setItem('donghua_history', JSON.stringify(updated));
    setItems(updated.slice(0, 4));
  };

  if (items.length === 0) return null;

  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-bold tracking-tight">Lanjut Tonton</h2>
        </div>
        <Link href="/history" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Lihat Semua History
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link 
            key={item.slug} 
            href={`/episode/${item.episodeSlug}`}
            className="group relative flex items-center gap-4 p-3 rounded-xl bg-card border border-white/20 hover:border-primary transition-all duration-300 overflow-hidden"
          >
            {/* Background Blur Effect */}
            <div 
              className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-cover bg-center scale-110" 
              style={{ backgroundImage: `url(${item.poster})` }}
            />

            {/* Poster Thumbnail */}
            <div className="relative h-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
              <img 
                src={item.poster} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 fill-white text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="relative flex-1 min-w-0">
              <h3 className="font-bold text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Terakhir: {item.episode}
              </p>
            </div>

            {/* Remove Button */}
            <button 
              onClick={(e) => handleRemove(item.slug, e)}
              className="relative p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
              title="Hapus dari history"
            >
              <X className="w-4 h-4" />
            </button>
          </Link>
        ))}
      </div>
    </section>
  );
};
