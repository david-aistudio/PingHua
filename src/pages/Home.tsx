import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { api, DonghuaCard as DonghuaCardType } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { LoadingGrid } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [latestRelease, setLatestRelease] = useState<DonghuaCardType[]>([]);
  const [ongoing, setOngoing] = useState<DonghuaCardType[]>([]);
  const [completed, setCompleted] = useState<DonghuaCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [homeData, ongoingData, completedData] = await Promise.all([
          api.getHome(1),
          api.getOngoing(1),
          api.getCompleted(1),
        ]);

        setLatestRelease(homeData.latest_release?.slice(0, 12) || []);
        setOngoing(ongoingData.ongoing_donghua?.slice(0, 8) || []);
        setCompleted(completedData.completed_donghua?.slice(0, 8) || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-primary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            Welcome to DonghuaK!ta
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
            Discover and watch the best Chinese animation (Donghua) with Indonesian subtitles
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Latest Release */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">🔥 Latest Release</h2>
          </div>
          {loading ? (
            <LoadingGrid count={12} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {latestRelease.map((donghua, index) => (
                <DonghuaCard key={index} donghua={donghua} />
              ))}
            </div>
          )}
        </section>

        {/* Ongoing */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">📺 Ongoing Donghua</h2>
            <Link to="/ongoing">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <LoadingGrid count={8} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {ongoing.map((donghua, index) => (
                <DonghuaCard key={index} donghua={donghua} />
              ))}
            </div>
          )}
        </section>

        {/* Completed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">✅ Completed Donghua</h2>
            <Link to="/completed">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <LoadingGrid count={8} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {completed.map((donghua, index) => (
                <DonghuaCard key={index} donghua={donghua} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
