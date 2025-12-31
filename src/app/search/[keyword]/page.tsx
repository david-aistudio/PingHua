import { api } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import SearchClient from '@/components/SearchClient';

export async function generateMetadata({ params }: { params: Promise<{ keyword: string }> }) {
  const { keyword: keywordEncoded } = await params;
  const keyword = decodeURIComponent(keywordEncoded);
  return {
    title: `Hasil Pencarian: ${keyword} - PingHua`,
    description: `Nonton donghua ${keyword} sub indo gratis.`,
  };
}

export default async function SearchResultPage({ params }: { params: Promise<{ keyword: string }> }) {
  const { keyword: keywordEncoded } = await params;
  const keyword = decodeURIComponent(keywordEncoded);
  const response = await api.search(keyword);
  const results = response?.data || []; 

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold">Hasil Pencarian: <span className="text-primary">"{keyword}"</span></h1>
            <p className="text-muted-foreground text-sm">Ditemukan {results.length} judul</p>
        </div>
        <div className="w-full md:w-auto">
            <SearchClient initialQuery={keyword} />
        </div>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {results.map((donghua: any, index: number) => (
            <DonghuaCard key={index} donghua={donghua} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-xl">Tidak ditemukan hasil untuk "{keyword}"</p>
          <p className="text-sm mt-2">Coba kata kunci lain atau cek ejaan.</p>
        </div>
      )}
    </div>
  );
}
