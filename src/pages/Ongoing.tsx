import { useEffect, useState, useRef, useCallback } from 'react';
import { Tv } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { api, DonghuaCard as DonghuaCardType } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { LoadingGrid, LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function Ongoing() {
  const [donghua, setDonghua] = useState<DonghuaCardType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchOngoing = useCallback(async (pageNum: number) => {
    if (loading) return;
    
    try {
      setLoading(true);
      const data = await api.getOngoing(pageNum);
      const newDonghua = data.ongoing_donghua || [];
      
      if (newDonghua.length === 0) {
        setHasMore(false);
      } else {
        setDonghua(prev => [...prev, ...newDonghua]);
      }
    } catch (error) {
      console.error('Error fetching ongoing:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchOngoing(1);
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
      fetchOngoing(page);
    }
  }, [page]);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Ongoing Donghua - Nonton Donghua Terbaru Sub Indo</title>
        <meta name="description" content="Daftar Donghua yang sedang tayang (Ongoing) dengan subtitle Indonesia terbaru dan terupdate." />
        <link rel="canonical" href="https://pinghua.qzz.io/ongoing" />
        <meta property="og:title" content="Ongoing Donghua - PingHua" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10">
            <Tv className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Ongoing Donghua</h1>
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
