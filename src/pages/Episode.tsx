import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, Share2 } from 'lucide-react';
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
      const servers = episode.streaming.servers;
      
      // SILENT Priority Logic (Rumble > OK.ru)
      const rumble = servers.find(s => s.name && s.name.toLowerCase().includes('rumble'));
      const okRu = servers.find(s => s.name && s.name.toLowerCase().includes('ok.ru'));
      
      // Rumble is priority 1, OK.ru is priority 2
      const bestServer = rumble?.url || okRu?.url || servers[0].url;
      
      setSelectedServer(bestServer);
      window.scrollTo(0, 0);

      // Save to history...
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
  
  if (error || !episode) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-center p-4">
    <div>
        <h1 className="text-2xl font-bold mb-4">Episode Gak Ketemu / API Error</h1>
        <Link to="/"><Button>Kembali ke Home</Button></Link>
    </div>
  </div>;

    // Filter dropdown: STRICT Integrity Check

    const allServers = episode.streaming?.servers || [];

    const displayServers = allServers.filter(s => {

      if (!s.name || !s.url) return false;

      

      const nameLower = s.name.toLowerCase();

      const urlLower = s.url.toLowerCase();

      

      // Integrity Check: Label and URL must both match clean sources

      const isRumble = nameLower.includes('rumble') && urlLower.includes('rumble.com');

      const isOkRu = nameLower.includes('ok.ru') && urlLower.includes('ok.ru');

      

      return isRumble || isOkRu;

    });

  

    const prevEpisode = episode.navigation?.previous_episode || episode.prev_episode;

    const nextEpisode = episode.navigation?.next_episode || episode.next_episode;

    const donghuaSlug = episode.donghua_details?.slug || slug?.replace(/-episode-\d+.*/, '');

  

    return (

      <div className="min-h-screen pb-24 bg-background text-foreground">

                        <Helmet>

                          <title>{`Nonton ${episode.donghua_details?.title || ''} ${episode.episode} Sub Indo HD - PingHua`}</title>

                          <meta name="description" content={`Streaming ${episode.donghua_details?.title || ''} ${episode.episode} Subtitle Indonesia terbaru kualitas HD. Server cepat, gratis, hemat kuota.`} />

                          <link rel="canonical" href={`https://pinghua.qzz.io/episode/${slug}`} />

                  <meta property="og:site_name" content="PingHua" />

          <meta property="og:title" content={`${episode.episode} Sub Indo - PingHua`} />

          <meta property="og:image" content={episode.donghua_details?.poster} />

          <meta property="og:type" content="video.episode" />

        </Helmet>

        

        {/* VIDEO PLAYER */}

        <div className="w-full bg-black aspect-video">

          {selectedServer ? (

            <iframe

              src={selectedServer}

              className="w-full h-full"

              allowFullScreen

              title="Video Player"

              sandbox="allow-scripts allow-same-origin allow-presentation"

            />

          ) : (

            <div className="w-full h-full flex items-center justify-center text-gray-500">

              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>

              Memulai Player...

            </div>

          )}

        </div>

  

        <div className="container mx-auto px-4 py-6">

          <h1 className="text-xl md:text-2xl font-bold mb-4">{episode.episode}</h1>

          

          <div className="flex flex-wrap gap-4 mb-8 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Server Selector - STRICT Integrity */}
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Pilih Server" />
                </SelectTrigger>
                <SelectContent>
                  {displayServers.length > 0 ? (
                    displayServers.map((s, i) => {
                      let displayName = s.name;
                      if (s.name.toLowerCase().includes('rumble')) displayName = 'Free-1 (Clean)';
                      if (s.name.toLowerCase().includes('ok.ru')) displayName = 'Free-2 (Fast)';
                      
                      return (
                        <SelectItem key={i} value={s.url}>{displayName}</SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value={selectedServer}>Server Backup</SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Share Button */}
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  const shareData = {
                    title: `Nonton ${episode.donghua_details?.title || 'Donghua'} ${episode.episode}`,
                    text: `Nonton ${episode.donghua_details?.title || ''} ${episode.episode} Sub Indo Gratis di PingHua!`,
                    url: window.location.href,
                  };

                  if (navigator.share) {
                    navigator.share(shareData).catch((err) => console.log('Error sharing:', err));
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link episode disalin!');
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

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