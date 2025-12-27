import { useEffect, useState } from 'react';
import { Clock, Trash2, ChevronLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { history, HistoryItem } from '@/lib/history';
import { DonghuaCard } from '@/components/DonghuaCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function History() {
  const [list, setList] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setList(history.get());
  }, []);

  const handleClearHistory = () => {
    if (confirm('Hapus semua riwayat tontonan?')) {
      history.clear();
      setList([]);
      toast.success('Riwayat berhasil dibersihkan');
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Helmet>
        <title>Riwayat Tontonan - PingHua</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Riwayat Tontonan</h1>
              <p className="text-sm text-muted-foreground">Donghua yang terakhir kamu tonton</p>
            </div>
          </div>

          {list.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleClearHistory}
              className="w-full md:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Bersihkan History
            </Button>
          )}
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-2xl border border-white/5">
            <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-bold mb-2">Belum ada riwayat</h3>
            <p className="text-muted-foreground mb-6">Mulai nonton donghua sekarang biar riwayatnya muncul di sini.</p>
            <Link to="/">
              <Button>Cari Donghua</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {list.map((item, index) => (
              <div key={`${item.slug}-${index}`} className="relative group">
                <DonghuaCard 
                  isHistory={true}
                  donghua={{
                    ...item,
                    current_episode: item.episode,
                    slug: item.slug,
                    url: `/episode/${item.episodeSlug}`
                  } as any} 
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 backdrop-blur-sm rounded-b-xl translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                   <p className="text-[10px] text-gray-400 text-center">
                     {new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                   </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
