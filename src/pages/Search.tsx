import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, DonghuaCard as DonghuaCardType } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { LoadingGrid } from '@/components/LoadingSkeleton';

export default function Search() {
  const { keyword } = useParams<{ keyword: string }>();
  const [results, setResults] = useState<DonghuaCardType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSearch = async () => {
      if (!keyword) return;

      try {
        setLoading(true);
        const data = await api.search(keyword, 1);
        setResults(data.search_results || []);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [keyword]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground mb-8">
          Showing results for: <span className="font-semibold text-foreground">"{keyword}"</span>
        </p>

        {loading ? (
          <LoadingGrid count={24} />
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No results found for "{keyword}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((donghua, index) => (
              <DonghuaCard key={index} donghua={donghua} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
