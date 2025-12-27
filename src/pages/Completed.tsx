import { useEffect, useState, useRef, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { api, DonghuaCard as DonghuaCardType } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { LoadingGrid, LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function Completed() {
  const [donghua, setDonghua] = useState<DonghuaCardType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchCompleted = useCallback(async (pageNum: number) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const data = await api.getCompleted(pageNum);
      const newDonghua = data.completed_donghua || [];
      
      if (newDonghua.length === 0) {
        setHasMore(false);
      } else {
        setDonghua(prev => [...prev, ...newDonghua]);
      }
    } catch (error) {
      console.error('Error fetching completed:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchCompleted(1);
  }, []);

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
      fetchCompleted(page);
    }
  }, [page]);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Completed Donghua - Nonton Donghua Tamat Sub Indo</title>
        <meta name="description" content="Koleksi Donghua yang sudah tamat (Completed) subtitle Indonesia lengkap, bisa ditonton maraton." />
        <link rel="canonical" href="https://pinghua.qzz.io/completed" />
        <meta property="og:title" content="Completed Donghua - PingHua" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Completed Donghua</h1>
        </div>

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
