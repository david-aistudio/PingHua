"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function SearchClient({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 1. Logic Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.length > 2) setIsOpen(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // 2. Fetch Data
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search-live', debouncedQuery],
    queryFn: async () => {
        if (!debouncedQuery || debouncedQuery.length <= 2) return [];
        try {
            const res = await api.search(debouncedQuery);
            return res?.data || [];
        } catch (e) { return []; }
    },
    enabled: debouncedQuery.length > 2, 
    staleTime: 1000 * 60,
  });

  // 3. Click Outside Handler (Safe for SSR)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    // Cek window dulu
    if (typeof window !== 'undefined') {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [wrapperRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search/${encodeURIComponent(query)}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative max-w-lg mx-auto w-full z-50">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        
        <Input 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length === 0) setIsOpen(false);
          }}
          onFocus={() => { if (query.length > 2) setIsOpen(true); }}
          placeholder="Ketik judul donghua..." 
          className="pl-12 pr-12 h-14 rounded-full bg-secondary/50 border-white/10 text-lg shadow-lg focus-visible:ring-primary backdrop-blur-md"
        />

        {/* Loading / Clear */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isLoading && query === debouncedQuery && query.length > 2 ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : query.length > 0 ? (
                <button type="button" onClick={() => { setQuery(''); setIsOpen(false); }}>
                    <X className="w-5 h-5 text-muted-foreground hover:text-white transition-colors" />
                </button>
            ) : null}
        </div>
      </form>

      {/* DROPDOWN */}
      {isOpen && debouncedQuery.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-black/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            
            {searchResults && searchResults.length > 0 ? (
                <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                    <div className="px-2 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Hasil Teratas
                    </div>
                    {searchResults.slice(0, 5).map((item: any) => (
                        <Link 
                            key={item.slug} 
                            href={`/detail/${item.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all group"
                        >
                            <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-gray-300">
                                        {item.type || 'Donghua'}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{item.status}</span>
                                </div>
                            </div>
                            <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity mr-2" />
                        </Link>
                    ))}
                    
                    <button 
                        onClick={handleSearch}
                        className="w-full py-3 mt-2 text-sm font-bold text-center text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
                    >
                        Lihat Semua Hasil "{query}"
                    </button>
                </div>
            ) : (
                !isLoading && (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>Tidak ditemukan hasil.</p>
                    </div>
                )
            )}
        </div>
      )}
    </div>
  );
}
