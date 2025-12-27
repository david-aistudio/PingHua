import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { LoadingGrid } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ContinueWatching } from '@/components/ContinueWatching';
import { Footer } from '@/components/Footer';

export default function Home() {
  const { data: homeData, isLoading: loadingHome } = useQuery({
    queryKey: ['home'],
    queryFn: async () => {
      try {
        return await api.getHome(1);
      } catch (error) {
        toast.error('Gagal memuat data terbaru');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: ongoingData, isLoading: loadingOngoing } = useQuery({
    queryKey: ['ongoing'],
    queryFn: async () => {
      try {
        return await api.getOngoing(1);
      } catch (error) {
        toast.error('Gagal memuat data ongoing');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: completedData, isLoading: loadingCompleted } = useQuery({
    queryKey: ['completed'],
    queryFn: async () => {
      try {
        return await api.getCompleted(1);
      } catch (error) {
        toast.error('Gagal memuat data completed');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const latestRelease = homeData?.latest_release?.slice(0, 12) || [];
  const ongoing = ongoingData?.ongoing_donghua?.slice(0, 8) || [];
  const completed = completedData?.completed_donghua?.slice(0, 8) || [];
  const carouselItems = homeData?.latest_release?.slice(0, 5) || [];

  return (
    <div className="min-h-screen pb-24">
      <Helmet>
        <title>PingHua - Nonton Donghua Sub Indo Terlengkap (Gratis, HD & Tanpa Iklan)</title>
        <meta name="description" content="PingHua adalah platform streaming Donghua (animasi China) subtitle Indonesia terlengkap dan terupdate. Nonton gratis kualitas HD tanpa iklan mengganggu." />
        <link rel="canonical" href="https://pinghua.qzz.io/" />
        <meta property="og:site_name" content="PingHua" />
        <meta property="og:title" content="PingHua - Nonton Donghua Sub Indo Gratis Terbaru" />
        <meta property="og:description" content="Streaming Donghua subtitle Indonesia terbaru dan terlengkap hanya di PingHua." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pinghua.qzz.io/" />
      </Helmet>

      {/* Full-width Hero Carousel */}
      <div className="w-full">
        {!loadingHome && carouselItems.length > 0 ? (
          <HeroCarousel items={carouselItems} />
        ) : (
          <div className="w-full aspect-[16/9] md:aspect-[21/9] lg:h-[60vh] bg-card animate-pulse" />
        )}
      </div>

      <div className="container mx-auto px-4 py-8 space-y-16">
        {/* Continue Watching Section */}
        <ContinueWatching />

        {/* Quick Genre Chips */}
        <section>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {['Action', 'Cultivation', 'Martial Arts', 'Romance', 'Fantasy', 'Adventure', 'Magic', 'Comedy'].map((genre) => (
                    <Link key={genre} to={`/genre/${genre.toLowerCase().replace(' ', '-')}`}>
                        <Button 
                            variant="outline" 
                            className="rounded-full border-2 border-white/20 bg-background/50 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 whitespace-nowrap px-6"
                        >
                            {genre}
                        </Button>
                    </Link>
                ))}
                <Link to="/genres">
                    <Button variant="ghost" className="rounded-full text-muted-foreground hover:text-white border-2 border-transparent hover:border-white/20 whitespace-nowrap px-6">
                        Lainnya
                    </Button>
                </Link>
            </div>
        </section>

        {/* Latest Release */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Latest Release</h2>
          </div>
          {loadingHome ? (
            <LoadingGrid count={12} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {latestRelease.map((donghua: any, index: number) => (
                <DonghuaCard key={index} donghua={donghua} />
              ))}
            </div>
          )}
        </section>

        {/* Ongoing */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ongoing Series</h2>
            <Link to="/ongoing">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {loadingOngoing ? (
            <LoadingGrid count={8} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {ongoing.map((donghua: any, index: number) => (
                <DonghuaCard key={index} donghua={donghua} />
              ))}
            </div>
          )}
        </section>

        {/* Completed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Completed Series</h2>
            <Link to="/completed">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {loadingCompleted ? (
            <LoadingGrid count={8} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
              {completed.map((donghua: any, index: number) => (
                <DonghuaCard key={index} donghua={donghua} />
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
