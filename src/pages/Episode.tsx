import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { history } from '@/lib/history';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Episode() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState('');
  const [visibleEpisodes, setVisibleEpisodes] = useState(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data: episode, isLoading: loading, error } = useQuery({
    queryKey: ['episode', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      try {
        return await api.getEpisode(slug);
      } catch (err) {
        toast.error('Gagal memuat episode');
        throw err;
      }
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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

  if (error || !episode) {
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

  // DEBUG MODE: Use all servers directly to test if filtering is the issue
  const allServers = episode.streaming?.servers || [];
  const displayServers = allServers; 

  useEffect(() => {
    if (episode && displayServers.length > 0) {
      // DEBUG: Default to first server available
      const bestServer = displayServers[0]?.url;
      
      setSelectedServer(prev => {
        if (prev !== bestServer && bestServer) {
            return bestServer;
        }
        return prev || episode.streaming?.main_url?.url || '';
      });
      
      window.scrollTo(0, 0);
      
      // Save history logic...
      if (episode.donghua_details && slug) {
          history.add({
            slug: episode.donghua_details.slug,
            title: episode.donghua_details.title,
            episode: episode.episode,
            episodeSlug: slug,
            poster: episode.donghua_details.poster,
          });
      }
    }
  }, [episode, slug, displayServers]);

  // CRITICAL CHECK: If streaming data is missing
  if (episode && (!episode.streaming || !episode.streaming.servers)) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
              <h1 className="text-2xl font-bold text-red-500 mb-4">API ERROR</h1>
              <p className="mb-4">No streaming data found for this episode.</p>
              <pre className="bg-gray-900 p-4 rounded text-left text-xs w-full max-w-lg overflow-auto">
                  {JSON.stringify(episode, null, 2)}
              </pre>
              <Link to="/"><Button className="mt-4">Back to Home</Button></Link>
          </div>
      )
  }

  // Get navigation data...
  const prevEpisode = episode.navigation?.previous_episode || episode.prev_episode;
  const nextEpisode = episode.navigation?.next_episode || episode.next_episode;
  const donghuaSlug = episode.donghua_details?.slug || 
                      episode.navigation?.all_episodes?.slug || 
                      slug?.replace(/-episode-\d+.*/, '');

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Helmet>
        <title>{`${episode.episode} ${episode.donghua_details?.title ? `- ${episode.donghua_details.title}` : ''} Sub Indo - PingHua`}</title>
        <meta name="description" content={`Nonton ${episode.episode} ${episode.donghua_details?.title} Subtitle Indonesia gratis kualitas HD.`} />
        <meta property="og:title" content={`${episode.episode} Sub Indo - PingHua`} />
        <meta property="og:image" content={episode.donghua_details?.poster} />
        <meta property="og:type" content="video.episode" />
      </Helmet>
      
      {/* THEATER MODE PLAYER SECTION */}
      <div className="w-full bg-black">
        <div className="max-w-[1800px] mx-auto">
          <div className="relative w-full aspect-video md:h-[70vh] md:aspect-auto flex items-center justify-center bg-zinc-900">
            {selectedServer ? (
              <iframe
                src={selectedServer}
                className="w-full h-full"
                allowFullScreen
                title={episode.episode}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            ) : displayServers.length === 0 ? (
              <div className="text-white text-center">
                <p className="text-lg font-semibold mb-2">No Servers Available</p>
                <p className="text-sm text-gray-400">Please try again later or select another episode.</p>
              </div>
            ) : (
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-sm text-gray-400">Selecting best server...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        
        {/* Info & Controls (Like YouTube) */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            
            {/* Title & Meta */}
            <div className="flex-1 space-y-2">
                <h1 className="text-xl md:text-2xl font-bold leading-tight">{episode.episode}</h1>
                {episode.donghua_details && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link to={`/detail/${donghuaSlug}`} className="hover:text-primary transition-colors font-medium text-foreground/80">
                        {episode.donghua_details.title}
                    </Link>
                    <span>•</span>
                    <span>{episode.donghua_details.released}</span>
                    </div>
                )}
            </div>

            {/* Server & Nav Controls */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
                {/* Server Selector */}
                {displayServers.length > 0 && (
                    <div className="flex items-center justify-between md:justify-end gap-3 bg-secondary/30 p-2 rounded-lg">
                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap px-2">Server</span>
                        <Select value={selectedServer} onValueChange={setSelectedServer}>
                            <SelectTrigger className="h-8 w-[140px] text-xs bg-background border-border/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {displayServers.map((server, index) => (
                                <SelectItem key={index} value={server.url}>
                                    {server.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => prevEpisode ? navigate(`/episode/${prevEpisode.slug}`) : null}
                        disabled={!prevEpisode}
                        variant="secondary"
                        size="sm"
                        className="flex-1 md:flex-none"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>

                    <Button
                        onClick={() => nextEpisode ? navigate(`/episode/${nextEpisode.slug}`) : null}
                        disabled={!nextEpisode}
                        variant="secondary"
                        size="sm"
                        className="flex-1 md:flex-none"
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-border/50 mb-8" />

        {/* Episodes List */}
        {episode.episodes_list && episode.episodes_list.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Episodes</h2>
                <Link to={`/detail/${donghuaSlug}`}>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Home className="w-4 h-4 mr-2" />
                        Detail Info
                    </Button>
                </Link>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {episode.episodes_list.slice(0, visibleEpisodes).map((ep, index) => {
                const isCurrentEpisode = ep.slug === slug;
                return (
                  <Link key={index} to={`/episode/${ep.slug}`}>
                    <Button
                      variant={isCurrentEpisode ? "default" : "outline"}
                      className={`w-full h-10 text-xs ${isCurrentEpisode ? 'font-bold' : 'font-normal text-muted-foreground'}`}
                    >
                      {episode.episodes_list!.length - index}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="mt-6 flex justify-center">
              {visibleEpisodes < episode.episodes_list.length && (
                <div className="loading-dots flex gap-1">
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
