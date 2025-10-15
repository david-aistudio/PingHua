import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { api, EpisodeDetail, Episode as EpisodeType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Episode() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState('');
  const [visibleEpisodes, setVisibleEpisodes] = useState(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEpisode = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await api.getEpisode(slug);
        setEpisode(data);
        setSelectedServer(data.streaming.main_url.url);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Error fetching episode:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisode();
  }, [slug]);

  // Infinite scroll for episodes
  const loadMoreEpisodes = useCallback(() => {
    if (episode?.episodes_list && visibleEpisodes < episode.episodes_list.length) {
      setVisibleEpisodes(prev => Math.min(prev + 20, episode.episodes_list!.length));
    }
  }, [episode, visibleEpisodes]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading episode...</p>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Episode not found</h1>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get navigation data - prioritize navigation object
  const prevEpisode = episode.navigation?.previous_episode || episode.prev_episode;
  const nextEpisode = episode.navigation?.next_episode || episode.next_episode;
  const donghuaSlug = episode.donghua_details?.slug || 
                      episode.navigation?.all_episodes?.slug || 
                      slug?.replace(/-episode-\d+.*/, '');

  return (
    <div className="min-h-screen pb-8">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{episode.episode}</h1>
          {episode.donghua_details && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to={`/detail/${donghuaSlug}`} className="hover:text-primary transition-colors">
                {episode.donghua_details.title}
              </Link>
              <span>•</span>
              <span>{episode.donghua_details.released}</span>
            </div>
          )}
        </div>

        {/* Video Player */}
        <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-hover mb-6">
          <div className="aspect-video">
            <iframe
              src={selectedServer}
              className="w-full h-full"
              allowFullScreen
              title={episode.episode}
            />
          </div>
        </div>

        {/* Controls Section */}
        <div className="space-y-3 mb-6">
          {/* Server Selector Bar */}
          {episode.streaming.servers.length > 0 && (
            <div className="bg-card/50 backdrop-blur-sm border rounded-lg px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Select Video Server</span>
                <Select value={selectedServer} onValueChange={setSelectedServer}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {episode.streaming.servers.map((server, index) => (
                      <SelectItem key={index} value={server.url}>
                        {server.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {prevEpisode ? (
              <Button
                onClick={() => navigate(`/episode/${prevEpisode.slug}`)}
                variant="outline"
                size="sm"
                className="h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Prev</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-9 px-3" disabled>
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Prev</span>
              </Button>
            )}

            <Link to={`/detail/${donghuaSlug}`} className="flex-1">
              <Button variant="default" className="w-full h-9">
                <Home className="h-4 w-4 mr-2" />
                All Episodes
              </Button>
            </Link>

            {nextEpisode ? (
              <Button
                onClick={() => navigate(`/episode/${nextEpisode.slug}`)}
                variant="outline"
                size="sm"
                className="h-9 px-3"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-9 px-3" disabled>
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Episodes List with Infinite Scroll */}
        {episode.episodes_list && episode.episodes_list.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">All Episodes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {episode.episodes_list.slice(0, visibleEpisodes).map((ep, index) => {
                const isCurrentEpisode = ep.slug === slug;
                return (
                  <Link key={index} to={`/episode/${ep.slug}`}>
                    <Button
                      variant={isCurrentEpisode ? "default" : "outline"}
                      className="w-full h-auto py-3 transition-all"
                    >
                      Ep {episode.episodes_list!.length - index}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="mt-4">
              {visibleEpisodes < episode.episodes_list.length && (
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
