import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Calendar, Clock, Star, Share2, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { api, DonghuaDetail } from '@/lib/api';
import { favorites } from '@/lib/favorites';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function Detail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [visibleEpisodes, setVisibleEpisodes] = useState(20);
  const [isFavorite, setIsFavorite] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Check favorite status on mount
  useEffect(() => {
    if (slug) {
      setIsFavorite(favorites.has(slug));
    }
  }, [slug]);

  const toggleFavorite = () => {
    if (!donghua || !slug) return;

    if (isFavorite) {
      favorites.remove(slug);
      setIsFavorite(false);
      toast.success('Dihapus dari Favorit');
    } else {
      favorites.add({
        slug: slug,
        title: donghua.title,
        poster: donghua.poster,
        status: donghua.status,
        url: `/detail/${slug}`
      });
      setIsFavorite(true);
      toast.success('Ditambahkan ke Favorit');
    }
  };

  useEffect(() => {
    // Check if slug looks like an episode slug (contains "episode-")
    if (slug && slug.includes('-episode-')) {
      // Redirect to episode page
      navigate(`/episode/${slug}`, { replace: true });
    }
  }, [slug, navigate]);

  const { data: donghua, isLoading: loading, error } = useQuery({
    queryKey: ['detail', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      try {
        const data = await api.getDetail(slug);
        // Validate if data has required fields
        if (data && data.title) {
          return data;
        }
        throw new Error('Invalid donghua data');
      } catch (err) {
        toast.error('Gagal memuat detail donghua');
        throw err;
      }
    },
    enabled: !!slug && !slug.includes('-episode-'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
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

  if (error || !donghua) {
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
      <Helmet>
        <title>{`Nonton ${donghua.title} Sub Indo Full Episode (Terbaru) - PingHua`}</title>
        <meta name="description" content={`Streaming ${donghua.title} Subtitle Indonesia kualitas HD gratis. ${donghua.synopsis?.slice(0, 120)}... Nonton donghua terlengkap dan terupdate tanpa iklan.`} />
        <link rel="canonical" href={`https://pinghua.qzz.io/detail/${slug}`} />
        <meta property="og:site_name" content="PingHua" />
        <meta property="og:title" content={`Nonton ${donghua.title} Subtitle Indonesia - PingHua`} />
        <meta property="og:description" content={`Streaming Donghua ${donghua.title} gratis dengan kualitas HD.`} />
        <meta property="og:image" content={donghua.poster} />
        <meta property="og:type" content="video.tv_show" />
        <meta property="og:url" content={`https://pinghua.qzz.io/detail/${slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TVSeries",
            "name": donghua.title,
            "alternativeHeadline": donghua.alter_title,
            "image": donghua.poster,
            "description": donghua.synopsis?.slice(0, 200),
            "genre": donghua.genres?.map(g => g.name),
            "numberOfEpisodes": donghua.episodes_count,
            "status": donghua.status,
            "author": {
              "@type": "Organization",
              "name": "PingHua",
              "url": "https://pinghua.qzz.io/"
            },
            "aggregateRating": donghua.rating ? {
              "@type": "AggregateRating",
              "ratingValue": donghua.rating,
              "bestRating": "10",
              "ratingCount": "100"
            } : undefined
          })}
        </script>
      </Helmet>

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

            {/* Watch & Share Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {donghua.episodes_list && donghua.episodes_list.length > 0 && (
                <Link to={`/episode/${donghua.episodes_list[0].slug}`} className="flex-1 sm:flex-none">
                  <Button size="lg" className="w-full">
                    <Play className="mr-2 h-5 w-5" />
                    Mulai Nonton
                  </Button>
                </Link>
              )}
              
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => {
                  const shareData = {
                    title: `Nonton ${donghua.title}`,
                    text: `Nonton Donghua ${donghua.title} Sub Indo Gratis di PingHua!`,
                    url: window.location.href,
                  };

                  if (navigator.share) {
                    navigator.share(shareData).catch((err) => console.log('Error sharing:', err));
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link berhasil disalin!');
                  }
                }}
              >
                <Share2 className="mr-2 h-5 w-5" />
                Share
              </Button>

              <Button
                size="lg"
                variant={isFavorite ? "default" : "outline"}
                className={`w-full sm:w-auto ${isFavorite ? "bg-red-600 hover:bg-red-700 text-white border-red-600" : ""}`}
                onClick={toggleFavorite}
              >
                <Heart className={`mr-2 h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                {isFavorite ? 'Saved' : 'Save'}
              </Button>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              {donghua.released && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{donghua.released}</span>
                </div>
              )}
              {donghua.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{donghua.duration}</span>
                </div>
              )}
              {donghua.rating && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{donghua.rating}</span>
                </div>
              )}
              {donghua.status && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    donghua.status === 'Ongoing'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {donghua.status}
                </span>
              )}
            </div>

            {/* Genres */}
            {donghua.genres && donghua.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {donghua.genres.map((genre, index) => (
                  <Link key={index} to={`/genre/${genre.slug}`}>
                    <Button variant="outline" size="sm" className="rounded-full">
                      {genre.name}
                    </Button>
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {donghua.synopsis && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">{donghua.synopsis}</p>
              </div>
            )}

            {/* Additional Info */}
            {(donghua.studio || donghua.network || donghua.episodes_count || donghua.season || donghua.country) && (
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
                {donghua.episodes_count && (
                  <div>
                    <span className="text-muted-foreground">Episodes:</span>
                    <p className="font-medium">{donghua.episodes_count}</p>
                  </div>
                )}
                {donghua.season && (
                  <div>
                    <span className="text-muted-foreground">Season:</span>
                    <p className="font-medium">{donghua.season}</p>
                  </div>
                )}
                {donghua.country && (
                  <div>
                    <span className="text-muted-foreground">Country:</span>
                    <p className="font-medium">{donghua.country}</p>
                  </div>
                )}
              </div>
            )}
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
