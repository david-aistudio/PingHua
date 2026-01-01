import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  basePath: string;
}

export const Pagination = ({ currentPage, basePath }: PaginationProps) => {
  return (
    <div className="flex justify-center items-center gap-3 mt-16 mb-12">
      {/* Prev */}
      <Link href={`${basePath}?page=${currentPage - 1}`} className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}>
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-gray-200 hover:border-primary hover:text-primary bg-white shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </Link>

      {/* Page Info */}
      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
        <span className="text-sm font-medium text-gray-500">Page</span>
        <span className="text-lg font-bold text-gray-900">{currentPage}</span>
      </div>

      {/* Next */}
      <Link href={`${basePath}?page=${currentPage + 1}`}>
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-gray-200 hover:border-primary hover:text-primary bg-white shadow-sm">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
};