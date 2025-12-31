"use client";

import { useState, useEffect } from 'react';
import { X, Search as SearchIcon, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function SearchModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const router = useRouter();

  // Simple debounce implementation
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => api.search(debouncedQuery),
    enabled: debouncedQuery.length > 2,
    staleTime: 1000 * 60, // 1 minute
  });

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    router.push(`/detail/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length > 0) {
      onOpenChange(false);
      router.push(`/search/${query}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-black/90 backdrop-blur-xl border-white/10 text-white gap-0">
        <DialogTitle className="sr-only">Search Donghua</DialogTitle>
        
        {/* Search Header */}
        <div className="flex items-center border-b border-white/10 p-4">
          <SearchIcon className="w-5 h-5 text-muted-foreground mr-3" />
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search anime, donghua..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </form>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {isLoading && (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full mx-auto mb-2" />
              Searching...
            </div>
          )}

          {!isLoading && debouncedQuery.length > 2 && searchResults?.data?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No results found for "{debouncedQuery}"
            </div>
          )}

          {!isLoading && searchResults?.data && searchResults.data.length > 0 && (
            <div className="grid gap-1">
              {searchResults.data.map((item: any) => (
                <div
                  key={item.slug}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group"
                  onClick={() => handleSelect(item.slug)}
                >
                  <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-white/5">
                    <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">
                        {item.type || 'Donghua'}
                      </span>
                      <span>{item.status}</span>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100">
                    <Play className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Suggestions (When query is empty) */}
          {query.length === 0 && (
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {['Soul Land', 'Battle Through the Heavens', 'Perfect World', 'Swallowed Star'].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-white/10 hover:bg-white/10 hover:text-white bg-transparent"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
