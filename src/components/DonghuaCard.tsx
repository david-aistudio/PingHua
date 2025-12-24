import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DonghuaCard as DonghuaCardType } from '@/lib/api';

interface DonghuaCardProps {
  donghua: DonghuaCardType;
  isHistory?: boolean;
}

export const DonghuaCard = ({ donghua, isHistory = false }: DonghuaCardProps) => {
  
  const slug = donghua.slug.replace(/\/$/, '');
  
  // History items link directly to episode, others link to detail page
  const targetUrl = isHistory ? donghua.url : `/detail/${slug}`;

  return (
    <Link to={targetUrl} className="group outline-none">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-card border border-white/5 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1">
        
        {/* Poster Image */}
        <img
          src={donghua.poster}
          alt={donghua.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Episode/Status Badge */}
        <div className="absolute top-2 right-2">
            <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-center shadow-lg">
                <span className="text-xs font-bold text-white">
                  {donghua.current_episode ? donghua.current_episode.replace('Episode ', '') : donghua.status}
                </span>
            </div>
        </div>

        {/* Title on Hover */}
        <div className="absolute bottom-0 left-0 p-3 w-full">
            <h3 className="font-bold text-base line-clamp-2 text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                {donghua.title}
            </h3>
        </div>

      </div>
    </Link>
  );
};
