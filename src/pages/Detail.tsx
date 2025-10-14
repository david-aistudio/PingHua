import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Calendar, Clock, Star } from 'lucide-react';
import { api, DonghuaDetail, Episode } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function Detail() {
  const { slug } = useParams<{ slug: string }>();
  const [donghua, setDonghua] = useState<DonghuaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleEpisodes, setVisibleEpisodes] = useState(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await api.getDetail(slug);
        setDonghua(data);
      } catch (error) {
        console.error('Error fetching detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo(0, 0);
  }, [slug]);

  // Infinite scroll for episodes
  const loadMoreEpisodes = useCallback(() => {
    if (donghua?.episodes_list && visibleEpisodes < donghua.episodes_list.length) {
      setVisibleEpisodes(prev => Math.min(prev + 20, donghua.episodes_list.length));
    }
  }, [donghua, visibleEpisodes]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreEpisodes();
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
  }, [loadMoreEpisodes]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <LoadingSkeleton />
            <div className="md:col-span-2 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!donghua) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Donghua not found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        <img
          src={donghua.poster}
          alt={donghua.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="flex justify-center md:justify-start">
            <img
              src={donghua.poster}
              alt={donghua.title}
              className="w-full max-w-sm rounded-lg shadow-hover"
            />
          </div>

          {/* Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{donghua.title}</h1>
              {donghua.alter_title && (
                <p className="text-lg text-muted-foreground">{donghua.alter_title}</p>
              )}
            </div>

            {/* Watch Button */}
            {donghua.episodes_list && donghua.episodes_list.length > 0 && (
              <Link to={`/episode/${donghua.episodes_list[0].slug}`}>
                <Button size="lg" className="w-full md:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Now
                </Button>
              </Link>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{donghua.released}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{donghua.duration}</span>
              </div>
              {donghua.rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{donghua.rating}</span>
                </div>
              )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  donghua.status === 'Ongoing'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {donghua.status}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {donghua.genres.map((genre, index) => (
                <Link key={index} to={`/genre/${genre.slug}`}>
                  <Button variant="outline" size="sm" className="rounded-full">
                    {genre.name}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Synopsis */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed">{donghua.synopsis}</p>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {donghua.studio && (
                <div>
                  <span className="text-muted-foreground">Studio:</span>
                  <p className="font-medium">{donghua.studio}</p>
                </div>
              )}
              {donghua.network && (
                <div>
                  <span className="text-muted-foreground">Network:</span>
                  <p className="font-medium">{donghua.network}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Episodes:</span>
                <p className="font-medium">{donghua.episodes_count}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Season:</span>
                <p className="font-medium">{donghua.season}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Country:</span>
                <p className="font-medium">{donghua.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes List with Infinite Scroll */}
        {donghua.episodes_list && donghua.episodes_list.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-6">Episodes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {donghua.episodes_list.slice(0, visibleEpisodes).map((episode, index) => (
                <Link key={index} to={`/episode/${episode.slug}`}>
                  <Button
                    variant="outline"
                    className="w-full h-auto py-3 hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    Ep {donghua.episodes_list.length - index}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="mt-4">
              {visibleEpisodes < donghua.episodes_list.length && (
                <div className="text-center text-sm text-muted-foreground">
                  Loading more episodes...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
