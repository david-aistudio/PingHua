import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { LoadingGrid } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Search() {
  const { keyword } = useParams<{ keyword: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState(keyword || '');
  const [debouncedQuery, setDebouncedQuery] = useState(keyword || '');
  
  // Debounce Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query && query !== keyword) {
        navigate(`/search/${query}`, { replace: true });
      } else if (!query && keyword) {
          navigate('/search', { replace: true });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, navigate, keyword]);

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
        if (!debouncedQuery) return [];
        const res = await api.search(debouncedQuery, 1);
        const rawData = res.data || res.search_results || [];
        
        // Bersihkan slug dari hasil search sanka
        return rawData.map((item: any) => ({
            ...item,
            slug: item.slug ? item.slug.replace(/^\/|\/$/g, '').replace('donghua/detail/', '') : 
                  item.href ? item.href.replace('/donghua/detail/', '').replace(/^\/|\/$/g, '') : ''
        }));
    },
    enabled: !!debouncedQuery && debouncedQuery.length > 1, // Turunkan ke 1 huruf biar lebih sensitif
    staleTime: 1000 * 60 * 5,
  });

  const popularSearches = ['Soul Land', 'Battle Through the Heavens', 'Perfect World', 'Swallowed Star', 'Throne of Seal'];

  return (
    <div className="min-h-screen pt-24 pb-24">
      <Helmet>
        <title>{debouncedQuery ? `Cari: ${debouncedQuery} - PingHua` : 'Cari Donghua - PingHua'}</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="container mx-auto px-4">
        
        {/* Search Header */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Find your favorite Donghua</h1>
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                    type="text"
                    className="w-full pl-12 pr-4 h-14 rounded-full bg-secondary/50 border border-white/10 focus:border-primary focus:bg-background text-lg shadow-sm transition-all duration-300"
                    placeholder="Search titles..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
            </div>
        </div>

        {/* Content Area */}
        {debouncedQuery.length < 3 ? (
            // Empty State / Popular Searches
            <div className="max-w-2xl mx-auto text-center animate-fade-in">
                <div className="flex items-center justify-center gap-2 mb-6 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">Popular Searches</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {popularSearches.map((term) => (
                        <Button
                            key={term}
                            variant="outline"
                            className="rounded-full border-white/10 hover:border-primary hover:text-primary transition-all duration-300"
                            onClick={() => setQuery(term)}
                        >
                            {term}
                        </Button>
                    ))}
                </div>
            </div>
        ) : (
            // Results
            <div className="animate-fade-in">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">
                        Results for "{debouncedQuery}"
                    </h2>
                    <span className="text-sm text-muted-foreground">
                        {isLoading ? 'Searching...' : `${results?.length || 0} items found`}
                    </span>
                </div>

                {isLoading ? (
                    <LoadingGrid count={12} />
                ) : results?.length === 0 ? (
                    <div className="text-center py-20 bg-card/50 rounded-2xl border border-white/20">
                        <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                        <h3 className="text-xl font-bold mb-2">No results found</h3>
                        <p className="text-muted-foreground">Try adjusting your search terms</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                        {results?.map((donghua: any, index: number) => (
                            <DonghuaCard key={index} donghua={donghua} />
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
