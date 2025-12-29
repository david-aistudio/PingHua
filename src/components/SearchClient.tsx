"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SearchClient({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search/${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-lg mx-auto w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ketik judul donghua..." 
        className="pl-12 h-14 rounded-full bg-secondary/50 border-white/10 text-lg shadow-lg focus-visible:ring-primary"
      />
      <Button type="submit" className="absolute right-2 top-2 h-10 rounded-full px-6">
        Cari
      </Button>
    </form>
  );
}
