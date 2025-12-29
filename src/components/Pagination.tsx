import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  basePath: string;
}

export function Pagination({ currentPage, basePath }: PaginationProps) {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage + 1;

  // Handle query params vs path params
  const getLink = (page: number) => {
    return basePath.includes('?') 
        ? `${basePath}&page=${page}` 
        : `${basePath}?page=${page}`;
  };

  return (
    <div className="flex justify-center gap-4 py-8">
      <Link href={prevPage ? getLink(prevPage) : '#'}>
        <Button variant="outline" disabled={!prevPage} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
      </Link>
      <Link href={getLink(nextPage)}>
        <Button variant="outline" className="gap-2">
            Next <ChevronRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
