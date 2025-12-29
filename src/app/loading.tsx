import { LoadingGrid } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen container mx-auto px-4 py-8 space-y-16">
      {/* Hero Skeleton */}
      <div className="w-full aspect-[16/9] md:aspect-[21/9] lg:h-[60vh] bg-muted animate-pulse rounded-lg" />
      
      {/* Content Skeleton */}
      <LoadingGrid count={12} />
      <LoadingGrid count={8} />
    </div>
  );
}
