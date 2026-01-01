import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  basePath: string;
}

export const Pagination = ({ currentPage, basePath }: PaginationProps) => {
  return (
    <div className="flex justify-center items-center gap-3 mt-16 mb-12" role="navigation" aria-label="Pagination">
      {/* Prev */}
      <Link href={`${basePath}?page=${currentPage - 1}`} className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''} aria-label="Previous page">
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-gray-200 hover:border-primary hover:text-primary bg-white shadow-sm" aria-hidden="true">
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </Link>

      {/* Page Info */}
      <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Page</span>
        <span className="text-xl font-black text-gray-900 leading-none">{currentPage}</span>
      </div>

      {/* Next */}
      <Link href={`${basePath}?page=${currentPage + 1}`} aria-label="Next page">
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-gray-200 hover:border-primary hover:text-primary bg-white shadow-sm" aria-hidden="true">
          <ChevronRight className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
};