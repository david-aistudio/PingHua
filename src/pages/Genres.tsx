import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api, Genre } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function Genres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const data = await api.getGenres();
        setGenres(data.data || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Daftar Genre Donghua - PingHua</title>
        <meta name="description" content="Jelajahi berbagai genre Donghua mulai dari Action, Cultivation, Romance, hingga Fantasy subtitle Indonesia." />
        <link rel="canonical" href="https://pinghua.qzz.io/genres" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">🎭 All Genres</h1>

        {loading ? (
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-32 bg-muted rounded-full animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {genres.map((genre, index) => (
              <Link key={index} to={`/genre/${genre.slug}`}>
                <Button
                  variant="outline"
                  className="rounded-full border-white/20 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                >
                  {genre.name}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
