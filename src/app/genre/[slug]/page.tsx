import { api } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { Pagination } from '@/components/Pagination'; // Need to create this

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Capitalize slug for title
  const title = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `Donghua Genre ${title} - PingHua`,
    description: `Nonton donghua genre ${title} subtitle Indonesia terlengkap.`,
  };
}

export default async function GenreDetailPage({ params, searchParams }: { params: { slug: string }, searchParams: { page?: string } }) {
  const page = Number(searchParams.page) || 1;
  const data = await api.getByGenre(params.slug, page);
  const donghuaList = data?.data || [];
  const title = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen space-y-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Genre: <span className="text-primary">{title}</span></h1>
        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold">Page {page}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
        {donghuaList.map((donghua: any, index: number) => (
          <DonghuaCard key={index} donghua={donghua} />
        ))}
      </div>

      {/* Pagination Simple */}
      <Pagination currentPage={page} basePath={`/genre/${params.slug}`} />
    </div>
  );
}
