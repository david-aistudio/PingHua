"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Play, Clock, ChevronRight } from 'lucide-react';
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
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em]">
                    <Clock className="w-4 h-4" /> Activity Logs
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic">Riwayat Tontonan</h1>
            </div>
            
            {items.length > 0 && (
                <Button 
                    variant="ghost" 
                    className="rounded-full text-red-500 hover:bg-red-50 font-bold text-xs tracking-widest px-6" 
                    onClick={clearHistory}
                >
                    <Trash2 className="w-4 h-4 mr-2" /> CLEAR ALL
                </Button>
            )}
        </div>

        {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-white rounded-[2.5rem] border border-black/5 shadow-soft">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-muted-foreground">
                    <Clock className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Belum ada riwayat</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">Film yang kamu tonton akan muncul di sini agar mudah dilanjutkan.</p>
                </div>
                <Link href="/">
                    <Button className="rounded-full px-8 bg-black text-white hover:bg-primary hover:text-black font-bold">Jelajahi Donghua</Button>
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {items.map((item, index) => (
                    <Link 
                        key={index} 
                        href={`/episode/${item.episodeSlug}`}
                        className="group relative bg-white p-4 md:p-6 rounded-[2rem] border border-black/5 shadow-soft hover:shadow-apple transition-all duration-500 flex items-center gap-6 overflow-hidden"
                    >
                        {/* Number Index */}
                        <div className="hidden md:flex text-4xl font-black text-secondary-foreground/5 italic group-hover:text-primary/10 transition-colors">
                            {(index + 1).toString().padStart(2, '0')}
                        </div>

                        {/* Thumbnail */}
                        <div className="relative h-20 md:h-28 aspect-[16/9] rounded-2xl overflow-hidden shadow-lg shrink-0">
                            <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                                <Play className="w-8 h-8 text-white fill-current opacity-0 group-hover:opacity-100 transition-opacity scale-50 group-hover:scale-100 duration-300" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-black text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors uppercase italic tracking-tight">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                    {item.episode}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    Dilihat pada {new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        </div>

                        {/* Action Icon */}
                        <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-secondary group-hover:bg-primary group-hover:text-black transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}