import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { history } from '@/lib/history';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Episode() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState('');

  const { data: episode, isLoading: loading, error } = useQuery({
    queryKey: ['episode', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      return await api.getEpisode(slug);
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (episode && episode.streaming?.servers?.length > 0) {
      // Langsung pilih server pertama tanpa filter ribet biar gak crash
      setSelectedServer(episode.streaming.servers[0].url);
      window.scrollTo(0, 0);

      // Save to history
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
  }, [episode, slug]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">Loading Episode...</div>;
  
  if (error || !episode) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Episode Gak Ketemu / API Error</div>;

  const servers = episode.streaming?.servers || [];
  const prevEpisode = episode.navigation?.previous_episode || episode.prev_episode;
  const nextEpisode = episode.navigation?.next_episode || episode.next_episode;
  const donghuaSlug = episode.donghua_details?.slug || slug?.replace(/-episode-\d+.*/, '');

  return (
    <div className="min-h-screen pb-24 bg-background text-foreground">
      
      {/* VIDEO PLAYER - BASIC MODE */}
      <div className="w-full bg-black aspect-video">
        {selectedServer ? (
          <iframe
            src={selectedServer}
            className="w-full h-full"
            allowFullScreen
            title="Video Player"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Memulai Player...
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-xl md:text-2xl font-bold mb-4">{episode.episode}</h1>
        
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Server Selector */}
          <Select value={selectedServer} onValueChange={setSelectedServer}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih Server" />
            </SelectTrigger>
            <SelectContent>
              {servers.map((s, i) => (
                <SelectItem key={i} value={s.url}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Nav Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => prevEpisode && navigate(`/episode/${prevEpisode.slug}`)} disabled={!prevEpisode}>Prev</Button>
            <Button onClick={() => nextEpisode && navigate(`/episode/${nextEpisode.slug}`)} disabled={!nextEpisode}>Next</Button>
          </div>
        </div>

        <Link to={`/detail/${donghuaSlug}`}>
          <Button variant="outline">Kembali ke Detail</Button>
        </Link>

        {/* EPISODE LIST SECTION */}
        {episode.episodes_list && episode.episodes_list.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              Semua Episode
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {episode.episodes_list.map((ep, index) => {
                const isCurrent = ep.slug === slug;
                return (
                  <Link key={index} to={`/episode/${ep.slug}`}>
                    <Button
                      variant={isCurrent ? "default" : "outline"}
                      className={`w-full h-10 text-xs font-medium transition-all ${
                        isCurrent ? 'shadow-lg shadow-primary/20 scale-105' : 'text-muted-foreground'
                      }`}
                    >
                      {episode.episodes_list!.length - index}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}