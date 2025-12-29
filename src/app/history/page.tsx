"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Play } from 'lucide-react';
import { history, HistoryItem } from '@/lib/history';
import { Button } from '@/components/ui/button';
import { DonghuaCard } from '@/components/DonghuaCard';

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(history.get());
  }, []);

  const clearHistory = () => {
    if (confirm('Hapus semua history?')) {
      history.clear();
      setItems([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Riwayat Tontonan</h1>
        {items.length > 0 && (
          <Button variant="destructive" size="sm" onClick={clearHistory}>
            <Trash2 className="w-4 h-4 mr-2" /> Hapus Semua
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Belum ada riwayat tontonan.</p>
          <Link href="/">
            <Button variant="link">Mulai Nonton</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
             <Link 
                key={item.slug} 
                href={`/episode/${item.episodeSlug}`}
                className="group relative flex items-center gap-4 p-4 rounded-xl bg-card border border-white/10 hover:border-primary transition-all overflow-hidden"
              >
                {/* Background Blur */}
                <div 
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-cover bg-center" 
                  style={{ backgroundImage: `url(${item.poster})` }}
                />

                <div className="relative h-24 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                  <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                </div>

                <div className="relative flex-1 min-w-0">
                  <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-white/10 px-2 py-0.5 rounded text-white">{item.episode}</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 fill-white text-white drop-shadow-lg" />
                </div>
              </Link>
          ))}
        </div>
      )}
    </div>
  );
}
