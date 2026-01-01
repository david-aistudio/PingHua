"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Play, Clock, ChevronRight, History } from 'lucide-react';
import { history, HistoryItem } from '@/lib/history';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(history.get());
  }, []);

  const clearHistory = () => {
    if (confirm('Hapus semua riwayat tontonan?')) {
      history.clear();
      setItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        
        {/* Simple Apple Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-soft flex items-center justify-center border border-black/[0.03]">
                    <History className="w-6 h-6 text-primary-dark" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">History</h1>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Tontonan Terakhir Anda</p>
                </div>
            </div>
            
            {items.length > 0 && (
                <Button 
                    variant="ghost" 
                    className="rounded-full text-red-500 hover:bg-red-50 text-xs font-bold" 
                    onClick={clearHistory}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus Semua
                </Button>
            )}
        </div>

        {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-white rounded-[2.5rem] border border-black/[0.03] shadow-soft">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                    <Clock className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-foreground">Riwayat Kosong</h3>
                    <p className="text-muted-foreground text-sm">Mulai tonton donghua favoritmu sekarang.</p>
                </div>
                <Link href="/">
                    <Button className="rounded-full px-8 bg-black text-white hover:bg-primary hover:text-black font-bold text-xs">JELAJAHI SEKARANG</Button>
                </Link>
            </div>
        ) : (
            <div className="space-y-3">
                {items.map((item, index) => (
                    <Link 
                        key={index} 
                        href={`/episode/${item.episodeSlug}`}
                        className="group flex items-center gap-4 md:gap-6 bg-white p-3 md:p-4 rounded-3xl border border-black/[0.03] shadow-soft hover:shadow-apple transition-all duration-300"
                    >
                        {/* Compact Thumbnail */}
                        <div className="relative h-16 md:h-20 aspect-video rounded-2xl overflow-hidden shadow-sm shrink-0 border border-black/5">
                            <img src={item.poster} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-6 h-6 text-white fill-current" />
                            </div>
                        </div>

                        {/* Clean Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm md:text-base font-bold text-foreground truncate group-hover:text-primary-dark transition-colors">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[11px] font-bold text-primary-dark uppercase tracking-tight">
                                    {item.episode}
                                </span >
                                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                <span className="text-[10px] text-muted-foreground font-medium">
                                    {new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        </div>

                        {/* Minimal Action */}
                        <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary-dark group-hover:text-white transition-all mr-2">
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}