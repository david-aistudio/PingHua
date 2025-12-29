import { api } from '@/lib/api';
import { DonghuaCard } from '@/components/DonghuaCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import SearchClient from '@/components/SearchClient'; // Client comp for input

export const metadata = {
  title: 'Search Donghua - PingHua',
  description: 'Cari donghua favoritmu subtitle Indonesia.',
};

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto text-center space-y-8 pt-10">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Cari Donghua</h1>
        <p className="text-muted-foreground">Temukan ribuan judul donghua gratis tanpa iklan.</p>
        
        <SearchClient />

        <div className="pt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Pencarian Populer</h3>
            <div className="flex flex-wrap justify-center gap-2">
                {['Soul Land', 'Battle Through the Heavens', 'Perfect World', 'Swallowed Star', 'Throne of Seal'].map((term) => (
                  <Link key={term} href={`/search/${term}`}>
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-white">
                        {term}
                    </Button>
                  </Link>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
