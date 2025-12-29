import { api } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { Pagination } from '@/components/Pagination';

export const metadata = {
  title: 'Ongoing Donghua - PingHua',
  description: 'Daftar donghua yang sedang tayang (On-going) subtitle Indonesia.',
};

export default async function OngoingPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;
  const data = await api.getOngoing(page);
  const list = data?.ongoing_donghua || [];

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen space-y-8">
       <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Ongoing Series</h1>
        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold">Page {page}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {list.map((donghua: any, index: number) => (
          <DonghuaCard key={index} donghua={donghua} />
        ))}
      </div>

      <Pagination currentPage={page} basePath="/ongoing" />
    </div>
  );
}
