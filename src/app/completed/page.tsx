import { api } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { Pagination } from '@/components/Pagination';
import { Library } from 'lucide-react';

export const metadata = {
  title: 'Archive - PingHua',
  description: 'Daftar semua donghua (tamat & ongoing) di database PingHua.',
};

export default async function CompletedPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const page = Number(pageStr) || 1;
  const data = await api.getCompleted(page);
  const list = data?.completed_donghua || [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-soft flex items-center justify-center border border-black/[0.03]">
                    <Library className="w-6 h-6 text-primary-dark" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase italic">Archive</h1>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Library Database System</p>
                </div>
            </div>
            <div className="bg-white px-4 py-2 rounded-full border border-black/5 shadow-soft text-xs font-bold text-muted-foreground">
                PAGE {page}
            </div>
        </div>

        {list.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-black/5 shadow-soft">
                <p className="text-muted-foreground font-bold">Tidak ada data ditemukan di Archive.</p>
            </div>
        ) : (
            <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
                    {list.map((donghua: any, index: number) => (
                        <DonghuaCard key={index} donghua={donghua} />
                    ))}
                </div>
                <Pagination currentPage={page} basePath="/completed" />
            </>
        )}
      </div>
    </div>
  );
}