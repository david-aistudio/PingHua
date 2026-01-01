import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DonghuaCard as DonghuaCardType } from '@/lib/api';
import { Play, Star } from 'lucide-react';
import { optimizeImage } from '@/lib/image-optimizer';

interface DonghuaCardProps {
  donghua: DonghuaCardType;
  isHistory?: boolean;
}

export const DonghuaCard = ({ donghua, isHistory = false }: DonghuaCardProps) => {
  
  const slug = donghua.slug.replace(/\/$/, '');
  const targetUrl = isHistory ? donghua.url : `/detail/${slug}`;
  const optimizedPoster = optimizeImage(donghua.poster, 400);

  return (
    <Link href={targetUrl} className="group block">
      <div className="flex flex-col gap-3">
        
        {/* POSTER: Super Rounded with Soft Shadow */}
        <div className={cn(
            "relative aspect-[3/4] w-full overflow-hidden rounded-[1.5rem] bg-secondary shadow-apple",
            "transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:shadow-apple-hover group-hover:-translate-y-2"
        )}>
            <img
                src={optimizedPoster}
                alt={`Nonton ${donghua.title} Sub Indo`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
            />
            
            {/* AMBER BADGE (Top Right) */}
            <div className="absolute top-3 right-3 z-10">
                <div className="bg-primary px-2.5 py-1 rounded-lg text-[10px] font-black text-black shadow-lg shadow-black/10">
                    {donghua.current_episode ? donghua.current_episode.replace('Episode ', 'E') : donghua.status}
                </div>
            </div>

            {/* HOVER OVERLAY: Soft Amber Blur */}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-all duration-500 delay-75">
                    <Play className="w-6 h-6 fill-primary text-primary ml-1" />
                </div>
            </div>
        </div>

        {/* DETAILS: Simple & Clean Typography */}
        <div className="px-1 space-y-1">
            <h3 className="font-bold text-[15px] text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
                {donghua.title}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">
                <span className="text-primary">{donghua.type || 'Donghua'}</span>
                {donghua.rating && (
                    <>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            <span>{donghua.rating}</span>
                        </div>
                    </>
                )}
            </div>
        </div>

      </div>
    </Link>
  );
};
