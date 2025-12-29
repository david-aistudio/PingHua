import { api } from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Jelajahi Genre - PingHua',
  description: 'Temukan anime & donghua favoritmu berdasarkan genre.',
};

export default async function GenresPage() {
  const response = await api.getGenres();
  const list = response?.data || [];

  return (
    <div className="min-h-screen pt-24 pb-24 container mx-auto px-4 flex flex-col items-center">
      {/* Simple Header */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Genres</h1>
        <p className="text-muted-foreground">Pilih kategori yang lo suka.</p>
      </div>

      {/* Pill Grid (Wrap) */}
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
        {list.map((genre: any, i: number) => (
          <Link key={i} href={`/genre/${genre.slug}`}>
            <Button 
                variant="outline" 
                className="rounded-full border-white/10 bg-white/5 hover:bg-white text-gray-300 hover:text-black hover:border-white transition-all duration-300 px-6 h-10 text-sm font-medium"
            >
                {genre.title || genre.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
