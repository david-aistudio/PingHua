import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { api, EpisodeDetail } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Episode() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState('');

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

  // Extract donghua slug from episode slug for back button
  const donghuaSlug = slug?.replace(/-episode-\d+.*/, '');

  return (
    <div className="min-h-screen pb-8">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{episode.episode}</h1>
            <Link to={`/detail/${donghuaSlug}`} className="text-sm text-primary hover:underline">
              Back to Detail
            </Link>
          </div>

          {/* Server Selector */}
          {episode.streaming.servers.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Server:</span>
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger className="w-[180px]">
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

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-between">
          {episode.prev_episode ? (
            <Button
              onClick={() => navigate(`/episode/${episode.prev_episode?.slug}`)}
              className="flex-1 md:flex-none"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Episode
            </Button>
          ) : (
            <div className="flex-1 md:flex-none" />
          )}

          <Link to={`/detail/${donghuaSlug}`}>
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Episode List
            </Button>
          </Link>

          {episode.next_episode ? (
            <Button
              onClick={() => navigate(`/episode/${episode.next_episode?.slug}`)}
              className="flex-1 md:flex-none"
            >
              Next Episode
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex-1 md:flex-none" />
          )}
        </div>
      </div>
    </div>
  );
}
