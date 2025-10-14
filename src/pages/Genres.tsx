import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
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
