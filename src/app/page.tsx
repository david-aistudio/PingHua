import { api } from '@/lib/api';
import { HeroCarousel } from '@/components/HeroCarousel';
import { DonghuaCard } from '@/components/DonghuaCard';
import { Footer } from '@/components/Footer';
import { ContinueWatching } from '@/components/ContinueWatching';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default async function Home() {
  // Pake Try Catch biar gak crash total kalau Supabase/Scraper macet
  let homeData: any = null;
  let ongoingData: any = null;
  let completedData: any = null;
  let genresData: any = null;

  try {
    [homeData, ongoingData, completedData, genresData] = await Promise.all([
      api.getHome(),
      api.getOngoing(1),
      api.getCompleted(1),
      api.getGenres()
    ]);
  } catch (e) {
    console.error("Home Data Fetch Error:", e);
  }

  // SAFE MAPPING (Kalau data null, jadi array kosong)
  const allPopular = homeData?.popular || [];
  const allLatest = homeData?.latest_release || [];
  const recommendation = homeData?.recommendation || [];
  const topGenres = genresData?.data?.slice(0, 10) || [];
  
  // Carousel pake Top 5 Popular (atau Latest kalau popular kosong)
  const carouselItems = allPopular.length > 0 ? allPopular.slice(0, 5) : allLatest.slice(0, 5);

  const latestSection = allLatest.slice(0, 12); 

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Hero Carousel (Elite Series) */}
      <div className="w-full">
        {carouselItems.length > 0 ? (
            <HeroCarousel items={carouselItems} />
        ) : (
            <div className="w-full h-[60vh] bg-neutral-900 animate-pulse flex items-center justify-center">
                <p className="text-gray-500">Memuat konten...</p>
            </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-12 space-y-20">
        {/* Continue Watching */}
        <ContinueWatching />

        {/* Quick Genre Pills */}
        <section>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {topGenres.map((genre: any) => (
                    <Link key={genre.slug} href={`/genre/${genre.slug}`}>
                        <Button 
                            variant="outline" 
                            className="rounded-full border border-white/10 bg-white/5 hover:bg-white text-gray-300 hover:text-black transition-all duration-300 px-6"
                        >
                            {genre.title}
                        </Button>
                    </Link>
                ))}
                <Link href="/genres">
                    <Button variant="ghost" className="rounded-full text-muted-foreground hover:text-white transition-colors px-6">
                        Lainnya
                    </Button>
                </Link>
            </div>
        </section>

        {/* POPULAR TODAY SECTION */}
        {allPopular.length > 0 && (
            <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">Popular Today</h2>
                </div>
                {/* Horizontal Scroll Container */}
                <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                    {allPopular.map((donghua: any, index: number) => (
                        <div key={index} className="flex-shrink-0 w-[160px] md:w-[200px] snap-start">
                            <DonghuaCard donghua={donghua} />
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* LATEST RELEASE SECTION */}
        {latestSection.length > 0 && (
            <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">Latest Release</h2>
                    <Link href="/ongoing">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors">
                        View All <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
                    {latestSection.map((donghua: any, index: number) => (
                    <DonghuaCard key={index} donghua={donghua} />
                    ))}
                </div>
            </section>
        )}

        {/* RECOMMENDATION SECTION */}
        {recommendation.length > 0 && (
            <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">Rekomendasi</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10">
                {recommendation.map((donghua: any, index: number) => (
                <DonghuaCard key={index} donghua={donghua} />
                ))}
            </div>
            </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
