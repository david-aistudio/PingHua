import { api } from '@/lib/api';
import { HeroCarousel } from '@/components/HeroCarousel';
import { DonghuaCard } from '@/components/DonghuaCard';
import { Footer } from '@/components/Footer';
import { ContinueWatching } from '@/components/ContinueWatching';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { optimizeImage } from '@/lib/image-optimizer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PingHua - Nonton Donghua Sub Indo Gratis Kualitas HD',
  description: 'Tempat nonton donghua (anime china) subtitle Indonesia terlengkap dan terupdate. Streaming kualitas HD gratis tanpa iklan mengganggu. Mulai nonton sekarang!',
  alternates: {
    canonical: 'https://pinghua.qzz.io',
  },
};

export default async function Home() {
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

  const allPopular = homeData?.popular || [];
  const allLatest = homeData?.latest_release || [];
  const recommendation = homeData?.recommendation || [];
  const topGenres = genresData?.data?.slice(0, 10) || [];
  
  const carouselItems = allPopular.length > 0 ? allPopular.slice(0, 5) : allLatest.slice(0, 5);
  const latestSection = allLatest.slice(0, 12); 

  return (
    <div className="min-h-screen pb-32 bg-background selection:bg-primary/30">
      {/* Visually Hidden H1 for SEO & Accessibility */}
      <h1 className="sr-only">PingHua - Platform Streaming Donghua Subtitle Indonesia Terlengkap</h1>

      {/* Cinematic Hero */}
      <HeroCarousel items={carouselItems} />

      {/* Main Content Area */}
      <div className="relative z-10 -mt-2 md:-mt-4">
        <div className="container mx-auto px-4 md:px-8 space-y-16 md:space-y-20">
          
          {/* Continue Watching Section */}
          <div className="pt-10 md:pt-14">
            <ContinueWatching />
          </div>

          {/* Discovery / Genre Section */}
          <section className="space-y-4" aria-labelledby="genre-heading">
              <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full shadow-sm" aria-hidden="true" />
                  <h2 id="genre-heading" className="text-lg font-bold tracking-tight text-foreground/90">Browse by Genre</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {topGenres.map((genre: any) => (
                      <Link key={genre.slug} href={`/genre/${genre.slug}`} aria-label={`Jelajahi Genre ${genre.title}`}>
                          <Button 
                              variant="outline" 
                              className="rounded-xl border-black/5 bg-white shadow-soft hover:bg-primary hover:text-black hover:border-primary text-foreground/70 transition-all duration-300 px-6 h-9 font-bold text-[10px] uppercase tracking-wider"
                              tabIndex={-1}
                          >
                              {genre.title}
                          </Button>
                      </Link>
                  ))}
                  <Link href="/genres" aria-label="Lihat semua genre yang tersedia">
                      <Button variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground transition-colors px-6 h-9 font-bold text-[10px] uppercase tracking-wider" tabIndex={-1}>
                          Discovery
                      </Button>
                  </Link>
              </div>
          </section>

        {/* POPULAR TODAY - Spotlight Edition */}
        {allPopular.length > 0 && (
            <section className="animate-fade-in" aria-labelledby="popular-heading">
                <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-primary rounded-full shadow-sm" aria-hidden="true" />
                        <h2 id="popular-heading" className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Popular Today</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* SPOTLIGHT ITEM (RANK 1) */}
                    <div className="lg:col-span-5 group relative">
                        <Link href={`/detail/${allPopular[0].slug}`} className="block relative aspect-[16/10] overflow-hidden rounded-[1.5rem] shadow-soft border border-black/5" aria-label={`Peringkat 1 Populer: ${allPopular[0].title}`}>
                            <img 
                                src={optimizeImage(allPopular[0].poster, 800)} 
                                alt="" 
                                aria-hidden="true"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 space-y-2">
                                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">{allPopular[0].title}</h3>
                                <div className="flex items-center gap-3">
                                    <Button className="h-9 px-5 rounded-full bg-primary text-black font-bold text-[10px] uppercase tracking-tight" tabIndex={-1}>Watch Now</Button>
                                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{allPopular[0].status}</span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* SCROLLING CAST (RANK 2+) */}
                    <div className="lg:col-span-7">
                        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x" role="list" aria-label="Trending Donghua List">
                            {allPopular.slice(1, 10).map((donghua: any, index: number) => (
                                <div key={index} className="flex-shrink-0 w-[150px] md:w-[190px] snap-start relative group" role="listitem">
                                    <div className="absolute -top-3 left-0 text-2xl font-black text-black/[0.03] z-0" aria-hidden="true">
                                        {(index + 2).toString().padStart(2, '0')}
                                    </div>
                                    <div className="relative z-10">
                                        <DonghuaCard donghua={donghua} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* LATEST RELEASE - GRID BERSIH */}
        <section className="animate-fade-in" aria-labelledby="latest-heading">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-black/5">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary rounded-full shadow-sm" aria-hidden="true" />
                    <h2 id="latest-heading" className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Latest Release</h2>
                </div>
                <Link href="/ongoing" aria-label="Lihat semua rilis donghua terbaru">
                  <Button variant="outline" className="h-9 px-5 rounded-full border-black/5 bg-white shadow-soft hover:border-primary text-[10px] font-bold transition-all uppercase tracking-tight" tabIndex={-1}>
                      View All
                  </Button>
                </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10" role="list">
                {latestSection.map((donghua: any, index: number) => (
                  <div key={index} role="listitem">
                    <DonghuaCard donghua={donghua} />
                  </div>
                ))}
            </div>
        </section>

        {/* RECOMMENDATION */}
        <section className="animate-fade-in pb-16" aria-labelledby="recommend-heading">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-5 bg-primary rounded-full shadow-sm" aria-hidden="true" />
                <h2 id="recommend-heading" className="text-xl md:text-2xl font-bold tracking-tight text-foreground">Recommended</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10" role="list">
                {recommendation.map((donghua: any, index: number) => (
                  <div key={index} role="listitem">
                    <DonghuaCard donghua={donghua} />
                  </div>
                ))}
            </div>
        </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}