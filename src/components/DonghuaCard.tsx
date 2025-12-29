import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DonghuaCard as DonghuaCardType } from '@/lib/api';
import { Play } from 'lucide-react';

interface DonghuaCardProps {
  donghua: DonghuaCardType;
  isHistory?: boolean;
}

export const DonghuaCard = ({ donghua, isHistory = false }: DonghuaCardProps) => {
  
  const slug = donghua.slug.replace(/\/$/, '');
  const targetUrl = isHistory ? donghua.url : `/detail/${slug}`;

  return (
    <Link href={targetUrl} className="group outline-none">
      <div className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-card",
        // BORDER LEBIH TEGAS DI SINI
        "border border-white/25", 
        // EFEK HOVER: Border nyala + Shadow Glow
        "transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:-translate-y-1"
      )}>
        
        {/* Poster Image */}
        <img
          src={donghua.poster}
          alt={donghua.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        {/* Play Icon on Hover (Biar makin hidup) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 text-white shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                <Play className="w-6 h-6 fill-current" />
            </div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2 z-10">
            <div className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 shadow-lg">
                <span className="text-[10px] font-bold text-white tracking-wider">
                  {donghua.current_episode ? donghua.current_episode.replace('Episode ', 'EP ') : donghua.status}
                </span>
            </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 p-3 w-full z-10">
            <h3 className="font-bold text-sm leading-tight text-white line-clamp-2 drop-shadow-md group-hover:text-primary transition-colors">
                {donghua.title}
            </h3>
        </div>

      </div>
    </Link>
  );
};