export const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-muted rounded-lg overflow-hidden">
        <div className="aspect-[2/3] bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer bg-[length:1000px_100%]" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded animate-shimmer bg-[length:1000px_100%]" />
          <div className="h-4 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded w-3/4 animate-shimmer bg-[length:1000px_100%]" />
        </div>
      </div>
    </div>
  );
};

export const LoadingGrid = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} />
      ))}
    </div>
  );
};
