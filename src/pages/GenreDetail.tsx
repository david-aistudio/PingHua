import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api, DonghuaCard as DonghuaCardType } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { LoadingGrid, LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function GenreDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [donghua, setDonghua] = useState<DonghuaCardType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchByGenre = useCallback(async (pageNum: number) => {
    if (loading || !slug) return;
    
    try {
      setLoading(true);
      const data = await api.getByGenre(slug, pageNum);
      const newDonghua = data.genre_donghua || [];
      
      if (newDonghua.length === 0) {
        setHasMore(false);
      } else {
        setDonghua(prev => [...prev, ...newDonghua]);
      }
    } catch (error) {
      console.error('Error fetching by genre:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, slug]);

  useEffect(() => {
    setDonghua([]);
    setPage(1);
    setHasMore(true);
    fetchByGenre(1);
  }, [slug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchByGenre(page);
    }
  }, [page]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 capitalize">
          {slug?.replace(/-/g, ' ')} Donghua
        </h1>

        {donghua.length === 0 && loading ? (
          <LoadingGrid count={24} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {donghua.map((item, index) => (
                <DonghuaCard key={`${item.slug}-${index}`} donghua={item} />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="mt-8">
              {loading && hasMore && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingSkeleton key={i} />
                  ))}
                </div>
              )}
            </div>

            {!hasMore && donghua.length > 0 && (
              <p className="text-center text-muted-foreground mt-8">
                No more donghua to load
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
