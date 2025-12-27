import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { favorites, FavoriteItem } from '@/lib/favorites';
import { DonghuaCard } from '@/components/DonghuaCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const [list, setList] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setList(favorites.get());
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Favorit Saya - PingHua</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Favorit Saya</h1>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-2xl border border-white/5">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-bold mb-2">Belum ada Favorit</h3>
            <p className="text-muted-foreground mb-6">Kamu belum menyimpan donghua apapun.</p>
            <Link to="/">
              <Button>Mulai Menjelajah</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {list.map((item, index) => (
              // We adapt FavoriteItem to fit DonghuaCard structure roughly
              <DonghuaCard 
                key={`${item.slug}-${index}`} 
                donghua={{
                  ...item,
                  current_episode: item.status // reuse status field
                } as any} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
