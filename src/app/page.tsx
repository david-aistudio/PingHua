import { api } from '@/lib/api';
import { HeroCarousel } from '@/components/HeroCarousel';
import { DonghuaCard } from '@/components/DonghuaCard';
import { Footer } from '@/components/Footer';
import { ContinueWatching } from '@/components/ContinueWatching';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default async function Home() {
  const [homeData, ongoingData, completedData] = await Promise.all([
    api.getHome(1),
    api.getOngoing(1),
    api.getCompleted(1)
  ]);

  const latestRelease = homeData?.latest_release?.slice(0, 12) || [];
  const ongoing = ongoingData?.ongoing_donghua?.slice(0, 8) || [];
  const completed = completedData?.completed_donghua?.slice(0, 8) || [];
  const carouselItems = homeData?.latest_release?.slice(0, 5) || [];

  return (
    <div className="min-h-screen pb-24">
      {/* Full-width Hero Carousel */}
      <div className="w-full">
        <HeroCarousel items={carouselItems} />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-16">
        {/* Continue Watching Section */}
        <ContinueWatching />

        {/* Quick Genre Chips */}
        <section>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {['Action', 'Cultivation', 'Martial Arts', 'Romance', 'Fantasy', 'Adventure', 'Magic', 'Comedy'].map((genre) => (
                    <Link key={genre} href={`/genre/${genre.toLowerCase().replace(' ', '-')}`}>
                        <Button 
                            variant="outline" 
                            className="rounded-full border-2 border-white/20 bg-background/50 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 whitespace-nowrap px-6"
                        >
                            {genre}
                        </Button>
                    </Link>
                ))}
                <Link href="/genres">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {latestRelease.map((donghua: any, index: number) => (
              <DonghuaCard key={index} donghua={donghua} />
            ))}
          </div>
        </section>

        {/* Ongoing */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Ongoing Series</h2>
            <Link href="/ongoing">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {ongoing.map((donghua: any, index: number) => (
              <DonghuaCard key={index} donghua={donghua} />
            ))}
          </div>
        </section>

        {/* Completed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Completed Series</h2>
            <Link href="/completed">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {completed.map((donghua: any, index: number) => (
              <DonghuaCard key={index} donghua={donghua} />
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}