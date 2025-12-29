"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { favorites, FavoriteItem } from '@/lib/favorites';
import { Button } from '@/components/ui/button';
import { DonghuaCard } from '@/components/DonghuaCard';

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setItems(favorites.get());
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="flex flex-col items-center mb-12 text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Favorit Saya</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <Search className="w-12 h-12 text-muted-foreground opacity-20" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-medium text-gray-400">Belum ada donghua favorit.</p>
            <p className="text-sm text-muted-foreground">Mulai jelajahi dan simpan donghua yang lo suka!</p>
          </div>
          <Link href="/">
            <Button className="rounded-full px-8 h-12 font-bold bg-white text-black hover:bg-white/90">
                Cari Donghua
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 animate-fade-in">
          {items.map((item) => (
            <DonghuaCard 
                key={item.slug} 
                donghua={{
                    title: item.title,
                    slug: item.slug,
                    poster: item.poster,
                    status: item.status,
                    url: item.url
                }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
